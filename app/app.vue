<script setup lang="ts">
import { useSession } from "~/composables/session";
import { useTheme } from "@/services/theme";

const { refreshSession } = useSession();
const { syncTheme } = useTheme();

const route = useRoute();

onMounted(async () => {
	await refreshSession();
	syncTheme();
});

watch(
	() => route.path,
	async () => {
		await refreshSession();
		syncTheme();
	},
	{ immediate: true },
);
</script>
<template>
	<NuxtLayout>
		<NuxtPage :key="route.fullPath" />
	</NuxtLayout>
</template>
