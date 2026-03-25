export function parseMarkdown(text: string): string {
	if (!text) return '';

	let html = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')

		.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')

		.replace(/`([^`]+)`/g, '<code>$1</code>')

		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

		.replace(/\*([^*]+)\*/g, '<em>$1</em>')

		.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
		)

		.replace(/^### (.+)$/gm, '<h3>$1</h3>')
		.replace(/^## (.+)$/gm, '<h2>$1</h2>')
		.replace(/^# (.+)$/gm, '<h1>$1</h1>')

		.replace(/^- (.+)$/gm, '<li>$1</li>')
		.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

		.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')

		.replace(/\n{3,}/g, '\n\n')
		.trim();

	return html;
}

export function truncateMarkdown(
	text: string,
	maxLength: number = 500
): { content: string; truncated: boolean } {
	if (text.length <= maxLength) {
		return { content: text, truncated: false };
	}

	const truncated = text.slice(0, maxLength);
	const lastPeriod = truncated.lastIndexOf('.');
	const lastNewline = truncated.lastIndexOf('\n');
	const breakPoint =
		lastPeriod > maxLength * 0.7
			? lastPeriod + 1
			: lastNewline > maxLength * 0.7
				? lastNewline
				: maxLength;

	return {
		content: text.slice(0, breakPoint),
		truncated: true
	};
}
