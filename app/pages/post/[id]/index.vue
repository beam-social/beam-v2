<script setup lang="ts">
	definePageMeta({
		title: 'Publication • Beam',
		middleware: 'posts'
	});

	import PostCard from "@/components/cards/PostCard.vue";
	import CommentCard from "@/components/cards/CommentCard.vue";
	import PictureRing from "@/components/PictureRing.vue";
	import ProfileBadge from "@/components/ProfileBadge.vue";

	import { useSession } from "@/stores/session";

	import { Comment } from "beamsocial";
	import type { Post } from "beamsocial";

	import axios from "axios";

	const { $client: client, $apiUrl: apiUrl } = useNuxtApp();
	const { me, refreshSession } = useSession();

	const route = useRoute();
	const router = useRouter();

	const id = route.params.id as string;

	const post = ref<Post | null>(null);
	const comments = ref<Comment[]>([]);
	let baselike: number | null = null;

	const loading = ref<boolean>(true);
	const errorMessage = ref<string | null>(null);

	/* Préparation du commentaire */
	const content = ref<string>('');
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
			alert("Le contenu du commentaire doit contenir entre 1 et 250 caractères.");
			return;
		}

		try {
			await post.value.add_comment(
				content.value,
				target.value,
			);

			content.value = "";
			await loadPost(post.value.id);
		} catch (err: any) {
			const msg = err.response?.data?.message || "";
			if (msg === "PrivatePost") {
				alert("Impossible de commenter un post privé.");
			} else {
				alert("Une erreur est survenue lors de la publication du commentaire.");
				console.error("Erreur inconnue :", err);
			}
		}
	};

	async function loadPost(postId: string) {
		loading.value = true;
		errorMessage.value = null;

		await refreshSession(
			() => router.push("/auth/login?return=" + encodeURIComponent(window.location.pathname)),
		);

		try {
			let _post: Post | null = await client.getPost(postId);
			post.value = _post;
			baselike =
				post.value.likes -
				(+!!me.value?.tastes.likes.includes(postId) || 0);

			try {
				const response = await axios.get(
					`${apiUrl}/posts/${postId}/comments`,
					{
						withCredentials: true,
					},
				);
				const data = response?.data;
				const rawComments = Array.isArray(data?.comments)
					? data.comments
					: Array.isArray(data)
						? data
						: [];
				comments.value = rawComments.map((item: any) => {
					const comment = new Comment(item.id);
					comment.__load(item, me.value || undefined, apiUrl);
					return comment;
				});
			} catch {
				comments.value = [];
			}
		} catch (err: any) {
			const msg = err.response.data.message || "";
			loading.value = false;

			if (msg == "PrivatePost") {
				errorMessage.value = "Ce post est privé.";
			} else if (msg == "PostNotFound") {
				errorMessage.value = "Post introuvable.";
			} else {
				errorMessage.value = "Une erreur est survenue.";
				console.error("Erreur inconnue :", err);
			}
		} finally {
			loading.value = false;
		}
	}

	onMounted(async () => {
		await refreshSession(() => {
			router.push('/auth/login?return=' + encodeURIComponent(window.location.pathname))
		});

		await loadPost(id);
	});

	watch(
		() => route.params.id,
		async (newId) => {
			if (typeof newId === "string") {
				await loadPost(newId);
			}
		},
	);
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
			<div class="block bg-background-surface text-text-surface text-left border border-border-surface rounded-3xl w-full p-4 space-y-3">
				<div class="flex items-center gap-x-2">
					<PictureRing
						:src=me?.avatar!
						:size=12
						:thickness=1.2
						:primary="me?.profile.badge?.colors['stops']![0] || 'transparent'"
						:second="me?.profile.badge?.colors['stops']![1] || 'transparent'"
					/>
					<span class="font-medium">{{ me?.profile?.display_name || me?.profile?.name || '...' }} <ProfileBadge :badge="me?.profile.badge || null" class="inline w-4 h-4 ml-0.5 -translate-y-0.5" /> </span>
				</div>
				<textarea
					v-model="content"
					class="border-none rounded-xl outline-none w-full h-24 resize-none px-2"
					placeholder="Qu'allez-vous partager aujourd'hui ?"
					:minlength=1
					:maxlength=250
				></textarea>
				<div class="flex gap-4 justify-end items-center">
					<span v-if="content.length <= 250 * 0.9" class="text-subtext text-sm">{{ content.length }}/250</span>
					<span v-else class="text-danger text-sm">{{ content.length }}/250</span>
					<button
						@click="submit"
						class="cursor-pointer block bg-primary text-white text-sm font-medium rounded-xl px-5 py-3 duration-300 hover:bg-primary-darker"
					>Répondre</button>
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
