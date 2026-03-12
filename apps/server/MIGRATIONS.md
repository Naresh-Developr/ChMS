## Generating Migrations (The CLI Commands)

**Important:** `Migrate()` in code applies existing migrations. But first you will have to _generate migration files_. This is done via the CLI.

### Where to Run From

You must run from the `apps/server/api/` directory (where `api.csproj` is).

### Creating a Migration

```bash
dotnet ef migrations add <MigrationName> \
    --project Modules/ChMS.Modules.<ModuleName>/ChMS.Modules.<ModuleName>.csproj \
    --startup-project . \
    --context <ModuleDbContext>
    --output-dir Database/Migrations
```

| Flag                                              | Meaning                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| `migrations add <MigrationName>`                  | Create a new migration given name                                                 |
| `--project Modules/ChMS.Modules.<ModuleName>/...` | The project that contains the `DbContext` and where migration files will be saved |
| `--startup-project .`                             | The project that has the connection string and can be "started" (`api.csproj`)    |
| `--context <ModuleDbContext>`                     | Which `DbContext` to use (important if you have multiple. Ex:AuthDbContext)       |
| `--output-dir Database/Migrations`                | Which `directory` to use (This should be the same for all modules)                |

This will create a `Migrations/` folder inside the Auth module with files like:

```
Modules/ChMS.Modules.Auth/Database/
└── Migrations/
    ├── 20260310120000_InitialCreate.cs          ← The migration (Up + Down)
    ├── 20260310120000_InitialCreate.Designer.cs ← Snapshot metadata
    └── AuthDbContextModelSnapshot.cs            ← Current model state
```

### What's Inside a Migration File?

```csharp
public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // SQL to CREATE the table
        migrationBuilder.CreateTable(
            name: "Users",
            schema: "auth",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                Username = table.Column<string>(nullable: false),
                // ... etc
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Users", x => x.Id);
            });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // SQL to UNDO (drop the table)
        migrationBuilder.DropTable(name: "Users", schema: "auth");
    }
}
```

- `Up()` — what to do when applying the migration.
- `Down()` — what to do when rolling it back.

### Applying Migrations

**Option A: Automatically at startup** (what this project does in Development):

```csharp
context.Database.Migrate();  // in RunMigrations()
```

**Option B: Via CLI:**

```bash
dotnet ef database update \
    --project Modules/ChMS.Modules.Auth/ChMS.Modules.Auth.csproj \
    --startup-project . \
    --context AuthDbContext
```

**Option C: Generate a SQL script** (common for production):

```bash
dotnet ef migrations script \
    --project Modules/ChMS.Modules.Auth/ChMS.Modules.Auth.csproj \
    --startup-project . \
    --context AuthDbContext \
    --output migration.sql
```

---
