import { WebSocket } from "ws";
import type { Player, JoinResponse, UpdateResponse, Log } from "../types";
import { rooms, wsStore } from "../index";
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

    // Check if player is in another room except ours
    for (const [room_id_, room_] of rooms) {
        if (room_id_ === room_id) continue;
        if (room_.players.find(player => player.id === data.data.player_id)) {
            const error = {
                type: 'ERROR',
                data: {
                    message: `Player ${data.data.player_id} is already in room ${room_id_}`
                }
            };
            ws_obj.send(JSON.stringify(error));
            return;
        }
    }

    // Check if player already in room with id
    let player = room.players.find(player => player.id === data.data.player_id);
    if (player) {
        player.connected = true; // Connect back
        
        // Send again information to the player
        const wsList = wsStore.get(room_id);
        if (wsList) {
            wsList.push({
                id: player.id,
                ws: ws_obj
            });
            wsStore.set(room_id, wsList);
        }

        const join_log: Log = {
            message: `${player.name} joined back the room`,
            date: new Date().toLocaleString()
        };
        room.logs.push(join_log);

        UpdateRoom(room_id, room);
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
        connected: true
    });

    console.log(`${data.data.player_id} joined room ${room_id}`);
    const wsList = wsStore.get(room_id);
    if (wsList) {
        wsList.push({
            id: data.data.player_id,
            ws: ws_obj
        });
        wsStore.set(room_id, wsList);
    }
    else{
        console.log(`Room ${room_id} does not exist in wsStore`);
        return;
    }

    const join_log: Log = {
        message: `${player_name} joined the room`,
        date: new Date().toLocaleString()
    }
    room.logs.push(join_log);

    UpdateRoom(room_id, room);
}