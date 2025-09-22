import type { LucideIcon } from 'lucide-react';
import { FolderOpen, Handshake, Users, Wrench } from 'lucide-react';

export type MetricCategory = 'clients' | 'projects' | 'team' | 'automation';

export type MetricCategoryMetadata = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export type CategoryMetadataRecord = Record<MetricCategory, MetricCategoryMetadata>;

export const CATEGORY_METADATA: CategoryMetadataRecord = {
  clients: {
    title: 'Clients',
    description: 'Pipeline health, relationships, and commercial momentum.',
    icon: Handshake,
    accent: 'from-sky-500/10 via-sky-500/5 to-transparent',
  },
  projects: {
    title: 'Projects',
    description: 'Monitor how projects move from planning through deployment.',
    icon: FolderOpen,
    accent: 'from-purple-500/10 via-purple-500/5 to-transparent',
  },
  team: {
    title: 'Team',
    description: 'Utilization, output, and collaboration across your crew.',
    icon: Users,
    accent: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
  },
  automation: {
    title: 'Systems',
    description: 'Automation coverage, system health, and cost impact.',
    icon: Wrench,
    accent: 'from-amber-500/10 via-amber-500/5 to-transparent',
  },
};

export const CATEGORY_ORDER: MetricCategory[] = ['projects', 'automation', 'clients', 'team'];
