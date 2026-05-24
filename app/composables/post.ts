import axios from "axios";
import { Comment, Post, type Session } from "beamsocial";

import { useSession } from "~/composables/session";

type SerializedRecord = Record<string, any>;

type PostPageSnapshot = {
	post: SerializedRecord | null;
	comments: SerializedRecord[];
	errorMessage: string | null;
};

function snapshot<T>(value: T): SerializedRecord {
	return JSON.parse(JSON.stringify(value)) as SerializedRecord;
}

function hydratePost(
	raw: SerializedRecord,
	me: Session | null,
	apiUrl: string,
) {
	const post = new Post(raw.id);
	post.__load(raw, me || undefined, apiUrl);
	return post;
}

function hydrateComment(
	raw: SerializedRecord,
	me: Session | null,
	apiUrl: string,
) {
	const comment = new Comment(raw.id);
	comment.__load(raw, me || undefined, apiUrl);
	return comment;
}

export async function usePostPageData(
	postId: string,
	options: { includeComments?: boolean } = {},
) {
	const { $client, $apiUrl } = useNuxtApp();
	const { me } = useSession();
	const includeComments = options.includeComments ?? true;

	const result = await useAsyncData<PostPageSnapshot>(
		`post-page:${postId}`,
		async () => {
			try {
				const post = await $client.getPost(postId);
				let rawComments: SerializedRecord[] = [];

				if (includeComments) {
					const response = await axios.get(
						`${$apiUrl}/posts/${postId}/comments`,
						{
							withCredentials: true,
						},
					);
					const data = response?.data;
					rawComments = Array.isArray(data?.comments)
						? data.comments
						: Array.isArray(data)
							? data
							: [];
				}

				return {
					post: post ? snapshot(post) : null,
					comments: snapshot(rawComments),
					errorMessage: null,
				};
			} catch (err: any) {
				const msg = err?.response?.data?.message || "";

				if (msg === "PrivatePost") {
					return {
						post: null,
						comments: [],
						errorMessage: "Ce post est privé.",
					};
				}

				if (msg === "PostNotFound") {
					return {
						post: null,
						comments: [],
						errorMessage: "Post introuvable.",
					};
				}

				console.error(
					"Erreur inconnue lors du chargement du post :",
					err,
				);

				return {
					post: null,
					comments: [],
					errorMessage: "Une erreur est survenue.",
				};
			}
		},
	);

	const post = computed(() => {
		const rawPost = result.data.value?.post;

		if (!rawPost) {
			return null;
		}

		return hydratePost(rawPost, me.value, $apiUrl);
	});

	const comments = computed(() =>
		(result.data.value?.comments ?? []).map((rawComment) =>
			hydrateComment(rawComment, me.value, $apiUrl),
		),
	);

	const baselike = computed(() => {
		if (!post.value) {
			return null;
		}

		return (
			post.value.likes - (+!!me.value?.tastes.likes.includes(postId) || 0)
		);
	});

	const errorMessage = computed(
		() => result.data.value?.errorMessage || null,
	);

	return {
		...result,
		post,
		comments,
		baselike,
		errorMessage,
	};
}
