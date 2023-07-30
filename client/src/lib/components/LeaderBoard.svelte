<script lang="ts">
    import { onMount } from 'svelte';
    import { room, user } from '$lib/store';
    import { slide } from 'svelte/transition';
    import type { Player } from '$lib/websocket/types';

    const id = $user.id;
    $: sortedPlayers = $room?.players.sort((a, b) => b.score - a.score);
    $: position = sortedPlayers ? sortedPlayers.findIndex(player => player.id === id) + 1 : 0;

    function IsUs(given_id: string): boolean
    {
        return given_id === id;
    }

</script>

{#if $room}
    <div class="overflow-x-auto w-80">
        <table class="table w-full">
            <!-- head -->
            <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                <!-- row 1 -->
                {#if $room.players.length > 0 && sortedPlayers}
                    <tr transition:slide>
                        <th>1 👑</th>
                        <td class="truncate" class:text-yellow-400={IsUs(sortedPlayers[0].id)}>{sortedPlayers[0].name}</td>
                        <td>{sortedPlayers[0].score}</td>
                    </tr>
                {/if}
                <!-- row 2 -->
                {#if $room.players.length > 1 && sortedPlayers}
                    <tr transition:slide>
                        <th>2</th>
                        <td class="truncate" class:text-yellow-400={IsUs(sortedPlayers[1].id)}>{sortedPlayers[1].name}</td>
                        <td>{sortedPlayers[1].score}</td>
                    </tr>
                {/if}
                <!-- row 3 -->
                {#if $room.players.length > 2 && sortedPlayers}
                    <tr transition:slide> 
                        <th>2</th>
                        <td class="truncate" class:text-yellow-400={IsUs(sortedPlayers[2].id)}>{sortedPlayers[2].name}</td>
                        <td>{sortedPlayers[2].score}</td>
                    </tr>
                {/if}

                <!-- row ... -->
                {#if $room.players.length > 3 && position > 3 && sortedPlayers}
                    <tr transition:slide>
                        <th>{position}</th>
                        <td class="text-yellow-400">{$user.username}</td>
                        <td>{sortedPlayers[position].score}</td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
{/if}