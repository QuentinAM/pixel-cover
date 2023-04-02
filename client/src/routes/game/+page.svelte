<script lang="ts">
    import type { CoverType } from '$lib/type';
    import { onMount } from "svelte";
    import { user } from "$lib/store";
    import { goto } from "$app/navigation";
    import { slide } from 'svelte/transition';
    import Cover from "$lib/components/Cover.svelte";

    const to_guess: CoverType[] = [
        {
            link: 'https://i.scdn.co/image/ab67616d00001e02e5fb8425dfe7771f698113b7',
            title: 'NOVAE',
            artist: 'Yvnnis'
        },
        {
            link: 'https://i.scdn.co/image/ab67616d00001e02550b4528f31fd28007a97ab9',
            title: 'LA COURSE',
            artist: 'NES'
        }
    ];

    let displayed_index: number = 0;
    let displayed_cover: CoverType = to_guess[0];
    let current_image_pixelated: boolean = true;

    let time_between_guesses: number = 3;
    let title_input_selected: boolean = true;
    let title_input: any;
    let artist_input: any;
    let current_guess_title: string = '';
    let current_guess_artist: string = '';

    function AttemptGuess()
    {
        // Check for guess validity
        if (false)
        {
            alert('invalid guess');
            return;
        }

        // Display full cover and increment score
        displayed_index++;
        current_image_pixelated = false;

        // Check for game over
        if (displayed_index >= to_guess.length)
        {
            alert('gameover');
            return;
        }

        // Display next cover after 3 seconds
        setTimeout(() => {
            current_image_pixelated = true;
            displayed_cover = to_guess[displayed_index];
        }, time_between_guesses * 1000);
    }

    function onKeydown(event: KeyboardEvent)
    {
        if (event.key === 'Enter')
        {
            AttemptGuess();
        }

        // Select input
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
        {
            title_input_selected = !title_input_selected;
            if (title_input_selected)
            {
                title_input.focus();
            }
            else
            {
                artist_input.focus();
            }
        }
    }   

</script>

<svelte:window on:keydown={onKeydown} />

<div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex lg:flex-row-reverse">
        <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <span class="countdown font-mono text-5xl">
              <span style={`--value:${displayed_index};`}></span>
            </span>
            score
        </div>
        <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div class="card-body">
                <div class="flex flex-col space-y-2 w-80">
                    {#if !current_image_pixelated}
                        <div class="flex flex-row space-x-2" transition:slide>
                            <h2 class="text-2xl font-bold underline">{displayed_cover.title}</h2>
                            <h3 class="text-2xl font-bold">by {displayed_cover.artist}</h3>
                        </div>
                    {/if}
                    <div class="h-80 w-80">
                        <Cover cover={displayed_cover} pixelate={current_image_pixelated} />
                    </div>
                    <div class="w-full flex flex-row space-x-2">
                        <div class="form-control w-1/2">
                            <label class="label">
                                <input class="hidden"/>
                                <span class="label-text">Title</span>
                              </label>
                            <input bind:this={title_input} bind:value={current_guess_title} type="text" placeholder="..." class="input input-bordered w-full" />
                        </div>
                        <div class="form-control w-1/2">
                            <label class="label">
                                <input class="hidden"/>
                                <span class="label-text">Artist</span>
                              </label>
                            <input bind:this={artist_input} bind:value={current_guess_artist} type="text" placeholder="..." class="input input-bordered w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
  
  