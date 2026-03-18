<script setup lang="ts">
	const props = defineProps<{
		isOpen: boolean
		size?: '2xl' | 'xl' | 'lg' | 'md' | 'sm'
	}>()

	const emit = defineEmits(['update:isOpen'])

	const close = () => {
		emit('update:isOpen', false)
	}

	const size_class = computed(() => {
		let base = 'relative text-text-surface bg-background-surface border-2 border-border-surface rounded-3xl w-full px-8 py-6 space-y-2'

		switch (props.size) {
			case '2xl':
				return base + ' max-w-4xl'

			case 'xl':
				return base + ' max-w-3xl'

			case 'lg':
				return base + ' max-w-2xl'

			case 'md':
				return base + ' max-w-xl'

			case 'sm':
				return base + ' max-w-md'

			default:
				return base + ' max-w-md'
		}
	})
</script>
<template>
	<Teleport to="body">
		<div v-if="isOpen" class="fixed flex items-center justify-center inset-0 z-1000 transition-all duration-300">
			<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
			<div :class="size_class">
				<slot />
			</div>
		</div>
	</Teleport>
</template>
