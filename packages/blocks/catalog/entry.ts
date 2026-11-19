// The embeddable catalog bundle: the generated wireframes (rectangles only), their contracts and models, the per-element
// tokens. Built by vite.config.ts with the kit's utils/cn aliased to kit-cn.ts (no tailwind-merge). No app chrome.
import "./catalog.css";
export { CATALOG, catalogIds } from "../src/catalog";
export { BLOCKS, BLOCK_BY_ID, MODELS, bind, placesFor, validateInstance, wireframeProps } from "../src/manifest";
export { mount, unmount } from "svelte";
