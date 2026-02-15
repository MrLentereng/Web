export type CollectionType =
  | 'actors'
  | 'items'
  | 'spells'
  | 'effects'
  | 'journal'
  | 'tables';

export type SidebarSection =
  | 'dashboard'
  | 'actors'
  | 'monsters'
  | 'pcs'
  | 'items'
  | 'spells'
  | 'effects'
  | 'journal'
  | 'tables'
  | 'settings';

export interface FoundryBase {
  _id: string;
  name: string;
  type: string;
  img?: string;
  folder?: string | null;
  sort?: number;
  flags?: Record<string, unknown>;
  ownership?: Record<string, number>;
  system: Record<string, any>;
  [key: string]: any;
}

export interface ProjectVersion {
  id: string;
  timestamp: number;
  data: ProjectData;
}

export interface ProjectData {
  id: string;
  name: string;
  updatedAt: number;
  tags: string[];
  actors: FoundryBase[];
  items: FoundryBase[];
  spells: FoundryBase[];
  effects: FoundryBase[];
  journal: FoundryBase[];
  tables: FoundryBase[];
  versions: ProjectVersion[];
}
