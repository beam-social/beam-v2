<script setup lang="ts">
	import { ChatBubbleOvalLeftIcon, HeartIcon, ArrowPathRoundedSquareIcon } from '@heroicons/vue/24/outline';
	import { HeartIcon as HeartFilled, CpuChipIcon, PencilIcon } from '@heroicons/vue/24/solid';

	import PictureRing from '@/components/PictureRing.vue';
	import ProfileBadge from '@/components/ProfileBadge.vue';

	import Menu from '../Menu.vue';
	import PostWidget from '../widgets/PostWidget.vue';
	import UpdateFlagsDialog from '../dialogs/UpdatePostFlagsDialog.vue';
	import EditPostDialog from '../dialogs/EditPostDialog.vue';

	import { Client } from 'beamsocial';
	import type { Session } from 'beamsocial'
	import { Post } from 'beamsocial'

	import { toLiteralNumber, applyMarkdownPatterns, type MarkdownPattern } from '@/utils/format';
	import { deltatime } from '@/utils/time';
import DeleteConfirmation from '../dialogs/DeleteConfirmation.vue';

	const props = defineProps<{
		data: Post
		me?: Session | null
		client?: Client
		clickable?: boolean
		short?: boolean
	}>()

	const { $apiUrl } = useNuxtApp();

	const router = useRouter();
	const show_all = ref<boolean>(true);
	const isFlagDialogOpen = ref<boolean>(false);
	const isEditDialogOpen = ref<boolean>(false);
	const isDeleteDialogOpen = ref<boolean>(false);

	const content = ref<string>('');
	const actions = ref<Array<{ label: string, style: string, handler: () => Promise<void> }>>([])

	const post = computed(() => props.data);
	const parent = ref<Post | null>(null);

	const baselike = ref<number | null>(null);
	const age = computed(() => deltatime(post.value.creation_date || new Date(0)));

	const initFromPost = () => {
		content.value = post.value.content;
		baselike.value = post.value.likes - (+!!props.me?.tastes.likes.includes(post.value.id) || 0);

		if (post.value.parent_id && props.client) {
			props.client.getPost(post.value.parent_id).then(
				data => parent.value = data
			)
		} else {
			parent.value = null;
		}

		if (props.short) {
			show_all.value = false;

			content.value = post.value.content.length > 400
				? post.value.content.slice(0, 400) + `...`
				: post.value.content;
		} else {
			show_all.value = true;
		}
	};

	const buildActions = () => {
		let list: Array<{ label: string, style: string, handler: () => Promise<void> }> = [
			{
				label: 'Copier le lien',
				style: 'normal',
				handler: async () => {
					await navigator.clipboard.writeText(window.location.origin + '/post/' + post.value.id);
				}
			}
		];

		if (props.me && (props.me.profile.id == post.value.author?.id || props.me.profile.level >= 6)) {
			list = [
				{
					label: 'Modifier la publication',
					style: 'normal',
					handler: async () => { isEditDialogOpen.value = true }
				},
				...list
			]
		}

		if (props.me && props.me.profile.level >= 6) {
			list.push({
				label: 'Modifier les flags',
				style: 'normal',
				handler: async () => { isFlagDialogOpen.value = true }
			})
		}

		if (props.me && (props.me.profile.id == post.value.author?.id || props.me.profile.level >= 6)) {
			list.push({
				label: 'Supprimer',
				style: 'danger',
				handler: async () => { isDeleteDialogOpen.value = true }
			})
		}

		if (props.me?.profile.id != post.value.author?.id) {
			list.push({
				label: 'Signaler',
				style: 'danger',
				handler: async () => {
					alert('Fonction de signalement non implémentée pour le moment.')
				}
			})

			list.push({
				label: `Bloquer ${post.value.author?.display_name || post.value.author?.name || "l'auteur"}`,
				style: 'danger',
				handler: async () => {
					await props.data.author?.block();
				}
			});
		}

		actions.value = list;
	};

	watch(
		() => [post.value, props.me, props.short, props.client],
		() => {
			initFromPost();
			buildActions();
		},
		{ immediate: true }
	);

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
	<div :key="post.id" :id="'post-' + post.id" class="block bg-background-surface text-text-surface text-left border border-border-surface rounded-3xl w-full p-4 space-y-3">
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
			<div v-if="post.flags.includes('AI')" class="select-none flex items-center bg-primary/15 border border-primary/10 rounded-full px-2 py-1 gap-1">
				<CpuChipIcon class="text-primary w-4 h-4" />
				<span class="text-primary text-sm max-sm:hidden">Généré par IA</span>
				<span class="text-primary text-sm sm:hidden">IA</span>
			</div>
			<div v-if="post.update_date" class="select-none flex items-center bg-primary/15 border border-primary/10 rounded-full px-2 py-1 gap-1">
				<PencilIcon class="text-primary w-4 h-4" />
				<span class="text-primary text-sm max-sm:hidden">Modifié •</span>
				<span class="text-primary text-sm">{{ deltatime(post.update_date!) }}</span>
			</div>
			<span class="text-subtext text-sm">{{ age }}</span>
			<Menu :actions="actions" />
		</div>
		<div v-if="post.attachments.length" class="grid grid-cols-2 gap-1 rounded-2xl w-full overflow-hidden">
			<img
				v-for="(file, index) in post.attachments"
				:src="$apiUrl + '/drive/' + file.id"
				class="rounded-md min-w-full h-full aspect-video object-cover"
				:class="(index == 0 && post.attachments.length % 2 == 1)
					? 'col-span-2 row-span-2'
					: ''"
			/>
		</div>
		<div
			class="md-area max-w-full px-2"
			:class="clickable ? 'select-none cursor-pointer' : ''"
			v-markdown="applyMarkdownPatterns(content, patterns)"
			@click="() => { if (clickable) router.push('/post/' + post!.id) }"
		></div>
		<div v-if="post.content.length > 400" class="flex justify-center px-2">
			<button v-if=show_all @click="() => { show_all = false; content = post.content.slice(0, 400) + '...' }" class="cursor-pointer text-primary text-sm font-semibold">Voir moins</button>
			<button v-else @click="() => { show_all = true; content = post.content }" class="cursor-pointer text-primary text-sm font-semibold">Voir plus</button>
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
	<UpdateFlagsDialog :isOpen="isFlagDialogOpen" :post="post" @update:isOpen="($val: boolean) => isFlagDialogOpen = $val" />
	<EditPostDialog :isOpen="isEditDialogOpen" :post="post" @update:isOpen="($val: boolean) => isEditDialogOpen = $val" />
	<DeleteConfirmation :isOpen="isDeleteDialogOpen" :post="post" @update:isOpen="($val: boolean) => isDeleteDialogOpen = $val" />
</template>
