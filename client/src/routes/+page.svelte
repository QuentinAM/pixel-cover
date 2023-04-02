<script lang="ts">
    import { onMount } from 'svelte';
    import type { CreateMessage, JoinResponse } from '$lib/websocket/types';
    import { room, user } from '$lib/store';
    import { goto } from '$app/navigation';

    let sendmessage: any;
    
    const id = Math.random().toString(36).substr(3, 10);
    let username: string = '';

    let room_id_to_join: string = '';

    function CreateRoom()
    {
        const message: CreateMessage = {
            type: 'CREATE',
            data:{
                host_name: username,
                host_id: id
            }
        };
        sendmessage(message);
    }

    function JoinRoom()
    {
        const message: JoinResponse = {
            type: 'JOIN',
            data:{
                room_id: room_id_to_join,
                player_id: id,
                player_name: username
            }
        };
        sendmessage(message);
    }

    $: if ($room && $room.id) {
        goto(`/room/${$room.id}`);
    }

    onMount(async () => {
        let { SendMessage } = await import('$lib/websocket');
        sendmessage = SendMessage;
        user.set({ id, username });
    });
</script>

<button class="btn btn-primary" on:click={CreateRoom}>Create Room</button>
<input class="input input-primary" bind:value={username} placeholder="Enter your name" />
<input class="input input-primary" bind:value={room_id_to_join} placeholder="RoomID" />
<button class="btn btn-primary" on:click={JoinRoom}>Join Room</button>