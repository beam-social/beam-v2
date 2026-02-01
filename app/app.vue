<script setup lang="ts">
	import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/solid'

	import Sidebar from './components/layout/Navbar.vue';

	import { RouterLink } from 'vue-router';

	import { me } from './stores/session';
</script>
<template>
	<Sidebar v-if=me :me=me />
	<div class="md:px-32 lg:px-64 xl:px-72">
		<NuxtPage class="text-text" />
	</div>
	<button class="sm:hidden fixed bottom-4 right-4 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl duration-300">
		<RouterLink to="/write" class="w-full h-full flex items-center justify-center">
			<ChatBubbleOvalLeftEllipsisIcon color="white" :filled=true class="block w-6 h-6" />
		</RouterLink>
	</button>
</template>
