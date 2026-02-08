<script setup lang="ts">
	import axios from 'axios';

	import { countryList } from '@/utils/countries';
	import { isYoungerThan18 } from '@/utils/profiles';
	import { useSession } from '@/stores/session';

	import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/solid';

	useHead({
		title: 'Rejoindre Beam',
		meta: [
			{ name: 'description', content: 'Créer un compte.' }
		]
	})

	const { $client, $apiUrl } = useNuxtApp();
	const { refreshMe } = useSession();
	$client.refresh();

	const router = useRouter()

	const step = ref<number>(-1);

	const payload = ref<Record<string, string | boolean>>({
		email: '',
		password: '',
		username: '',
		display_name: '',
		birthday: new Date().toISOString().split('T')[0]!,
		// country: 'FR',
		private: true,
		sudo_code: ''
	});

	const valid = ref<Record<string, boolean>>({
		email: true,
		password: true,
		username: true,
		display_name: true,
		birthday: true,
		// country: false
		private: true,
		sudo_code: true
	});

	const pwSpecs = {
		length: false,
		uppercase: false,
		lowercase: false,
		digit: false,
		special: false
	}

	async function signup() {
		const res = await axios.post(
			`${$apiUrl}/auth/signup`,
			payload.value
		)

		if (res.status == 200) {
			const session = await $client.login(payload.value!.username as string, payload.value!.password as string)
			await $client.refresh(session?.token!)

			router.push('/@' + payload.value.username)
		} else {
			console.error(res.status, res.data)
		}
	}

	onMounted(async () => {
		await refreshMe();
	});

	function check(field: string, regex: RegExp, min?: number, max?: number) {
		let val = payload.value[field as string] as string;

		if (min && val.length < min) {
			valid.value[field] = false;
			return false;
		}

		if (!regex.test(val)) {
			valid.value[field] = false;
			return false;
		}

		if (max && val.length > max) {
			valid.value[field] = false;
			return false;
		}

		valid.value[field] = true;
		return true;
	}

	function checkPassword() {
		const val = payload.value.password as string;

		const length = val.length >= 8;
		const uppercase = /[A-Z]/.test(val);
		const lowercase = /[a-z]/.test(val);
		const digit = /[0-9]/.test(val);
		const special = /[!@#$%^&*(),.?":{}|<>]/.test(val);

		pwSpecs.length = length;
		pwSpecs.uppercase = uppercase;
		pwSpecs.lowercase = lowercase;
		pwSpecs.digit = digit;
		pwSpecs.special = special;

		valid.value.password = length && uppercase && lowercase && digit && special;
		return valid.value.password;
	}
</script>
<template>
	<main v-if="step === -1" class="p-4 xs:p-8">
		<nav class="flex max-w-md px-10 mx-auto mb-1">
			<a href="/" class="text-primary font-semibold">Retour à l'accueil</a>
			<div class="grow"></div>
			<a href="/auth/login" class="text-primary font-semibold">Se connecter</a>
		</nav>
		<section class="bg-background-surface text-text-surface border-2 border-border-surface rounded-4xl max-w-md p-8 mx-auto space-y-8">
			<h1 class="text-4xl font-bold mb-4">La création de compte est restreinte.</h1>
			<p class="max-w-md mx-auto">
				La plateforme a restreint la création de compte et n'est désormais accessible que sur invitation. Contactez-nous à l'adresse <a href="mailto:beam.sc@proton.me" class="text-primary font-medium">beam.sc@proton.me</a> pour en savoir plus.
			</p>
			<div class="flex justify-center gap-4">
				<button @click="() => step = 0" class="cursor-pointer block bg-action text-white text-sm font-medium rounded-full px-5 py-3 duration-300 hover:bg-action-hovered">J'ai un code</button>
				<button @click="() => router.back()" class="cursor-pointer block text-subtext text-sm font-medium underline decoration-[1.5px] decoration-transparent duration-300 hover:decoration-subtext">Retour</button>
			</div>
		</section>
	</main>
	<main v-if="step === 0" class="p-4 xs:p-8">
		<nav class="flex max-w-md px-10 mx-auto mb-1">
			<a href="/" class="text-primary font-semibold">Retour à l'accueil</a>
			<div class="grow"></div>
			<a href="/auth/login" class="text-primary font-semibold">Se connecter</a>
		</nav>
		<form @submit.prevent="() => step = 1" class="bg-background-surface text-text-surface border-2 border-border-surface rounded-4xl max-w-md p-8 mx-auto space-y-4">
			<h1 class="text-2xl text-center font-bold">Créer un compte</h1>
			<div class="space-y-1">
				<label for="email" class="block text-sm font-medium">Adresse mail:</label>
				<input
					type="email"
					id="email"
					name="email"
					class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2"
					@input="() => check('email', /^[a-zA-Z0-9_]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/)"
					v-model=payload.email
					required
				/>
				<p v-if="!valid.email" class="text-rose-500 text-xs">L'adresse mail doit être valide.</p>
			</div>
			<div class="space-y-1">
				<label for="username" class="block text-sm font-medium">Nom d'utilisateur: <span class="text-xs text-subtext">{{ 16 - (payload.username as string).length }} caractères restants</span></label>
				<input
					type="text"
					id="username"
					name="username"
					class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2"
					@input="() => check('username', /^[a-z0-9._]{3,16}$/)"
					v-model=payload.username
					:minlength=3
					:maxlength=16
					required
				/>
				<p v-if="!valid.username" class="text-rose-500 text-xs">Le nom d'utilisateur doit contenir entre 3 et 16 caractères et ne peut contenir que des lettres minuscules, des chiffres et des underscores.</p>
				<p class="text-blue-400 text-xs">Celui-ci est modifiable à tout moment. Vous l'utiliserez pour vous connecter à votre compte.</p>
			</div>
			<div class="space-y-1">
				<label for="password" class="block text-sm font-medium">Mot de passe:</label>
				<input
					type="password"
					id="password"
					name="password"
					class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2"
					@input="() => checkPassword()"
					v-model=payload.password
					:minlength=8
					required
				/>
				<p class="text-xs">Le mot de passe doit contenir:</p>
				<ul class="text-xs list-none list-inside">
					<li :class="pwSpecs.length ? 'text-success' : 'text-danger'"><CheckIcon v-if="pwSpecs.length" class="inline w-4 h-4" /><XMarkIcon v-else class="inline w-4 h-4" /> Au moins 8 caractères</li>
					<li :class="pwSpecs.uppercase ? 'text-success' : 'text-danger'"><CheckIcon v-if="pwSpecs.uppercase" class="inline w-4 h-4" /><XMarkIcon v-else class="inline w-4 h-4" /> Au moins une majuscule</li>
					<li :class="pwSpecs.lowercase ? 'text-success' : 'text-danger'"><CheckIcon v-if="pwSpecs.lowercase" class="inline w-4 h-4" /><XMarkIcon v-else class="inline w-4 h-4" /> Au moins une minuscule</li>
					<li :class="pwSpecs.digit ? 'text-success' : 'text-danger'"><CheckIcon v-if="pwSpecs.digit" class="inline w-4 h-4" /><XMarkIcon v-else class="inline w-4 h-4" /> Au moins un chiffre</li>
					<li :class="pwSpecs.special ? 'text-success' : 'text-danger'"><CheckIcon v-if="pwSpecs.special" class="inline w-4 h-4" /><XMarkIcon v-else class="inline w-4 h-4" /> Au moins un caractère spécial</li>
				</ul>
			</div>
			<div>
				<button type="submit" class="cursor-pointer block bg-action text-white text-sm font-medium rounded-full px-5 py-3 mx-auto duration-300 hover:bg-action-hovered">Continuer</button>
			</div>
		</form>
	</main>
	<main v-if="step === 1" class="p-4 xs:p-8">
		<form @submit.prevent="() => step = 2" class="bg-background-surface border-2 border-border-surface rounded-4xl max-w-md p-8 mx-auto space-y-4">
			<h1 class="text-2xl font-bold text-center">Personnaliser votre profil</h1>
			<div class="space-y-1">
				<label for="display_name" class="block text-sm font-medium">Nom d'affichage:</label>
				<input
					type="text"
					id="display_name"
					name="display_name"
					class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2"
					@input="() => check('display_name', /^([*]+)$/, 0, 32)"
					v-model=payload.display_name
					required
				/>
				<p class="text-blue-400 text-xs">Comment voulez-vous que les gens vous appellent ?</p>
			</div>
			<div class="space-y-1">
				<label for="birthday" class="block text-sm font-medium">Date de naissance:</label>
				<input type="date" id="birthday" name="birthday" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" v-model=payload.birthday required />
			</div>
			<!--div class="space-y-1">
				<label for="country" class="block text-sm font-medium">Pays de résidence</label>
				<select id="country" name="country" v-model="payload.country" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" required>
					<option v-for="ctr in countryList" :value=ctr.code>{{ ctr.flag }} {{ ctr.name }}</option>
				</select>
			</div-->
			<div class="flex justify-center gap-4">
				<button v-if="step > 0" @click="() => step -= 1" class="cursor-pointer block text-subtext text-sm font-medium underline decoration-[1.5px] decoration-transparent duration-300 hover:decoration-subtext">Retour</button>
				<button type="submit" class="cursor-pointer block bg-action text-white text-sm font-medium rounded-full px-5 py-3 duration-300 hover:bg-action-hovered">Suivant</button>
			</div>
		</form>
	</main>
	<main v-if="step === 2" class="p-4 xs:p-8">
		<form @submit.prevent="() => step = 3" class="bg-background-surface border-2 border-border-surface rounded-4xl max-w-md p-8 mx-auto space-y-4">
			<h1 class="text-2xl font-bold text-center">Gardez le contrôle</h1>
			<div class="space-y-1">
				<label for="target" class="block text-sm font-medium">Garder mon profil privé</label>
				<select id="target" name="target" v-model="payload.private" class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2" required>
					<option :value=true>Oui (recommandé)</option>
					<option :value=false :disabled="isYoungerThan18(new Date(payload.birthday as string))">Non</option>
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
				<button type="submit" class="cursor-pointer block bg-action text-white text-sm font-medium rounded-full px-5 py-3 duration-300 hover:bg-action-hovered">Entrer mon code</button>
			</div>
		</form>
	</main>
	<main v-if="step === 3" class="p-4 xs:p-8">
		<form @submit.prevent="signup" class="bg-background-surface border-2 border-border-surface rounded-4xl max-w-md p-8 mx-auto space-y-4">
			<h1 class="text-2xl font-bold text-center">Code de vérification</h1>
			<div class="space-y-1">
				<label for="code" class="block text-sm font-medium">Le code à 14 caractères qui vous a été donné</label>
				<input
					type="text"
					id="code"
					name="code"
					class="block bg-background-surface text-sm border border-border-surface rounded-lg w-full px-4 py-2"
					@input="() => check('sudo_code', /^[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{4}$/)"
					v-model=payload.sudo_code
					required
				/>
				<p v-if="!valid.sudo_code" class="text-rose-500 text-xs">Le code doit être composé de 14 caractères alphanumériques.</p>
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
