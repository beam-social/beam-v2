<script setup lang="ts">
	import type { Post } from 'beamsocial';
	import Dialog from '../layout/Dialog.vue'

	const props = defineProps<{
		isOpen: boolean
		post: Post
	}>();

	const is_ai = ref<boolean>(props.post.flags.includes('AI'));
	const is_nudity = ref<boolean>(props.post.flags.includes('NFE'));
</script>
<template>
	<Dialog
		size="xl"
		:isOpen="isOpen"
		@update:isOpen="($val) => $emit('update:isOpen', $val)"
	>
		<h2 class="text-xl font-medium">Modifier le post</h2>
		<textarea v-model="post.content" class="w-full h-48 p-3 border-2 border-border-surface rounded-lg bg-background-surface text-text-surface focus:outline-none focus:ring-2 focus:ring-action"></textarea>
		<div class="flex justify-start items-center gap-2">
			<label for="visibility" class="text-sm font-bold">Visibilité</label>
			<select v-model="post.visibility" name="visibility" class="block bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2">
				<option value="me">Seulement moi</option>
				<option value="friends">Mes amis</option>
				<option value="followers">Mes abonnés</option>
				<option value="everyone">Tout le monde</option>
			</select>
		</div>
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-1">
				<input
					type="checkbox"
					id="ai"
					v-model="is_ai"
					class="w-4 h-4 text-action bg-background-surface border-border-surface rounded focus:ring-action-hovered"
					:disabled="post.flags.includes('AI')"
				>
				<label for="ai" class="text-sm font-medium">Généré par IA</label>
			</div>
			<div class="flex items-center gap-1">
				<input
					type="checkbox"
					id="nudity"
					v-model="is_nudity"
					class="w-4 h-4 text-action bg-background-surface border-border-surface rounded focus:ring-action-hovered"
					:disabled="post.flags.includes('NFE')"
				>
				<label for="nudity" class="text-sm font-medium">Nudité</label>
			</div>
		</div>
		<div class="flex justify-center gap-2">
			<button
				class="cursor-pointer bg-gray-500/10 text-gray-500 text-sm font-medium rounded-full px-5 py-3 hover:bg-gray-500/20"
				@click="() => $emit('update:isOpen', false)"
			>
				Annuler
			</button>
			<button
				class="cursor-pointer bg-action text-white text-sm font-medium rounded-full px-5 py-3 hover:bg-action-hovered"
				@click="() => { post.edit(post.content); $emit('update:isOpen', false) }"
			>
				Valider
			</button>
		</div>
	</Dialog>
</template>
