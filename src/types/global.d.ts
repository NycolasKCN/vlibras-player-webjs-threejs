export {};

declare global {
  interface Window {
    VLibras?: { Player: typeof import("../Player").default };
  }
}
