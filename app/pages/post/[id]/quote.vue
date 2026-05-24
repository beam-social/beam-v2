<script setup lang="ts">
import { PlusCircleIcon } from "@heroicons/vue/24/solid";

import PictureRing from "@/components/PictureRing.vue";
import ProfileBadge from "@/components/ProfileBadge.vue";
import PostWidget from "@/components/widgets/PostWidget.vue";
import AttachmentEdit from "@/components/AttachmentEdit.vue";
import Button from "~/components/Button.vue";

import axios from "axios";

import { isYoungerThan18 } from "@/utils/profiles";
import { applyMarkdownPatterns, type MarkdownPattern } from "@/utils/format";
import { ensureSession, useSession } from "~/composables/session";
import { usePostPageData } from "~/composables/post";

useHead({
	title: "Reposter • Beam",
	meta: [
		{ name: "robots", content: "noindex,nofollow" },
		{ name: "description", content: "Reposter une publication." },
	],
});

const { $client, $apiUrl } = useNuxtApp();
const { me } = useSession();

const route = useRoute();

const returnUrl = (route.query.return as string) || undefined;

await ensureSession("/auth/login?return=" + encodeURIComponent(route.fullPath));

const parentId =
	typeof route.params.id === "string"
		? route.params.id
		: typeof route.query.quote === "string"
			? route.query.quote
			: null;

const parentData = parentId
	? await usePostPageData(parentId, {
			includeComments: false,
		})
	: { post: ref(null) };

const { post: parent } = parentData;

const show_preview = ref<boolean>(false);
const max = ref<number>(500);
const content = ref<string>("");
const target = ref<"me" | "friends" | "followers" | "everyone">("followers");
const attachments = ref<File[]>([]);

const privacyOptions = [
	{
		value: "me",
		label: "Moi seulement",
		disabled: false,
	},
	{
		value: "friends",
		label: "Mes amis",
		disabled: false,
	},
	{
		value: "followers",
		label: "Mes abonnés",
		disabled: false,
	},
	{
		value: "everyone",
		label: "Tout le monde",
		disabled: true,
	},
];

privacyOptions[3]!.disabled = isYoungerThan18(
	new Date(me.value?.profile.birthday || new Date()),
);

max.value =
	(me.value?.profile.level || 0) >= 5
		? 2000
		: (me.value?.profile.level || 0) >= 4
			? 1000
			: 500;

const patterns: MarkdownPattern[] = [
	{
		pattern: /(^|\s)@([a-z0-9._]+)/g,
		replace: (match, leading, username) =>
			`${leading}[@${username}](/@${username})`,
	},
	{
		pattern: /(^|\s)#([\p{L}\p{N}_]+)/gu,
		replace: (match, leading, tag) =>
			`${leading}[#${tag}](/search?q=${tag})`,
	},
];

const submit = async () => {
	const post = await $client.writePost(
		content.value,
		target.value,
		parent.value ? parent.value.id : undefined,
	);
	await navigateTo(returnUrl ? returnUrl : "/post/" + post.id);

	for (const file of attachments.value) {
		const formData = new FormData();
		formData.append("file", file);

		await axios
			.post(`${$apiUrl}/drive/upload/attachment`, formData, {
				withCredentials: true,
				headers: {
					"Content-Type": "multipart/form-data",
				},
				params: {
					post_id: post.id,
				},
			})
			.catch((err) => {
				alert("Erreur lors de l'upload de la pièce jointe : " + err);
			});
	}
};

const getTempUrl = (file: File) => {
	return URL.createObjectURL(file);
};

function addAttachment() {
	const _file = (document.getElementById("fileInput") as HTMLInputElement)
		.files![0];

	if (!_file) {
		return;
	}

	attachments.value.push(_file);
}
</script>
<template>
	<main class="flex flex-col p-4 gap-4 xs:p-8">
		<h1 class="text-4xl text-center font-bold">Écrire un post</h1>
		<div
			class="block bg-surface text-on-surface text-left border border-surface-border rounded-3xl w-full p-4 space-y-3"
		>
			<div class="flex items-center gap-x-2">
				<PictureRing
					:src="me?.avatar!"
					:size="12"
					:thickness="1.2"
					:primary="
						me?.profile.badge?.colors['stops']![0] || 'transparent'
					"
					:second="
						me?.profile.badge?.colors['stops']![1] || 'transparent'
					"
				/>
				<span class="font-medium"
					>{{
						me?.profile?.display_name || me?.profile?.name || "..."
					}}
					<ProfileBadge
						:badge="me?.profile.badge || null"
						class="inline w-4 h-4 ml-0.5 -translate-y-0.5"
					/>
				</span>
			</div>
			<div
				class="grid grid-cols-2 gap-1 rounded-2xl w-full overflow-hidden"
			>
				<img
					v-if="show_preview"
					v-for="(file, index) in attachments"
					:src="getTempUrl(file)"
					class="rounded-md min-w-full h-full aspect-video object-cover"
					:class="
						index == 0 && attachments.length % 2 == 1
							? 'col-span-2 row-span-2'
							: ''
					"
				/>
				<AttachmentEdit
					v-else
					v-for="(file, index) in attachments"
					:key="index"
					:url="getTempUrl(file)"
					:index="index"
					:isLast="index === attachments.length - 1"
					:onDelete="() => attachments.splice(index, 1)"
					:onReorder="
						(direction: 'up' | 'down') => {
							const newIndex =
								direction === 'up' ? index - 1 : index + 1;

							if (
								newIndex >= 0 &&
								newIndex < attachments.length
							) {
								const temp = attachments[newIndex]!;
								attachments[newIndex] = attachments[index]!;
								attachments[index] = temp;
							}
						}
					"
					class="rounded min-w-full h-full aspect-video object-cover"
					:class="
						index == 0 &&
						attachments.length % 2 == 0 &&
						attachments.length != 4
							? 'col-span-2 row-span-2'
							: ''
					"
				/>
				<div
					v-if="attachments.length < 4 && !show_preview"
					:class="
						attachments.length == 0 ? 'col-span-2 row-span-2' : ''
					"
				>
					<input
						type="file"
						id="fileInput"
						class="hidden"
						accept="image/*"
						@change="() => addAttachment()"
					/>
					<label for="fileInput" class="cursor-pointer">
						<div
							class="flex flex-col items-center justify-center gap-1 bg-zinc-500/10 text-on-surface rounded-lg min-w-full h-full aspect-video"
						>
							<PlusCircleIcon class="w-10 h-10" />
							<span class="text-sm font-medium"
								>Ajouter une pièce jointe</span
							>
						</div>
					</label>
				</div>
			</div>
			<div v-if="show_preview" class="px-2 md-area">
				<p v-markdown="applyMarkdownPatterns(content, patterns)"></p>
			</div>
			<textarea
				v-else
				v-model="content"
				class="border-none rounded-xl outline-none w-full h-32 resize-none px-2"
				placeholder="Qu'allez-vous partager aujourd'hui ?"
				:minlength="1"
				:maxlength="max"
			></textarea>
			<PostWidget
				v-if="parent"
				:data="parent"
				:me="me"
				:client="$client"
				:clickable="false"
			/>
			<div class="px-2">
				<span
					v-if="content.length <= max * 0.9"
					class="text-muted text-sm"
					>{{ max - content.length }} caractères restants</span
				>
				<span v-else class="text-danger text-sm"
					>{{ max - content.length }} caractères restants</span
				>
			</div>
			<div class="flex items-center w-fit px-2 gap-4">
				<label for="target" class="text-sm font-medium"
					>Qui peut voir mon post ?</label
				>
				<select
					id="target"
					name="target"
					v-model="target"
					class="block bg-surface text-sm border border-surface-border rounded-lg px-4 py-2"
					required
				>
					<option value="me">Seulement moi</option>
					<option value="friends">Mes amis</option>
					<option value="followers">Mes abonnés</option>
					<option value="everyone">Tout le monde</option>
				</select>
			</div>
			<div class="flex gap-2 justify-center items-center w-fit mx-auto">
				<Button label="Republier" type="action" :handler="submit" />
				<Button
					v-if="show_preview"
					label="Retourner à l'écriture"
					type="transparent"
					:handler="() => (show_preview = false)"
				/>
				<Button
					v-else
					label="Voir le résultat"
					type="transparent"
					:handler="() => (show_preview = true)"
				/>
			</div>
		</div>
	</main>
</template>
