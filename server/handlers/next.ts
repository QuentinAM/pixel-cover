import { WebSocket } from "ws";
import type { NextMessage } from "../types";
import { rooms } from "../index";
import { UpdateRoom } from "../update";

export function NextRound(ws: WebSocket, data: NextMessage) {
    const room_id = data.data.room_id;
    const player_id = data.data.user_id;

    console.log(`Player ${player_id} is trying to start the next round in room ${room_id}`);

    // Check if room exists
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

    // Check if player is in room
    let player = room.players.find(player => player.id === player_id);
    if (!player) {
        const error = {
            type: 'ERROR',
            data: {
                message: `Player ${player_id} is not in room ${room_id}`
            }
        };
        ws.send(JSON.stringify(error));
        return;
    }

    // Check if player is host
    if (player.id !== room.host_player_id) {
        const error = {
            type: 'ERROR',
            data: {
                message: `Player ${player_id} is not host of room ${room_id}`
            }
        };
        ws.send(JSON.stringify(error));
        return;
    }

    room.index += 1;
    room.currently_guessed = false;
    room.last_guess = '';
    UpdateRoom(room_id, room);
}