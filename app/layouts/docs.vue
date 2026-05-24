<script setup lang="ts">
import Navbar from "@/components/layout/HCNavbar.vue";

import { useSession } from "~/composables/session";

const { me } = useSession();
</script>
<template>
	<Navbar :me="me" class="sticky top-0 col-span-3" />
	<aside class="col-start-1"></aside>
	<slot />
	<aside></aside>
</template>
