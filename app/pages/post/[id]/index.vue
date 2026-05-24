<script setup lang="ts">
definePageMeta({
	title: "Publication • Beam",
	middleware: "posts",
});

import PostCard from "@/components/cards/PostCard.vue";
import CommentCard from "@/components/cards/CommentCard.vue";
import PictureRing from "@/components/PictureRing.vue";
import ProfileBadge from "@/components/ProfileBadge.vue";

import { ensureSession, useSession } from "~/composables/session";
import { usePostPageData } from "~/composables/post";

const { $client: client } = useNuxtApp();
const { me } = useSession();

const route = useRoute();

const id = route.params.id as string;

await ensureSession("/auth/login?return=" + encodeURIComponent(route.fullPath));

const {
	post,
	comments,
	errorMessage,
	refresh: refreshPostData,
	pending,
} = await usePostPageData(id);

const loading = computed(
	() => pending.value && !post.value && !errorMessage.value,
);

/* Préparation du commentaire */
const content = ref<string>("");
const target = ref<"me" | "friends" | "followers" | "everyone">("everyone");

const submit = async () => {
	if (!me.value) {
		alert("Vous devez être connecté pour publier un commentaire.");
		return;
	}

	if (!post.value) {
		alert("Post non chargé.");
		return;
	}

	if (content.value.length < 1 || content.value.length > 250) {
		alert(
			"Le contenu du commentaire doit contenir entre 1 et 250 caractères.",
		);
		return;
	}

	try {
		await post.value.add_comment(content.value, target.value);

		content.value = "";
		await refreshPostData();
	} catch (err: any) {
		const msg = err.response?.data?.message || "";
		if (msg === "PrivatePost") {
			alert("Impossible de commenter un post privé.");
		} else {
			alert(
				"Une erreur est survenue lors de la publication du commentaire.",
			);
			console.error("Erreur inconnue :", err);
		}
	}
};
</script>
<template>
	<main
		v-if="loading"
		class="relative grow flex items-center justify-center text-center p-4 xs:p-8"
	>
		<p class="text-2xl font-bold">Chargement...</p>
	</main>

	<main v-else-if="post" class="p-4 space-y-2 xs:p-8">
		<PostCard :data="post" :me="me" :client="client" />
		<section class="mt-8">
			<h2 class="text-xl font-bold mb-4">
				Commentaires ({{ post.comments }})
			</h2>
			<div
				class="block bg-surface text-on-surface text-left border border-surface-border rounded-3xl w-full p-4 space-y-3"
			>
				<div class="flex items-center gap-x-2">
					<PictureRing
						:src="me?.avatar!"
						:size="12"
						:thickness="1.2"
						:primary="
							me?.profile.badge?.colors['stops']![0] ||
							'transparent'
						"
						:second="
							me?.profile.badge?.colors['stops']![1] ||
							'transparent'
						"
					/>
					<span class="font-medium"
						>{{
							me?.profile?.display_name ||
							me?.profile?.name ||
							"..."
						}}
						<ProfileBadge
							:badge="me?.profile.badge || null"
							class="inline w-4 h-4 ml-0.5 -translate-y-0.5"
						/>
					</span>
				</div>
				<textarea
					v-model="content"
					class="border-none rounded-xl outline-none w-full h-24 resize-none px-2"
					placeholder="Qu'allez-vous partager aujourd'hui ?"
					:minlength="1"
					:maxlength="250"
				></textarea>
				<div class="flex gap-4 justify-end items-center">
					<span
						v-if="content.length <= 250 * 0.9"
						class="text-muted text-sm"
						>{{ content.length }}/250</span
					>
					<span v-else class="text-danger text-sm"
						>{{ content.length }}/250</span
					>
					<button
						@click="submit"
						class="cursor-pointer block bg-primary text-white text-sm font-medium rounded-xl px-5 py-3 duration-300 hover:bg-primary-darker"
					>
						Répondre
					</button>
				</div>
			</div>
		</section>
		<section v-if="post.comments > 0" class="mt-4">
			<div class="flex flex-col gap-2">
				<CommentCard
					v-for="comment in comments"
					:key="comment.id"
					:data="comment"
					:me="me"
					:client="client"
					:clickable="false"
				/>
			</div>
		</section>
	</main>

	<main
		v-else-if="errorMessage"
		class="relative grow flex items-center justify-center text-center p-4 xs:p-8"
	>
		<p class="text-2xl font-bold">{{ errorMessage }}</p>
	</main>

	<main
		v-else
		class="relative grow flex items-center justify-center text-center p-4 xs:p-8"
	>
		<p class="text-2xl font-bold">Ce post n'existe pas.</p>
	</main>
</template>
