import type { WebSocket } from "ws";

export type MessageType = 'CREATE' | 'UPDATE' | 'JOIN' | 'LEAVE' | 'ERROR';

export interface Message {
    type: MessageType;
    data: any;
}

export interface CreateMessage extends Message {
    type: 'CREATE';
    data: {
        host_id: string;
        host_name: string;
    }
}

export interface UpdateResponse extends Message {
    type: 'UPDATE';
    data: {
        room: Room;
    }
}

export interface JoinResponse extends Message {
    type: 'JOIN';
    data: {
        room_id: string;
        player_id: string;
        player_name: string;
    }
}

export interface ErrorResponse extends Message {
    type: 'ERROR';
    data: {
        message: string;
    }
}

export interface Player {
    id: string;
    name: string;
    score: number;
    ws: WebSocket;
}

export interface Cover {
    link: string;
    title: string;
    artist: string;
}

export interface Room {
    id: string;
    host_player_id: string;
    players: Player[];
    covers: Cover[];

    // Guess management
    index: number; // Index of the current cover
    timer?: NodeJS.Timeout;
    currently_guessed: boolean; // Has someone guessed the cover, only true during timer

    // Settings
    case_sensitive: boolean;
    allow_misspelling: number;
    replace_special_chars: boolean;
    time_to_answer_after_first_guess: number;
}