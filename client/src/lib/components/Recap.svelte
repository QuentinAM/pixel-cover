<script lang="ts">
    import { room, user } from "$lib/store";
    import type { Player } from "$lib/websocket/types";
    import Cover from "./Cover.svelte";

    function GetPlayerById(id: string): Player
    {
        const res: Player | undefined = $room?.players.find((player: Player) => player.id === id);
        if (res === undefined)
        {
            throw new Error("Player not found");
        }
        return res
    }

    function IsUs(id: string): boolean
    {
        return id === $user?.id;
    }

</script>

{#if $room}
    <div class="max-h-[30rem] overflow-y-auto space-y-1">
        <p class="text-xl font-semibold">Recap</p>
        {#each $room.covers as cover, i}
            <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                <input type="checkbox" />
                <div class="collapse-title text-xl font-medium">
                    {i + 1}/{$room.covers.length} - {cover.title} by {cover.artist}
                </div>
                <div class="collapse-content">
                    <div class="flex flex-row space-x-2">
                        <div class="w-1/2">
                            <Cover {cover}/>
                        </div>
                        <div class="w-1/2 flex flex-col space-y-1 h-full overflow-y-auto">
                            <p class:text-yellow-400={IsUs(cover.first_to_found_id)} class="text-lg truncate">{GetPlayerById(cover.first_to_found_id).name} - +2</p>
                            {#each cover.others_to_found_id as id, j}
                                <p class:text-yellow-400={IsUs(id)} class="text-base truncate">{GetPlayerById(id).name} - +1</p>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}