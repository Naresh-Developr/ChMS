import Onboarding from "~/pages/Onboarding";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Onboarding" }, { name: "description", content: "Finish setting up account details." }];
}

export default function Onboard() {
  return <Onboarding />;
}
