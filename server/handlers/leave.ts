import { WebSocket } from "ws";
import type { Room, Player, LeaveMessage, Log, UpdateResponse } from "../types";
import { rooms, wsStore } from "../index";
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

    console.log(`Player ${player_id} is leaving room ${room_id}`);
    
    // Remove player from room
    // room.players = room.players.filter(player => player.id !== player_id);
    player.connected = false;

    // If room all player are disconnected, delete it
    let all_disconnected = true;
    for (const p of room.players) {
        if (p.connected) {
            all_disconnected = false;
        }
    }
    if (all_disconnected) {
        console.log(`Room ${room_id} is empty, deleting it`);
        rooms.delete(room_id);
        wsStore.delete(room_id);
        return;
    }

    let wsList = wsStore.get(room_id);
    if (wsList) {
        // We don't send the information to the player
        wsList = wsList.filter(ws_ => ws_.id !== player_id);
        wsStore.set(room_id, wsList);
    }

    // Send null room to player to notify them that they left
    const leave_message: UpdateResponse = {
        type: 'UPDATE',
        data: {
            room: null
        }
    };
    ws.send(JSON.stringify(leave_message));

    const leave_log: Log = {
        message: `${player.name} left the room`,
        date: new Date().toLocaleString()
    };
    room.logs.push(leave_log);

    UpdateRoom(room_id, room);
}