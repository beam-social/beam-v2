<script setup lang="ts">
	import PostView from '@/components/cards/PostCard.vue';
	import ProfileCard from '@/components/cards/ProfileCard.vue';

	import { onMounted, ref } from 'vue';

	import { me, refreshMe } from '@/stores/session';

	const { $client } = useNuxtApp();
	import { getFeed, posts, users } from '@/services/feed';

	const tab = ref<
		'posts' | 'users'
	>('posts')

	onMounted(async () => {
		document.title = "Beam • Discover";

		await refreshMe();
		await getFeed();
	});
</script>
<template>
	<main class="flex flex-col p-4 gap-4 sm:p-8">
		<h1 class="text-3xl text-center font-bold">Discover</h1>
		<nav
			class="sticky top-4 z-500 flex gap-1 bg-background-surface backdrop-blur-lg text-text-surface border-2 border-border-surface rounded-full shadow-xl w-fit p-2 mx-auto"
		>
			<button
				class="cursor-pointer text-sm font-medium rounded-full px-4 py-2 duration-300"
				:class="tab == 'posts' ? 'text-primary bg-primary/10' : 'text-text-surface hover:bg-primary/5'"
				@click="() => { tab = 'posts'}"
			>
				Posts
			</button>
			<button
				class="cursor-pointer text-sm font-medium rounded-full px-4 py-2 duration-300"
				:class="tab == 'users' ? 'text-primary bg-primary/10' : 'text-text-surface hover:bg-primary/5'"
				@click="() => { tab = 'users'}"
			>
				Profils
			</button>
		</nav>
		<section v-if="tab == 'posts'" class="">
			<div class="flex flex-col gap-2 md:gap-4" v-if="posts.length">
				<PostView
					v-for="post in posts"
					:data=post
					:me=me
					:client=$client
					:clickable=true
					class="max-w-lg mx-auto"
				/>
				<p class="text-subtext text-center">Oups ! Tu arrives déjà à la fin de ton feed...</p>
			</div>
			<div v-else>
				<p class="text-2xl font-bold text-center">Aucun post à afficher pour le moment.</p>
			</div>
		</section>
		<section v-if="tab == 'users'" class="xl:w-2/3 xl:mx-auto">
			<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
				<ProfileCard
					v-for="user in users"
					:profile=user
					:me="me || undefined"
					:client=$client
					:clickable=true
					:actions="me ? (
						me.profile.id != user.id ? [
							me.relations.following.includes(user.id) ? {
								title: 'Suivi(e)',
								color: 'gray',
								callback: async () => { await user.unfollow(); await refreshMe() }
							} : {
								title: 'Suivre',
								color: 'action',
								callback: async () => { await user.follow(); await refreshMe() }
							}
						] : [
							{
								title: 'Vous',
								color: 'transparent',
							}
						]
					) : []"
				/>
			</div>
		</section>
	</main>
</template>
