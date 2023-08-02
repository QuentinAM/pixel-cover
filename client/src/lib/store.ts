import { writable } from 'svelte/store';
import type { LocalUser } from '$lib/type';
import type { Room, SuccessMessage } from './websocket/types';

export const language = writable<string>('EN');
export const user = writable<LocalUser>();
export const room = writable<Room | null>();
export const success_msg = writable<SuccessMessage | null>(null);
export const wssConnected = writable<boolean>(false);