// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	compatibilityDate: '2026-02-08',
	ssr: true,
	nitro: {
		preset: 'cloudflare-pages'
	},
	srcDir: 'app',
	runtimeConfig: {
		public: {
			apiUrl: 'https://api.beam.ejnalo.me'
		}
	},
	css: [
		'./app/assets/main.css'
	],
	vite: {
		resolve: {
			extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
		},
		plugins: [
			tailwindcss()
		]
	}
})
