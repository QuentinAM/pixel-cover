<script lang="ts">
    import type { CoverType } from '$lib/type';
    import { onMount } from 'svelte';

    export let cover: CoverType;

    let loading = true;

    onMount(() => {
        loading = false;
    })

</script>

{#if !loading}
    <img id="cover" src={cover.link} alt={cover.title} class="w-full h-full rounded shadow shadow-black" />
{/if}