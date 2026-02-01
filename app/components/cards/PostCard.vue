<script setup lang="ts">
	import { ChatBubbleOvalLeftIcon, HeartIcon, ArrowPathRoundedSquareIcon } from '@heroicons/vue/24/outline';
	import { HeartIcon as HeartFilled } from '@heroicons/vue/24/solid';

	import PictureRing from '@/components/PictureRing.vue';
	import ProfileBadge from '@/components/ProfileBadge.vue';
	import PostWidget from '../widgets/PostWidget.vue';
	import Menu from '../Menu.vue';

	import { onMounted, ref } from 'vue';
	import { useRouter } from 'vue-router';

	import { Client } from 'beamsocial';
	import type { Session } from 'beamsocial'
	import { Post } from 'beamsocial'

	import { toLiteralNumber, applyMarkdownPatterns, type MarkdownPattern } from '@/utils/format';
	import { deltatime } from '@/utils/time';

	const props = defineProps<{
		data: Post
		me?: Session | null
		client?: Client
		clickable?: boolean
		short?: boolean
	}>()

	const apiUrl = useNuxtApp().$apiUrl;

	const router = useRouter();
	const show_all = ref<boolean>(true)
	const content = ref<string>('');
	const actions = ref<Array<{ label: string, style: string, handler: () => Promise<void> }>>([
		{
			'label': 'Partager',
			'style': 'normal',
			'handler': async () => {
				await navigator.clipboard.writeText(apiUrl + '/p/' + post.value.id);
				alert('Lien du post copié dans le presse-papier: \n' + apiUrl + '/p/' + post.value.id);
			}
		}
	])

	const post = ref<Post>(props.data);
	const parent = ref<Post | null>(null)

	const baselike = ref<number | null>(null);
	const age = ref<string | undefined>(deltatime(post.value.creation_date || new Date(0)))


	onMounted(async () => {
		content.value = post.value.content
		baselike.value = post.value.likes - (+!!props.me?.tastes.likes.includes(post.value.id) || 0)

		if (post.value.parent_id && props.client) {
			props.client.getPost(post.value.parent_id).then(
				data => parent.value = data
			)
		}

		if (props.short) {
			show_all.value = false;

			content.value = post.value.content.length > 400
				? post.value.content.slice(0, 400) + `...`
				: post.value.content;
		}


		age.value = deltatime(post.value.creation_date || new Date(0));

		if (props.me && (props.me.profile.id == post.value.author?.id || props.me.profile.level >= 8)) {
			actions.value.push({
				'label': 'Supprimer',
				'style': 'danger',
				'handler': async () => { await post.value.delete(); router.back() }
			})
		}

		if (props.me?.profile.id != post.value.author?.id) {
			actions.value.push({
				'label': 'Signaler',
				'style': 'danger',
				'handler': async () => {
					alert('Fonction de signalement non implémentée pour le moment.')
				}
			})

			actions.value.push({
				'label': `Bloquer ${post.value.author?.display_name || post.value.author?.name || "l'auteur"}`,
				'style': 'danger',
				'handler': async () => {
					await props.data.author?.block();
				}
			});
		}
	});

	const patterns: MarkdownPattern[] = [
		{
			pattern: /@([a-zA-Z0-9_]+)/g,
			replace: (match, username) => `[@${username}](/@${username})`
		},
		{
			pattern: /#([a-zA-Z0-9_]+)/g,
			replace: (match, tag) => `[#${tag}](/discover?tag=${tag})`
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
	<div :key="post.id" :id="'post-' + post.id" class="block bg-background-surface text-text-surface text-left border-2 border-border-surface rounded-3xl w-full p-4 space-y-3">
		<div class="flex items-center gap-x-2">
			<PictureRing
				:src=post.author!.avatar_url!
				:size=12
				:thickness=1.2
				:primary="post.author?.badge?.colors['stops']![0] || 'transparent'"
				:second="post.author?.badge?.colors['stops']![1] || 'transparent'"
			/>
			<div class="flex flex-col -space-y-2">
				<RouterLink :to="'/@' + post.author?.name" class="block font-semibold">{{ post.author?.display_name || post.author?.name || '...' }} <ProfileBadge :badge="post.author?.badge || null" class="inline w-4 h-4 ml-0.5 -translate-y-0.5" /></RouterLink>
				<RouterLink :to="'/@' + post.author?.name" class="block text-subtext font-medium text-sm">@{{ post.author?.name || '...' }}</RouterLink>
			</div>
			<div class="grow"></div>
			<span class="text-subtext text-sm">{{ age }}</span>
			<Menu :actions="actions" />
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
			class="md-area max-w-full px-2"
			:class="clickable ? 'select-none cursor-pointer' : ''"
			v-markdown="applyMarkdownPatterns(content, patterns)"
			@click="() => { if (clickable) router.push('/post/' + post!.id) }"
		></div>
		<div v-if="!show_all && post.content.length > 200" class="flex justify-end px-2">
			<button @click="() => { show_all = true; content = post.content }" class="text-subtext text-sm">Voir plus</button>
		</div>
		<div class="px-0">
			<PostWidget v-if=post.parent_id :data="parent" :client=client :me=me />
		</div>
		<div class="flex gap-4 items-center border-t border-border-surface px-2 pt-3">
			<button
				class="cursor-pointer flex items-center text-text-surface text-sm font-medium gap-0.5 duration-150 active:scale-85"
				@click="async () => { post!.likes == baselike ? await post!.like() : await post!.unlike() }"
			>
				<HeartFilled v-if="post!.likes != baselike" class="text-rose-500 w-5 h-5" />
				<HeartIcon v-else class="stroke-2 w-5 h-5" />
				<span class="translate-y-[-0.5px]">{{ toLiteralNumber(post.likes) }}</span>
			</button>
			<button
				class="cursor-pointer flex items-center text-text-surface text-sm font-medium gap-0.5 duration-150 active:scale-85"
				@click="async () => { await router.push('/post/' + post!.id + '/quote') }"
			>
				<ArrowPathRoundedSquareIcon class="text-text-surface stroke-2 w-5 h-5" />
				<span class="translate-y-[-0.5px]">{{ toLiteralNumber(post.reposts) }}</span>
			</button>
			<button
				class="cursor-pointer flex items-center text-text-surface text-sm font-medium gap-0.5 duration-150 active:scale-85"
			>
				<ChatBubbleOvalLeftIcon class="text-text-surface stroke-2 w-5 h-5" />
				<span class="translate-y-[-0.5px]">{{ toLiteralNumber(post.comments) }}</span>
			</button>
			<div class="grow"></div>
		</div>
	</div>
</template>
