/// <reference types="vite/client" />

// Raw markdown imports (Vite `?raw` suffix) — used by the blog content layer.
declare module '*.md?raw' {
  const content: string
  export default content
}
