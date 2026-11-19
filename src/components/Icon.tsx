import {
  Briefcase, Building2, DoorOpen, Monitor, Rocket, Sparkles, Users, type LucideProps,
} from "lucide-react";
import type { IconName } from "@/lib/catalog";

const MAP = { Sparkles, Briefcase, Users, DoorOpen, Monitor, Building2 };

export function CategoryIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const C = MAP[name] ?? Rocket;
  return <C aria-hidden="true" {...props} />;
}
