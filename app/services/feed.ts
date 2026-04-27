import axios from 'axios';

import { Post, User } from 'beamsocial';

import { useSession } from '@/stores/session';

export const useFeed = () => {
	const posts = useState<Post[]>('posts', () => []);
	const users = useState<User[]>('users', () => []);

	const topPosts = useState<Post[]>('topPosts', () => []);
	const topUsers = useState<User[]>('topUsers', () => []);

	const { me, refreshSession } = useSession();
	const { $apiUrl } = useNuxtApp();

	const getFeed = async () => {
		await refreshSession();

		let _posts = [];

		if (me.value) {
			_posts = (await axios.get(
				`${$apiUrl}/me/feed`,
				{
					withCredentials: true
				}
			)).data.posts;
		} else {
			_posts = (await axios.get(
				`${$apiUrl}/top/posts?sort_by=date`
			)).data;
		}

		posts.value = [];

		for (const p of _posts) {
			let post = new Post(p.id)
			post.__load(p, me.value || undefined, $apiUrl)

			posts.value.push(post)
		}

		let _users = (await axios.get(
			`${$apiUrl}/top/users`,
			{
				withCredentials: true
			}
		)).data;

		users.value = [];

		for (const u of _users) {
			let user = new User(u.id)
			user.__load(u, me.value || undefined, $apiUrl)

			users.value.push(user)
		}
	};

	const getLeaderboard = async (tag?: string) => {
		await refreshSession();

		let _posts = [];

		_posts = (await axios.get(`${$apiUrl}/top/posts?sort_by=stats`, {
			params: {
				tag,
				after: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 28).toISOString(), // Last month
			},
		})).data;

		topPosts.value = [];

		for (const p of _posts) {
			let post = new Post(p.id);
			post.__load(p, me.value || undefined, $apiUrl);

			topPosts.value.push(post);
		}

		let _users = (
			await axios.get(`${$apiUrl}/top/users`)
		).data;

		topUsers.value = [];

		for (const u of _users) {
			let user = new User(u.id);
			user.__load(u, me.value || undefined, $apiUrl);

			topUsers.value.push(user);
		}
	};

	return { posts, users, topPosts, topUsers, getFeed, getLeaderboard };
};
