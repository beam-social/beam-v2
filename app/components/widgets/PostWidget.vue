<script setup lang="ts">
	import PictureRing from '@/components/PictureRing.vue';
	import ProfileBadge from '@/components/ProfileBadge.vue';

	import { onMounted, ref, watch } from 'vue';
	import { useRouter } from 'vue-router';

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
	const content = ref<string>('');

	const post = ref<Post | null>(props.data);

	const age = ref<string>(post.value?.creation_date.toLocaleString('fr-FR') || '1970-01-01')

	onMounted(async () => {
		content.value = post.value?.content.slice(0, 200) || "Ce post est privé."

		age.value = deltatime(post.value?.creation_date || new Date(0));
	});


	watch(() => props.data, (newData) => {
		post.value = newData;
		content.value = post.value?.content.slice(0, 200) || "Ce post est privé.";
		age.value = deltatime(post.value?.creation_date || new Date(0));
	})


	const patterns: MarkdownPattern[] = [
		{
			pattern: /@([a-zA-Z0-9_]+)/g,
			replace: (match, username) => `[@${username}](/@${username})`
		},
		{
			pattern: /#([a-zA-Z0-9_]+)/g,
			replace: (match, tag) => `[#${tag}](/explore?tag=${tag})`
		},
		{
			pattern: /\r\n/g,
			replace: () => '<br>'
		},
		{
			pattern: /\[([a-zA-Z0-9_]+)\]\(([a-zA-Z0-9_]+)\)/g,
			replace: (match, link, url) => `${url}`
		}
	]
</script>
<template>
	<div
		v-if="post"
		:key="post.id"
		:id="'repost-' + post.id"
		class="select-none cursor-pointer block bg-background-surface text-text-surface text-left border-2 border-border-surface rounded-2xl w-full p-4 space-y-3"
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
			<span class="text-text-secondary text-sm">{{ age }}</span>
		</div>
		<div v-if="post.attachments.length" class="flex flex-wrap gap-0.5 rounded-2xl w-fit overflow-hidden">
			<img
				v-for="(file, index) in post.attachments"
				:src="file.path"
				:class="index == 0 && post.attachments.length % 2 == 1
				? 'w-full'
				: 'w-[calc(50%-0.0625rem)]'"
			/>
		</div>
		<div
			class="md-area max-w-full px-1"
			v-markdown="applyMarkdownPatterns(content, patterns)"
		></div>
	</div>
	<div
		v-else
		class="select-none block bg-background-surface text-text-surface text-left border-2 border-border-surface rounded-2xl w-full p-4 space-y-3"
	>
		Ce post est privé.
	</div>
</template>
