<script setup lang="ts">
	import type { Badge } from 'beamsocial';
	import ProfileBadge from '../ProfileBadge.vue';

	interface Entitlement {
		id: string;
		name: string;
		account: string;
		granted_by: string;
		granted_at: Date;
		expires_at: Date;
		revoked: boolean;
		reward_type: string;
		reward_id: string;
		reason?: string;
	}

	const props = defineProps<{
		badge: Badge;
		clickable?: boolean;
		can_buy?: boolean;
		entitlement?: Entitlement;
	}>();
</script>
<template>
	<div
		class="flex flex-col items-center gap-1 text-center rounded-3xl px-8 py-6"
		:style="{
			backgroundImage: `linear-gradient(45deg, ${badge.colors['stops']![0]}50, ${badge.colors['stops']![1]}50)`,
			border: `2px solid ${badge.colors['primary'] as string || 'transparent'}`,
			color: badge.colors['primary'] as string || 'inherit'
		}"
	>
		<ProfileBadge :badge="badge" class="w-12 h-12" />
		<span class="text-lg font-semibold">{{ badge.title }}</span>
		<span
			v-if=entitlement
			class="font-medium"
		>
			Élément n°{{ entitlement.id }}</span>
		<button
			class="text-white text-sm font-medium rounded-full px-5 py-2.5 mt-2 transition"
			:style="{
				backgroundColor: badge.colors['primary'] as string || 'transparent',
				borderColor: badge.colors['primary'] as string || 'transparent'
			}"
			v-if=can_buy
		>
			Acheter
		</button>
	</div>
</template>
