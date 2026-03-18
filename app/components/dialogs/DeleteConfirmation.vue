<script setup lang="ts">
	import type { Post } from 'beamsocial';

	import Dialog from '../layout/Dialog.vue'
	import Button from '../Button.vue';

	const props = defineProps<{
		isOpen: boolean
		post: Post
	}>();
</script>
<template>
	<Dialog
		size="sm"
		:isOpen="isOpen"
		@update:isOpen="($val) => $emit('update:isOpen', $val)"
	>
		<h2 class="text-xl font-medium">Confirmez la suppression</h2>
		<p>Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.</p>
		<div class="flex justify-center gap-2">
			<Button
				:key="`cancel-${post.id}`"
				label="Annuler"
				type="transparent"
				:handler="() => $emit('update:isOpen', false)"
			/>
			<Button
				:key="`delete-${post.id}`"
				label="Supprimer"
				type="danger"
				:handler="() => { post.delete(); $emit('update:isOpen', false) }"
			/>
		</div>
	</Dialog>
</template>
