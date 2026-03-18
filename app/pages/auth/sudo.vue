<script setup lang="ts">
	import axios from 'axios';

	useHead({
		title: 'Sudo • Beam',
		meta: [
			{ name: 'robots', content: 'noindex,nofollow' },
			{ name: 'description', content: 'Confirmer mon identité pour une action sécurisée.' }
		]
	})

	const { $client, $apiUrl } = useNuxtApp();

	const route = useRoute();
	const router = useRouter();

	const actions: Record<string, string> = {
		'delete-account': 'Supprimer mon compte',
		'reset-email': 'Changer mon adresse mail',
		'reset-password': 'Réinitialiser mon mot de passe',
	}

	const action = ref<string | undefined>(undefined);

	async function sudo() {
		axios.post(
		`${$apiUrl}/auth/sudo`,
			{
				username: (document.getElementById('login') as HTMLInputElement).value,
				password: (document.getElementById('password') as HTMLInputElement).value
			},
			{
				headers: {
					'Content-Type': 'application/json'
				},
				params: {
					action: route.query.action || 'none'
				}
			}
		)
			.then((response) => {
				const result = response.data;
				if (result) {
					switch (route.query.action) {
						case 'delete-account':
							router.push('/account/delete?token=' + encodeURIComponent(result.token));
							break;

						case 'reset-email':
							router.push('/account/reset-email?token=' + encodeURIComponent(result.token));
							break;

						case 'reset-password':
							router.push('/account/reset-password?token=' + encodeURIComponent(result.token));
							break;

						default:
							router.push('/account/settings');
							break;
					}
				} else {
					alert('Échec de la connexion');
				}
			});
	}

	onMounted(() => {
		$client.refresh()

		if (route.query.action && Object.keys(actions).includes(route.query.action as string)) {
			action.value = route.query.action as string;
		} else {
			router.push('/account/settings');
		}
	})
</script>
<template>
	<main class="p-4 xs:p-8">
		<nav class="flex px-10 mb-1">
			<a href="/" class="text-primary font-semibold">Retour en zone sécurisée</a>
			<div class="grow"></div>
		</nav>
		<form @submit.prevent="sudo" class="bg-background-surface text-text-surface border-2 border-border-surface rounded-4xl p-8 space-y-4">
			<h1 class="text-2xl font-bold text-center">Confirmez que c'est bien vous</h1>
			<p><strong>Mode sudo:</strong> {{ actions[action!] || 'Action inconnue' }}</p>
			<div class="space-y-1">
				<label for="login" class="block text-sm font-medium">Nom d'utilisateur ou adresse mail:</label>
				<input type="text" id="login" name="login" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" required />
			</div>
			<div class="space-y-1">
				<label for="password" class="block text-sm font-medium">Mot de passe:</label>
				<input type="password" id="password" name="password"  class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" required />
			</div>
			<p class="text-danger text-sm"><strong>Attention !</strong> Vous êtes sur le point d'effectuer une action potentiellement destructrice. Si vous n'êtes pas arrivé ici de votre plein gré, merci de revenir en arrière et de ne rien renseigner.</p>
			<div class="flex items-center gap-4">
				<Button
					label="Suivant"
					type="action"
					:handler="sudo"
				/>
			</div>
		</form>
	</main>
</template>
