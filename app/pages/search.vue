<script setup lang="ts">
	import PostView from '@/components/cards/PostCard.vue';
	import ProfileCard from '@/components/cards/ProfileCard.vue';

	import { useSession } from '@/stores/session';

	import axios from 'axios';

	import { User, Post } from 'beamsocial';

	useHead({
		title: 'Recherche • Beam',
		meta: [
			{ name: 'description', content: 'Rechercher des posts ou des comptes' }
		]
	})

	const router = useRouter();

	const { $client, $apiUrl } = useNuxtApp();
	const { me, refreshSession } = useSession();

	const tab = ref<'users' | 'posts'>('posts')

	const posts = ref<Post[]>([]);
	const users = ref<User[]>([]);

	onMounted(async () => {
		await refreshSession(() => {
			router.push('/auth/login?return=' + encodeURIComponent(window.location.pathname))
		});

		const query = new URLSearchParams(window.location.search).get('q') || '';

		if (!query) {
			return;
		}

		posts.value = [];
		users.value = [];

		axios.get(
			`${$apiUrl}/users/fetch?q=${encodeURIComponent(query)}`,
			{
				withCredentials: true
			}
		).then(response => {
			for (const u of response.data || []) {
				let user = new User(u.id);
				user.__load(u, me.value || undefined, $apiUrl);
				users.value.push(user);
			}
		});

		axios.get(
			`${$apiUrl}/posts/fetch?q=${encodeURIComponent(query)}`,
			{
				withCredentials: true
			}
		).then(response => {
			for (const p of response.data || []) {
				let post = new Post(p.id);
				post.__load(p, me.value || undefined, $apiUrl);
				posts.value.push(post);
			}
		});
	});
</script>
<template>
	<main class="flex flex-col p-4 gap-4 xs:p-8">
		<div class="space-y-1">
			<h1 class="text-4xl text-center font-bold">Résultats</h1>
		</div>
		<nav class="sticky z-500 top-4 flex gap-1 bg-background-surface backdrop-blur-xl text-text-surface border border-border-surface rounded-full w-fit p-2">
			<button
				class="cursor-pointer text-sm font-medium rounded-full px-4 py-2 duration-300"
				:class="tab == 'users' ? 'text-primary bg-primary/10' : 'text-text-surface hover:bg-primary/5'"
				@click="() => tab = 'users'"
			>Profils</button>
			<button
				class="cursor-pointer text-sm font-medium rounded-full px-4 py-2 duration-300"
				:class="tab == 'posts' ? 'text-primary bg-primary/10' : 'text-text-surface hover:bg-primary/5'"
				@click="() => tab = 'posts'"
			>Publications</button>
		</nav>
		<section v-if="tab === 'posts' && posts.length" class="flex flex-col gap-2 md:gap-4">
			<PostView
				v-for="post in posts"
				:key=post.id
				:data=post
				:me=me
				:client=$client
				:clickable=true
			/>
			<p class="text-subtext text-center">Oups ! Tu arrives déjà à la fin de ton feed...</p>
		</section>
		<section v-else-if="tab === 'users' && users.length" class="flex flex-col gap-2 md:gap-4">
			<ProfileCard
				v-for="user in users"
				:key=user.id
				:profile=user
				:me="me || undefined"
				:client=$client
				:clickable=true
				:actions="me ? (
					me.profile.id != user.id ? [
						me.relations.following.includes(user.id) ? {
							label: 'Suivi(e)',
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
							type: 'neutral',
							handler: () => {}
						}
					]
				) : []"
			/>
			<p class="text-subtext text-center">Oups ! Tu arrives déjà à la fin de ton feed...</p>
		</section>
		<section v-else>
			<p class="text-2xl font-bold text-center">Aucun post à afficher pour le moment.</p>
		</section>
	</main>
</template>
