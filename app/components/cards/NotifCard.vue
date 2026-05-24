<script setup lang="ts">
	import PostWidget from '@/components/widgets/PostWidget.vue';
	import CommentWidget from '@/components/widgets/CommentWidget.vue';

	import { Post } from 'beamsocial';
	import type { Client, Comment, Notification, NotificationComment, NotificationPost, NotificationSingle } from 'beamsocial';

	import { deltatime } from '@/utils/time';

	const props = defineProps<{
		notif: Notification
		client: Client
	}>();

	const post = ref<Post | null>(null);
	const comment = ref<Comment | null>(null);

	switch (props.notif.type) {
		case 'like':
			props.client.getPost((props.notif as NotificationPost).target)
				.then(
					data => {
						post.value = data
					}
				)

			break;

		case 'repost':
			props.client.getPost((props.notif as NotificationPost).target)
				.then(
					data => {
						post.value = data
					}
				)

			break;

		case 'add_comment':
			props.client.getPost((props.notif as NotificationComment).post)
				.then(
					data => {
						post.value = data
					}
				)

			props.client.getComment((props.notif as NotificationComment).target)
				.then(
					data => {
						comment.value = data
					}
				)

			break;
	}
</script>
<template>
	<div
		v-if="notif.type == 'like'"
		class="block bg-surface text-on-surface border border-surface-border rounded-3xl p-4 space-y-2"
	>
		<div class="flex items-center gap-2">
			<p class="text-muted text-sm">❤️</p>
			<p class="text-primary"><RouterLink class="font-bold" :to="'/@' + (notif.author?.name || 'fantome_off')">{{ notif.author?.display_name || notif.author?.name || 'Utilisateur Inconnu' }}</RouterLink> a kiffé votre publication.</p>
			<p class="text-muted text-sm">{{ deltatime(new Date(notif.date)) }}</p>
		</div>
		<PostWidget :data=post :me="undefined" />
	</div>

	<div
		v-else-if="notif.type == 'repost'"
		class="block bg-surface text-on-surface border border-surface-border rounded-3xl p-4 space-y-2"
	>
		<div class="flex items-center gap-2">
			<p class="text-muted text-sm">🔁</p>
			<p class="text-primary"><RouterLink class="font-bold" :to="'/@' + (notif.author?.name || 'fantome_off')">{{ notif.author?.display_name || notif.author?.name || 'Utilisateur Inconnu' }}</RouterLink> vous a mentionné(e) dans une publication.</p>
			<p class="text-muted text-sm">{{ deltatime(new Date(notif.date)) }}</p>
		</div>
		<PostWidget :data=post :me="undefined" />
	</div>

	<div
		v-else-if="notif.type == 'follow'"
		class="block bg-surface text-on-surface border border-surface-border rounded-3xl p-4 space-y-2"
	>
		<div class="flex items-center gap-2">
			<p class="text-muted text-sm">👥</p>
			<p class="text-primary"><RouterLink class="font-bold" :to="'/@' + (notif.author?.name || 'fantome_off')">{{ notif.author?.display_name || notif.author?.name || 'Utilisateur Inconnu' }}</RouterLink> a commencé à vous suivre.</p>
			<p class="text-muted text-sm">{{ deltatime(new Date(notif.date)) }}</p>
		</div>
	</div>

	<div
		v-else-if="notif.type == 'accept_follow'"
		class="block bg-surface text-on-surface border border-surface-border rounded-3xl p-4 space-y-2"
	>
		<div class="flex items-center gap-2">
			<p class="text-muted text-sm">👥</p>
			<p class="text-primary"><RouterLink class="font-bold" :to="'/@' + (notif.author?.name || 'fantome_off')">{{ notif.author?.display_name || notif.author?.name || 'Utilisateur Inconnu' }}</RouterLink> a accepté votre demande de suivi.</p>
			<p class="text-muted text-sm">{{ deltatime(new Date(notif.date)) }}</p>
		</div>
	</div>

	<div
		v-else-if="notif.type == 'add_comment'"
		class="block bg-surface text-on-surface border border-surface-border rounded-3xl p-4 space-y-2"
	>
		<div class="flex items-center gap-2">
			<p class="text-muted text-sm">💬</p>
			<p class="text-primary"><RouterLink class="font-bold" :to="'/@' + (notif.author?.name || 'fantome_off')">{{ notif.author?.display_name || notif.author?.name || 'Utilisateur Inconnu' }}</RouterLink> a commenté votre publication.</p>
			<p class="text-muted text-sm">{{ deltatime(new Date(notif.date)) }}</p>
		</div>
		<CommentWidget :data=comment :me="undefined" />
	</div>
</template>
