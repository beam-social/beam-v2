<script setup lang="ts">
	import { onMounted } from 'vue';
	import { useRouter } from 'vue-router';

	import { refreshMe } from '@/stores/session';

	import axios from 'axios';

	const router = useRouter();
	const { $apiUrl } = useNuxtApp();

	onMounted(async () => {
		document.title = "Déconnexion • Beam";

		axios.post(
			`${$apiUrl}/auth/logout`,
			{},
			{
				withCredentials: true
			}
		);

		await refreshMe();

		router.push('/');
	});
</script>
<template>
	<header class="bg-primary text-white p-8 md:p-16">
		<h1 class="text-5xl font-bold">Déconnecté(e) avec succès !</h1>
		<RouterLink to="/" class="underline">Retourner à l'accueil</RouterLink>
	</header>
</template>
