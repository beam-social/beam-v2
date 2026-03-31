<script setup lang="ts">
	const props = defineProps<{
		src: string,
		size: number,
		thickness: number
		primary?: string,
		second?: string
	}>();

	let [ stop1, stop2, size ] = [ props.primary, props.second || props.primary, props.size ]
	let multiplier: number = 4

	if (props.primary == 'transparent') {
		stop2 = 'transparent'
	}
</script>
<template>
	<div class="rounded-full w-fit h-fit" :style="{
		borderColor: primary,
		backgroundColor: 'transparent',
		borderWidth: primary == 'transparent' ? '0' : (size * multiplier) * (6.4/96) + 'px',
		borderRadius: '50%',
		padding: primary == 'transparent' ? '0' : (size * multiplier) * (6/96) + 'px',
		height: size * multiplier + 'px',
		width: size * multiplier + 'px'
	}">
		<img class="rounded-full w-full h-full aspect-square object-cover" :src="src" />
	</div>
</template>
