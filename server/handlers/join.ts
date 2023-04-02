import { WebSocket } from "ws";
import type { Player, JoinResponse } from "../types";
import { rooms } from "../index";
import { UpdateRoom } from "../update";

export function JoinRoom(ws: WebSocket, data: JoinResponse) {
    const room_id = data.data.room_id;

    // Check if room exists

    // Check if player already in room with id

    // Check if player with the same name already in room, if so add a number to the name

    const player: Player = {
        id: data.data.player_id,
        name: data.data.player_name,
        score: 0,
        ws: ws
    }

    let room = rooms.get(room_id);

    if (!room) {
        const error = {
            type: 'ERROR',
            data: {
                message: `Room ${room_id} does not exist`
            }
        };
        ws.send(JSON.stringify(error));
        return;
    }

    room.players = [...room.players, player];

    console.log(`${player.id} joined room ${room_id}`);
    
    UpdateRoom(room_id, room);
}