<script setup lang="ts">
	defineProps<{
		isOpen: boolean
	}>()

	const emit = defineEmits(['update:isOpen'])

	const close = () => {
		emit('update:isOpen', false)
	}
</script>
<template>
	<Teleport to="body">
		<div v-if="isOpen" class="fixed flex items-center justify-center inset-0 z-1000 transition-all duration-300">
			<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
			<div class="relative text-text-surface bg-background-surface border-2 border-border-surface rounded-3xl w-full max-w-md px-8 py-6 space-y-2">
				<slot />
			</div>
		</div>
	</Teleport>
</template>
