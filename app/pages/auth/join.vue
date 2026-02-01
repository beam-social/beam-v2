<script setup lang="ts">
	import { onMounted, ref } from 'vue';
	import { useRouter } from 'vue-router';
	import axios from 'axios';

	import { countryList } from '@/utils/countries';
	import { isYoungerThan18 } from '@/utils/profiles';
	import { refreshMe } from '@/stores/session';

	const { $client, $apiUrl } = useNuxtApp();
	$client.refresh();

	const router = useRouter()

	const step = ref(0);

	const payload = ref({
		email: '',
		password: '',
		username: '',
		display_name: '',
		birthday: new Date().toISOString().split('T')[0]!,
		country: 'FR',
		private: true
	});

	async function signup() {
		const res = await axios.post(
			`${$apiUrl}/auth/signup`,
			payload.value
		)

		if (res.status == 200) {
		const session = await $client.login(payload.value.username, payload.value.password)
		await $client.refresh(session?.token!)

			router.push('/@' + payload.value.username)
		} else {
			console.error(res.status, res.data)
		}
	}

	onMounted(async () => {
		await refreshMe();
		document.title = "Rejoindre Beam"
	})
</script>
<template>
	<main v-if="step === 0" class="p-4 sm:p-8">
		<nav class="flex max-w-md px-10 mx-auto mb-1">
			<a href="/" class="text-primary font-semibold">Retour à l'accueil</a>
			<div class="grow"></div>
			<a href="/auth/login" class="text-primary font-semibold">Se connecter</a>
		</nav>
		<form @submit.prevent="() => step = 1" class="bg-background-surface text-text-surface border-2 border-border-surface rounded-4xl max-w-md p-8 mx-auto space-y-4">
			<h1 class="text-2xl text-center font-bold">Créer un compte</h1>
			<div class="space-y-1">
				<label for="email" class="block text-sm font-medium">Adresse mail:</label>
				<input type="email" id="email" name="email" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" v-model=payload.email required />
			</div>
			<div class="space-y-1">
				<label for="username" class="block text-sm font-medium">Nom d'utilisateur: <span class="text-sm">{{ 16 - payload.username.length }} caractères restants</span></label>
				<input type="text" id="username" name="username" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" v-model=payload.username :minlength=2 :maxlength=16 required />
				<p class="text-blue-400 text-xs">Celui-ci est modifiable à tout moment. Vous l'utiliserez pour vous connecter à votre compte.</p>
			</div>
			<div class="space-y-1">
				<label for="password" class="block text-sm font-medium">Mot de passe:</label>
				<input type="password" id="password" name="password" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" v-model=payload.password :minlength=8 required />
			</div>
			<div>
				<button type="submit" class="cursor-pointer block bg-action text-white text-sm font-medium rounded-full px-5 py-3 mx-auto duration-300 hover:bg-action-hovered">Continuer</button>
			</div>
		</form>
	</main>
	<main v-if="step === 1" class="p-4 md:p-8">
		<form @submit.prevent="() => step = 2" class="bg-background-surface border-2 border-border-surface rounded-4xl max-w-md p-8 mx-auto space-y-4">
			<h1 class="text-2xl font-bold text-center">Personnaliser votre profil</h1>
			<div class="space-y-1">
				<label for="email" class="block text-sm font-medium">Nom complet:</label>
				<input type="text" id="display_name" name="display_name" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" v-model=payload.display_name required />
			</div>
			<div class="space-y-1">
				<label for="birthday" class="block text-sm font-medium">Date de naissance:</label>
				<input type="date" id="birthday" name="birthday" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" v-model=payload.birthday required />
			</div>
			<div class="space-y-1">
				<label for="private" class="block text-sm font-medium">Pays de résidence</label>
				<select id="target" name="target" v-model="payload.country" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" required>
					<option v-for="ctr in countryList" :value=ctr.code>{{ ctr.flag }} {{ ctr.name }}</option>
				</select>
			</div>
			<div class="flex justify-center gap-4">
				<button v-if="step > 0" @click="() => step -= 1" class="cursor-pointer block text-subtext text-sm font-medium underline decoration-[1.5px] decoration-transparent duration-300 hover:decoration-subtext">Retour</button>
				<button type="submit" class="cursor-pointer block bg-action text-white text-sm font-medium rounded-full px-5 py-3 duration-300 hover:bg-action-hovered">Suivant</button>
			</div>
		</form>
	</main>
	<main v-if="step === 2" class="p-4 md:p-8">
		<form @submit.prevent="signup" class="bg-background-surface border-2 border-border-surface rounded-4xl max-w-md p-8 mx-auto space-y-4">
			<h1 class="text-2xl font-bold text-center">Gardez le contrôle</h1>
			<div class="space-y-1">
				<label for="private" class="block text-sm font-medium">Protéger mon profil des mauvais regards</label>
				<select id="target" name="target" v-model="payload.private" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" required>
					<option :value=true>Activé (recommandé)</option>
					<option :value=false :disabled="isYoungerThan18(new Date(payload.birthday))">Désactivé</option>
				</select>
			</div>
			<div class="space-y-1">
				<p v-if="payload.private" class="text-sm duration-500">
					En gardant votre profil privé, votre prénom, photo de profil, vos publications et d'autres informations ne seront visible que par vos <u>followers</u>. Vous aurez la possibilité de poster des publications publiques.
				</p>
				<p v-else class="text-sm duration-500">
					Si vous rendez votre profil public, les informations que vous mettrez en ligne seront visible par tous les utilisateurs possédant un compte. Vous pourrez toujours poster certaines publications privées.
				</p>
				<p class="text-blue-400 text-xs">Vous pourrez changer ces paramètres à tout moment.</p>
			</div>
			<div
				class="flex gap-4 justify-center"
			>
				<button v-if="step > 0" @click="() => step -= 1" class="cursor-pointer block text-subtext text-sm font-medium underline decoration-1 decoration-transparent duration-300 hover:decoration-subtext">Retour</button>
				<button type="submit" class="cursor-pointer block bg-action text-white text-sm font-medium rounded-full px-5 py-3 duration-300 hover:bg-action-hovered">Valider</button>
			</div>
		</form>
	</main>
</template>
