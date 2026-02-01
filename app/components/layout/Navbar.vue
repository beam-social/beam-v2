<script setup lang="ts">
	import PictureRing from '../PictureRing.vue';
	import { ChatBubbleOvalLeftEllipsisIcon, BellIcon, FireIcon, Cog6ToothIcon } from '@heroicons/vue/24/solid'

	import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

	import type { Session } from 'beamsocial'

	import axios from 'axios';

	const menuOpen = ref(false)
	const menuRef = ref<HTMLElement | null>(null)

	const handler = (e: MouseEvent) => {
		if (!menuRef.value) return
		const target = e.target as Node | null
		if (!target) return
		if (!menuRef.value.contains(target)) menuOpen.value = false
	}

	const props = defineProps<{
		me: Session | null
	}>()

	const notifications = ref<number>(0)

	onMounted(() => {
		document.addEventListener('click', handler)
	})

	onBeforeUnmount(() => document.removeEventListener('click', handler))

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
		class="sm:sticky z-1000 bg-background-surface flex justify-around text-text-surface border-b-2 border-border-surface h-20 w-full px-6 mx-auto box-border gap-4 ease-out duration-300 sm:top-4 sm:border-2 sm:rounded-full sm:w-fit sm:h-16"
		:class="menuOpen ? 'max-sm:animate-showSidebar' : 'max-sm:animate-hideSidebar'"
	>
		<RouterLink
			v-if=me
			to="/discover"
			class="cursor-pointer flex items-center justify-center text-left font-medium duration-300"
		>
			<FireIcon class="w-6 h-6 inline-block" />
		</RouterLink>
		<RouterLink
			v-if=me
			to="/write"
			class="cursor-pointer flex items-center justify-center text-left font-medium duration-300"
		>
			<ChatBubbleOvalLeftEllipsisIcon class="w-6 h-6 inline-block" />
		</RouterLink>
		<RouterLink
			v-if=me
			:to="'/@' + me.profile.name"
			class="cursor-pointer flex items-center justify-center text-left font-semibold duration-300"
		>
			<PictureRing
				:src=me!.avatar!
				:size=12
				:thickness=0
			/>
		</RouterLink>
		<RouterLink
			v-if=me
			to="/inbox"
			class="cursor-pointer flex items-center justify-center text-left font-medium duration-300"
		>
			<BellIcon class="w-6 h-6 inline-block" />
		</RouterLink>
		<RouterLink
			v-if=me
			to="/account/settings"
			class="cursor-pointer flex items-center justify-center text-left font-medium duration-300"
		>
			<Cog6ToothIcon class="w-6 h-6 inline-block" />
		</RouterLink>
	</nav>
</template>
