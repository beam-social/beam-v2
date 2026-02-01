<script setup lang="ts">
	import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/solid'

	import Sidebar from '@/components/layout/Navbar.vue';

	import { me } from '@/stores/session';
	import { syncTheme } from '@/services/theme';

	const route = useRoute();

	watch(
		() => route.path,
		() => {
			syncTheme();
		},
		{ immediate: true }
	);
</script>
<template>
	<Sidebar v-if=me :me=me />
	<div v-else class="sticky top-0 z-1000 sm:top-4 bg-background-surface text-text-surface border-b-2 sm:border-2 border-border-surface sm:rounded-full flex justify-center items-center sm:w-fit px-6 py-4 sm:px-8 sm:mx-auto">
		<p>Votre expérience sera meilleure en <RouterLink to="/auth/join" class="text-primary underline decoration-transparent decoration-2 transition-all duration-300 hover:decoration-primary">vous connectant</RouterLink>.</p>
	</div>
	<div class="md:px-32 lg:px-64 xl:px-72">
		<NuxtPage class="text-text" />
	</div>
	<button class="sm:hidden fixed bottom-4 right-4 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl duration-300">
		<RouterLink to="/write" class="w-full h-full flex items-center justify-center">
			<ChatBubbleOvalLeftEllipsisIcon color="white" :filled=true class="block w-6 h-6" />
		</RouterLink>
	</button>
</template>
