<script setup lang="ts">
	import PictureRing from '../PictureRing.vue';

	import type { Session } from 'beamsocial';

	const props = defineProps<{
		me: Session | null
	}>()
</script>
<template>
	<nav
		class="col-span-4 w-full box-border"
	>
		<div class="flex gap-4 z-1000 bg-background-surface text-text-surface border-b border-border-surface w-full h-20 px-8">
			<div class="cursor-default flex items-center gap-2">
				<img src="/app-icon.png" class="w-8 h-8" />
				<span class="font-semibold text-lg max-sm:hidden">Centre d'aide</span>
			</div>
			<RouterLink
				to="/"
				class="cursor-pointer flex gap-2 items-center text-left font-medium duration-300"
			>
				Accueil
			</RouterLink>
			<div class="grow"></div>
			<RouterLink
				v-if=me
				:to="'/@' + me.profile.name"
				class="cursor-pointer flex gap-2 items-center text-left font-semibold duration-300"
			>
				<PictureRing
					:src=me!.avatar!
					:size=10
					:thickness=0
				/>
				<div class="-space-y-1 max-sm:hidden">
					<span class="block text-lg font-medium">{{ me.profile.display_name || me.profile.name }} <ProfileBadge :badge=me.profile.badge class="inline w-4 h-4 ml-0.5 -translate-y-0.5" /></span>
				</div>
			</RouterLink>
		</div>
	</nav>
</template>
