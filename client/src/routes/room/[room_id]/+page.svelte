<script lang="ts">
	import { page } from '$app/stores';
    import { onMount } from 'svelte';
	import { room, success_msg, user } from '$lib/store';
    import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import type { Cover as CoverType, Room } from '$lib/websocket/types';
    import type { GuessMessage, JoinResponse, LeaveMessage, NextMessage, StartMessage } from '$lib/websocket/types';
    import Cover from '$lib/components/Cover.svelte';
	import LeaderBoard from '$lib/components/LeaderBoard.svelte';
	import Logs from '$lib/components/Logs.svelte';
	import Recap from '$lib/components/Recap.svelte';
    import { PixelateCovers } from '$lib/utils/pixelate';

	const room_id = $page.params.room_id;
	let is_host: boolean = false;
	let is_spec: boolean = false;
    let sendmessage: any;
	let loading: boolean = true;

	let show_guess_message: boolean = false;
	let show_guess_message_to: number | null = null;

    let title_input_selected: boolean = true;
    let title_input: any;
    let artist_input: any;
    let current_guess_title: string = '';
    let current_guess_artist: string = '';

	let time_left_to_answer_timeout: number | null = null;
	let timer: number | null = null;

	// Settings
	let covers_input: CoverType[] = [
        {
            link: 'https://i.scdn.co/image/ab67616d00001e02e5fb8425dfe7771f698113b7',
            title: 'NOVAE',
            artist: 'Yvnnis',
			first_to_found_id: '',
			others_to_found_id: []
        },
        {
            link: 'https://i.scdn.co/image/ab67616d00001e02550b4528f31fd28007a97ab9',
            title: 'LA COURSE',
            artist: 'NES',
			first_to_found_id: '',
			others_to_found_id: []
        }
    ];
	let setting_cover_link: string = '';
	let setting_cover_title: string = '';
	let setting_cover_artist: string = '';

	// Updated value
	$: player = $room?.players.find((player) => player.id == $user.id);
	$: game_ended = $room?.index == $room?.covers.length;
	$: if ($room) 
	{
		if (time_left_to_answer_timeout && !$room.first_guess)
		{
			clearTimeout(time_left_to_answer_timeout);
			timer = null;
			time_left_to_answer_timeout = null;
		}
		else if (!time_left_to_answer_timeout && $room.first_guess)
		{
			timer = $room.time_to_answer_after_first_guess - 1;
			console.log(timer);
			time_left_to_answer_timeout = setInterval(() => {
				if (timer)
				{
					timer--;
				}
			}, 1000);
		}
	}

	$: has_guessed = $room?.first_guess && ($room?.covers[$room.index].first_to_found_id == $user.id || $room?.covers[$room.index].others_to_found_id.includes($user.id));

	function LeaveRoom()
	{
		const message: LeaveMessage = {
			type: 'LEAVE',
			data:{
				room_id: room_id,
				player_id: $user.id
			}
		};
		sendmessage(message);

		const unsubscribe = room.subscribe((value) => {
			if (value == null)
			{
				unsubscribe();
				goto('/');
			}
		});
	}

	async function StartGame()
	{
		if (is_host && $room)
		{
			// Create pixelated covers
			const covers = await PixelateCovers(covers_input, $room.pixelate_factor);

			const message: StartMessage = {
				type: 'START',
				data:{
					room_id: room_id,
					user_id: $user.id,
					covers: covers,
					real_covers: covers_input,

					// Settings
					case_sensitive: $room.case_sensitive,
					allow_misspelling: $room.allow_misspelling,
					replace_special_chars: $room.replace_special_chars,
					time_to_answer_after_first_guess: $room.time_to_answer_after_first_guess,
					pixelate_factor: $room.pixelate_factor
				}
			};
			sendmessage(message);
		}
	}

	function NextRound()
	{
		if (is_host)
		{
			const message: NextMessage = {
				type: 'NEXT',
				data:{
					room_id: room_id,
					user_id: $user.id
				}
			};
			sendmessage(message);
		}
	}
	
	function AttemptGuess()
	{
		const message: GuessMessage = {
			type: 'GUESS',
			data:{
				room_id: room_id,
				user_id: $user.id,
				title_guess: current_guess_title,
				artist_guess: current_guess_artist
			}
		};

		if (show_guess_message_to !== null)
		{
			show_guess_message = false;
			clearTimeout(show_guess_message_to);
		}

		sendmessage(message);
	}

	success_msg.subscribe((value) => {
		console.log(`${value?.data.success} ${value?.data.first}`);

		show_guess_message = true;
		show_guess_message_to = setTimeout(() => {
			show_guess_message = false;
		}, 4000);
	});

	function onKeydown(event: KeyboardEvent)
    {
        if (event.key === 'Enter')
        {
            AttemptGuess();
        }

        // Select input
        // if (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
        // {
        //     title_input_selected = !title_input_selected;
        //     if (title_input_selected)
        //     {
        //         title_input.focus();
        //     }
        //     else
        //     {
        //         artist_input.focus();
        //     }
        // }
    }   

	// Settings
	function AddCover()
	{
		if (setting_cover_link == '' || setting_cover_title == '' || setting_cover_artist == '')
		{
			return;
		}
		covers_input = [...covers_input, 
			{
				link: setting_cover_link,
				title: setting_cover_title,
				artist: setting_cover_artist,
				first_to_found_id: '',
				others_to_found_id: []
			}
		];
		setting_cover_link = '';
		setting_cover_artist = '';
		setting_cover_title = '';
	}

	function TimeLeftToAnswer(r: Room | null)
	{
		if (r && r.first_guess)
		{
			const first_guess: Date= new Date(r.first_guess);
			const limit: Date = new Date(first_guess.getTime());
			const now: Date = new Date();
			const diff = limit.getTime() - now.getTime();
			console.log(diff);
			const res = Math.max(-1, Math.floor(diff / 1000));
			console.log(res);
			return res;
		}
		return -1;
	}

	function DeleteCover(link: string)
	{
		covers_input = covers_input.filter((cover) => cover.link != link);
	}

	onMount(async () => {
        let { SendMessage } = await import('$lib/websocket');
        sendmessage = SendMessage;

		if ($room == null)
		{
			if ($user == null)
			{
				goto('/');
				return;
			}

			const message: JoinResponse = {
				type: 'JOIN',
				data:{
					room_id: room_id,
					player_id: $user.id,
					player_name: $user.username
				}
			};
			sendmessage(message);

			const unsubscribe = room.subscribe((value) => {
				if (value != null)
				{
					unsubscribe();
					is_host = value.host_player_id == $user.id;
					is_spec = value.players.find((player) => player.id == $user.id) == null;
					loading = false;
				}
				else
				{
					goto('/');
				}
			});

			return;
		}
		else
		{
			is_host = $room.host_player_id == $user.id;
			is_spec = $room.players.find((player) => player.id == $user.id) == null;
			loading = false;
		}
	});
</script>

<svelte:window on:beforeunload={LeaveRoom} on:keydown={onKeydown}/>
{#if loading}
	<p>Loading...</p>
{:else}
	<div class="hero min-h-screen bg-base-200 relative">
		<div class="hero-content flex w-full">
			{#if $room}
				<div class="absolute bottom-2 right-2">
					<Logs/>
				</div>
				<!-- <div class="absolute top-5 right-5"> -->
					<!-- <span class="countdown font-mono text-6xl">
						<span style={`--value:${timer};`}></span>
					</span>
				</div> -->
				{#if !$room.playing}
					<div class="absolute left-2 rounded p-3 shadow shadow-black">
						{#each $room.players as player}
							<p transition:slide>{player.name}</p>
						{/each}
					</div>
					{#if is_host}
						<div class="shadow shadow-black p-3 bg-base-100 space-y-2 w-3/4">
							<h1 class="text-base font-semibold">Settings</h1>
							<div class="divider divider-vertical"></div>
							<div class="space-y-1 flex flex-row">
								<div class="w-1/2 space-y-2">
									<h1 class="text-base font-medium">Covers</h1>
									<div class="overflow-x-auto w-full shadow shadow-black rounded overflow-y-auto max-h-64">
										<table class="table w-full">
											<!-- head -->
											<thead>
												<tr>
												<th>Cover</th>
												<th>Title</th>
												<th>Artist</th>
												<th></th>
												</tr>
											</thead>
											<tbody>
												<!-- row 1 -->

												{#each covers_input as cover}
													<tr>
														<td>
															<div class="avatar">
															<div class="mask mask-squircle w-12 h-12">
																<img src={cover.link} alt="Avatar Tailwind CSS Component" />
															</div>
															</div>
														</td>
														<td>{cover.title}</td>
														<td>{cover.artist}</td>
														<th>
															<button on:click={() => DeleteCover(cover.link)} class="btn btn-error btn-xs">Delete</button>
														</th>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
									<div class="shadow shadow-black p-3 rounded space-y-2">
										<h1 class="text-base font-light">Add cover</h1>
										<div class="form-control w-full">
											<label class="label">
												<input class="hidden"/>
												<span class="label-text">Link</span>
											</label>
											<input bind:value={setting_cover_link} type="text" placeholder="..." class="input input-bordered w-full" />
										</div>
										<div class="flex flex-row w-full space-x-2">
											<div class="form-control w-1/2">
												<label class="label">
													<input class="hidden"/>
													<span class="label-text">Title</span>
												</label>
												<input bind:value={setting_cover_title} type="text" placeholder="..." class="input input-bordered w-full" />
											</div>
											<div class="form-control w-1/2">
												<label class="label">
													<input class="hidden"/>
													<span class="label-text">Artist</span>
												</label>
												<input bind:value={setting_cover_artist} type="text" placeholder="..." class="input input-bordered w-full" />
											</div>
										</div>
										<button class="btn btn-primary w-full" on:click={AddCover}>Add</button>
									</div>
								</div>
								<div class="divider divider-horizontal"></div>
								<div class="w-1/2 space-y-2">
									<h1 class="text-base font-medium">Global params</h1>
									<div class="form-control">
										<label class="label cursor-pointer">
											<span class="label-text">Case sensitive</span> 
											<input bind:checked={$room.case_sensitive} type="checkbox" class="toggle" />
										</label>
									</div>
									<div class="form-control">
										<label class="label cursor-pointer">
											<span class="label-text">Replace special chars</span> 
											<input bind:checked={$room.replace_special_chars} type="checkbox" class="toggle" />
										</label>
									</div>
									<div class="form-control w-full">
										<label class="label">
											<input class="hidden"/>
											<span class="label-text">Pixelate factor ({$room.pixelate_factor} px)</span>
										</label>
										<input bind:value={$room.pixelate_factor} type="range" min="2" max="100" class="range" step="1" />
									</div>
									<div class="form-control w-full">
										<label class="label">
											<input class="hidden"/>
											<span class="label-text">Time to guess after first</span>
										</label>
										<input bind:value={$room.time_to_answer_after_first_guess} type="number" min="0" max="60" class="input input-primary" />
									</div>
								</div>
							</div>
						</div>
						<div>
							<button class="btn btn-primary" on:click={StartGame}>Start Game</button>
							<button class="btn btn-primary" on:click={LeaveRoom}>Leave Room</button>
						</div>
					{:else}
						<button class="btn btn-primary" on:click={LeaveRoom}>Leave Room</button>
					{/if}
				{:else}
					<div class="absolute top-2 right-2">
						<LeaderBoard/>
					</div>
					<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
						<span class="countdown font-mono text-5xl">
						<span style={`--value:${player?.score};`}></span>
						</span>
						score
					</div>
					{#if timer != null && timer >= 0}
						<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
							<span class="countdown font-mono text-5xl">
								<span style={`--value:${timer};`}></span>
							</span>
							sec left
						</div>
					{/if}
					<div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
						<div class="card-body">
							<div class="flex flex-col space-y-2 w-80">
								{#if game_ended}
									<Recap/>
								{:else}
									{#if $room.currently_guessed && $room.covers[$room.index].title && $room.covers[$room.index].artist}
										<div class="flex flex-row space-x-2" transition:slide>
											<h2 class="text-2xl font-bold underline">{$room.covers[$room.index].title}</h2>
											<h3 class="text-2xl font-bold">by {$room.covers[$room.index].artist}</h3>
										</div>
									{/if}
									<div class="h-80 w-80">
										<Cover cover={$room.covers[$room.index]} />
									</div>
									{#if !$room.currently_guessed && !is_spec}
										<div class="w-full flex flex-row space-x-2">
											<div class="form-control w-1/2">
												<label class="label">
													<input class="hidden"/>
													<span class="label-text">Title</span>
												</label>
												<input disabled={has_guessed ? has_guessed : false} bind:this={title_input} bind:value={current_guess_title} type="text" placeholder="..." class="input input-bordered w-full" />
											</div>
											<div class="form-control w-1/2">
												<label class="label">
													<input class="hidden"/>
													<span class="label-text">Artist</span>
												</label>
												<input disabled={has_guessed ? has_guessed : false} bind:this={artist_input} bind:value={current_guess_artist} type="text" placeholder="..." class="input input-bordered w-full" />
											</div>
										</div>
									{/if}
									{#if $room.currently_guessed && is_host}
										<button class="btn btn-primary" on:click={NextRound}>Next Round</button>
									{/if}
								{/if}
							</div>
						</div>
						{#if show_guess_message}
							{#if $success_msg !== null}
								{#if !$success_msg.data.success}
									<div class="w-full bg-error rounded p-2" transition:slide>
										<p class="text-center text-white">Incorrect try again !</p>
									</div>
								{:else if $success_msg.data.first}
									<div class="w-full bg-success rounded p-2" transition:slide>
										<p class="text-center text-white">Correct ! You are the first to find it ! +2 points</p>
									</div>
								{:else}
									<div class="w-full bg-success rounded p-2" transition:slide>
										<p class="text-center text-white">Correct ! +1 point</p>
									</div>
								{/if}
							{/if}
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>		  
{/if}

