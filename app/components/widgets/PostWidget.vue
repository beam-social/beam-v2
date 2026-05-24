<script setup lang="ts">
	import PictureRing from '@/components/PictureRing.vue';
	import ProfileBadge from '@/components/ProfileBadge.vue';

	import { Client } from 'beamsocial';
	import type { Session } from 'beamsocial'
	import { Post } from 'beamsocial'

	import { applyMarkdownPatterns, type MarkdownPattern } from '@/utils/format';
	import { deltatime } from '@/utils/time';


	const props = defineProps<{
		data: Post | null
		me?: Session | null
		client?: Client
	}>()

	const router = useRouter();

	const post = computed(() => props.data);
	const content = computed(() => post.value
		? post.value.content.length > 200
			? post.value.content.slice(0, 200) + "..."
			: post.value.content
		: "Ce post est privé."
	);

	const age = computed(() => deltatime(post.value?.creation_date || new Date(0)));

	const patterns: MarkdownPattern[] = [
		{
			pattern: /(^|\s)@([a-z0-9._]+)/g,
			replace: (match, leading, username) => `${leading}[@${username}](/@${username})`
		},
		{
			pattern: /(^|\s)#([\p{L}\p{N}_]+)/gu,
			replace: (match, leading, tag) => `${leading}[#${tag}](/search?q=${tag})`
		}
	]
</script>
<template>
	<div
		v-if="post"
		:key="post.id"
		:id="'repost-' + post.id"
		class="select-none cursor-pointer block bg-surface text-on-surface text-left border border-surface-border rounded-2xl w-full p-4 space-y-3"
		@click="() => router.push('/post/' + post!.id)"
	>
		<div class="flex items-center gap-x-2">
			<PictureRing
				:src=post.author!.avatar_url!
				:size=10
				:thickness=1
				:primary="post.author?.badge?.colors['stops']![0] || 'transparent'"
				:second="post.author?.badge?.colors['stops']![1] || 'transparent'"
			/>
			<RouterLink :to="'/@' + post.author?.name" class="block font-semibold">{{ post.author?.display_name || post.author?.name || '...' }} <ProfileBadge :badge="post.author?.badge || null" class="inline w-4 h-4 -translate-y-0.5" /></RouterLink>
			<div class="grow"></div>
			<span class="text-muted text-sm">{{ age }}</span>
		</div>
		<div v-if="post.attachments.length" class="flex flex-wrap gap-1 rounded-2xl w-fit overflow-hidden">
			<img
				:src="$apiUrl + '/drive/' + post.attachments[0]!.id"
				class="min-w-full h-full object-cover"
			/>
		</div>
		<div v-if="post.attachments.length > 1" class="px-1">
			<span class="text-sm text-muted">{{ post.attachments.length }} pièces jointes</span>
		</div>
		<div
			class="md-area max-w-full px-1"
			v-markdown="applyMarkdownPatterns(content, patterns)"
		></div>
	</div>
	<div
		v-else
		class="select-none block bg-surface text-on-surface text-left border border-surface-border rounded-2xl w-full p-4 space-y-3"
	>
		Ce post est privé.
	</div>
</template>
