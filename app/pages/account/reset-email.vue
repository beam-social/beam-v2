<script setup lang="ts">
	import axios from 'axios';

	import { useSession } from '@/stores/session';

	useHead({
		title: 'Changer mon adresse mail • Beam',
		meta: [
			{ name: 'robots', content: 'noindex,nofollow' },
			{ name: 'description', content: 'Changer mon adresse mail.' }
		]
	});

	const { $apiUrl } = useNuxtApp();
	const { refreshMe } = useSession();

	const router = useRouter();
	const route = useRoute();

	const newEmail = ref<string>('');

	onMounted(async () => {
		await refreshMe(() => {
			router.push('/auth/login?return=' + encodeURIComponent(window.location.pathname))
		});
	});

	function submit() {
		axios.post(
			`${$apiUrl}/auth/email-reset`,
			{
				token: route.query.token,
				new_email: newEmail.value
			}
		).then(() => {
			router.push('/auth/login')
		});
	}
</script>
<template>
	<main class="p-4 xs:p-8">
		<section class="bg-background-surface text-text-surface border-2 border-border-surface rounded-3xl">
			<h1 class="text-3xl font-bold mb-4">Changer mon adresse mail</h1>
			<form @submit.prevent="submit" class="flex flex-col gap-4">
				<label class="flex flex-col">
					Nouvelle adresse mail
					<input type="email" v-model="newEmail" required class="mt-2 p-2 border-2 border-border-surface rounded-lg bg-background-surface" />
				</label>
				<button type="submit" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition">Changer mon adresse mail</button>
			</form>
		</section>
	</main>
</template>
