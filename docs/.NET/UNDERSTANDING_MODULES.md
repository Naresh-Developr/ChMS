# Monolithic Module & Migration Setup Guide

This generated guide will walks you through exactly how each module is is setup to work in this ChMS project.
This pattern will act as a template for all upcoming modules to be added.

---

## Table of Contents

1. [The Big Picture — What Are We Even Doing?](#1-the-big-picture)
2. [The Players — Every File Involved](#2-the-players)
3. [Part A — What Happens When `AddAuthModule()` Is Called (Line 25 of Program.cs)](#3-part-a)
4. [Part B — When and How `AuthDbContext` Is Created & Its Relationship to `AddAuthModule`](#4-part-b)
5. [Part C — How `MigrationExtension.cs` Works (When and How)](#5-part-c)
6. [The Full Lifecycle — From App Start to Database Tables](#6-full-lifecycle)
7. [Reflection Questions & Answers](#8-reflection)
8. [Common Mistakes & Gotchas](#9-gotchas)
9. [Cheat Sheet — Write It Yourself](#10-cheat-sheet)

---

## 1. The Big Picture — What Are We Even Doing? <a id="1-the-big-picture"></a>

Imagine you're building a house. You have a blueprint (your C# entity classes like `User`) and you need to actually build the rooms (database tables). **Entity Framework Migrations** is the construction crew that reads your blueprints and builds/modifies the rooms for you.

Here is what the system does at a high level:

```
  Your C# Classes (User.cs)
        ↓
  AuthDbContext tells EF "these are my tables"
        ↓
  AddAuthModule() registers AuthDbContext with the app's service container
        ↓
  EF Migrations generates SQL from your classes (you run a CLI command)
        ↓
  RunMigrations() applies that SQL to the actual PostgreSQL database at startup
```

### What is a "Modular Monolith"?

This project is structured as a **modular monolith** — one application, but the code is split into modules (folders/projects) that each own their data. The Auth module owns its own database schema (`auth`), its own `DbContext`, and its own migrations. The main `api` project just _plugs modules in_.

---

## 2. The Players — Every File Involved <a id="2-the-players"></a>

Here's every file and its role:

| File                       | Role                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `Program.cs`               | The application entry point. Registers services and starts the app.                       |
| `AuthModule.cs`            | The Auth module's "installer." Tells the app how to set up the Auth module's database.    |
| `AuthDbContext.cs`         | The Auth module's database context — EF's representation of the database for this module. |
| `Schema.cs`                | A tiny class holding the schema name (`"auth"`).                                          |
| `User.cs`                  | An entity class — represents a row in the `Users` table.                                  |
| `UserRole.cs`              | An enum used by `User`.                                                                   |
| `MigrationExtension.cs`    | A helper that runs pending migrations at application startup.                             |
| `appsettings.json`         | Configuration file holding the database connection string.                                |
| `api.csproj`               | The main project file listing NuGet packages (EF Core, Npgsql, etc.).                     |
| `ChMS.Modules.Auth.csproj` | The Auth module's project file listing its own NuGet packages.                            |

---

## 3. Part A — What Happens When `AddAuthModule()` Is Called <a id="3-part-a"></a>

### The Line in Question

```csharp
// Program.cs, line 25
builder.Services.AddAuthModule(builder.Configuration);
```

### Let's Break This Down Word by Word

#### `builder` — What is it?

```csharp
var builder = WebApplication.CreateBuilder(args);
```

`builder` is a `WebApplicationBuilder`. Think of it as a **toolbox** you use to configure your app _before_ it starts running.

It has two important properties:

- `builder.Services` — a collection (like a shopping list) where you register all the services your app needs.
- `builder.Configuration` — the app's settings, loaded from `appsettings.json`, environment variables, etc.

#### `builder.Services` — The Dependency Injection Container

.NET uses a pattern called **Dependency Injection (DI)**. Instead of classes creating their own dependencies, you register services in a central container, and .NET hands them out automatically when needed.

```
builder.Services is of type IServiceCollection
    ↓
It's basically a list of "recipes" like:
    "When someone asks for AuthDbContext, create one using this connection string"
```

#### `.AddAuthModule(builder.Configuration)` — An Extension Method

This is a call to a **static extension method** defined in `AuthModule.cs`. Let's look at it:

```csharp
// AuthModule.cs
namespace ChMS.Modules.Auth
{
    public static class AuthModule
    {
        public static IServiceCollection AddAuthModule(
            this IServiceCollection services,     // ← "this" makes it an extension method
            IConfiguration configuration)
        {
            // Step 1: Read the connection string from appsettings.json
            string dbConnectionString = configuration.GetConnectionString("Database")!;

            // Step 2: Register AuthDbContext with the DI container
            services.AddDbContext<AuthDbContext>(options =>
            {
                options.UseNpgsql(
                    dbConnectionString,
                    npgsqlOptions =>
                        npgsqlOptions.MigrationsHistoryTable(
                            HistoryRepository.DefaultTableName,
                            Schema.Name    // ← "auth"
                        )
                );
            });

            return services;
        }
    }
}
```

### Step-by-Step Walkthrough

**Step 1: Read the connection string**

```csharp
string dbConnectionString = configuration.GetConnectionString("Database")!;
```

This reads from `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Database": "Host=database;Port=5432;Database=chms;Username=postgres;Password=letmein;SSL Mode=Disable"
  }
}
```

`GetConnectionString("Database")` is shorthand for `configuration["ConnectionStrings:Database"]`. It returns the connection string as a plain `string`.

The `!` at the end is the **null-forgiving operator** — it tells the compiler "I know this won't be null, trust me." (If it IS null at runtime, you'll get a `NullReferenceException`.)

**Step 2: Register AuthDbContext**

```csharp
services.AddDbContext<AuthDbContext>(options =>
{
    options.UseNpgsql(
        dbConnectionString,
        npgsqlOptions =>
            npgsqlOptions.MigrationsHistoryTable(
                HistoryRepository.DefaultTableName,  // "__EFMigrationsHistory"
                Schema.Name                          // "auth"
            )
    );
});
```

What `AddDbContext<AuthDbContext>(...)` does:

1. **Registers `AuthDbContext`** in the DI container as a **scoped service** (one instance per HTTP request).
2. **Tells EF Core how to connect** — use PostgreSQL (`UseNpgsql`) with the provided connection string.
3. **Customizes the migrations history table** — instead of storing the migration tracking table in the default `public` schema, store it in the `auth` schema.

> **What is the migrations history table?**
> EF Core keeps track of which migrations have already been applied to the database in a table called `__EFMigrationsHistory`. By default, this table goes in the `public` schema. Since this is a modular monolith, each module puts its history table in its own schema (`auth`), so they don't collide.

### What `AddDbContext` Does NOT Do

At this point, **no database connection is made**. No `AuthDbContext` object is created. You're just _registering a recipe_:

> "Hey DI container, whenever someone asks for an `AuthDbContext`, create one with these options."

Think of it like writing a recipe card and filing it in a drawer. The cake isn't baked yet.

### Why is it an extension method?

The `this IServiceCollection services` parameter makes it an extension method. This lets you call it like:

```csharp
builder.Services.AddAuthModule(configuration);
```

instead of:

```csharp
AuthModule.AddAuthModule(builder.Services, configuration);
```

Both do the same thing. Extension methods are just syntactic sugar for cleaner code. This is a **very common .NET pattern** — look at `AddControllers()`, `AddOpenApi()`, etc. They're all extension methods.

---

## 4. Part B — When and How `AuthDbContext` Is Created <a id="4-part-b"></a>

### The `AuthDbContext` Class

```csharp
// AuthDbContext.cs
namespace ChMS.Modules.Auth.Database
{
    internal sealed class AuthDbContext(DbContextOptions<AuthDbContext> options)
        : DbContext(options)
    {
        internal DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema(Schema.Name);  // "auth"
        }
    }
}
```

### Breaking It Down

#### The Class Declaration — Primary Constructor Syntax

```csharp
internal sealed class AuthDbContext(DbContextOptions<AuthDbContext> options)
    : DbContext(options)
```

This uses C# 12's **primary constructor** syntax. It's equivalent to writing:

```csharp
internal sealed class AuthDbContext : DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options)
        : base(options)
    {
    }
}
```

- `internal` — only visible within the same project/assembly (the Auth module).
- `sealed` — no other class can inherit from it.
- `DbContext` — the base class from Entity Framework Core. It's your gateway to the database.
- `DbContextOptions<AuthDbContext>` — configuration options (connection string, provider, etc.) that were set up in `AddDbContext<AuthDbContext>(...)` in `AuthModule.cs`.

#### `DbSet<User> Users`

```csharp
internal DbSet<User> Users { get; set; }
```

A `DbSet<T>` represents a **table** in the database. This line says:

> "There is a table called `Users` and each row in it maps to a `User` object."

When EF Core sees `DbSet<User>`, it knows to:

1. Create a table called `Users` (by convention, the property name).
2. Create columns matching the properties of the `User` class.

#### `OnModelCreating` — Configuring the Database Model

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.HasDefaultSchema(Schema.Name);  // "auth"
}
```

`OnModelCreating` is called **once** by EF Core when it first builds its internal model of your database. It's where you configure things that can't be expressed by conventions alone.

`HasDefaultSchema("auth")` means: **all tables created by this context go into the `auth` schema** in PostgreSQL.

So the `Users` table will actually be `auth.Users`, not `public.Users`.

### The `User` Entity

```csharp
// User.cs
namespace ChMS.Modules.Auth.Core.Entities
{
    internal class User
    {
        public Guid Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
```

EF Core maps this to a table like:

| Column         | SQL Type                   | Notes                                                 |
| -------------- | -------------------------- | ----------------------------------------------------- |
| `Id`           | `uuid`                     | Primary Key (by convention, EF treats `Id` as the PK) |
| `Username`     | `text`                     | NOT NULL (because `required`)                         |
| `Email`        | `text`                     | NOT NULL                                              |
| `PasswordHash` | `text`                     | NOT NULL                                              |
| `Role`         | `integer`                  | Stored as int (enum → int by default)                 |
| `IsActive`     | `boolean`                  |                                                       |
| `CreatedAt`    | `timestamp with time zone` |                                                       |
| `UpdatedAt`    | `timestamp with time zone` |                                                       |

### The `Schema` Class

```csharp
// Schema.cs
internal static class Schema
{
    public const string Name = "auth";
}
```

Just a constant. Used in two places:

1. `AuthDbContext.OnModelCreating` — to set the default schema for tables.
2. `AuthModule.AddAuthModule` — to put the migrations history table in the `auth` schema.

### So When Is `AuthDbContext` Actually Created?

**NOT during `AddAuthModule()`.** That just registers it. The actual `AuthDbContext` object is created when something **requests it from the DI container**. In this project, that happens in `MigrationExtension.cs`:

```csharp
using TDbContext context = scope.ServiceProvider.GetRequiredService<TDbContext>();
```

Here is the timeline:

```
1. Program.cs line 25: AddAuthModule()
   └─ Registers the RECIPE for AuthDbContext. No object created.

2. Program.cs line 38: app.RunMigrations()
   └─ MigrationExtension asks the DI container: "Give me an AuthDbContext"
   └─ DI container follows the recipe from step 1:
       a. Creates DbContextOptions<AuthDbContext> with the Npgsql config
       b. Calls new AuthDbContext(options)
       c. AuthDbContext's constructor calls base DbContext(options)
       d. Returns the AuthDbContext instance
   └─ MigrationExtension calls context.Database.Migrate()
       a. EF Core calls OnModelCreating() to build the internal model
       b. EF Core checks __EFMigrationsHistory in the "auth" schema
       c. Applies any pending migrations
```

### Does `AuthDbContext` Have Anything to Do with `AddAuthModule`?

**Yes, absolutely.** They are directly connected:

- `AddAuthModule()` **registers** `AuthDbContext` — it tells the DI container _how to create one_ and _what database to connect to_.
- Without `AddAuthModule()`, nothing registers `AuthDbContext`, and any code that asks for one will crash with:
  ```
  InvalidOperationException: No service for type 'AuthDbContext' has been registered.
  ```

They are two halves of the same coin:

- `AddAuthModule()` = **registration** (the recipe)
- `GetRequiredService<AuthDbContext>()` = **resolution** (baking the cake using the recipe)

---

## 5. Part C — How `MigrationExtension.cs` Works <a id="5-part-c"></a>

### The Full Code

```csharp
// MigrationExtension.cs
using ChMS.Modules.Auth.Database;
using Microsoft.EntityFrameworkCore;

namespace api.Extensions
{
    public static class MigrationExtension
    {
        internal static void RunMigrations(this IApplicationBuilder app)
        {
            using IServiceScope scope = app.ApplicationServices.CreateScope();

            // Add modules here
            RunMigration<AuthDbContext>(scope);
        }

        private static void RunMigration<TDbContext>(IServiceScope scope)
            where TDbContext : DbContext
        {
            using TDbContext context = scope.ServiceProvider.GetRequiredService<TDbContext>();

            context.Database.Migrate();
        }
    }
}
```

### When Is It Called?

```csharp
// Program.cs, lines 33-38
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(...);
    app.RunMigrations();    // ← HERE, only in Development!
}
```

It runs **only during Development**, right before the app starts listening for HTTP requests. This is a convenience — in production, you'd typically run migrations separately (via a CI/CD pipeline or a manual command).

### Line-by-Line Walkthrough

#### `internal static void RunMigrations(this IApplicationBuilder app)`

Another extension method (notice `this`). This time it extends `IApplicationBuilder` (which is what `app` is in `Program.cs`). This lets you write `app.RunMigrations()` instead of `MigrationExtension.RunMigrations(app)`.

#### `using IServiceScope scope = app.ApplicationServices.CreateScope();`

This is the most important line to understand. Let's break it down:

**What is a scope?**

In .NET DI, services have **lifetimes**:

| Lifetime      | Meaning                                             | Example               |
| ------------- | --------------------------------------------------- | --------------------- |
| **Transient** | New instance every time you ask for one             | Lightweight helpers   |
| **Scoped**    | One instance per "scope" (usually one HTTP request) | `DbContext` ← THIS    |
| **Singleton** | One instance for the entire app                     | Configuration, caches |

`AuthDbContext` was registered as **Scoped** (by `AddDbContext` — that's the default). Scoped services can only be resolved inside a scope.

During an HTTP request, ASP.NET automatically creates a scope. But `RunMigrations()` runs at startup — there's no HTTP request yet! So we _manually_ create a scope with `CreateScope()`.

The `using` keyword means this scope (and everything resolved from it, including the `DbContext`) will be **disposed** (cleaned up) when the code block ends.

#### `RunMigration<AuthDbContext>(scope);`

Calls the generic helper method with `AuthDbContext` as the type parameter. If you add more modules later, you'd add more lines here:

```csharp
RunMigration<AuthDbContext>(scope);
RunMigration<EventsDbContext>(scope);    // future module
RunMigration<GroupsDbContext>(scope);    // future module
```

This is the **extensibility point** of the modular monolith pattern.

#### `private static void RunMigration<TDbContext>(IServiceScope scope) where TDbContext : DbContext`

A **generic method**. `TDbContext` is a placeholder for any type that inherits from `DbContext`. The `where TDbContext : DbContext` constraint ensures you can't accidentally call `RunMigration<string>(scope)`.

#### `using TDbContext context = scope.ServiceProvider.GetRequiredService<TDbContext>();`

This is where the `AuthDbContext` is **actually created**:

1. `scope.ServiceProvider` — the DI container for this scope.
2. `.GetRequiredService<TDbContext>()` — "Give me an instance of `AuthDbContext`". If it's not registered, it throws `InvalidOperationException`.
3. The DI container looks up the recipe registered by `AddDbContext<AuthDbContext>(...)` in `AddAuthModule()`.
4. It creates a new `AuthDbContext` with the configured options (Npgsql, connection string, etc.).
5. `using` ensures the context is disposed when done (closes the DB connection).

#### `context.Database.Migrate();`

**This is where the magic happens.** This single line:

1. **Connects** to the PostgreSQL database.
2. **Calls `OnModelCreating()`** to build EF's internal model (learns about the `auth` schema and the `Users` table).
3. **Checks the `__EFMigrationsHistory` table** in the `auth` schema. If the table doesn't exist, creates it.
4. **Compares** the list of migration files in your code against the list in `__EFMigrationsHistory`.
5. **Applies any pending migrations** — runs the SQL `Up()` methods of migrations that haven't been applied yet.
6. If there are no pending migrations, does nothing.

```
Database after Migrate():

Schema: auth
├── __EFMigrationsHistory     (tracks applied migrations)
│   ├── MigrationId: "20260310_InitialCreate"
│   └── ProductVersion: "10.0.3"
└── Users                      (your actual table)
    ├── Id (uuid, PK)
    ├── Username (text)
    ├── Email (text)
    ├── PasswordHash (text)
    ├── Role (integer)
    ├── IsActive (boolean)
    ├── CreatedAt (timestamptz)
    └── UpdatedAt (timestamptz)
```

---

## 6. The Full Lifecycle — From App Start to Database Tables <a id="6-full-lifecycle"></a>

Here is the **complete sequence** when you run the application in Development mode:

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: var builder = WebApplication.CreateBuilder()   │
│  → Creates the WebApplicationBuilder with config from   │
│    appsettings.json loaded into builder.Configuration   │
└──────────────────────────┬──────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  Step 2: builder.Services.AddAuthModule(config)         │
│  → Reads connection string from config                  │
│  → Registers AuthDbContext in DI as Scoped              │
│  → Configures: Npgsql + connection string + schema      │
│  → NO database connection yet!                          │
└──────────────────────────┬──────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  Step 3: var app = builder.Build()                      │
│  → Builds the app. Finalizes the DI container.          │
│  → All registrations are now locked in.                 │
└──────────────────────────┬──────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  Step 4: app.RunMigrations()                            │
│  → Creates a DI scope                                   │
│  → Resolves AuthDbContext from the DI container         │
│    → DI creates AuthDbContext with configured options   │
│  → Calls context.Database.Migrate()                     │
│    → Connects to PostgreSQL                             │
│    → Creates "auth" schema if needed                    │
│    → Creates __EFMigrationsHistory if needed            │
│    → Applies any pending migrations (CREATE TABLE etc.) │
│  → Disposes context and scope                           │
└──────────────────────────┬──────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  Step 5: app.Run()                                      │
│  → Starts listening for HTTP requests                   │
│  → For each request, DI creates a fresh AuthDbContext   │
│    scoped to that request                               │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Reflection Questions & Answers <a id="8-reflection"></a>

### Q1: Why do we register `AuthDbContext` in `AddAuthModule()` instead of directly in `Program.cs`?

**A:** Encapsulation. The Auth module is a separate project that knows its own needs. `Program.cs` (the host) shouldn't need to know which database provider the Auth module uses, what schema it uses, or how it configures its context. The module exposes one clean method: `AddAuthModule()`. This makes it easy to add or remove modules — each one is a single line in `Program.cs`.

---

### Q2: What would happen if you removed the `AddAuthModule()` call from `Program.cs`?

**A:** Two things would break:

1. `RunMigrations()` would crash on `GetRequiredService<AuthDbContext>()` — because `AuthDbContext` was never registered, the DI container doesn't know how to create one → `InvalidOperationException`.
2. Any controller or service that injects `AuthDbContext` would also crash for the same reason.

---

### Q3: Why is `AuthDbContext` marked `internal sealed` instead of `public`?

**A:** `internal` limits access to within the Auth module assembly. This prevents other modules from accidentally depending on the Auth module's database context directly. Modules should communicate through defined interfaces, not by sharing database access. `sealed` prevents inheritance — nobody should extend this context.

The host project (`api`) can still use it in `MigrationExtension.cs` because the module and the host are in the same solution and the host references the module's assembly.

---

### Q4: What does `HasDefaultSchema("auth")` do, and what happens if you remove it?

**A:** It tells EF Core to create all tables in the `auth` PostgreSQL schema. Without it, tables go into the `public` schema. In a modular monolith, this is important because multiple modules might have a table called `Users`. Schemas prevent naming collisions:

- `auth.Users` (Auth module)
- `groups.Users` (hypothetical Groups module)

---

### Q5: Why do we put the migrations history table in the `auth` schema too?

**A:** The line:

```csharp
npgsqlOptions.MigrationsHistoryTable(HistoryRepository.DefaultTableName, Schema.Name)
```

puts `__EFMigrationsHistory` in the `auth` schema. If all modules used the default `public` schema for their history, they'd share one table and could conflict. Each module having its own history table in its own schema keeps everything cleanly separated.

---

### Q6: Why does `RunMigrations()` create a manual scope with `CreateScope()`?

**A:** `DbContext` is registered as a Scoped service. Scoped services can only be resolved within a scope. During an HTTP request, ASP.NET creates a scope automatically. But `RunMigrations()` runs at startup — there's no HTTP request → no automatic scope. So we have to create one manually.

---

### Q7: What's the difference between `context.Database.Migrate()` and `context.Database.EnsureCreated()`?

**A:**
| | `Migrate()` | `EnsureCreated()` |
|-|-------------|-------------------|
| Uses migration files | ✅ Yes | ❌ No |
| Tracks what's been applied | ✅ Yes (`__EFMigrationsHistory`) | ❌ No |
| Supports incremental changes | ✅ Yes (add columns, tables over time) | ❌ No (creates once, never updates) |
| Use in production | ✅ Yes | ❌ Never |
| Use for prototyping | ✅ Yes | ✅ Yes |

Always use `Migrate()` in real projects.

---

### Q8: If I add a new property to `User.cs` (e.g., `public string PhoneNumber { get; set; }`), what do I need to do?

**A:**

1. Add the property to `User.cs`.
2. Run: `dotnet ef migrations add AddPhoneNumber --project Modules/ChMS.Modules.Auth/ChMS.Modules.Auth.csproj --startup-project . --context AuthDbContext`
3. This generates a migration file with an `Up()` that adds the column and a `Down()` that removes it.
4. On next app startup, `RunMigrations()` applies it. Or you apply it manually with `dotnet ef database update`.

---

### Q9: What is the purpose of `AddApplicationPart(typeof(AuthModule).Assembly)` in Program.cs?

**A:** Controllers defined inside the Auth module project live in a different assembly (DLL) than the main `api` project. By default, `AddControllers()` only scans the main assembly. `AddApplicationPart(...)` tells it: "Also scan the Auth module's assembly for controllers." Without this, any API controllers in the Auth module would be invisible and never respond to HTTP requests.

---

### Q10: Could I have two different modules use the same connection string but different schemas?

**A:** Yes! That's exactly what this project is designed for. The connection string points to the same PostgreSQL database (`chms`), but each module uses its own schema (`auth`, `events`, etc.) within that database. Each module has its own `DbContext`, its own migrations, and its own `__EFMigrationsHistory` table.

---

## 8. Common Mistakes & Gotchas <a id="9-gotchas"></a>

### 1. Forgetting to add `ProjectReference`

The `api.csproj` must reference the Auth module's `.csproj`. Without it, the host can't see `AuthModule`, `AuthDbContext`, or any types from the module. Currently, both projects are in the solution:

```xml
<!-- ChMS.slnx -->
<Project Path="api/api.csproj" />
<Project Path="api/Modules/ChMS.Modules.Auth/ChMS.Modules.Auth.csproj" />
```

But the `api.csproj` should also have:

```xml
<ItemGroup>
  <ProjectReference Include="Modules\ChMS.Modules.Auth\ChMS.Modules.Auth.csproj" />
</ItemGroup>
```

### 2. Running `dotnet ef` from the wrong directory

Always `cd` into the directory containing the `--startup-project` (usually `api/`).

### 3. Forgetting `--context` when you have multiple DbContexts

If you have `AuthDbContext` and later `EventsDbContext`, EF tooling won't know which one to use. Always specify `--context`.

### 4. Calling `Migrate()` in production startup

`RunMigrations()` is gated behind `app.Environment.IsDevelopment()` for a reason. In production, migrations should be applied deliberately (via CI/CD, scripts, etc.), not automatically on startup — because migration failures could crash your production app.

### 5. The connection string `Host=database`

The hostname `database` is a Docker Compose service name. If running outside Docker, you'd use `Host=localhost` instead.

---

## 9. Cheat Sheet — Write It Yourself <a id="10-cheat-sheet"></a>

Here's a step-by-step recipe for adding a brand-new module (say, `Groups`) with its own database schema and migrations:

### Step 1: Create the module project

```
api/Modules/ChMS.Modules.Groups/
├── GroupsModule.cs
├── ChMS.Modules.Groups.csproj
├── Core/
│   └── Entities/
│       └── Group.cs
└── Database/
    ├── GroupsDbContext.cs
    └── Schema.cs
```

### Step 2: Define the entity

```csharp
// Group.cs
namespace ChMS.Modules.Groups.Core.Entities
{
    internal class Group
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
    }
}
```

### Step 3: Define the schema constant

```csharp
// Schema.cs
namespace ChMS.Modules.Groups.Database
{
    internal static class Schema
    {
        public const string Name = "groups";
    }
}
```

### Step 4: Create the DbContext

```csharp
// GroupsDbContext.cs
using ChMS.Modules.Groups.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChMS.Modules.Groups.Database
{
    internal sealed class GroupsDbContext(DbContextOptions<GroupsDbContext> options)
        : DbContext(options)
    {
        internal DbSet<Group> Groups { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema(Schema.Name);
        }
    }
}
```

### Step 5: Create the module registration

```csharp
// GroupsModule.cs
using ChMS.Modules.Groups.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChMS.Modules.Groups
{
    public static class GroupsModule
    {
        public static IServiceCollection AddGroupsModule(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            string dbConnectionString = configuration.GetConnectionString("Database")!;

            services.AddDbContext<GroupsDbContext>(options =>
            {
                options.UseNpgsql(
                    dbConnectionString,
                    npgsqlOptions =>
                        npgsqlOptions.MigrationsHistoryTable(
                            HistoryRepository.DefaultTableName,
                            Schema.Name)
                );
            });

            return services;
        }
    }
}
```

### Step 6: Register in Program.cs

```csharp
// Program.cs
builder.Services.AddControllers()
    .AddApplicationPart(typeof(AuthModule).Assembly)
    .AddApplicationPart(typeof(GroupsModule).Assembly);    // ← Add this

builder.Services.AddAuthModule(builder.Configuration);
builder.Services.AddGroupsModule(builder.Configuration);   // ← Add this
```

### Step 7: Add to MigrationExtension.cs

```csharp
internal static void RunMigrations(this IApplicationBuilder app)
{
    using IServiceScope scope = app.ApplicationServices.CreateScope();

    RunMigration<AuthDbContext>(scope);
    RunMigration<GroupsDbContext>(scope);    // ← Add this
}
```

### Step 8: Add `ProjectReference` in `api.csproj`

```xml
<ProjectReference Include="Modules\ChMS.Modules.Groups\ChMS.Modules.Groups.csproj" />
```

### Step 9: Generate migrations

```bash
dotnet ef migrations add <MigrationName> \
    --project Modules/ChMS.Modules.<ModuleName>/ChMS.Modules.<ModuleName>.csproj \
    --startup-project . \
    --context <ModuleDbContext>
    --output-dir Database/Migrations
```

```bash
dotnet ef migrations add <MigrationName> --project Modules/ChMS.Modules.<ModuleName>/ChMS.Modules.<ModuleName>.csproj --startup-project . --context <ModuleDbContext> --output-dir Database/Migrations
```

### Step 10: Run the app

The migrations run automatically in Development. Done!

---

## Glossary

| Term                           | Meaning                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Entity Framework (EF) Core** | An ORM (Object-Relational Mapper) that lets you work with databases using C# objects instead of raw SQL |
| **DbContext**                  | Your session with the database. It knows your tables, tracks changes, and generates SQL                 |
| **DbSet\<T>**                  | Represents a table. `DbSet<User>` = the `Users` table                                                   |
| **Migration**                  | A versioned set of database changes (create/alter tables) generated from your C# model                  |
| **OnModelCreating**            | A DbContext method where you configure schema, relationships, and table mappings                        |
| **Dependency Injection (DI)**  | A pattern where objects receive their dependencies instead of creating them                             |
| **IServiceCollection**         | The DI registration container — where you add service recipes                                           |
| **IServiceProvider**           | The DI resolution container — where you ask for service instances                                       |
| **Scoped Service**             | One instance per scope (typically per HTTP request)                                                     |
| **Extension Method**           | A static method that appears as an instance method on a type (uses `this` keyword)                      |
| **Schema**                     | A namespace within a PostgreSQL database — like folders for tables                                      |
| **Modular Monolith**           | One deployable app, but code is organized into independent modules with clear boundaries                |
