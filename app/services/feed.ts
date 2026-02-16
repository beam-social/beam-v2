import axios from 'axios';

import { Post, User } from 'beamsocial';

import { useSession } from '@/stores/session';

export const useFeed = () => {
	const posts = useState<Post[]>('posts', () => []);
	const users = useState<User[]>('users', () => []);

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

	return { posts, users, getFeed };
};
