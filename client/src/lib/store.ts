import { writable } from 'svelte/store';
import type { LocalUser } from '$lib/type';
import type { Room } from './websocket/types';

export const language = writable<string>('FR');
export const user = writable<LocalUser>();
export const room = writable<Room | null>();