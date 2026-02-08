<script setup lang="ts">
	import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/solid'

	import Navbar from '@/components/layout/Navbar.vue';
	import Sidebar from '@/components/layout/Sidebar.vue';
	import Aside from '@/components/layout/Aside.vue';

	import { useSession } from '@/stores/session';

	const { me } = useSession();
</script>
<template>
	<Sidebar :me=me class="max-sm:hidden" />
	<Navbar :me=me class="sm:hidden" />
	<slot />
	<Aside :me=me class="max-lg:hidden" />
	<button class="sm:hidden fixed bottom-4 right-4 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl duration-300">
		<RouterLink to="/write" class="w-full h-full flex items-center justify-center">
			<ChatBubbleOvalLeftEllipsisIcon color="white" :filled=true class="block w-6 h-6" />
		</RouterLink>
	</button>
</template>
