import { Post, User, type Session } from "beamsocial";

import { useSession } from "~/composables/session";

type SerializedRecord = Record<string, any>;

type ProfilePageSnapshot = {
	profile: SerializedRecord | null;
	posts: SerializedRecord[];
	following: SerializedRecord[];
	followers: SerializedRecord[];
	errorMessage: string | null;
};

function snapshot<T>(value: T): SerializedRecord {
	return JSON.parse(JSON.stringify(value)) as SerializedRecord;
}

function hydrateUser(
	raw: SerializedRecord,
	me: Session | null,
	apiUrl: string,
) {
	const user = new User(raw.id);
	user.__load(raw, me || undefined, apiUrl);
	return user;
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

function hydrateUserList(
	items: SerializedRecord[],
	me: Session | null,
	apiUrl: string,
) {
	return items.map((item) => hydrateUser(item, me, apiUrl));
}

function hydratePostList(
	items: SerializedRecord[],
	me: Session | null,
	apiUrl: string,
) {
	return items.map((item) => hydratePost(item, me, apiUrl));
}

export async function useProfilePageData(username: string) {
	const { $client, $apiUrl } = useNuxtApp();
	const { me } = useSession();

	const result = await useAsyncData<ProfilePageSnapshot>(
		`profile-page:${username}`,
		async () => {
			try {
				const profile = await $client.getUser(username);
				const [posts, following, followers] = await Promise.all([
					$client.fetchUserPosts(username),
					profile?.getFollowing?.() ?? Promise.resolve([]),
					profile?.getFollowers?.() ?? Promise.resolve([]),
				]);

				return {
					profile: profile ? snapshot(profile) : null,
					posts: snapshot(posts ?? []),
					following: snapshot(following ?? []),
					followers: snapshot(followers ?? []),
					errorMessage: null,
				};
			} catch (err: any) {
				const msg = err?.response?.data?.message || "";

				if (msg.includes("Private")) {
					return {
						profile: null,
						posts: [],
						following: [],
						followers: [],
						errorMessage: "Ce profil est privé.",
					};
				}

				if (msg.includes("NotFound")) {
					return {
						profile: null,
						posts: [],
						following: [],
						followers: [],
						errorMessage: "Utilisateur introuvable.",
					};
				}

				console.error(
					"Erreur inconnue lors du chargement du profil :",
					err,
				);

				return {
					profile: null,
					posts: [],
					following: [],
					followers: [],
					errorMessage: "Une erreur est survenue.",
				};
			}
		},
	);

	const profile = computed(() => {
		const rawProfile = result.data.value?.profile;

		if (!rawProfile) {
			return null;
		}

		return hydrateUser(rawProfile, me.value, $apiUrl);
	});

	const posts = computed(() =>
		hydratePostList(result.data.value?.posts ?? [], me.value, $apiUrl),
	);

	const following = computed(() =>
		hydrateUserList(result.data.value?.following ?? [], me.value, $apiUrl),
	);

	const followers = computed(() =>
		hydrateUserList(result.data.value?.followers ?? [], me.value, $apiUrl),
	);

	const errorMessage = computed(
		() => result.data.value?.errorMessage || null,
	);

	return {
		...result,
		profile,
		posts,
		following,
		followers,
		errorMessage,
	};
}
