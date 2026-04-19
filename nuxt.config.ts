// https://nuxt.com/docs/api/configuration/nuxt-config
import { env } from "node:process";
import { defineNuxtConfig } from "nuxt/config";

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2026-02-08",
	ssr: true,
	modules: ["@nuxt/content"],
	nitro: {
		preset: env.CF_PAGES ? "cloudflare-pages" : "node-server",
	},
	srcDir: "app",
	content: {
		database: {
			type: "sqlite",
			filename: ".data/content.sqlite",
		},
		experimental: {
			sqliteConnector: "native",
		},
	},
	runtimeConfig: {
		public: {
			apiUrl: "https://api.beam.ejnalo.me",
		},
	},
	css: ["./app/assets/main.css"],
	vite: {
		resolve: {
			extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
		},
		plugins: [tailwindcss()],
	},
});
