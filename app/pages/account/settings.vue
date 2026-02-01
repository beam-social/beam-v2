<script setup lang="ts">
	import { EyeIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/vue/24/outline';
	import { ArrowRightStartOnRectangleIcon, FingerPrintIcon, SparklesIcon, UserIcon } from '@heroicons/vue/24/solid';
	import { ChevronRightIcon } from '@heroicons/vue/24/outline';

	import ProfileBadge from '@/components/ProfileBadge.vue';
	import ThemePreviewCard from '@/components/cards/ThemePreviewCard.vue';
	import ShopBadgeCard from '@/components/cards/ShopBadgeCard.vue';

	import { onMounted, onUnmounted, ref, watch } from 'vue';
	import { useRouter } from 'vue-router';

	import axios from 'axios';

	import type { Badge } from 'beamsocial';

	import { me, refreshMe, setMe } from '@/stores/session';

	const { $client, $apiUrl } = useNuxtApp();
	import { syncTheme, setTheme, themes } from '@/services/theme';
	import { grades } from '@/utils/profiles';

	interface Entitlement {
		id: string;
		name: string;
		account: string;
		granted_by: string;
		granted_at: Date;
		expires_at: Date;
		revoked: boolean;
		reward_type: string;
		reward_id: string;
		reason?: string;
	}


	$client.refresh();

	const router = useRouter();

	const section = ref<string>('home');

	const profile = ref<{
		name: string;
		display_name: string;
		pronouns: string;
		account_type: string;
		status: string;
		description: string
		badge: string | null
	}>({
		name: '',
		display_name: '',
		pronouns: '',
		account_type: '',
		status: '',
		description: '',
		badge: null
	});

	const settings = ref<{
		id: string;
		privacy: {
			profile: 'everyone' | 'followers' | 'friends' | 'me';
			status: 'everyone' | 'followers' | 'friends' | 'me';
			birthday: 'everyone' | 'followers' | 'friends' | 'me';
			dms: 'everyone' | 'followers' | 'friends' | 'me';
		},
		appearance: {
			global_theme: string;
			high_contrast: boolean;
			color_blind_mode: boolean
		}
	}>({
		id: '',
		privacy: {
			profile: 'followers',
			status: 'followers',
			birthday: 'followers',
			dms: 'friends'
		},
		appearance: {
			global_theme: me.value?.settings.appearance.global_theme || 'light',
			high_contrast: false,
			color_blind_mode: false
		}
	});

	const credentials = ref<{
		username: string;
		email: string;
	}>({
		username: '',
		email: ''
	});

	const badges = ref<Badge[]>([]);
	const entitlements = ref<Entitlement[]>([]);

	onMounted(async () => {
		document.title = "Paramètres • Beam"

		await refreshMe(() => {
			router.push('/login?return=' + encodeURIComponent(window.location.pathname))
		});

	$client.me()
		.then((session: any) => {
			if (!session) {
				router.push('/login?return=' + encodeURIComponent(window.location.pathname))
			} else {
				setMe(session)

			profile.value = {
				name: session.profile.name,
				display_name: session.profile.display_name ?? '',
				pronouns: session.profile.pronouns ?? '',
				account_type: session.profile.account_type ?? '',
				status: session.profile.status ?? '',
				description: session.profile.description ?? '',
				badge: session.profile.badge?.id || null
			}

			settings.value = session.settings as typeof settings.value;
		}
	});

	axios.get(
		`${$apiUrl}/auth/credentials`,
			{
				withCredentials: true
			}
		).then(response => {
			credentials.value = response.data;
		});

		axios.get(
		`${$apiUrl}/me/entitlements/badges`,
			{
				withCredentials: true
			}
		).then(response => {
			badges.value = response.data;
		});

		axios.get(
		`${$apiUrl}/me/entitlements`,
			{
				withCredentials: true,
				params: {
					include_revoked: true,
					include_expired: true
				}
			}
		).then(response => {
			entitlements.value = response.data;
		});
	});

	onUnmounted(() => {
		syncTheme()
	})

	watch(settings, (newSettings) => {
		if (me?.value) {
			setMe({
				...me.value,
				settings: newSettings
			});
		}
	}, { immediate: true, deep: true });

	function saveProfile() {
		axios.put(
		`${$apiUrl}/me/profile`,
			profile.value,
			{
				withCredentials: true
			}
		).then(() => {
			alert('Profil mis à jour avec succès !');
		}).catch(() => {
			alert("Une erreur est survenue lors de la mise à jour du profil.");
		});
	}

	function saveSettings() {
		axios.put(
		`${$apiUrl}/me/settings`,
			settings.value,
			{
				withCredentials: true
			}
		).then(() => {
			alert('Paramètres modifiés avec succès !');
		}).catch(() => {
			alert("Une erreur est survenue lors de la mise à jour des paramètres.");
		});
	}

	function uploadAvatar() {
		const formData = new FormData();
		formData.append('avatar', (document.getElementById('avatarInput') as HTMLInputElement).files![0]!);

		axios.post(
		`${$apiUrl}/me/avatar`,
			formData,
			{
				withCredentials: true,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		).then(() => {
			alert('Avatar mis à jour avec succès !');
			window.location.reload();
		}).catch(() => {
			alert("Une erreur est survenue lors de la mise à jour de l'avatar.");
		});
	}
</script>
<template>
	<main class="grow select-none flex flex-col p-4 gap-4 sm:p-8">
		<h1 v-if="section == 'home'" class="text-3xl text-center font-bold">Paramètres</h1>
		<div v-else class="flex items-center gap-4">
			<button @click="section = 'home'" class="cursor-pointer flex items-center gap-1 bg-background-surface text-text-surface font-medium border-2 border-border-surface rounded-full w-fit px-4 py-2">
				<ChevronRightIcon class="w-4 h-4 rotate-180 stroke-2 stroke-subtext text-subtext" />
				<span>Retour</span>
			</button>
		</div>
		<section v-if="section == 'home'" class="space-y-8">
			<div class="space-y-1">
				<div class="grid grid-cols-1 gap-2 xl:grid-cols-3">
					<button
						class="cursor-pointer flex gap-1 items-center bg-background-surface text-text-surface font-medium border-2 border-border-surface rounded-3xl w-full px-6 py-6"
						@click="() => section = 'profile'"
					>
						<UserCircleIcon class="w-8 h-8" />
						<span class="grow text-lg text-left line-clamp-1">Modifier mon profil</span>
						<ChevronRightIcon class="w-4 h-4 stroke-2 stroke-subtext text-subtext" />
					</button>
					<button
						class="cursor-pointer flex gap-1 items-center bg-[#d013ff]/15 text-[#d013ff] font-medium border-2 border-[#d013ff]/50 rounded-3xl w-full px-6 py-6"
						@click="() => section = 'plus'"
					>
						<SparklesIcon class="text-[#d013ff] w-7 h-7 mx-0.5" />
						<span class="grow text-lg text-left line-clamp-1">Gérer mon grade</span>
						<ChevronRightIcon class="w-4 h-4 stroke-2 stroke-[#d013ff] text-[#d013ff]" />
					</button>
					<button
						class="cursor-pointer flex gap-1 items-center bg-danger/15 text-danger font-medium border-2 border-danger/50 rounded-3xl w-full px-6 py-6"
						@click="() => router.push('/auth/logout')"
					>
						<ArrowRightStartOnRectangleIcon class="text-danger w-7 h-7 mx-0.5" />
						<span class="grow text-lg text-left line-clamp-1">Se déconnecter</span>
						<ChevronRightIcon class="w-4 h-4 stroke-2 stroke-danger text-danger" />
					</button>
				</div>
			</div>
			<div class="space-y-1">
				<h2 class="text-subtext font-medium uppercase px-6">Compte & Sécurité</h2>
				<div class="flex flex-col border-2 border-border-surface rounded-3xl divide-y divide-border-surface overflow-hidden">
					<button
						class="cursor-pointer flex gap-1 items-center bg-background-surface text-text-surface font-medium w-full px-6 py-6"
						@click="() => section = 'account'"
					>
						<FingerPrintIcon class="w-8 h-8" />
						<span class="grow text-lg text-left line-clamp-1">Compte</span>
						<ChevronRightIcon class="w-4 h-4 stroke-2 stroke-subtext text-subtext" />
					</button>
					<button
						class="cursor-pointer flex gap-1 items-center bg-background-surface text-text-surface font-medium w-full px-6 py-6"
						@click="() => section = 'privacy'"
					>
						<LockClosedIcon class="w-8 h-8" />
						<span class="grow text-lg text-left line-clamp-1">Confidentialité</span>
						<ChevronRightIcon class="w-4 h-4 stroke-2 stroke-subtext text-subtext" />
					</button>
				</div>
			</div>
			<div class="space-y-1">
				<h2 class="text-subtext font-medium uppercase px-6">Personnalisation</h2>
				<div class="flex flex-col border-2 border-border-surface rounded-3xl divide-y divide-border-surface overflow-hidden">
					<button
						class="cursor-pointer flex gap-1 items-center bg-background-surface text-text-surface font-medium w-full px-6 py-6"
						@click="() => section = 'appearance'"
					>
						<EyeIcon class="w-8 h-8" />
						<span class="grow text-lg text-left line-clamp-1">Apparence</span>
						<ChevronRightIcon class="w-4 h-4 stroke-2 stroke-subtext text-subtext" />
					</button>
				</div>
			</div>
		</section>
		<section v-if="section == 'profile'" class="px-4 space-y-8">
			<h1 class="text-3xl font-bold">Paramètres du profil</h1>
			<div class="flex gap-8 max-sm:flex-col max-sm:items-center sm:justify-center">
				<div class="shrink-0 w-48 sm:w-56">
					<input type="file" id="avatarInput" class="hidden" accept="image/*" @change="() => uploadAvatar()" />
					<label for="avatarInput" class="cursor-pointer">
						<img :src="me?.avatar || ''" class="rounded-full w-48 h-48 sm:w-56 sm:h-56 mb-4" />
					</label>
					<p class="text-subtext text-sm">Cliquez sur la photo de profil pour la modifier.</p>
				</div>
				<div class="space-y-6 w-full">
					<div class="space-y-4">
						<label class="block font-medium">Nom d'utilisateur<br />
							<input type="text" v-model="profile.name" class="bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2 w-full sm:w-48 lg:w-64" />
							<p class="text-subtext text-sm mt-2">https://beam.ejnalo.me/@{{ profile.name }}</p>
						</label>
						<label class="block font-medium">Nom d'affichage<br />
							<input type="text" v-model="profile.display_name" class="bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2 w-full sm:w-48 lg:w-64" />
						</label>
						<label class="block font-medium">Type de compte<br />
							<input type="text" v-model="profile.account_type" class="bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2 w-full sm:w-48 lg:w-64" />
						</label>
						<label class="block font-medium">Badge<br />
							<select v-model="profile.badge" class="cursor-pointer bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2 mr-2">
								<option :value=null>Aucun</option>
								<option v-for="badge of badges" :value=badge.id>{{ badge.title }}</option>
							</select>
							<ProfileBadge :badge="badges.find((badge: Badge) => badge.id === profile.badge) || null" class="inline w-6 h-6" />
						</label>
					</div>
					<button
						class="cursor-pointer bg-action text-white text-sm font-medium rounded-full w-fit px-5 py-3 duration-300 hover:bg-action-hovered"
						@click="() => saveProfile()"
					>
						Enregistrer
					</button>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<label class="block font-medium">Pronoms<br />
					<input type="text" v-model="profile.pronouns" class="bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2 w-full" />
				</label>
				<label class="block font-medium opacity-50">Statut <br />
					<input type="text" v-model="profile.status" disabled class="bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2 w-full" />
				</label>
				<label class="block font-medium col-span-2">Description<br />
					<textarea v-model="profile.description" rows="4" class="bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2 w-full"></textarea>
				</label>
				<button
					class="cursor-pointer bg-action text-white text-sm font-medium rounded-full w-fit px-5 py-3 duration-300 hover:bg-action-hovered"
					@click="() => saveProfile()"
				>
					Enregistrer
				</button>
			</div>
		</section>
		<section v-if="section == 'plus'" class="px-4 space-y-8">
			<h1 class="text-3xl font-bold">Abonnement et grade</h1>
			<div class="text-center">
				<ProfileBadge v-if="me?.profile.badge" :badge="me.profile.badge" class="w-20 h-20 mx-auto mb-2" />
				<div v-else class="bg-background-surface w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
					<UserIcon class="w-10 h-10 text-text-surface" />
				</div>
				<h2 class="text-2xl font-bold">{{ me?.profile.badge?.title || 'Aucun badge' }}</h2>
				<p class="text-subtext text-center">Grade {{ grades[me?.profile.level || 3] }}</p>
			</div>
			<div v-if="me?.profile.level === 0">
				<p>Votre compte est définitivement suspendu.</p>
			</div>
			<div v-if="me?.profile.level === 1">
				<p>Vous ne pouvez plus poster sur Beam mais vous pouvez encore lire les posts.</p>
			</div>
			<div v-if="me?.profile.level === 2">
				<p>Votre compte est restreint.</p>
			</div>
			<div v-if="me?.profile.level === 3">
				<p>Abonnez-vous à Beam+ pour profiter de ces avantages:</p>
				<ul class="list-disc list-inside">
					<li>Profil personnalisé avec un badge et des couleurs</li>
					<li>Posts mis en avant dans les différents feeds</li>
					<li>Posts 2 fois plus longs</li>
					<li>Fonctionnalités à venir...</li>
				</ul>
			</div>
			<div v-if="me?.profile.level === 4" class="space-y-2">
				<h3 class="text-xl font-bold">Avantages</h3>
				<ul class="list-disc list-inside">
					<li>Profil personnalisé avec un badge et des couleurs</li>
					<li>Posts mis en avant dans les différents feeds</li>
					<li>1000 caractères par post</li>
					<li>Fonctionnalités à venir...</li>
				</ul>
				<p>Pour renoncer à ce grade, merci de contacter le support.</p>
			</div>
			<div v-if="me?.profile.level && me.profile.level >= 5" class="space-y-2">
				<h3 class="text-xl font-bold">Avantages</h3>
				<ul class="list-disc list-inside">
					<li>Profil personnalisé avec un badge et des couleurs</li>
					<li>Posts mis en avant dans les différents feeds</li>
					<li>Reconnaissance au sein de la communauté</li>
					<li>2000 caractères par post</li>
					<li>Fonctionnalités à venir...</li>
				</ul>
				<p>Pour renoncer à ce grade, merci de contacter le support.</p>
			</div>
			<div class="space-y-4">
				<h2 class="text-2xl font-bold">Mes badges</h2>
				<div v-if="badges.length == 0" class="text-center text-subtext">
					<p>Vous n'avez aucun badge.</p>
				</div>
				<div v-else class="grid grid-cols-2 gap-4 xl:grid-cols-3">
					<ShopBadgeCard v-for="badge in badges" :key="badge.id" :badge="badge" />
				</div>
			</div>
			<div class="space-y-4">
				<h2 class="text-2xl font-bold">Mes récompenses</h2>
				<div v-if="entitlements.length == 0" class="text-center text-subtext">
					<p>Vous n'avez aucune récompense.</p>
				</div>
				<div v-else class="divide-y divide-border-surface">
					<div
						v-for="entitlement in entitlements"
						:key="entitlement.id"
						class="py-4 space-y-2"
						:class="(entitlement.revoked || entitlement.expires_at <= new Date() ? 'opacity-50' : '')"
					>
						<h3 class="text-lg font-semibold">{{ entitlement.name }}</h3>
						<p class="text-sm">Attribué le {{ new Date(entitlement.granted_at).toLocaleDateString() }}</p>
						<p v-if="entitlement.expires_at" class="text-sm">Expire le {{ new Date(entitlement.expires_at).toLocaleDateString() }}</p>
						<p v-if="entitlement.reason" class="text-sm">Raison: {{ entitlement.reason }}</p>
					</div>
				</div>
			</div>
		</section>
		<section v-if="section == 'account'" class="px-4 space-y-8">
			<h1 class="text-3xl font-bold">Paramètres du compte</h1>
			<div class="space-y-6">
				<h2 class="text-2xl font-semibold">Informations de connexion</h2>
				<div class="space-y-2">
					<label class="block font-medium text-subtext">Nom d'utilisateur<br />
						<input type="text" v-model="credentials.username" disabled class="cursor-not-allowed bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2 w-auto" />
					</label>
					<label class="block font-medium text-subtext">Adresse email<br />
						<input type="email" v-model="credentials.email" disabled class="bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2 w-auto" />
						<button @click="router.push('/account/sudo?action=change-email')" class="ml-2 bg-action text-white text-sm px-4 py-2 rounded-full hover:bg-action-hovered transition">Modifier</button>
					</label>
				</div>
				<button @click="router.push('/account/sudo?action=change-password')" class="bg-action text-white text-sm px-4 py-2 rounded-full hover:bg-action-hovered transition">Changer mon mot de passe</button>
			</div>
			<div class="space-y-2">
				<h2 class="text-2xl font-semibold">Zone de danger</h2>
				<button @click="router.push('/account/sudo?action=delete-account')" class="block bg-danger text-white px-4 py-2 rounded-full hover:bg-danger-hovered transition">Supprimer mon compte</button>
			</div>
		</section>
		<section v-if="section == 'privacy'" class="px-4 space-y-8">
			<h1 class="text-3xl font-bold">Confidentialité et vie privée</h1>
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Paramètres de visibilité</h2>
				<label class="block font-medium">Profil
					<select v-model="settings.privacy.profile" class="bg-background-surface text-sm border border-border-surface rounded-lg ml-4 px-2 py-2 w-64">
						<option value="everyone">Public</option>
						<option value="followers">Privé</option>
					</select>
				</label>
				<label class="block font-medium">Statut
					<select v-model="settings.privacy.status" class="bg-background-surface text-sm border border-border-surface rounded-lg ml-4 px-2 py-2 w-64">
						<option value="everyone">Tout le monde</option>
						<option value="followers">Mes abonnés</option>
						<option value="friends">Mes amis</option>
					</select>
				</label>
				<label class="block font-medium">Anniversaire
					<select v-model="settings.privacy.birthday" class="bg-background-surface text-sm border border-border-surface rounded-lg ml-4 px-2 py-2 w-64">
						<option value="everyone">Tout le monde</option>
						<option value="followers">Mes abonnés</option>
						<option value="friends">Mes amis</option>
						<option value="me">Seulement moi</option>
					</select>
				</label>
			</div>
			<div class="select-none cursor-not-allowed space-y-4 opacity-50">
				<h2 class="text-2xl font-semibold">Messages directs</h2>
				<label class="cursor-not-allowed block font-medium">Qui peut m'envoyer des messages directs ?<br />
					<select v-model="settings.privacy.dms" disabled class="bg-background-surface text-sm border border-border-surface rounded-lg px-2 py-2 w-64">
						<option value="everyone">Tout le monde</option>
						<option value="followers">Mes abonnés</option>
						<option value="friends">Mes amis</option>
						<option value="me">Personne</option>
					</select>
				</label>
			</div>
			<button
				class="cursor-pointer bg-action text-white text-sm font-medium rounded-full w-fit px-5 py-3 duration-300 hover:bg-action-hovered"
				@click="() => saveSettings()"
			>
				Enregistrer
			</button>
		</section>
		<section v-if="section == 'appearance'" class="px-4 space-y-8">
			<h1 class="text-3xl font-bold">Apparence</h1>
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Thème</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<ThemePreviewCard v-for="theme in Object.keys(themes)" :key="theme" :theme="theme" @click="() => { settings.appearance.global_theme = theme; setTheme(theme) }" />
				</div>
				<label class="cursor-not-allowed block font-medium">Correction
					<select disabled class="bg-background-surface text-sm border border-border-surface rounded-lg ml-4 px-2 py-2 w-64">
						<option :value=null>Aucune</option>
					</select>
				</label>
			</div>
			<button
				class="cursor-pointer bg-action text-white text-sm font-medium rounded-full w-fit px-5 py-3 duration-300 hover:bg-action-hovered"
				@click="() => saveSettings()"
			>
				Enregistrer
			</button>
		</section>
	</main>
</template>
