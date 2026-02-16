<script setup lang="ts">
	import PictureRing from '../PictureRing.vue';
	import ProfileBadge from '../ProfileBadge.vue';

	import type { Session, User } from 'beamsocial';

	const props = defineProps<{
		profile: User
		me?: Session | null
		clickable?: boolean
		minified?: boolean
		deployed?: boolean
		actions?: {
			title: string
			color: "action" | "danger" | "success" | "gray" | "transparent"
			icon?: Component
			callback?: (payload: PointerEvent) => void
		}[]
	}>();

	const router = useRouter();

	const getColor = (color: "action" | "danger" | "success" | "gray" | "transparent") => {
		let base = 'cursor-pointer flex items-center gap-1 text-sm font-medium px-3 py-2'

		if (props.deployed) {
			base += ' rounded-xl'
		} else {
			base += ' rounded-lg'
		}

		switch (color) {
			case "action":
				return base + " bg-action text-white hover:bg-action-hovered"

			case "danger":
				return base + " bg-danger text-white hover:bg-danger-hovered"

			case "success":
				return base + " bg-success text-white hover:bg-success-hovered"

			case "gray":
				return base + " bg-zinc-600/10 text-zinc-600 hover:bg-zinc-600/20"

			case "transparent":
				return base + " text-subtext"

			default:
				return base + " text-subtext"
		}
	}

	let _class = ''

	if (props.minified) {
		_class = 'flex items-center gap-2 py-1'
	} else if (props.deployed) {
		_class = 'flex flex-col items-stretch gap-4 bg-background-surface text-text-surface border-2 border-border-surface rounded-3xl p-4'
	} else {
		_class = 'flex items-center gap-2 bg-background-surface text-text-surface border-2 border-border-surface rounded-3xl p-4'
	}
</script>
<template>
	<div
		:class=_class
	>
		<div
			class="grow shrink-0 flex items-center gap-2"
			:class="deployed ? 'w-full' : ''"
		>
			<PictureRing
				:src=profile.avatar_url!
				:size=deployed?12:12
				:thickness=deployed?1.2:1.2
				:primary="profile.badge?.colors['stops']![0] || 'transparent'"
				:second="profile.badge?.colors['stops']![1] || 'transparent'"
			/>
			<div
				class="flex flex-col -space-y-1.5"
				:class="(clickable ? 'cursor-pointer ' : '')"
				@click="() => { if (clickable) { router.push(`/@${profile.name}`) }}"
			>
				<span class="font-semibold">{{ profile.display_name || profile.name }} <ProfileBadge :badge=profile.badge class="inline w-4 h-4 ml-0.5 -translate-y-0.5" /></span>
				<span class="text-subtext text-sm font-medium">@{{ profile.name }}</span>
			</div>
		</div>
		<div v-if=deployed class="px-2">
			<p class="text-text-surface text-sm line-clamp-1">{{ profile.description }}</p>
		</div>
		<div v-if=deployed class="w-full border-t-2 border-border-surface"></div>
		<div v-if=!deployed class="grow"></div>
		<div
			v-if=actions
			class="flex gap-1 transition-all duration-150"
			:class="deployed ? 'justify-end' : ''"
		>
			<button
				v-for="action in actions"
				:class="getColor(action.color)"
				@click=action.callback
			>
				<component :is=action.icon v-if=action.icon class="inline-block w-4 h-4" />
				{{ action.title }}
			</button>
		</div>
	</div>
</template>
