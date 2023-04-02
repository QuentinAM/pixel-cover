import { WebSocket } from "ws";
import type { Player, JoinResponse, UpdateResponse } from "../types";
import { rooms } from "../index";
import { UpdateRoom } from "../update";

export function JoinRoom(ws_obj: WebSocket, data: JoinResponse) {
    const room_id = data.data.room_id;

    // Check if room exists
    let room = rooms.get(room_id);
    if (!room) {
        const error = {
            type: 'ERROR',
            data: {
                message: `Room ${room_id} does not exist`
            }
        };
        ws_obj.send(JSON.stringify(error));
        return;
    }

    // Check if player is in another room
    for (const [room_id, room] of rooms) {
        if (room.players.find(player => player.id === data.data.player_id)) {
            const error = {
                type: 'ERROR',
                data: {
                    message: `Player ${data.data.player_id} is already in room ${room_id}`
                }
            };
            ws_obj.send(JSON.stringify(error));
            return;
        }
    }

    // Check if player already in room with id
    if (room.players.find(player => player.id === data.data.player_id)) {
        
        // Don't send an error just connect the player to the room
        const response: UpdateResponse = {
            type: 'UPDATE',
            data: {
                room: room
            }
        }
        ws_obj.send(JSON.stringify(response));
        return;
    }

    // Check if player with the same name already in room, if so add a number to the name
    let player_name = data.data.player_name;
    let player_name_count = 1;
    while (room.players.find(player => player.name === player_name)) {
        player_name = `${data.data.player_name} (${player_name_count})`;
        player_name_count++;
    }

    room.players.push({
        id: data.data.player_id,
        name: player_name,
        score: 0,
        ws: ws_obj
    });

    console.log(`${data.data.player_id} joined room ${room_id}`);
    
    UpdateRoom(room_id, room);
}