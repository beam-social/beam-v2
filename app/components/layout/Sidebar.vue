<script setup lang="ts">
	import PictureRing from '../PictureRing.vue';
	import { ChatBubbleOvalLeftEllipsisIcon, BellIcon, FireIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/solid'

	import type { Session } from 'beamsocial'

	import axios from 'axios';


	const props = defineProps<{
		me: Session | null
	}>()

	const notifications = useState<number>('notifications', () => 0);

	watch(props, () => {
		if (props.me) {
			const apiUrl = useNuxtApp().$apiUrl;

			axios.get(`${apiUrl}/me/inbox`, {
				withCredentials: true,
				params: {
					leave_unread: true
				}
			}).then(response => {
				notifications.value = response.data.unread.length;
			}).catch(() => {
				notifications.value = 0;
			});
		} else {
			notifications.value = 0;
		}
	});
</script>
<template>
	<nav
		class="h-screen w-full box-border"
	>
		<div class="flex flex-col gap-4 z-1000 bg-background-navbar text-text-navbar border-r-2 border-border-navbar h-full p-8">
			<RouterLink
				v-if=me
				:to="'/@' + me.profile.name"
				class="cursor-pointer flex gap-2 items-center text-left font-semibold duration-300"
			>
				<PictureRing
					:src=me!.avatar!
					:size=12
					:thickness=1.2
					:primary="me?.profile.badge?.colors['stops']![0] || 'transparent'"
					:second="me?.profile.badge?.colors['stops']![1] || 'transparent'"
				/>
				<div class="-space-y-2 max-sm:hidden">
					<span class="block text-lg font-medium">{{ me.profile.display_name || me.profile.name }} <ProfileBadge :badge=me.profile.badge class="inline w-4 h-4 ml-0.5 -translate-y-0.5" /></span>
					<span class="block text-subtext text-sm font-medium">@{{ me.profile.name }}</span>
				</div>
			</RouterLink>
			<RouterLink
				v-if=me
				to="/discover"
				class="cursor-pointer flex gap-2 items-center text-left font-medium duration-300"
			>
				<FireIcon class="w-6 h-6 inline-block sm:w-8 sm:h-8" />
				<span class="block font-semibold max-sm:hidden sm:text-lg">Discover</span>
			</RouterLink>
			<RouterLink
				v-if=me
				to="/write"
				class="cursor-pointer flex gap-2 items-center text-left font-medium duration-300"
			>
				<ChatBubbleOvalLeftEllipsisIcon class="w-6 h-6 inline-block sm:w-8 sm:h-8" />
				<span class="block font-semibold max-sm:hidden sm:text-lg">Écrire</span>
			</RouterLink>
			<div class="grow"></div>
			<RouterLink
				v-if=me
				to="/inbox"
				class="cursor-pointer flex gap-2 items-center text-left font-medium duration-300"
			>
				<BellIcon class="w-6 h-6 inline-block sm:w-8 sm:h-8" />
				<span class="block font-semibold max-sm:hidden sm:text-lg">Notifications {{ notifications > 0 ? `(${notifications})` : '' }}</span>
			</RouterLink>
			<RouterLink
				v-if=me
				to="/account/settings"
				class="cursor-pointer flex gap-2 items-center text-left font-medium duration-300"
			>
				<Cog6ToothIcon class="w-6 h-6 inline-block sm:w-8 sm:h-8" />
				<span class="block font-semibold max-sm:hidden sm:text-lg">Paramètres</span>
			</RouterLink>
			<RouterLink
				v-if=me
				to="/auth/logout"
				class="cursor-pointer flex gap-2 items-center text-left font-medium duration-300"
			>
				<ArrowRightStartOnRectangleIcon class="w-6 h-6 inline-block sm:w-8 sm:h-8" />
				<span class="block font-semibold max-sm:hidden sm:text-lg">Déconnexion</span>
			</RouterLink>
		</div>
	</nav>
</template>
