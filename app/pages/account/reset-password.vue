<script setup lang="ts">
import axios from "axios";

import { useSession } from "~/composables/session";

useHead({
	title: "Réinitialiser mon mot de passe • Beam",
	meta: [
		{ name: "robots", content: "noindex,nofollow" },
		{ name: "description", content: "Réinitialiser mon mot de passe." },
	],
});

const { $apiUrl } = useNuxtApp();
const { refreshSession } = useSession();

const router = useRouter();
const route = useRoute();

const newPassword = ref<string>("");

onMounted(async () => {
	await refreshSession(() => {});
});

function submit() {
	axios
		.post(`${$apiUrl}/auth/password-reset`, {
			token: route.query.token,
			new_password: newPassword.value,
		})
		.then(() => {
			router.push("/auth/login");
		})
		.catch((error) => {
			alert(
				"Erreur lors de la réinitialisation du mot de passe: " +
					error.response.data.message,
			);
		});
}
</script>
<template>
	<main class="p-4 xs:p-8">
		<form
			@submit.prevent="submit"
			class="bg-surface text-on-surface border border-surface-border rounded-4xl p-8 space-y-4 md:w-1/3 md:mx-auto"
		>
			<h1 class="text-2xl font-bold text-center">
				Changer mon mot de passe
			</h1>
			<div class="space-y-1">
				<label for="newPassword" class="block text-sm font-medium"
					>Nouveau mot de passe:</label
				>
				<input
					type="password"
					id="newPassword"
					name="newPassword"
					v-model="newPassword"
					class="block bg-surface text-sm border border-surface-border rounded-lg w-full px-4 py-2"
					required
				/>
			</div>
			<div class="flex items-center gap-4">
				<button
					type="submit"
					class="cursor-pointer block bg-button text-white text-sm font-medium rounded-full px-5 py-3 mx-auto duration-300 hover:bg-button-hovered"
				>
					Valider
				</button>
			</div>
		</form>
	</main>
</template>
