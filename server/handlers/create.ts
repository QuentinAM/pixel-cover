import { WebSocket } from "ws";
import type { Room, Player, CreateMessage } from "../types";
import { rooms } from "../index";
import { UpdateRoom } from "../update";

export function CreateRoom(ws: WebSocket, data: CreateMessage) {
    const room_id = Math.random().toString(36).substr(2, 9);

    const host: Player = {
        id: data.data.host_id,
        name: data.data.host_name,
        score: 0,
        ws: ws
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
        replace_special_chars: false,
        time_to_answer_after_first_guess: 0
    };
    
    console.log(`${host.id} created room ${room_id}`);
    UpdateRoom(room_id, room);
}