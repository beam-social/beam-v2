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
		<textarea v-model="post.content" class="w-full h-48 p-3 border border-surface-border rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-button"></textarea>
		<div class="flex justify-start items-center gap-2">
			<label for="visibility" class="text-sm font-bold">Visibilité</label>
			<select v-model="post.visibility" name="visibility" class="block bg-surface text-sm border border-surface-border rounded-lg px-4 py-2">
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
					class="w-4 h-4 text-button bg-surface border-surface-border rounded focus:ring-button-hovered"
					:disabled="post.flags.includes('AI')"
				>
				<label for="ai" class="text-sm font-medium">Généré par IA</label>
			</div>
			<div class="flex items-center gap-1">
				<input
					type="checkbox"
					id="nudity"
					v-model="is_nudity"
					class="w-4 h-4 text-button bg-surface border-surface-border rounded focus:ring-button-hovered"
					:disabled="post.flags.includes('NFE')"
				>
				<label for="nudity" class="text-sm font-medium">Nudité</label>
			</div>
		</div>
		<div class="flex justify-center gap-2">
			<Button
				:key="`cancel-${post.id}`"
				label="Annuler"
				type="transparent"
				:handler="() => $emit('update:isOpen', false)"
			/>
			<Button
				:key="`validate-${post.id}`"
				label="Valider"
				type="action"
				:handler="() => { post.edit(post.content); $emit('update:isOpen', false) }"
			/>
		</div>
	</Dialog>
</template>
