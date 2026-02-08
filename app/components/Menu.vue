<script setup lang="ts">
	import { EllipsisVerticalIcon } from '@heroicons/vue/24/solid'

	const props = defineProps<{
		actions: {
			label: string,
			style: string,
			handler: () => void
		}[]
	}>()

	const showMenu = ref<boolean>(false);
	const x = ref<number>(0);
	const y = ref<number>(0);

	function openMenu(event: MouseEvent) {
		x.value = event.clientX
		y.value = event.clientY
		showMenu.value = true
	}

	const handleScroll = () => {
		showMenu.value = false
	}

	const handleWindowClick = () => {
		showMenu.value = false
	}

	onMounted(() => {
		window.addEventListener('scroll', handleScroll)
		window.addEventListener('click', handleWindowClick)
	})

	onBeforeUnmount(() => {
		window.removeEventListener('scroll', handleScroll)
		window.removeEventListener('click', handleWindowClick)
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
				:class="classNames[action.style] + ' cursor-pointer block text-sm text-left font-medium whitespace-nowrap w-fit px-2 py-1'"
				v-for="action in actions"
				@click="() => { action.handler(); closeMenu(); }"
			>
				{{ action.label }}
			</button>
		</div>
	</div>
</template>

