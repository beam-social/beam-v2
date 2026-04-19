<script setup lang="ts">
	import { ExclamationCircleIcon } from '@heroicons/vue/24/outline';
</script>
<template>
	<div class="block bg-amber-600/15 text-amber-600 text-left border border-amber-600/20 rounded-2xl w-full p-4 space-y-3">
		<div class="flex items-center gap-x-2">
			<ExclamationCircleIcon class="w-8 h-8 text-amber-600" />
			<p class="text-amber-600"><slot /></p>
		</div>
	</div>
</template>
