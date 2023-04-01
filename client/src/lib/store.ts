import { writable } from 'svelte/store';
import type { LocalUser, GameParams } from '$lib/type';

export const language = writable<string>('FR');
export const user = writable<LocalUser>();
export const gameParams = writable<GameParams>();