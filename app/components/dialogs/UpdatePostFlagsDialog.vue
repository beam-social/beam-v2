<script setup lang="ts">
	import type { Post } from 'beamsocial';
	import Dialog from '../layout/Dialog.vue'

	const props = defineProps<{
		isOpen: boolean
		post: Post
	}>()

	const translation: { [key in 'NFE' | 'spam' | 'harassment' | 'suspicious' | 'suicide' | 'AI']: string } = {
		'NFE': 'Contenu non adapté à un public mineur',
		'spam': 'Spam',
		'harassment': 'Harcèlement',
		'suspicious': 'Contenu suspect',
		'suicide': 'Suicide ou automutilation',
		'AI': 'Généré par IA'
	}

	const selectedFlags = ref<Record<'NFE' | 'spam' | 'harassment' | 'suspicious' | 'suicide' | 'AI', boolean>>({
		'NFE': props.post.flags.includes('NFE'),
		'spam': props.post.flags.includes('spam'),
		'harassment': props.post.flags.includes('harassment'),
		'suspicious': props.post.flags.includes('suspicious'),
		'suicide': props.post.flags.includes('suicide'),
		'AI': props.post.flags.includes('AI')
	});
</script>
<template>
	<Dialog :isOpen="isOpen" @update:isOpen="($val) => $emit('update:isOpen', $val)">
		<h2 class="text-xl font-medium">Modifier les flags du post</h2>
		<p>Sélectionnez les flags du post en fonction de ce qu'il contient. L'utilisateur n'en sera pas averti.</p>
		<div class="flex flex-col gap-2">
			<div v-for="(value, flag) in selectedFlags" :key="flag" class="flex items-center gap-2">
				<input type="checkbox" :id="flag" :value="flag" v-model="selectedFlags[flag]" class="w-4 h-4 text-action bg-background-surface border-border-surface rounded focus:ring-action-hovered">
				<label :for="flag" class="text-sm">{{ translation[flag] }}</label>
			</div>
		</div>
		<div class="flex justify-center">
			<Button
				label="Annuler"
				type="transparent"
				:handler="() => $emit('update:isOpen', false)"
			/>
			<Button
				label="Valider"
				type="action"
				:handler="() => { post.edit_flags(selectedFlags); $emit('update:isOpen', false) }"
			/>
		</div>
	</Dialog>
</template>
