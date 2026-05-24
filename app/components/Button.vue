<script setup lang="ts">
const props = defineProps<{
	label: string;
	handler: () => void;
	type?:
		| "action"
		| "danger"
		| "success"
		| "neutral"
		| "surface"
		| "transparent";
	size?: "sm" | "md" | "lg" | "xl";
	icon?: Component;
}>();

let base =
	"cursor-pointer inline-flex gap-x-1 items-center line-clamp-1 font-medium transition-colors duration-200";

switch (props.type) {
	case "action":
		base += " bg-button text-on-button hover:bg-button-hovered";
		break;

	case "danger":
		base += " bg-danger text-on-danger hover:bg-danger-hovered";
		break;

	case "success":
		base += " bg-success text-on-success hover:bg-success-hovered";
		break;

	case "neutral":
		base += " bg-zinc-600/10 text-zinc-600 hover:bg-zinc-600/20";
		break;

	case "surface":
		base += " bg-surface text-on-surface hover:bg-muted-surface";
		break;

	case "transparent":
		base += " text-muted hover:bg-zinc-600/10";
		break;

	default:
		base += " text-muted hover:bg-zinc-600/10";
		break;
}

switch (props.size) {
	case "sm":
		base += " rounded-xl h-10 px-4 text-sm";
		break;

	case "md":
		base += " rounded-full h-10 px-5 text-sm";
		break;

	case "lg":
		base += " rounded-full h-12 px-6 text-base";
		break;

	case "xl":
		base += " rounded-full h-14 px-7 text-base";
		break;

	default:
		base += " rounded-full h-10 px-5 text-sm";
		break;
}

const loading = ref(false);

const clickHandler = async () => {
	if (loading.value) return;
	loading.value = true;
	try {
		await props.handler();
	} finally {
		loading.value = false;
	}
};
</script>
<template>
	<a v-if="!loading" :class="base" @click="clickHandler">
		<component :is="icon" v-if="icon" class="inline-block w-4 h-4" />
		{{ props.label }}
	</a>
	<a v-else :class="base" @click="clickHandler">
		<div class="w-2 h-2 my-2 rounded-full bg-current animate-pulse"></div>
		<div
			class="w-2 h-2 my-2 rounded-full bg-current animate-pulse delay-500"
		></div>
		<div
			class="w-2 h-2 my-2 rounded-full bg-current animate-pulse delay-1000"
		></div>
	</a>
</template>
