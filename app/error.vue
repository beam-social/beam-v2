<script setup lang="ts">
	import { useTheme } from '@/services/theme';

	const { syncTheme } = useTheme();

	onMounted(() => {
		syncTheme();
	});
</script>
<template>
	<NuxtLayout name="home">
		<section class="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
			<h1 class="text-6xl font-bold">Oups !</h1>
			<p class="text-xl text-center">Il semble que la page que vous recherchez n'existe pas.</p>
			<RouterLink to="/" class="text-action underline">Retourner à l'accueil</RouterLink>
		</section>
	</NuxtLayout>
</template>
