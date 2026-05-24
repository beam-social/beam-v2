<script setup lang="ts">
import { TrashIcon, UsersIcon } from "@heroicons/vue/24/solid";

import ProfileCard from "@/components/cards/ProfileCard.vue";
import NotifCard from "@/components/cards/NotifCard.vue";

import type { IncomingRequest } from "beamsocial";
import type { Notification } from "beamsocial";

import { useSession, useInbox } from "~/composables/session";

useHead({
	title: "Notifications • Beam",
	meta: [
		{ name: "robots", content: "noindex,nofollow" },
		{
			name: "description",
			content: "Consultez vos notifications sur Beam.",
		},
	],
});

const router = useRouter();
const { $client } = useNuxtApp();
const { me, refreshSession } = useSession();
const { inbox } = useInbox();

const section = ref<string>("unread");

const requests = ref<IncomingRequest[]>([]);
const unread = ref<Notification[]>([]);
const read = ref<Notification[]>([]);

onMounted(async () => {
	await refreshSession(() => {
		router.push(
			"/auth/login?return=" +
				encodeURIComponent(window.location.pathname),
		);
	});
});

watch(
	inbox,
	() => {
		if (inbox.value) {
			requests.value = inbox.value.incoming.follow;
			unread.value = inbox.value.unread;
			read.value = inbox.value.read;
		} else {
			requests.value = [];
			unread.value = [];
			read.value = [];
		}
	},
	{ immediate: true },
);
</script>
<template>
	<main class="flex flex-col p-4 gap-4 xs:p-8">
		<h1 class="text-4xl text-center font-bold">Notifications</h1>
		<nav
			class="sticky z-500 top-4 flex gap-1 bg-surface backdrop-blur-xl text-on-surface border border-surface-border rounded-full w-fit p-2 mx-auto"
		>
			<button
				class="cursor-pointer text-sm font-medium rounded-full px-4 py-2 duration-300"
				:class="
					section == 'requests'
						? 'text-primary bg-primary/10'
						: 'text-on-surface hover:bg-primary/5'
				"
				@click="() => (section = 'requests')"
			>
				Demandes ({{ requests.length }})
			</button>
			<button
				class="cursor-pointer text-sm font-medium rounded-full px-4 py-2 duration-300"
				:class="
					section == 'unread'
						? 'text-primary bg-primary/10'
						: 'text-on-surface hover:bg-primary/5'
				"
				@click="() => (section = 'unread')"
			>
				Non lues ({{ unread.length }})
			</button>
			<button
				class="cursor-pointer text-sm font-medium rounded-full px-4 py-2 duration-300"
				:class="
					section == 'read'
						? 'text-primary bg-primary/10'
						: 'text-on-surface hover:bg-primary/5'
				"
				@click="() => (section = 'read')"
			>
				Lues
			</button>
		</nav>
		<section class="" v-if="section == 'requests'">
			<div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
				<ProfileCard
					v-for="req in requests"
					:key="'follow-req-' + req.from.id"
					:profile="req.from"
					:me="me"
					:clickable="true"
					:deployed="true"
					:actions="[
						{
							label: 'Accepter',
							type: 'action',
							icon: UsersIcon,
							handler: async () => {
								await req.accept();
								refreshSession();
							},
						},
						{
							label: 'Refuser',
							type: 'neutral',
							icon: TrashIcon,
							handler: async () => {
								await req.reject();
								refreshSession();
							},
						},
					]"
				/>
			</div>
		</section>
		<section class="space-y-2" v-else-if="section == 'read'">
			<NotifCard
				v-for="notif in read"
				:key="notif.id"
				:notif="notif"
				:client="$client"
			/>
		</section>
		<section class="space-y-2" v-else>
			<NotifCard
				v-for="notif in unread"
				:key="notif.id"
				:notif="notif"
				:client="$client"
			/>
		</section>
	</main>
</template>
