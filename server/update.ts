import { rooms, wsStore } from "./index";
import type { Room, UpdateResponse } from "./types";

export function UpdateRoom(room_id: string, room_data: Room) {
    // Update room
    rooms.set(room_id, room_data);

    const room_copy = JSON.parse(JSON.stringify(room_data));
    
    // Remove all title and artist from not guessed yet
    for (let i = room_copy.covers.length - 1; i >= room_copy.index; i--) {
        if (i == room_copy.index && room_copy.currently_guessed)
        {
            break;
        }
        room_copy.covers[i].title = '';
        room_copy.covers[i].artist = '';
    }

    const response: UpdateResponse = {
        type: 'UPDATE',
        data: {
            room: room_copy
        }
    }
    const raw_response = JSON.stringify(response);
    const wsList = wsStore.get(room_id);

    if (!wsList) {
        console.log(`Room ${room_id} does not exist in wsStore`);
        return;
    }

    // Send update to all players in the room
    console.log(`Updating room ${room_id} with ${room_copy.players}`);
    for (const w of wsList) {
        w.ws?.send(raw_response);
    }
}