import { Inbox, type Session } from "beamsocial";

const getMeState = () => useState<Session | null>("me", () => null);
const getInboxState = () => useState<Inbox | null>("inbox", () => null);

export function setMe(session: Session | null) {
	const me = getMeState();
	me.value = session ?? null;
}

export async function refreshSession(callback?: () => void) {
	const { $client } = useNuxtApp();

	const _inbox = await $client.inbox().catch(() => null);
	setInbox(_inbox);

	return $client.me().then((session) => {
		setMe(session);

		if (callback && !session) {
			callback();
		}
	});
}

export async function ensureSession(redirectTo: string) {
	await refreshSession();

	const me = getMeState();

	if (!me.value) {
		return navigateTo(redirectTo);
	}
}

export function clearMe() {
	const me = getMeState();
	me.value = null;
}

export function setInbox(inbox: Inbox | null) {
	const inboxState = getInboxState();
	inboxState.value = inbox ?? null;
}

export function clearInbox() {
	const inboxState = getInboxState();
	inboxState.value = null;
}

export function useInbox() {
	const inbox = getInboxState();
	const { $client } = useNuxtApp();
	return { inbox, setInbox, clearInbox, client: $client };
}

export function useSession() {
	const me = getMeState();
	const { $client } = useNuxtApp();
	return { me, setMe, refreshSession, clearMe, client: $client };
}
