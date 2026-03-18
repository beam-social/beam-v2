<script setup lang="ts">
	import PostView from '@/components/cards/PostCard.vue';
	import ProfileCard from '@/components/cards/ProfileCard.vue';

	import { useSession } from '@/stores/session';

	useHead({
		title: 'Discover • Beam',
		meta: [
			{ name: 'description', content: 'Découvrez les dernières publications des personnes que vous suivez.' }
		]
	})

	const { $client } = useNuxtApp();
	import { useFeed } from '@/services/feed';

	const { me, refreshSession } = useSession();
	const { getFeed, posts } = useFeed();

	const router = useRouter();

	const tab = ref<'feed' | 'following' | 'top'>('feed')

	onMounted(async () => {
		await refreshSession(() => {
			router.push('/auth/login?return=' + encodeURIComponent(window.location.pathname))
		});

		await getFeed();
	});
</script>
<template>
	<main class="flex flex-col p-4 gap-4 xs:p-8 lg:pt-48 xl:pt-64">
		<div class="space-y-1">
			<h1 class="text-4xl text-center font-bold">Discover</h1>
		</div>
		<section class="flex flex-col gap-2 md:gap-4" v-if="posts.length">
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
		<section v-else>
			<p class="text-2xl font-bold text-center">Aucun post à afficher pour le moment.</p>
		</section>
	</main>
</template>
