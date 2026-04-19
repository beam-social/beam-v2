<script setup lang="ts">
	import axios from 'axios';

	import { useSession } from '@/stores/session';

	useHead({
		title: 'Supprimer mon compte • Beam',
		meta: [
			{ name: 'robots', content: 'noindex,nofollow' },
			{ name: 'description', content: 'Supprimer mon compte.' }
		]
	})

	const { $apiUrl } = useNuxtApp();
	const { refreshSession } = useSession();

	const router = useRouter();
	const route = useRoute();

	onMounted(async () => {
		await refreshSession(() => {
			router.push('/auth/login?return=' + encodeURIComponent(window.location.pathname))
		});

		document.title = "Supprimer mon compte • Beam"
	});

	function submit() {
		axios.post(
		`${$apiUrl}/auth/delete`,
			{
				token: route.query.token
			}
		).then(() => {
			router.push('/auth/login')
		});
	}
</script>
<template>
	<main class="p-4 xs:p-8">
		<section class="bg-background-surface text-text-surface border border-border-surface rounded-3xl">
			<h1 class="text-3xl font-bold mb-4">Suppression de mon compte</h1>
			<form @submit.prevent="submit" class="flex flex-col gap-4">
				<h2 class="text-lg font-medium">Êtes-vous sûr de vouloir supprimer votre compte ?</h2>
				<p class="text-sm text-subtext">Cette action est irréversible. Après la suppression de votre compte, vous serez redirigé vers la page de connexion.</p>
				<button type="submit" class="bg-danger text-white px-4 py-2 rounded-lg hover:bg-danger-hovered transition">Supprimer mon compte</button>
			</form>
		</section>
	</main>
</template>
