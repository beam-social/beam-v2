<script setup lang="ts">
	import { useSession } from '@/stores/session';

useHead({
	title: "Beam",
	meta: [
		{
			name: "description",
			content: "Bienvenue sur Beam, le réseau social 100% moderne.",
		},
	],
});

const router = useRouter();
const { me, refreshSession } = useSession();

onMounted(async () => {
	await refreshSession();

	if (me.value) {
		router.push("/discover");
		return;
	}
});
</script>
<template>
	<header
		class="select-none flex flex-col items-center justify-center gap-8 text-center h-screen"
	>
		<h1 class="text-primary text-7xl font-bold">Bienvenue sur Beam !</h1>
		<p class="text-xl text-muted font-medium md:w-2/3">
			Rejoins notre communauté maintenant, gratuitement.
		</p>
		<div
			class="flex flex-wrap gap-x-4 items-center max-md:justify-center max-md:gap-y-2"
		>
			<RouterLink
				to="/auth/join"
				class="cursor-pointer block bg-button text-white text-center font-medium rounded-full w-32 py-3 duration-300 hover:bg-button-hovered"
				>Rejoindre</RouterLink
			>
			<RouterLink
				to="/auth/login"
				class="cursor-pointer block text-center font-medium underline decoration-[1.5px] decoration-transparent w-fit duration-300 hover:decoration-inherit"
				>Se connecter</RouterLink
			>
		</div>
		<hr class="border border-surface-border rounded-full w-48" />
		<p class="text-muted font-medium md:w-2/3">
			En rejoignant, vous acceptez nos
			<RouterLink
				to="/legal/terms"
				class="text-primary underline decoration-[1.5px] decoration-transparent duration-300 hover:decoration-primary-hovered"
				>Conditions d'utilisation</RouterLink
			>
			et vous engagez à les repsecter.
		</p>
	</header>
</template>
