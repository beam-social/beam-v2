<script setup lang="ts">
	import axios from 'axios';

	const route = useRoute();

	const content = ref<string>('# Chargement...');

	onMounted(() => {
		axios.get(`https://raw.githubusercontent.com/beam-social/beam-hc/master/pages/${(route.params.path as string[]).join('/')}.md`)
			.then(res => {
				content.value = res.data;
			})
			.catch(() => {
				content.value = '# Page non trouvée\nLa page que vous recherchez n\'existe pas.';
			});
	});
</script>
<template>
	<main
		class="prose prose-invert max-w-none p-4 xs:p-8 md:px-16 lg:px-32 lg:py-16 xl:px-48 xl:py-24"
		v-markdown="content"
	></main>
</template>
