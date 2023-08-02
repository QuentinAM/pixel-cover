<script lang="ts">
    import { onMount } from 'svelte';
    import { room, user, wssConnected } from '$lib/store';
    import { goto } from '$app/navigation';
    import { concurrent } from 'svelte-typewriter';
    import { slide } from 'svelte/transition';
    import type { CoverType } from '$lib/type';
    import type { CreateMessage, JoinResponse } from '$lib/websocket/types';
    import Cover from '$lib/components/Cover.svelte';

    let sendmessage: any;
    let loading: boolean = true;
    
    let id: string;
    let username: string = '';
    let room_id_to_join: string = '';

    let username_error: boolean = false;
    let room_id_error: boolean = false;

    // Showcase
    let showcase_cover: CoverType = {
        link: 'https://i.scdn.co/image/ab67616d00001e02e5fb8425dfe7771f698113b7',
        title: 'NOVAE',
        artist: 'Yvnnis'
    };
    let showcase_cover_pixelate: boolean = true;
    let showcase_loading: boolean = false;
    let showcase_guessed: boolean = false;
    let showcase_second: boolean = false;

    function CreateRoom()
    {
        if (username === '') {
            username_error = true;
            room_id_error = false;
            return;
        }

        const message: CreateMessage = {
            type: 'CREATE',
            data:{
                host_name: username,
                host_id: id
            }
        };
        user.set({ id, username });
        localStorage.setItem('user', JSON.stringify({ id, username }));
        sendmessage(message);
    }

    function JoinRoom()
    {
        if (room_id_to_join == '') {
            room_id_error = true;
        }
        
        if (username === '') {
            username_error = true;
        }

        if (room_id_error || username_error) {
            return;
        }

        const message: JoinResponse = {
            type: 'JOIN',
            data:{
                room_id: room_id_to_join,
                player_id: id,
                player_name: username
            }
        };
        user.set({ id, username });
        localStorage.setItem('user', JSON.stringify({ id, username }));
        sendmessage(message);
    }

    $: if ($room && $room.id) {
        goto(`/room/${$room.id}`);
    }

    function StartShowcase() {
        setTimeout(() => {
            showcase_loading = true;
            setTimeout(() => {
                showcase_cover_pixelate = false;
                showcase_loading = false;
                showcase_guessed = true;

                if (!showcase_second) {
                    showcase_second = true;
                    setTimeout(() => {
                        showcase_guessed = false;
                        showcase_cover_pixelate = true;
                        showcase_cover = {
                            link: 'https://i.scdn.co/image/ab67616d00001e02550b4528f31fd28007a97ab9',
                            title: 'LA COURSE',
                            artist: 'NES',
                        };
                        StartShowcase();
                    }, 6000);
                }
            }, 500);
        }, 2000);
    }

    onMount(async () => {
        let { SendMessage } = await import('$lib/websocket');
        sendmessage = SendMessage;

        id = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : Math.random().toString(36).substr(7);
        user.set({ id, username });
        loading = false;
        localStorage.setItem('user', JSON.stringify({ id, username }));
        StartShowcase();
    });
</script>
<div class="navbar bg-base-100">
    <div class="flex-1">
    </div>
    <div class="flex-none">
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
        <div class="flex flex-col w-1/2">
            <div class="text-center lg:text-left">
                <h1 class="text-8xl font-bold">Pixel Cover</h1>
                <p class="py-6">Fight to prove you're the best at finding covers !</p>
            </div>
            <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                <div class="card-body">
                <div class="form-control">
                    <label class="label">
                    <span class="label-text">Username</span>
                    </label>
                    <input on:focus={() => {
                        username_error = false;
                    }} class="input input-primary" class:input-error={username_error} disabled={!$wssConnected} bind:value={username} placeholder="Enter your name" />
                </div>
                <div class="form-control">
                    <label class="label">
                    <span class="label-text">Room ID</span>
                    </label>
                    <input on:focus={() => {
                        room_id_error = false;
                    }} class="input input-primary" class:input-error={room_id_error} disabled={!$wssConnected} bind:value={room_id_to_join} placeholder="RoomID" />
                </div>
                <div class="form-control mt-6 flex flex-row w-full space-x-2">
                    <button class="btn btn-primary w-1/2" disabled={!$wssConnected} on:click={CreateRoom}>Create Room</button>
                    <button class="btn btn-primary w-1/2" disabled={!$wssConnected} on:click={JoinRoom}>Join Room</button>
                </div>
                </div>
            </div>
        </div>
        <div class="w-1/2">
            <div class="flex flex-col space-y-2 w-[21rem] items-center justify-center bg-base-100 p-2 shadow-2xl">
                <div class="h-80 w-80" transition:slide>
                    {#if !loading}
                        <Cover cover={showcase_cover} pixelate={showcase_cover_pixelate} pixelate_factor={40} showcase/>
                    {/if}
                </div>
                <div class="w-full flex flex-row space-x-2">
                    <div class="form-control w-1/2">
                        <label class="label">
                            <input class="hidden"/>
                            <span class="label-text">Title</span>
                        </label>
                        <div class="input input-bordered w-full flex justify-start items-center">
                            {showcase_cover.title}
                        </div>
                    </div>
                    <div class="form-control w-1/2">
                        <label class="label">
                            <input class="hidden"/>
                            <span class="label-text">Artist</span>
                        </label>
                        <div class="input input-bordered w-full flex justify-start items-center">
                            {showcase_cover.artist}
                        </div>
                    </div>
                </div>
                <div class:loading={showcase_loading} class:btn-success={showcase_guessed} class="btn w-full hover:cursor-default">
                    {#if !showcase_loading && !showcase_guessed}
                        Guess
                    {/if}
                    {#if showcase_guessed}
                        Correct !
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>