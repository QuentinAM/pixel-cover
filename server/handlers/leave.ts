import { WebSocket } from "ws";
import type { Room, Player, LeaveMessage } from "../types";
import { rooms } from "../index";
import { UpdateRoom } from "../update";

export function LeaveRoom(ws: WebSocket, data: LeaveMessage) {
    const room_id = data.data.room_id;
    const player_id = data.data.player_id;

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

    // Remove player from room
    room.players = room.players.filter(player => player.id !== player_id);
    
    // If room is empty, delete it
    if (room.players.length === 0) {
        rooms.delete(room_id);
        return;
    }

    UpdateRoom(room_id, room);
}