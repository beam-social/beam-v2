import { usePostPageData } from "~/composables/post";

export default defineNuxtRouteMiddleware(async (to) => {
	const id = to.params.id as string | undefined;

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: "ID is required",
		});
	}

	try {
		const { post } = await usePostPageData(id);
		const currentPost = post.value;

		if (currentPost) {
			useHead({
				// title: 'Publication • Beam',
				title: currentPost.author?.display_name
					? `${currentPost.author.display_name} • Beam`
					: `@${currentPost.author?.name || "Beam"} • Beam`,
				meta: [
					{
						name: "description",
						// content: "Connectez-vous à Beam pour voir cette publication."
						content:
							currentPost.content ||
							`Voir la publication de ${currentPost.author?.display_name || currentPost.author?.name || "cet utilisateur"} sur Beam.`,
					},
					{
						property: "og:title",
						// content: "Publication • Beam"
						content: `Post de ${currentPost.author?.display_name || currentPost.author?.name || "Beam"} • Beam`,
					},
					{
						property: "og:description",
						// content: "Connectez-vous à Beam pour voir cette publication."
						content:
							currentPost.content ||
							`Voir la publication de ${currentPost.author?.display_name || currentPost.author?.name || "cet utilisateur"} sur Beam.`,
					},
					{
						property: "og:type",
						content: "post",
					},
					{
						property: "og:image",
						content: currentPost.author?.avatar_url || "",
					},
					{
						property: "og:url",
						content: `https://beam.ejnalo.me/post/${id}`,
					},
					{
						property: "og:color",
						// content: '#e021ff'
						content:
							currentPost.author?.badge?.colors?.["primary"] ||
							"#e021ff",
					},
				],
			});
		} else {
			throw new Error("Post not found");
		}
	} catch (error) {
		throw createError({
			statusCode: 404,
			statusMessage: "Post not found",
		});
	}
});
