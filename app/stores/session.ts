import type { Session } from 'beamsocial';

const getMeState = () => useState<Session | null>('me', () => null);

export function setMe(session: Session | null) {
	const me = getMeState();
	me.value = session ?? null;
}

export async function refreshMe(callback?: () => void) {
	const { $client } = useNuxtApp();
	return $client.me().then((session) => {
		setMe(session);

		if (callback && !session) {
			callback();
		}
	});
}

export function clearMe() {
	const me = getMeState();
	me.value = null;
}

export function useSession() {
	const me = getMeState();
	const { $client } = useNuxtApp();
	return { me, setMe, refreshMe, clearMe, client: $client };
}
