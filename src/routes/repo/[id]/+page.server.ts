import { redirect } from '@sveltejs/kit';

export function load({ params }: { params: { id: string } }) {
	throw redirect(301, `/tool/${encodeURIComponent(params.id)}`);
}
