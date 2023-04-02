<script lang="ts">
    import type { CoverType } from '$lib/type';
    import { onMount } from 'svelte';
    import { PixelateImage } from '$lib/utils/pixelate';

    export let cover: CoverType;
    export let pixelate: boolean = true;
    export let pixelate_factor: number;

    let image_uri: string = cover.link;
    let loading = true;
    let loaded_once = false;
    
    onMount(() => {
        if (pixelate)
        {
            PixelateImage(cover.link, pixelate_factor, (uri: string) => {
                image_uri = uri;
                loading = false;
            });
        }
        else
        {
            loading = false;
        }
        loaded_once = true;
    });

    $: if (!pixelate)
    {
        image_uri = cover.link;
        loading = false;
    }
    else if (loaded_once)
    {
        PixelateImage(cover.link, pixelate_factor, (uri: string) => {
            image_uri = uri;
            loading = false;
        });
    }

    $: image_uri = cover.link;

</script>

{#if !loading}
<img id="cover" src={image_uri} alt={cover.title} class="w-full h-full rounded shadow shadow-black" />
{/if}