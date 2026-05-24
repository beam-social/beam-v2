<script setup lang="ts">
import { useSession } from "~/composables/session";

useHead({
	title: "Se connecter • Beam",
	meta: [{ name: "description", content: "Se connecter à mon compte." }],
});

const { $client } = useNuxtApp();
const { refreshSession } = useSession();

const router = useRouter();

async function login() {
	const result = await $client.login(
		(document.getElementById("login") as HTMLInputElement).value,
		(document.getElementById("password") as HTMLInputElement).value,
	);

	if (result) {
		router.push("/");
	} else {
		alert("Échec de la connexion");
	}
}

onMounted(async () => {
	await refreshSession();
});
</script>
<template>
	<main class="p-4 xs:p-8">
		<nav class="flex max-w-lg px-10 mx-auto mb-1">
			<a href="/" class="text-primary font-semibold"
				>Retour à l'accueil</a
			>
			<div class="grow"></div>
			<a href="/auth/join" class="text-primary font-semibold"
				>S'inscrire</a
			>
		</nav>
		<form
			@submit.prevent="login"
			class="bg-surface text-on-surface border border-surface-border rounded-4xl max-w-lg p-8 mx-auto space-y-4"
		>
			<h1 class="text-2xl font-bold text-center">Se connecter</h1>
			<div class="space-y-1">
				<label for="login" class="block text-sm font-medium"
					>Nom d'utilisateur ou adresse mail:</label
				>
				<input
					type="text"
					id="login"
					name="login"
					class="block bg-surface text-sm border border-surface-border rounded-lg w-full px-4 py-2"
					required
				/>
			</div>
			<div class="space-y-1">
				<label for="password" class="block text-sm font-medium"
					>Mot de passe:</label
				>
				<input
					type="password"
					id="password"
					name="password"
					class="block bg-surface text-sm border border-surface-border rounded-lg w-full px-4 py-2"
					required
				/>
			</div>
			<div class="flex justify-center items-center gap-4">
				<RouterLink
					to="/auth/join"
					class="text-sm text-primary font-medium underline decoration-[1.5px] decoration-transparent duration-300 hover:decoration-primary-hovered"
					>Je n'ai pas de compte</RouterLink
				>
				<Button label="Connexion" type="action" :handler="login" />
			</div>
		</form>
	</main>
</template>
