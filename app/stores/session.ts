import { ref, reactive } from 'vue';

import { Client } from 'beamsocial';
import type { Session } from 'beamsocial';

export const me = ref<Session | null>(null);

export function setMe(session: Session | null) {
	if (!session) {
		me.value = null;
	} else {
		me.value = reactive(session as any);
	}
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
	me.value = null;
}

export function useSession() {
	const { $client } = useNuxtApp();
	return { me, setMe, refreshMe, clearMe, client: $client };
}
