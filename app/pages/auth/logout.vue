<script setup lang="ts">
	import { useSession } from '@/stores/session';

	import axios from 'axios';

	useHead({
		title: 'Déconnexion • Beam',
		meta: [
			{ name: 'robots', content: 'noindex,nofollow' },
			{ name: 'description', content: 'Se déconnecter de mon compte.' }
		]
	})

	const router = useRouter();
	const { $apiUrl } = useNuxtApp();
	const { refreshSession } = useSession();

	onMounted(async () => {
		axios.post(
			`${$apiUrl}/auth/logout`,
			{},
			{
				withCredentials: true
			}
		);

		await refreshSession();

		router.push('/');
	});
</script>
<template>
	<header class="bg-primary text-white p-8 md:p-16">
		<h1 class="text-5xl font-bold">Déconnecté(e) avec succès !</h1>
		<RouterLink to="/" class="underline">Retourner à l'accueil</RouterLink>
	</header>
</template>
