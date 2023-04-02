<script lang="ts">
	import { page } from '$app/stores';
    import { onMount } from 'svelte';
	import { room } from '$lib/store';
    import { goto } from '$app/navigation';

	function LeaveRoom()
	{
		
	}

	onMount(() => {
		if ($room == null)
		{
			goto('/');
			return;
		}
	});

</script>

<svelte:window on:beforeunload={LeaveRoom} />
<h1>{$page.params.room_id}</h1>

