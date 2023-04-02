import { rooms } from "./index";
import type { Room, UpdateResponse } from "./types";

export function UpdateRoom(room_id: string, room_data: Room) {
    const response: UpdateResponse = {
        type: 'UPDATE',
        data: {
            room: room_data
        }
    }

    // Send update to all players in the room
    console.log(`Updating room ${room_id} with ${room_data.players}`);
    for (const player of room_data.players) {
        player.ws.send(JSON.stringify(response));
    }

    // Update room
    rooms.set(room_id, room_data);
}