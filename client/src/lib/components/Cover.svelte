<script lang="ts">
    import type { CoverType } from '$lib/type';
    import { PixelateImage } from '$lib/utils/pixelate';
    import { onMount } from 'svelte';

    export let cover: CoverType;
    export let pixelate: boolean = false;
    export let pixelate_factor: number | null = null;
    export let showcase: boolean = false;
    
    let loading = true;
    let uri: string = '';

    function Depixelate(factor: number) {
        if (factor == 0) {
            return;
        }
        PixelateImage(cover.link, factor, ((url: string) => {
            uri = url;
            setTimeout(() => {
                Depixelate(factor - 1);
            }, 100);
        }));
    }

    $: if (!pixelate) {
        if (showcase) {
            Depixelate((pixelate_factor ?? 40) - 5);
        }
        else {
            uri = cover.link;
        }
    } 
    else {
        PixelateImage(cover.link, pixelate_factor ?? 40, ((url: string) => {
            uri = url;
        }));
    }

    onMount(() => {
        if (pixelate){
            PixelateImage(cover.link, pixelate_factor ?? 40, ((url: string) => {
                uri = url;
                loading = false;
            }));
        }
        else {
            uri = cover.link;
            loading = false;
        }
    })

</script>

{#if !loading}
    <img id="cover" src={uri} alt={cover.title} class="w-full h-full rounded shadow shadow-black" />
{/if}