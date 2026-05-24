<script setup lang="ts">
import { ChevronDoubleRightIcon } from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

const contentPath = computed(() => {
	const pathSegments = route.params.path;

	if (!pathSegments) {
		return "/";
	}

	const segments = Array.isArray(pathSegments)
		? pathSegments
		: [pathSegments];

	return `/${segments.join("/")}`;
});

const { data: page } = await useAsyncData(contentPath, () => {
	return queryCollection("content").path(contentPath.value).first();
});

const ariane: Record<string, string> = {
	blog: "Blog",
};

const slugSegments = computed(() => {
	const slug = route.params.path;

	if (!slug) return [];
	if (Array.isArray(slug)) {
		return slug;
	}

	return [slug];
});

const breadcrumbItems = computed(() => {
	return slugSegments.value.map((segment, index) => {
		const cleaned = decodeURIComponent(segment);
		const fallbackLabel = cleaned
			.split(/[-_]/g)
			.filter(Boolean)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return {
			path: `/${slugSegments.value.slice(0, index + 1).join("/")}`,
			label: ariane[cleaned] || fallbackLabel || cleaned,
			isCurrent: index === slugSegments.value.length - 1,
		};
	});
});
</script>
<template>
	<main>
		<header class="container px-4 md:px-8">
			<nav aria-label="Fil d'ariane">
				<ol class="flex flex-wrap items-center gap-2">
					<li>
						<Button
							label="Accueil"
							btnStyle="LINK"
							:handler="() => router.push('/')"
						/>
					</li>

					<template
						v-for="(item, index) in breadcrumbItems"
						:key="item.path"
					>
						<li class="text-subtext">
							<ChevronDoubleRightIcon class="h-4 w-4" />
						</li>
						<li>
							<Button
								v-if="!item.isCurrent"
								:label="item.label"
								btnStyle="LINK"
								:handler="() => router.push(item.path)"
							/>
							<span
								v-else
								aria-current="page"
								class="rounded-lg bg-primary/12 px-3 py-1.5 text-sm font-semibold text-primary"
							>
								{{ item.label }}
							</span>
						</li>
					</template>
				</ol>
			</nav>
		</header>
		<ContentRenderer
			class="container markdown px-4 md:px-8"
			v-if="page"
			:value="page"
		/>
		<div v-else class="container px-4 md:px-8">
			<p class="text-subtext">
				Contenu introuvable pour {{ contentPath }}.
			</p>
		</div>
	</main>
</template>
