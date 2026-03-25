<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toasts } from '$lib/utils/toast';

	function getIcon(isSaved: boolean) {
		return isSaved ? 'bookmark' : 'bookmark_remove';
	}
</script>

{#if $toasts.length > 0}
	<div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
		{#each $toasts as toast (toast.id)}
			<div
				class="toast flex items-center gap-3 rounded-sm border border-metal-900 bg-accent-dim px-4 py-3 shadow-[4px_4px_0px_var(--metal-900)]"
				transition:fly={{ y: 16, duration: 150 }}
			>
				<span class="material-symbols-outlined text-xl text-metal-900">bookmark</span>
				<span class="text-sm font-medium text-metal-900">{toast.message}</span>
			</div>
		{/each}
	</div>
{/if}

<style>
	@keyframes toastPulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}

	.toast {
		animation: toastPulse 200ms ease-out;
	}
</style>
