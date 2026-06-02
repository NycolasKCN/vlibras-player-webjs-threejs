export const STATUSES = {
  idle: "idle",
  preparing: "preparing",
  playing: "playing",
} as const;

export type PlayerStatus = (typeof STATUSES)[keyof typeof STATUSES];

export type ProgressConstructor = new (wrapper: HTMLElement) => unknown;

export interface PlayerOptions {
  translator?: string;
  targetPath?: string;
  onLoad?: () => void;
  progress?: ProgressConstructor;
  personalization?: unknown;
  wrapper?: unknown;
  [key: string]: unknown;
}

export interface PlayOptions {
  fromTranslation?: boolean;
  isEnabledStats?: boolean;
}

export interface TranslateOptions {
  isEnabledStats?: boolean;
}

export type NormalizedPlayerOptions = PlayerOptions & {
  translator: string;
  targetPath: string;
};
