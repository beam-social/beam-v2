<script setup lang="ts">
	import { TrashIcon } from '@heroicons/vue/24/solid';
	import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';

	const props = defineProps<{
		url: string,
		index: number,
		isLast: boolean,
		onDelete: () => void
		onReorder: (direction: 'up' | 'down') => void
	}>()
</script>
<template>
	<div class="bg-cover bg-center bg-no-repeat group" :style="{
		backgroundImage: `url('${url}')`
	}">
		<div class="flex items-center justify-center gap-1 bg-black/50 h-full opacity-0 transition group-hover:opacity-100">
			<button @click="() => onReorder('up')">
				<ArrowLeftIcon v-if="index > 0" class="cursor-pointer text-white stroke-2 w-5 h-5" />
			</button>
			<button @click="onDelete">
				<TrashIcon class="cursor-pointer text-white w-5 h-5" />
			</button>
			<button @click="() => onReorder('down')">
				<ArrowRightIcon v-if="!isLast" class="cursor-pointer text-white stroke-2 w-5 h-5" />
			</button>
		</div>
	</div>
</template>
