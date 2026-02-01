export interface MarkdownPattern {
	pattern: RegExp
	replace: (match: string, ...groups: string[]) => string
}

export function applyMarkdownPatterns(input: string, patterns: MarkdownPattern[]): string {
	let output = input

	for (const { pattern, replace } of patterns) {
		output = output.replace(pattern, (...args) => {
			return replace(...args)
		})
	}

	return output
}

export const toLiteralNumber = (n: number): string => {
    if (n < 1000) return n.toString();

    const units = ["", "k", "M", "B"];
    const index = Math.floor(Math.log10(n) / 3);

    const value = n / Math.pow(1000, index);

    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

    return formatted + units[index];
};
