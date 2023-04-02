import { rooms } from "./index";
import type { Room, UpdateResponse } from "./types";

export function UpdateRoom(room_id: string, room_data: Room) {
    const room_copy = { ...room_data };
    
    // Remove all title and artist from not guessed yet
    for (let i = room_data.covers.length - 1; i >= room_data.index; i--) {
        room_data.covers[i].title = '';
        room_data.covers[i].artist = '';
    }

    const response: UpdateResponse = {
        type: 'UPDATE',
        data: {
            room: room_data
        }
    }
    const raw_response = JSON.stringify(response);

    // Send update to all players in the room
    console.log(`Updating room ${room_id} with ${room_data.players}`);
    for (const player of room_data.players) {
        if (!player.ws) {
            console.log(`Player ${player.id} does not have a websocket`);
            continue;
        }
        player.ws.send(raw_response);
    }

    // Update room
    rooms.set(room_id, room_copy);
}