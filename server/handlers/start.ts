import { WebSocket } from "ws";
import type { Room, Player, CreateMessage, StartMessage, Log } from "../types";
import { rooms } from "../index";
import { UpdateRoom } from "../update";

export async function StartRoom(ws: WebSocket, data: StartMessage) {
    
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

    // Check if there is at least one cover
    if (data.data.covers.length === 0) {
        const error = {
            type: 'ERROR',
            data: {
                message: `There is no cover in room ${room_id}`
            }
        };
        ws.send(JSON.stringify(error));
        return;
    }

    // Update params
    room.case_sensitive = data.data.case_sensitive;
    room.allow_misspelling = data.data.allow_misspelling;
    room.replace_special_chars = data.data.replace_special_chars;
    room.time_to_answer_after_first_guess = data.data.time_to_answer_after_first_guess;

    // Start the game
    room.playing = true;

    const start_log: Log = {
        message: `${player.name} started the game`,
        date: new Date().toLocaleString()
    }
    room.logs.push(start_log);

    // Fill pixelated covers 
    let covers = data.data.covers;
    room.real_covers = data.data.real_covers;
    room.covers = data.data.covers;

    room.can_still_guess = true;
    
    rooms.set(room_id, room);
    UpdateRoom(room_id, room);
}