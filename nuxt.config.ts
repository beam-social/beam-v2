// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	ssr: true,
	nitro: {
		preset: 'cloudflare-pages'
	},
	srcDir: 'app',
	runtimeConfig: {
		public: {
			apiUrl: 'https://api.beamsocial.com' // Fallback if env not set
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
