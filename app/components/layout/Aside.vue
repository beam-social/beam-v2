<script setup lang="ts">
	import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

	import ProfileCard from '@/components/cards/ProfileCard.vue';

	import type { Session } from 'beamsocial'
	import { User } from 'beamsocial';

	import { useFeed } from '@/services/feed';
	import { useSession, useInbox } from '@/stores/session';

	const router = useRouter();
	const { users } = useFeed();
	const { refreshSession } = useSession();
	const { inbox } = useInbox();

	const props = defineProps<{
		me: Session | null
	}>();

	const searchQuery = ref<string>('');

	const suggestions = computed<User[]>(() =>
		users.value
			.filter(u => u.id !== props.me?.profile.id)
			.filter(u => !props.me?.relations.following.includes(u.id))
			.slice(0, 5)
	)
</script>
<template>
	<aside
		class="flex flex-col z-1000 bg-background text-text w-full p-8 box-border overflow-y-scroll max-sm:bg-background-surface sm:h-screen sm:pl-0 max-xl:hidden"
	>
		<div class="flex flex-col gap-4">
			<h2 class="text-2xl text-center font-bold">Recherche</h2>
			<form
				@submit.prevent="() => router.push(`/search?q=${encodeURIComponent(searchQuery)}`)"
				class="flex gap-2"
			>
				<div class="flex gap-1 justify-between items-center bg-background-surface text-text-surface border-2 border-border-surface rounded-full p-1 overflow-hidden">
					<input
						type="text"
						placeholder="Rechercher des profils, des posts..."
						class="block grow bg-transparent text-sm line-clamp-1 outline-none max-w-full pl-3.5 py-1.5"
						v-model="searchQuery"
					/>
					<button
						type="submit"
						class="shrink-0 block cursor-pointer bg-action text-white text-sm font-semibold rounded-full px-4 h-full duration-150 hover:bg-action-hovered"
					>
						<MagnifyingGlassIcon class="stroke-3 w-4 h-4" />
					</button>
				</div>
			</form>
		</div>
		<div class="flex flex-col gap-4 mt-4" v-if=suggestions.length>
			<h2 class="text-2xl text-center font-bold">Suggestions</h2>
			<div class="grid grid-cols-1 gap-2">
				<ProfileCard
					v-for="user in suggestions"
					:profile=user
					:me="me || undefined"
					:client=$client
					:clickable=true
					:minified=true
					:actions="me ? (
						me.profile.id != user.id ? [
							me.relations.following.includes(user.id) ? {
								title: 'Suivi(e)',
								color: 'gray',
								callback: async () => { await user.unfollow(); await refreshSession() }
							} : inbox?.outgoing.follow.some(req => req.to.id === user.id) ? {
								title: 'Demande envoyée',
								color: 'gray',
								callback: async () => { await user.unfollow(); await refreshSession() }
							} : {
								title: 'Suivre',
								color: 'action',
								callback: async () => { await user.follow(); await refreshSession() }
							}
						] : [
							{
								title: 'Vous',
								color: 'transparent',
							}
						]
					) : []"
				/>
			</div>
		</div>
		<div class="grow"></div>
		<div class="flex flex-wrap gap-1 text-subtext text-sm">
			<RouterLink to="/legal/terms" class="text-text-surface text-sm font-medium hover:underline">CGU</RouterLink>•
			<RouterLink to="/legal/privacy" class="text-text-surface text-sm font-medium hover:underline">Confidentialité</RouterLink>
		</div>
	</aside>
</template>
