export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".well-known/appspecific/com.chrome.devtools.json","favicon.svg","images/arcane.svg","images/axe.svg","images/bow.svg","images/bug.svg","images/characters/mage1.webp","images/characters/mage2.webp","images/characters/warrior1.webp","images/characters/warrior2.webp","images/close-button.svg","images/currency.svg","images/dagger.svg","images/dark.svg","images/dice.webp","images/fire.svg","images/flail.svg","images/fullscreen.svg","images/gold.svg","images/ice.svg","images/info.svg","images/item.svg","images/landscape-svgs/custom.svg","images/landscape-svgs/cyberpunk.webp","images/landscape-svgs/dock.svg","images/landscape-svgs/forest.svg","images/landscape-svgs/mountain.svg","images/landscape-svgs/random.svg","images/landscape-svgs/rpg.webp","images/landscape-svgs/shop1.svg","images/landscape-svgs/shop2.svg","images/landscape-svgs/shop3.svg","images/landscape-svgs/tavern.svg","images/landscape-svgs/town.svg","images/light.svg","images/lightning.svg","images/mace.svg","images/main-bg.webp","images/map.svg","images/music.svg","images/potion.svg","images/run.svg","images/spear.svg","images/sword.svg","images/time.svg","images/toxic.svg","images/undefined.svg","images/unique.svg","images/unknown.svg"]),
	mimeTypes: {".json":"application/json",".svg":"image/svg+xml",".webp":"image/webp"},
	_: {
		client: {start:"_app/immutable/entry/start.BFSpl4vA.js",app:"_app/immutable/entry/app.9eCuCI7c.js",imports:["_app/immutable/entry/start.BFSpl4vA.js","_app/immutable/chunks/DUev1ZMx.js","_app/immutable/chunks/k4vayzEn.js","_app/immutable/chunks/CsYA_GUq.js","_app/immutable/entry/app.9eCuCI7c.js","_app/immutable/chunks/k4vayzEn.js","_app/immutable/chunks/CuDy-hXz.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/chat",
				pattern: /^\/api\/chat\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/chat/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
