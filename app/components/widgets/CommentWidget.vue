<script setup lang="ts">
	import PictureRing from '@/components/PictureRing.vue';
	import ProfileBadge from '@/components/ProfileBadge.vue';

	import { Client } from 'beamsocial';
	import type { Session } from 'beamsocial'
	import { Comment } from 'beamsocial'

	import { applyMarkdownPatterns, type MarkdownPattern } from '@/utils/format';
	import { deltatime } from '@/utils/time';


	const props = defineProps<{
		data: Comment | null
		me?: Session | null
		client?: Client
	}>()

	const router = useRouter();
	const content = ref<string>('');

	const comment = ref<Comment | null>(props.data);

	const age = ref<string>(comment.value?.creation_date.toLocaleString('fr-FR') || '1970-01-01')

	onMounted(async () => {
		content.value = comment.value?.content.slice(0, 200) || "Ce commentaire est privé."

		age.value = deltatime(comment.value?.creation_date || new Date(0));
	});


	watch(() => props.data, (newData) => {
		comment.value = newData;
		content.value = comment.value?.content.slice(0, 200) || "Ce commentaire est privé.";
		age.value = deltatime(comment.value?.creation_date || new Date(0));
	})


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
		v-if="comment"
		:key="comment.id"
		:id="'comment-' + comment.id"
		class="select-none cursor-pointer block bg-background-surface text-text-surface text-left border-2 border-border-surface rounded-2xl w-full p-4 space-y-3"
		@click="() => router.push('/post/' + comment!.post?.id + '#comment-' + comment!.id)"
	>
		<div class="flex items-center gap-x-2">
			<PictureRing
				:src=comment.author!.avatar_url!
				:size=10
				:thickness=1
				:primary="comment.author?.badge?.colors['stops']![0] || 'transparent'"
				:second="comment.author?.badge?.colors['stops']![1] || 'transparent'"
			/>
			<RouterLink :to="'/@' + comment.author?.name" class="block font-semibold">{{ comment.author?.display_name || comment.author?.name || '...' }} <ProfileBadge :badge="comment.author?.badge || null" class="inline w-4 h-4 -translate-y-0.5" /></RouterLink>
			<div class="grow"></div>
			<span class="text-subtext text-sm">{{ age }}</span>
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
		Ce commentaire est privé.
	</div>
</template>
