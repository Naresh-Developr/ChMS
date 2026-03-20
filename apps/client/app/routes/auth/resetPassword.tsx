import ResetPassword from "~/pages/ResetPassword";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Reset Password" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <ResetPassword />;
}
