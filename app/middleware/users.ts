type ProfileMeta = {
	name?: string;
	display_name?: string;
	description?: string | null;
	avatar_url?: string | null;
	badge?: {
		colors?: {
			primary?: string;
		};
	};
};

export default defineNuxtRouteMiddleware(async (to) => {
	const username = to.params.username as string | undefined;

	if (!username) {
		throw createError({
			statusCode: 400,
			statusMessage: "Username is required",
		});
	}

	const { $client } = useNuxtApp();
	const profileUserMeta = useState<ProfileMeta | null>("profileUserMeta", () => null);

	try {
		const user = await $client.getUser(username);
		if (user) {
			profileUserMeta.value = {
				name: user.name,
				display_name: user.display_name || undefined,
				description: user.description ?? null,
				avatar_url: user.avatar_url ?? null,
				badge: user.badge ? { colors: user.badge.colors } : undefined,
			};
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
