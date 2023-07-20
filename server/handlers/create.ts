import { WebSocket } from "ws";
import type { Room, Player, CreateMessage, WebSocketPlayer, Log } from "../types";
import { rooms, wsStore } from "../index";
import { UpdateRoom } from "../update";

export function CreateRoom(ws_: WebSocket, data: CreateMessage) {
    const room_id = Math.random().toString(36).substr(2, 9);

    const host: Player = {
        id: data.data.host_id,
        name: data.data.host_name,
        score: 0
    }

    const room: Room = {
        id: room_id,
        host_player_id: host.id,
        players: [host],
        covers: [],
        index: 0,
        currently_guessed: false,
        case_sensitive: false,
        allow_misspelling: 0,
        playing: false,
        first_guess: null,
        replace_special_chars: true,
        spectators: [],
        time_to_answer_after_first_guess: 3,
        pixelate_factor: 40,
        logs: [],
        real_covers: [],
        can_still_guess: false
    };
    const ws_obj: WebSocketPlayer = {
        ws: ws_,
        id: host.id
    }
    const create_log: Log = {
        message: `${host.name} created the room`,
        date: new Date().toLocaleString()
    }
    room.logs.push(create_log);

    wsStore.set(room_id, [ws_obj]);
    
    console.log(`${host.id} created room ${room_id}`);
    UpdateRoom(room_id, room);
}