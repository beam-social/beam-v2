<script setup lang="ts">
	import Button from '../Button.vue';
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
			label: string
			type: "action" | "danger" | "success" | "neutral" | "transparent"
			icon?: Component
			handler: () => void
		}[]
	}>();

	const router = useRouter();

	let _class = ''

	if (props.minified) {
		_class = 'flex items-center gap-2 py-1'
	} else if (props.deployed) {
		_class = 'flex flex-col items-stretch gap-4 bg-surface text-on-surface border border-surface-border rounded-3xl p-4'
	} else {
		_class = 'flex items-center gap-2 bg-surface text-on-surface border border-surface-border rounded-3xl p-4'
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
				<span class="text-muted text-sm font-medium">@{{ profile.name }} • {{ profile.followers }} abonnés</span>
			</div>
		</div>
		<div v-if=deployed class="px-2">
			<p class="text-on-surface text-sm line-clamp-1">{{ profile.description }}</p>
		</div>
		<div v-if=deployed class="w-full border-t-2 border-surface-border"></div>
		<div v-if=!deployed class="grow"></div>
		<div
			v-if=actions
			class="flex gap-1 transition-all duration-150"
		>
			<Button
				v-for="action in actions"
				:key=action.label
				:label=action.label
				:type=action.type
				:size="deployed ? 'sm' : 'sm'"
				:icon=action.icon
				:handler=action.handler
			/>
		</div>
	</div>
</template>
