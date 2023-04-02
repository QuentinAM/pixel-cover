import { WebSocket } from "ws";
import type { Room, Player, CreateMessage, StartMessage } from "../types";
import { rooms } from "../index";
import { UpdateRoom } from "../update";

export function StartRoom(ws: WebSocket, data: StartMessage) {
    
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

    // Start the game
    room.playing = true;

    // Fill covers
    room.covers = [
        {
            link: 'https://i.scdn.co/image/ab67616d00001e02e5fb8425dfe7771f698113b7',
            title: 'NOVAE',
            artist: 'Yvnnis'
        },
        {
            link: 'https://i.scdn.co/image/ab67616d00001e02550b4528f31fd28007a97ab9',
            title: 'LA COURSE',
            artist: 'NES'
        }
    ];
    rooms.set(room_id, room);

    UpdateRoom(room_id, room);
}