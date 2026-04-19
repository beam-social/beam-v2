type PostMeta = {
	date?: string;
	author_name?: string;
	author_avatar_url?: string | null;
	author_badge_color?: string;
	content?: string | null;
};

export default defineNuxtRouteMiddleware(async (to) => {
	const id = to.params.id as string | undefined;

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: "ID is required",
		});
	}

	const { $client } = useNuxtApp();
	const postMeta = useState<PostMeta | null>("postMeta", () => null);

	try {
		const post = await $client.getPost(id);
		if (post) {
			const meta = {
				date: post.creation_date ? new Date(post.creation_date).toISOString() : undefined,
				author_name: post.author?.display_name || post.author?.name || 'Utilisateur Beam',
				author_avatar_url: post.author?.avatar_url ?? null,
				author_badge_color: post.author?.badge ? post.author.badge.colors['primary'] as string : '#e021ff',
				content: post.content ?? null,
			};

			postMeta.value = meta;

			useHead({
				// title: 'Publication • Beam',
				title: meta.author_name ? `${meta.author_name} • Beam` : `@${meta.author_name} • Beam`,
				meta: [
					{
						name: 'description',
						// content: "Connectez-vous à Beam pour voir cette publication."
						content: meta.content || `Voir la publication de ${meta.author_name} sur Beam.`
					},
					{
						property: 'og:title',
						// content: "Publication • Beam"
						content: meta.author_name ? `Post de ${meta.author_name} • Beam` : `@${meta.author_name} • Beam`
					},
					{
						property: 'og:description',
						// content: "Connectez-vous à Beam pour voir cette publication."
						content: meta.content || `Voir la publication de ${meta.author_name} sur Beam.`
					},
					{
						property: 'og:type',
						content: 'post'
					},
					{
						property: 'og:image',
						content: meta.author_avatar_url || ''
					},
					{
						property: 'og:url',
						content: `https://beam.ejnalo.me/post/${id}`
					},
					{
						property: 'og:color',
						// content: '#e021ff'
						content: meta.author_badge_color || '#e021ff'
					}
				]
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
