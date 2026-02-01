import { defineNuxtPlugin } from '#app'
import vMarkdown from '@/directives/v-markdown'

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive('markdown', vMarkdown)
})
