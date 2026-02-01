<script setup lang="ts">
	import PictureRing from '../PictureRing.vue';
	import ProfileBadge from '../ProfileBadge.vue';

	import { ref } from 'vue';
	import { useRouter } from 'vue-router';

	import type { Session, User } from 'beamsocial';

	const props = defineProps<{
		profile: User
		me?: Session | null
		clickable?: boolean
		actions?: {
			title: string
			color: "action" | "danger" | "success" | "gray" | "transparent"
			callback?: (payload: PointerEvent) => void
		}[]
	}>();

	const router = useRouter();

	const getColor = (color: "action" | "danger" | "success" | "gray" | "transparent") => {
		switch (color) {
			case "action":
				return "bg-action text-white hover:bg-action-hovered"

			case "danger":
				return "bg-danger text-white hover:bg-danger-hovered"

			case "success":
				return "bg-success text-white hover:bg-success-hovered"

			case "gray":
				return "bg-zinc-600/10 text-zinc-600"

			case "transparent":
				return "text-subtext"

			default:
				return "text-subtext"
		}
	}
</script>
<template>
	<div class="flex items-center gap-2 bg-background-surface text-text-surface border-2 border-border-surface rounded-3xl p-4">
		<PictureRing
			:src=profile.avatar_url!
			:size=12
			:thickness=1.2
			:primary="profile.badge?.colors['stops']![0] || 'transparent'"
			:second="profile.badge?.colors['stops']![1] || 'transparent'"
		/>
		<div
			class="flex flex-col -space-y-2"
			:class="clickable ? 'cursor-pointer' : ''"
			@click="() => { if (clickable){ router.push(`/@${profile.name}`) }}"
		>
			<span class="font-semibold">{{ profile.display_name || profile.name }} <ProfileBadge :badge=profile.badge class="inline w-4 h-4 ml-0.5 -translate-y-0.5" /></span>
			<span class="text-subtext text-sm font-medium">@{{ profile.name }}</span>
		</div>
		<div class="grow"></div>
		<div v-if=actions>
			<button
				v-for="action in actions"
				class="cursor-pointer text-sm font-medium rounded-lg px-4 py-2"
				:class=getColor(action.color)
				@click=action.callback
			>
				{{ action.title }}
			</button>
		</div>
	</div>
</template>
