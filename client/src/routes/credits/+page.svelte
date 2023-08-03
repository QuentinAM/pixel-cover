<script lang="ts">
    import { goto } from "$app/navigation";
    import { wssConnected } from "$lib/store";

    
</script>

<div class="absolute w-screen top-0 left-0 right-0 z-10 bg-base-100 flex p-2">
    <div class="flex-1">
		<a class="btn btn-ghost normal-case text-xl" href="/" on:click|preventDefault={() => {
			goto('/');
		}}>Pixel Cover</a>
    </div>
    <div class="flex-row flex items-center">
        {#if !$wssConnected}
            <p>Connecting to server...</p>
            <span class="loading loading-ring loading-lg"></span>
            <div class="divider divider-horizontal"></div>
        {/if}
        <button class="btn btn-square btn-ghost">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
        </button>
    </div>
</div>
<div class="flex min-h-screen justify-start bg-base-200">
    <div class="hero-content w-full max-w-full">

    </div>
</div>