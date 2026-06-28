export interface Experience {
  load(): Promise<void>;
  start(): void;
}
