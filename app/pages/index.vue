<script setup lang="ts">
	import { onMounted } from 'vue';
	import { me, refreshMe } from '@/stores/session';
	import { useRouter } from 'vue-router';

	const router = useRouter();

	onMounted(async () => {
		document.title = "Beam • Le réseau social 100% moderne";

		await refreshMe();

		if (me.value) {
			router.push('/discover');
			return;
		}
	});
</script>
<template>
	<header class="select-none flex items-center p-8 h-screen max-md:text-center max-md:justify-center md:p-24 lg:p-32 xl:p-48">
		<div class="space-y-8">
			<div class="space-y-4">
				<h1 class="text-5xl font-semibold">Bienvenue !</h1>
				<p class="text-xl text-subtext font-medium md:w-2/3">Rejoins notre communauté dès maintenant, gratuitement.</p>
			</div>
			<div class="flex flex-wrap gap-x-4 items-center max-md:justify-center max-md:gap-y-2">
				<RouterLink to="/auth/join" class="cursor-pointer block bg-action text-white text-center font-medium rounded-full w-40 py-3 duration-300 hover:bg-action-hovered">C'est parti</RouterLink>
				<RouterLink to="/auth/login" class="cursor-pointer block text-center font-medium underline decoration-[1.5px] decoration-transparent w-fit duration-300 hover:decoration-inherit">J'ai un compte</RouterLink>
			</div>
			<!--hr class="border border-border-surface rounded-full w-48 max-md:mx-auto" />
			<div>
				<p class="text-subtext font-medium md:w-2/3">En rejoignant, vous acceptez nos <RouterLink to="/terms" class="text-primary underline decoration-[1.5px] decoration-transparent duration-300 hover:decoration-primary-hovered">Conditions d'utilisation</RouterLink> et vous engagez à les repsecter.</p>
			</div-->
		</div>
	</header>
</template>
