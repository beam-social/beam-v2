<script setup lang="ts">
	import { themes, useTheme } from '@/services/theme';

	const { theme: current } = useTheme();

	const props = defineProps<{
		theme: string
	}>()
</script>
<template>
	<div
		class="cursor-pointer text-center border-2 rounded-2xl p-4 space-y-1 duration-300 hover:bg-primary/10 transition-colors"
		:class="theme == current ? 'bg-primary/25 border-primary' : 'border-transparent'"
		@click="current = theme"
	>
		<div
			class="rounded-full w-fit p-2 mx-auto"
			:style="{
				backgroundColor: themes[theme]?.color + '60'
			}"
		>
			<div
				class="rounded-full bg-linear-to-br w-12 h-12"
				:style="{
					backgroundColor: themes[theme]?.color,
				}"
			>
				<div
					class="rounded-full w-full h-full"
					style="background-image: linear-gradient(135deg, #00000000, #00000030);"
				></div>
			</div>
		</div>
		<p class="font-medium">{{ themes[theme]?.name }}</p>
	</div>
</template>
