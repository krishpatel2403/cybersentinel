import {
  Cloud,
  Database,
  Globe2,
  Laptop,
  Network,
  Server,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import type { AssetType } from "@/types";

const ICONS: Record<AssetType, LucideIcon> = {
  server: Server,
  workstation: Laptop,
  web_app: Globe2,
  database: Database,
  network: Network,
  cloud: Cloud,
  mobile: Smartphone,
};

export function AssetIcon({ type, className }: { type: AssetType; className?: string }) {
  const Icon = ICONS[type] ?? Server;
  return <Icon className={className} aria-hidden="true" />;
}
