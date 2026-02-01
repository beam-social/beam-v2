<script setup lang="ts">
	import { EllipsisVerticalIcon } from '@heroicons/vue/24/solid'

	import { onMounted, onBeforeUnmount, ref } from 'vue'

	const props = defineProps<{
		actions: {
			label: string,
			style: string,
			handler: () => void
		}[]
	}>()

	const showMenu = ref(false)
	const x = ref(0)
	const y = ref(0)

	function openMenu(event: MouseEvent) {
		x.value = event.clientX
		y.value = event.clientY
		showMenu.value = true
	}

	onMounted(() => {
		window.addEventListener('scroll', () => {
			showMenu.value = false
		})

		window.addEventListener('click', () => {
			showMenu.value = false
		})
	})

	onBeforeUnmount(() => {
		window.removeEventListener('scroll', () => {
			showMenu.value = false
		})

		window.removeEventListener('click', () => {
			showMenu.value = false
		})
	})

	function closeMenu() {
		showMenu.value = false
	}

	const classNames: Record<string, string> = {
		'normal': 'text-text-surface',
		'danger': 'text-red-500'
	}
</script>
<template>
	<div @click="closeMenu" class="flex flex-col -space-y-6 items-end cursor-pointer h-6 w-6">
		<button @click.stop="openMenu" class="cursor-pointer block">
			<EllipsisVerticalIcon class="w-6 h-6 text-text-surface stroke-2" />
		</button>

		<div
			v-if="showMenu"
			class="relative top-0 z-1000 flex flex-col bg-background-surface text-text-surface border-2 border-border-surface rounded-2xl w-fit h-fit p-2 shadow-lg"
		>
			<button
				:class="classNames[action.style] + ' cursor-pointer text-sm text-left font-medium px-2 py-1'"
				v-for="action in actions"
				@click="() => { action.handler(); closeMenu(); }"
			>
				{{ action.label }}
			</button>
		</div>
	</div>
</template>

