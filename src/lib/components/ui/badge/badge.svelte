<script lang="ts">
	import { cn } from '$lib/utils';
	import { badgeVariants, type BadgeVariant } from './index';

	interface Props {
		variant?: BadgeVariant;
		class?: string;
		children: any;
	}

	let { variant = 'default', class: className = '', children }: Props = $props();
</script>

<div class={cn(badgeVariants({ variant }), className)}>
	{@render children()}
</div>
