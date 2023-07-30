<script lang="ts">
    import { room } from "$lib/store";
    import { slide } from "svelte/transition";
</script>

{#if $room}
<div class="flex flex-col">
    <div class="text-sm text-slate-300 mb-1 text-right">Logs</div>
    <div class="w-[26rem] h-56 overflow-y-auto bg-base-100 space-y-1 shadow shadow-black rounded p-1">
        {#each $room.logs as log}
            <div class="text-sm text-slate-300 flex flex-row w-full" transition:slide>
                <span class="text-left w-1/2">{log.date}</span>
                <span class="text-right w-1/2 truncate">{log.message}</span>
            </div>
        {/each}
    </div>
</div>
{/if}