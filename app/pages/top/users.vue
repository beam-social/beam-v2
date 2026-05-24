<script setup lang="ts">
import PostView from "@/components/cards/PostCard.vue";
import ProfileCard from "@/components/cards/ProfileCard.vue";

import { useSession } from "~/composables/session";
import { useInbox } from "~/composables/session";

useHead({
	title: "Classement • Beam",
	meta: [
		{
			name: "description",
			content: "Découvrez les Beamers les plus populaires du réseau.",
		},
	],
});

const { $client } = useNuxtApp();
import { useFeed } from "@/services/feed";

const { me, refreshSession } = useSession();
const { getLeaderboard, topUsers } = useFeed();
const { inbox } = useInbox();

const router = useRouter();

onMounted(async () => {
	await refreshSession(() => {
		router.push(
			"/auth/login?return=" +
				encodeURIComponent(window.location.pathname),
		);
	});

	await getLeaderboard();
});
</script>
<template>
	<main class="flex flex-col p-4 gap-4 xs:p-8">
		<div class="space-y-1">
			<h1 class="text-4xl text-center font-bold">Classement</h1>
		</div>
		<section class="flex flex-col gap-2 md:gap-4" v-if="topUsers.length">
			<ProfileCard
				v-for="user in topUsers"
				:key="user.id"
				:profile="user"
				:me="me"
				:client="$client"
				:clickable="true"
				:deployed="true"
				:actions="
					me
						? me.profile.id != user.id
							? [
									me.relations.following.includes(user.id)
										? {
												label: 'Suivi(e)',
												type: 'neutral',
												handler: async () => {
													await user.unfollow();
													await refreshSession();
												},
											}
										: inbox?.outgoing.follow.some(
													(req) =>
														req.to.id === user.id,
											  )
											? {
													label: 'Demande envoyée',
													type: 'neutral',
													handler: async () => {
														await user.unfollow();
														await refreshSession();
													},
												}
											: {
													label: 'Suivre',
													type: 'action',
													handler: async () => {
														await user.follow();
														await refreshSession();
													},
												},
								]
							: [
									{
										label: 'Vous',
										type: 'transparent',
										handler: () => {},
									},
								]
						: []
				"
			/>
			<p class="text-muted text-center">
				Oups ! Tu arrives déjà à la fin du classement...
			</p>
		</section>
		<section v-else>
			<p class="text-2xl font-bold text-center">
				Aucun utilisateur à afficher pour le moment.
			</p>
		</section>
	</main>
</template>
