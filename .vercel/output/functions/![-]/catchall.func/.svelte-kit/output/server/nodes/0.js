

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.CqmjZcHP.js","_app/immutable/chunks/k4vayzEn.js","_app/immutable/chunks/CuDy-hXz.js"];
export const stylesheets = ["_app/immutable/assets/0.BMZKiGtK.css"];
export const fonts = [];
