import { WebSocket } from "ws";
import type { Room, Player,  EndMessage, Log } from "../types";
import { rooms } from "../index";
import { UpdateRoom } from "../update";

export async function EndRound(ws: WebSocket, data: EndMessage) {
    
    // Check if room exists
    const room_id = data.data.room_id;
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

    // Check if user is in room and is the host
    const player_id = data.data.user_id;
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
    if (player.id !== room.host_player_id) {
        const error = {
            type: 'ERROR',
            data: {
                message: `Player ${player_id} is not the host of room ${room_id}`
            }
        };
        ws.send(JSON.stringify(error));
        return;
    }

    // Update params
    console.log(`Round manually ended ${room_id}`);
    if (!room) return;
    room.can_still_guess = false;

    // Switch back to normal cover
    room.covers[room.index].link = room.real_covers[room.index].link;
    room.currently_guessed = true;
    
    // Log
    const log: Log = {
        message: `${player.name} ended the round`,
        date: new Date().toLocaleString()
    }
    room.logs.push(log);

    // Update
    rooms.set(room_id, room);
    UpdateRoom(room_id, room);
}