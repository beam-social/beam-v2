<script setup lang="ts">
	definePageMeta({
		title: 'Profil',
		path: '/@:username',
		middleware: 'users'
	})

	import PostCard from '@/components/cards/PostCard.vue';
	import PictureRing from '@/components/PictureRing.vue';
	import ProfileBadge from '@/components/ProfileBadge.vue';
	import ProfileCard from '@/components/cards/ProfileCard.vue';

	import Button from '~/components/Button.vue';
	import Menu from '~/components/Menu.vue';

	import type { User } from 'beamsocial'
	import type { Post } from 'beamsocial'

	import { toLiteralNumber } from '@/utils/format';
	import { useSession, useInbox } from '@/stores/session';

	const { $client } = useNuxtApp();
	const { me, refreshSession } = useSession();
	const { inbox } = useInbox();

	const route = useRoute();
	const router = useRouter();

	const username = route.params.username as string;

	const profile = ref<User | null>(null);
	const posts = ref<Post[] | null>(null);
	const following = ref<User[] | null>(null);
	const followers = ref<User[] | null>(null);

	const loading = ref<boolean>(true);
	const errorMessage = ref<string | null>(null);
	const section = ref<string>('posts');

	const blocked = ref<boolean>(false);

	async function loadProfile(profileUsername: string) {
		loading.value = true;
		errorMessage.value = null;
		profile.value = null;
		posts.value = null;
		following.value = null;
		followers.value = null;
		blocked.value = false;

		document.title = "@" + profileUsername + " • Beam"

		await refreshSession(() => {
			router.push('/auth/login?return=' + encodeURIComponent(window.location.pathname))
		});

		try {
			const _profile: User | null = await $client.getUser(profileUsername);
			profile.value = _profile;

			document.title = (profile.value?.display_name || `@${profileUsername}`) + " • Beam"

			let _posts: Post[] | null = await $client.fetchUserPosts(profileUsername);
			posts.value = _posts;
		} catch(err: any) {
			const msg = err.response.data.message || '';
			loading.value = false;

			if (msg.includes('Private')) {
				errorMessage.value = 'Ce profil est privé.';
			} else if (msg.includes('NotFound')) {
				errorMessage.value = 'Utilisateur introuvable.';
			} else {
				errorMessage.value = 'Une erreur est survenue.';
				console.error('Erreur inconnue :', err);
			}
		}

		try {
			profile.value?.getFollowing().then(async users => {
				following.value = users
			});
		} catch(err: any) {
			console.error('Erreur lors du chargement des abonnements :', err);
		}

		try {
			profile.value?.getFollowers().then(async users => {
				followers.value = users
			});
		} catch(err: any) {
			console.error('Erreur lors du chargement des abonnés :', err);
		} finally {
			loading.value = false;
		}
	}

	onMounted(async () => {
		await loadProfile(username);
	});

	watch(() => route.params.username, async (newUsername) => {
		if (typeof newUsername === 'string') {
			await loadProfile(newUsername);
		}
	});

	watch(me, () => {
		blocked.value = me.value?.relations.blocklist.includes(profile.value?.id || '') || false
	})
</script>
<template>
	<main v-if="loading"
		class="relative grow flex items-center justify-center text-center p-4 xs:p-8"
	>
		<p class="text-2xl font-bold">Chargement...</p>
	</main>

	<main v-else-if="profile" class="xs:p-8">
		<section class="flex flex-col xs:gap-6">
			<div id="profileBox" class="select-none shrink-0 bg-background-surface text-text-surface text-center p-8 xs:border-2 xs:border-border-surface xs:rounded-4xl w-full h-full xs:p-12 space-y-6">
				<div class="space-y-4">
					<PictureRing
						:src=profile.avatar_url!
						:size=32
						:thickness=3.2
						:primary="profile.badge?.colors['stops']![0] || 'transparent'"
						:second="profile.badge?.colors['stops']![1] || 'transparent'"
						class="mx-auto"
					/>
					<div class="-space-y-1">
						<h1 class="text-2xl font-bold">{{ profile.display_name ? profile.display_name : profile.name }} <ProfileBadge :badge=profile.badge class="inline w-8 h-8 -translate-y-1" /></h1>
						<p v-if="profile.pronouns || profile.account_type" class="opacity-50 font-medium">
							<span v-if="profile.pronouns">{{ profile.pronouns }}</span>
							<span v-if="profile.pronouns && profile.account_type"> • </span>
							<span v-if="profile.account_type">{{ profile.account_type }}</span>
						</p>
						<p><span class="text-subtext font-medium">@{{ profile.name }}</span></p>
					</div>
				</div>
				<div class="grid grid-cols-3 max-w-96 mx-auto">
					<div class="cursor-pointer flex flex-col -space-y-1" @click="section = 'posts'">
						<span class="text-2xl font-bold">{{ toLiteralNumber(posts?.length || 0) }}</span>
						<span class="opacity-50 text-sm font-medium">Posts</span>
					</div>
					<div class="cursor-pointer flex flex-col -space-y-1" @click="section = 'following'">
						<span class="text-2xl font-bold">{{ toLiteralNumber(profile.following) }}</span>
						<span class="opacity-50 text-sm font-medium">Abonnements</span>
					</div>
					<div class="cursor-pointer flex flex-col -space-y-1" @click="section = 'followers'">
						<span class="text-2xl font-bold">{{ toLiteralNumber(profile.followers) }}</span>
						<span class="opacity-50 text-sm font-medium">Abonnés</span>
					</div>
				</div>
				<div class="flex justify-center items-center gap-x-2" v-if="me && profile.id != me.profile.id">
					<Button
						v-if="me.relations.following.includes(profile.id)"
						label="Suivi(e)"
						type="neutral"
						size="lg"
						:handler="async () => { await profile!.unfollow(); await refreshSession() }"
					/>
					<Button
						v-else-if="inbox?.outgoing.follow.some(f => f.to.id == profile?.id)"
						label="Demande envoyée"
						type="neutral"
						size="lg"
						:handler="async () => { await profile!.unfollow(); await refreshSession() }"
					/>
					<Button
						v-else
						label="Suivre"
						type="action"
						size="lg"
						:handler="async () => { await profile!.follow(); await refreshSession() }"
					/>
					<div class="bg-zinc-600/5 rounded-full p-2">
						<Menu
							:actions="[
								(me?.relations.blocklist.includes(profile.id) ? {
									label: `Débloquer ${profile.display_name || profile.name}`,
									style: 'normal',
									handler: async () => {
										await profile!.unblock();
										await refreshSession();
									}
								} : {
									label: `Bloquer ${profile.display_name || profile.name}`,
									style: 'danger',
									handler: async () => {
										await profile!.block();
										await refreshSession();
									}
								})
							]"
						/>
					</div>
				</div>
				<div class="space-y-1">
					<p class="opacity-50 text-subtext text-sm font-medium">Membre depuis le {{ new Date(profile.creation_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
					<p>{{ profile.description }}</p>
				</div>
			</div>
			<div class="grow space-y-4 h-full max-md:p-4">
				<div class="flex gap-1 bg-background-surface backdrop-blur-sm text-text-surface border-2 border-border-surface rounded-full w-fit p-2 mx-auto">
					<button
						class="cursor-pointer text-primary text-sm font-medium rounded-full px-4 py-2 duration-300"
						:class="section == 'posts' ? 'bg-primary/10' : 'hover:bg-primary/5'"
						@click="() => section = 'posts'"
					>Posts</button>
					<button
						class="cursor-pointer text-primary text-sm font-medium rounded-full px-4 py-2 duration-300"
						:class="section == 'following' ? 'bg-primary/10' : 'hover:bg-primary/5'"
						@click="() => section = 'following'"
					>Abonnements</button>
					<button
						class="cursor-pointer text-primary text-sm font-medium rounded-full px-4 py-2 duration-300"
						:class="section == 'followers' ? 'bg-primary/10' : 'hover:bg-primary/5'"
						@click="() => section = 'followers'"
					>Abonnés</button>
				</div>
				<div v-if="section == 'posts'" class="relative grow space-y-4">
					<div v-if="posts?.length || 0" class="flex flex-col gap-2 md:gap-4">
						<PostCard
							v-for="post in posts"
							:key=post.id
							:data=post
							:me=me
							:client=$client
							:clickable=true
							:short=true
						/>
					</div>
					<div v-else class="flex flex-col items-center justify-center h-full pt-6 gap-4">
						<p class="text-2xl font-bold">Cette section semble vide...</p>
						<RouterLink v-if="profile.id == me?.profile.id" :to="'/write?return=' + route.path" class="cursor-pointer block bg-action text-white text-sm font-medium rounded-full px-7 py-3 duration-150 hover:bg-action-hovered">Partagez quelque chose</RouterLink>
						<p v-else>Retourner à l'<RouterLink to=/ class="text-primary">accueil</RouterLink>.</p>
					</div>
				</div>
				<div v-else-if="section == 'following'" class="relative grow justify-center">
					<div v-if="following?.length || 0" class="grid grid-cols-1 gap-2 lg:grid-cols-2">
						<ProfileCard
							v-for="user in following"
							:key=user.id
							:profile=user
							:me=me
							:clickable=true
							:actions="me ? (
								me.profile.id != user.id ? [
									me.relations.following.includes(user.id) ? {
										label: 'Suivi(e)',
										type: 'neutral',
										handler: async () => { await user.unfollow(); await refreshSession() }
									} : inbox?.outgoing.follow.some(req => req.to.id === user.id) ? {
										label: 'Demande envoyée',
										type: 'neutral',
										handler: async () => { await user.unfollow(); await refreshSession() }
									} : {
										label: 'Suivre',
										type: 'action',
										handler: async () => { await user.follow(); await refreshSession() }
									}
								] : [
									{
										label: 'Vous',
										type: 'transparent',
										handler: async () => { /* Rien à faire */ }
									}
								]
							) : []"
						/>
					</div>
					<div v-else class="relative grow flex flex-col items-center justify-center text-center pt-6 gap-4">
						<p class="text-2xl font-bold">Cette section semble vide...</p>
					</div>
				</div>
				<div v-else-if="section == 'followers'" class="relative grow justify-center">
					<div v-if="followers?.length || 0" class="grid grid-cols-1 gap-2 lg:grid-cols-2">
						<ProfileCard
							v-for="user in followers"
							:key=user.id
							:profile=user
							:me=me
							:clickable=true
							:actions="me ? (
								me.profile.id != user.id ? [
									me.relations.following.includes(user.id) ? {
										label: 'Suivi(e)',
										type: 'neutral',
										handler: async () => { await user.unfollow(); await refreshSession() }
									} : inbox?.outgoing.follow.some(req => req.to.id === user.id) ? {
										label: 'Demande envoyée',
										type: 'neutral',
										handler: async () => { await user.unfollow(); await refreshSession() }
									} : {
										label: 'Suivre',
										type: 'action',
										handler: async () => { await user.follow(); await refreshSession() }
									}
								] : [
									{
										label: 'Vous',
										type: 'transparent',
										handler: async () => { /* Rien à faire */ }
									}
								]
							) : []"
						/>
					</div>
					<div v-else class="relative grow flex flex-col items-center justify-center text-center pt-6 gap-4">
						<p class="text-2xl font-bold">Cette section semble vide...</p>
						<button
							v-if="me?.profile.id != profile.id"
							@click=profile.follow
							class="cursor-pointer bg-action text-white text-sm font-medium rounded-full px-5 py-3 duration-300 hover:bg-action-hovered"
						>
							Devenez le 1er fan !
						</button>
					</div>
				</div>
			</div>
		</section>
	</main>

	<main v-else-if="errorMessage" class="relative grow flex items-center justify-center text-center">
		<p class="text-2xl font-bold">{{ errorMessage }}</p>
	</main>

	<main v-else class="relative grow flex items-center justify-center text-center">
		<p class="text-2xl font-bold">Ce profil n'existe pas.</p>
	</main>
</template>
