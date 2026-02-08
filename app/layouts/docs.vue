<script setup lang="ts">
	import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/solid'

	import Navbar from '@/components/layout/HCNavbar.vue';

	import { useSession } from '@/stores/session';

	const { me } = useSession();
</script>
<template>
	<Navbar :me=me />
	<slot />
</template>
