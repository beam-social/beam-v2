import { useProfilePageData } from "~/composables/profile";

export default defineNuxtRouteMiddleware(async (to) => {
	const username = to.params.username as string | undefined;

	if (!username) {
		throw createError({
			statusCode: 400,
			statusMessage: "Username is required",
		});
	}

	try {
		const { profile } = await useProfilePageData(username);
		const user = profile.value;

		if (user) {
			useHead({
				title: `@${user.name} • Beam`,
				// title: 'Profil • Beam',
				meta: [
					{
						name: "description",
						// content: "Connectez-vous à Beam pour voir ce profil."
						content:
							user.description ||
							`Voir le profil Beam de @${user.name}.`,
					},
					{
						property: "og:title",
						// content: "Profil • Beam"
						content: user.display_name
							? `${user.display_name} • Beam`
							: `@${user.name} • Beam`,
					},
					{
						property: "og:description",
						// content: "Connectez-vous à Beam pour voir ce profil."
						content:
							user.description ||
							`Voir le profil Beam de @${user.name}.`,
					},
					{
						property: "og:type",
						content: "profile",
					},
					{
						property: "og:image",
						content: user.avatar_url || "",
					},
					{
						property: "og:url",
						content: `https://beam.ejnalo.me/@${username}`,
					},
					{
						property: "og:color",
						// content: '#e021ff'
						content: user.badge?.colors?.primary || "#e021ff",
					},
				],
			});
		} else {
			throw new Error("User not found");
		}
	} catch (error) {
		throw createError({
			statusCode: 404,
			statusMessage: "User not found",
		});
	}
});
