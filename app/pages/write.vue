<script setup lang="ts">
	import PictureRing from '@/components/PictureRing.vue';
	import ProfileBadge from '@/components/ProfileBadge.vue';
	import PostWidget from '@/components/widgets/PostWidget.vue';

	import { onMounted, ref } from 'vue';
	import { useRoute, useRouter } from 'vue-router';

	import { Post } from 'beamsocial';

	import { isYoungerThan18 } from '@/utils/profiles'
	import { applyMarkdownPatterns, type MarkdownPattern } from '@/utils/format';
	import { me, refreshMe } from '@/stores/session';

	const { $client } = useNuxtApp();

	const router = useRouter()
	const route = useRoute()

	const returnUrl = (route.query.return as string) || '/'

	const show_preview = ref(false)
	const max = ref<number>(500)
	const content = ref<string>('')
	const target = ref<"me" | "friends" | "followers" | "everyone">('everyone')
	const parent = ref<Post | null>(null)


	const privacyOptions = [
		{
			value: 'me',
			label: 'Moi seulement',
			disabled: false
		},
		{
			value: 'friends',
			label: 'Mes amis',
			disabled: false
		},
		{
			value: 'followers',
			label: 'Mes abonnés',
			disabled: false
		},
		{
			value: 'everyone',
			label: 'Tout le monde',
			disabled: true
		},
	]

	onMounted(async () => {
		document.title = "Écrire • Beam"

		await refreshMe(() => {
			router.push('/login?return=' + encodeURIComponent(window.location.pathname))
		});

		privacyOptions[3]!.disabled = isYoungerThan18(new Date(me.value?.profile.birthday || new Date()))

		if (route.params.id) {
		$client.getPost(route.params.id as string)
			.then(post => {
				})
		}

		max.value =
			(me.value?.profile.level || 0) >= 5 ? 2000
			: (me.value?.profile.level || 0) >= 4 ? 1000
			: 500
	})

	const patterns: MarkdownPattern[] = [
		{
			pattern: /@([a-zA-Z0-9_]+)/g,
			replace: (match, username) => `[@${username}](/@${username})`
		},
		{
			pattern: /\r\n/g,
			replace: () => '<br>'
		}
	]

	const submit = async () => {
		await $client.writePost(content.value, target.value, parent.value ? parent.value.id : undefined)
		router.push(returnUrl)
	}
</script>
<template>
	<main class="flex flex-col p-4 gap-4 sm:p-8">
		<h1 class="text-3xl text-center font-bold">Écrire un post</h1>
		<div class="block bg-background-surface text-text-surface text-left border-2 border-border-surface rounded-3xl w-full p-4 space-y-3">
			<div class="flex items-center gap-x-1">
				<PictureRing
					:src=me?.avatar!
					:size=12
					:thickness=1.2
					:primary="me?.profile.badge?.colors['stops']![0] || 'transparent'"
					:second="me?.profile.badge?.colors['stops']![1] || 'transparent'"
				/>
				<span class="font-medium">{{ me?.profile?.display_name || me?.profile?.name || '...' }} <ProfileBadge :badge="me?.profile.badge || null" class="inline w-4 h-4 ml-0.5 -translate-y-0.5" /> </span>
			</div>
			<!--div v-if="post.attachments.length" class="flex flex-wrap gap-0.5 rounded-2xl w-fit overflow-hidden">
				<img
					v-for="(file, index) in post.attachments"
					:src="file.path"
					:class="index == 0 && post.attachments.length % 2 == 1
					? 'w-full'
					: 'w-[calc(50%-0.0625rem)]'"
				/>
			</div-->
			<div v-if="show_preview" class="px-2 md-area">
				<p v-markdown="applyMarkdownPatterns(content, patterns)"></p>
			</div>
			<textarea
				v-else
				v-model="content"
				class="border-none rounded-xl outline-none w-full h-32 resize-none px-2"
				placeholder="Qu'allez-vous partager aujourd'hui ?"
				:minlength=1
				:maxlength=max
			></textarea>
			<PostWidget
				v-if=parent
				:data=parent
				:me=me
				:client=$client
				:clickable=false
			/>
			<div class="px-2">
				<span v-if="content.length <= max * 0.9" class="text-subtext text-sm">{{ max - content.length }} caractères restants</span>
				<span v-else class="text-danger text-sm">{{ max - content.length }} caractères restants</span>
			</div>
			<div class="flex items-center w-fit px-2 gap-4">
				<label for="target" class="text-sm font-medium">Qui peut voir mon post ?</label>
				<select id="target" name="target" v-model="target" class="block bg-background-surface text-sm border border-border-surface rounded-lg px-4 py-2" required>
					<option value="me">Seulement moi</option>
					<option value="friends">Mes amis</option>
					<option value="followers">Mes abonnés</option>
					<option value="everyone">Tout le monde</option>
				</select>
			</div>
			<div class="flex gap-2 justify-center items-center w-fit mx-auto">
				<button
					@click="submit"
					class="cursor-pointer block bg-primary text-white text-sm font-medium rounded-full px-5 py-3 duration-300 hover:bg-primary-darker"
				>Publier</button>
				<button v-if="show_preview" @click="() => show_preview = false" class="cursor-pointer block text-primary mx-3 text-sm font-medium duration-300 hover:underline">Retourner à l'écriture</button>
				<button v-else @click="() => show_preview = true" class="cursor-pointer block text-primary mx-3 text-sm font-medium duration-300 hover:underline">Voir le résultat</button>
			</div>
		</div>
	</main>
</template>
