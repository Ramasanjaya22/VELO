<script lang="ts">
	import { cn } from '$lib/utils';
	import { buttonVariants, type ButtonVariant, type ButtonSize } from './index';

	interface Props {
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: () => void;
		children: any;
	}

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		disabled = false,
		type = 'button',
		onclick,
		children
	}: Props = $props();
</script>

<button {type} {disabled} class={cn(buttonVariants({ variant, size }), className)} {onclick}>
	{@render children()}
</button>
