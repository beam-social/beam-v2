<script setup lang="ts">
	import ProfileCard from '@/components/cards/ProfileCard.vue';
	import NotifCard from '@/components/cards/NotifCard.vue';

	import { onMounted, ref } from 'vue';
	import { useRouter } from 'vue-router';

	import axios from 'axios';

	import type { User } from 'beamsocial'
	import type { Notification } from 'beamsocial'

	import { me, refreshMe } from '@/stores/session';

	const router = useRouter();
	const { $client, $apiUrl } = useNuxtApp();

	const section = ref<string>('unread');

	const requests = ref<User[]>([]);
	const unread = ref<Notification[]>([]);
	const read = ref<Notification[]>([]);

	onMounted(async () => {
		document.title = "Notifications • Beam"

		await refreshMe(() => {
			router.push('/login?return=' + encodeURIComponent(window.location.pathname))
		});

		axios.get(
		`${$apiUrl}/me/inbox`,
		{
			withCredentials: true
		}
	).then(response => {
		const inbox = response.data;

		for (const u of inbox.requests.followers || []) {
			$client.getUser(u)
			.then(user => {
				if (user) {
					requests.value.push(user);
				}
			});
	}

	read.value = inbox.read
	unread.value = inbox.unread
	});
});

function reload() {
	window.location.reload()
}
</script>
<template>
	<main class="flex flex-col p-4 gap-4 sm:p-8">
		<h1 class="text-3xl text-center font-bold">Notifications</h1>
		<nav class="sticky z-500 top-4 flex gap-1 bg-background-surface backdrop-blur-xl text-text-surface border-2 border-border-surface rounded-full w-fit p-2 mx-auto">
			<button
				class="cursor-pointer text-sm font-medium rounded-full px-4 py-2 duration-300"
				:class="section == 'requests' ? 'text-primary bg-primary/10' : 'text-text-surface hover:bg-primary/5'"
				@click="() => section = 'requests'"
			>Demandes ({{ requests.length }})</button>
			<button
				class="cursor-pointer text-sm font-medium rounded-full px-4 py-2 duration-300"
				:class="section == 'unread' ? 'text-primary bg-primary/10' : 'text-text-surface hover:bg-primary/5'"
				@click="() => section = 'unread'"
			>Non lues ({{ unread.length }})</button>
			<button
				class="cursor-pointer text-sm font-medium rounded-full px-4 py-2 duration-300"
				:class="section == 'read' ? 'text-primary bg-primary/10' : 'text-text-surface hover:bg-primary/5'"
				@click="() => section = 'read'"
			>Lues</button>
		</nav>
		<section class="" v-if="section == 'requests'">
			<div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
				<ProfileCard
					v-for="user in requests"
					:key=user.id
					:profile=user
					:me=me
					:clickable=true
				/>
			</div>
		</section>
		<section class="space-y-2" v-else-if="section == 'read'">
			<NotifCard
				v-for="notif in read"
				:key=notif.id
				:notif=notif
				:client=$client
				class="max-w-lg mx-auto"
			/>
		</section>
		<section class="space-y-2" v-else>
			<NotifCard
				v-for="notif in unread"
				:key=notif.id
				:notif=notif
				:client=$client
				class="max-w-lg mx-auto"
			/>
		</section>
	</main>
</template>
