<script setup lang="ts">
	import { ChatBubbleOvalLeftIcon, HeartIcon } from '@heroicons/vue/24/outline';
	import { HeartIcon as HeartFilled } from '@heroicons/vue/24/solid';

	import PictureRing from '@/components/PictureRing.vue';
	import ProfileBadge from '@/components/ProfileBadge.vue';
	import Menu from '../Menu.vue';

	import { Client } from 'beamsocial';
	import type { Session } from 'beamsocial'
	import { Comment } from 'beamsocial'

	import { toLiteralNumber, applyMarkdownPatterns, type MarkdownPattern } from '@/utils/format';
	import { deltatime } from '@/utils/time';

	const props = defineProps<{
		data: Comment
		me?: Session | null
		client?: Client
		clickable?: boolean
	}>()

	const router = useRouter();
	const content = ref<string>('');
	const actions = ref<Array<{ label: string, style: string, handler: () => Promise<void> }>>([
		{
			'label': 'Partager',
			'style': 'normal',
			'handler': async () => {
				await navigator.clipboard.writeText(window.location.origin + '/post/' + comment.value.post!.id + '#comment-' + comment.value.id);
				alert('Lien du commentaire copié dans le presse-papier: \n' + window.location.origin + '/post/' + comment.value.post!.id + '#comment-' + comment.value.id);
			}
		}
	])

	const comment = ref<Comment>(props.data);

	const baselike = ref<number | null>(null);
	const age = ref<string | undefined>(deltatime(comment.value.creation_date || new Date(0)))

	onMounted(async () => {
		content.value = comment.value.content
		baselike.value = comment.value.likes - (+!!props.me?.tastes.likes.includes(comment.value.id) || 0)

		age.value = deltatime(comment.value.creation_date || new Date(0));

		if (props.me && (props.me.profile.id == comment.value.author?.id || props.me.profile.level >= 8)) {
			actions.value.push({
				'label': 'Supprimer',
				'style': 'danger',
				'handler': async () => { await comment.value.delete(); router.back() }
			})
		}

		if (props.me?.profile.id != comment.value.author?.id) {
			actions.value.push({
				'label': 'Signaler',
				'style': 'danger',
				'handler': async () => {
					alert('Fonction de signalement non implémentée pour le moment.')
				}
			})

			actions.value.push({
				'label': `Bloquer ${comment.value.author?.display_name || comment.value.author?.name || "l'auteur"}`,
				'style': 'danger',
				'handler': async () => {
					await props.data.author?.block();
				}
			});
		}
	});

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
	<div :key="comment.id" :id="'comment-' + comment.id" class="block bg-surface text-on-surface text-left border border-surface-border rounded-3xl w-full p-4 space-y-3">
		<div class="flex gap-2">
			<PictureRing
				:src=comment.author!.avatar_url!
				:size=12
				:thickness=1.2
				:primary="comment.author?.badge?.colors['stops']![0] || 'transparent'"
				:second="comment.author?.badge?.colors['stops']![1] || 'transparent'"
				class="shrink-0"
			/>
			<div class="grow">
				<div class="flex items-center gap-x-2 h-12">
					<div class="flex flex-col -space-y-2">
						<RouterLink :to="'/@' + comment.author?.name" class="block font-semibold">{{ comment.author?.display_name || comment.author?.name || '...' }} <ProfileBadge :badge="comment.author?.badge || null" class="inline w-4 h-4 ml-0.5 -translate-y-0.5" /></RouterLink>
						<RouterLink :to="'/@' + comment.author?.name" class="block text-muted font-medium text-sm">@{{ comment.author?.name || '...' }}</RouterLink>
					</div>
					<div class="grow"></div>
					<span class="text-muted text-sm">{{ age }}</span>
					<Menu :actions="actions" />
				</div>
				<div
					class="md-area max-w-full"
					v-markdown="applyMarkdownPatterns(content, patterns)"
					@click="() => { if (clickable) router.push('/post/' + comment.post!.id) }"
				></div>
			</div>
		</div>
		<!--div class="flex gap-4 items-center border-t-1 border-surface-border px-2 pt-3">
			<button
				class="cursor-pointer flex items-center text-on-surface text-sm font-medium gap-0.5 duration-150 active:scale-85"
				@click="async () => { comment!.likes == baselike ? await comment!.like() : await comment!.unlike() }"
			>
				<HeartFilled v-if="comment!.likes != baselike" class="text-rose-500 w-5 h-5" />
				<HeartIcon v-else class="stroke-2 w-5 h-5" />
				<span class="translate-y-[-0.5px]">{{ toLiteralNumber(comment.likes) }}</span>
			</button>
			<button
				class="cursor-pointer flex items-center text-on-surface text-sm font-medium gap-0.5 duration-150 active:scale-85"
			>
				<ChatBubbleOvalLeftIcon class="text-on-surface stroke-2 w-5 h-5" />
				<span class="translate-y-[-0.5px]">{{ toLiteralNumber(comment.answers) }}</span>
			</button>
			<div class="grow"></div>
		</div-->
	</div>
</template>
