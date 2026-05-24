<script setup lang="ts">
	import { useSession } from '@/stores/session';
	import { useTheme } from '@/services/theme';

	const { me, refreshSession } = useSession();
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
		{ immediate: true }
	);

	const name = computed(() => {
		const noSideRoutes = [
			'/',
			'/auth/join',
			'/auth/login',
			'/auth/logout',
			'/auth/sudo',
			'/account/delete',
			'/account/reset-email',
			'/account/reset-password'
		];

		const noSuggestionRoutes = [
			'/inbox',
			'/account/settings',
		];

		if (noSideRoutes.includes(route.path)) {
			document.body.classList.remove('with-sidebar');
			return 'home';
		} else if (noSuggestionRoutes.includes(route.path)) {
			document.body.classList.add('with-sidebar');
			return 'no-suggest';
		} else if (route.path.startsWith('/hc') || route.path.startsWith('/legal')) {
			document.body.classList.add('both-sidebars');
			return 'docs';
		} else if (me.value) {
			document.body.classList.add('with-sidebar');
			return 'logged-in';
		} else {
			document.body.classList.add('with-sidebar');
			return 'default';
		}
	});
</script>
<template>
	<NuxtLayout :name="name">
		<NuxtPage :key="route.fullPath" class="text-text" />
	</NuxtLayout>
</template>
