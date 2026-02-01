import type { Directive } from 'vue';
import { renderMMarkdown } from 'mmi-md';
import DOMPurify from 'dompurify';

interface MarkdownBinding {
	value: string;
}

function renderMarkdownOnly(src: string): string {
	if (typeof window === 'undefined') return '';

	const parsed = renderMMarkdown(src ?? '');
	return DOMPurify.sanitize(parsed);
}

const vMarkdown: Directive<HTMLElement, string> = {
	mounted(el, binding: MarkdownBinding) {
		if (binding.value) {
			el.innerHTML = renderMarkdownOnly(binding.value);
		} else {
			el.innerHTML = '';
		}
	},

	updated(el, binding: MarkdownBinding) {
		if (binding.value) {
			el.innerHTML = renderMarkdownOnly(binding.value);
		} else {
			el.innerHTML = '';
		}
	}
};

export default vMarkdown;
