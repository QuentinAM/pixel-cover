import type { WebSocket } from "ws";

export type MessageType = 'CREATE' | 'UPDATE' | 'JOIN' | 'LEAVE' | 'ERROR' | 'START' | 'GUESS';

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

export interface LeaveMessage extends Message {
    type: 'LEAVE';
    data: {
        room_id: string;
        player_id: string;
    }
}

export interface StartMessage extends Message {
    type: 'START';
    data: {
        room_id: string;
        user_id: string;
    }
}

export interface GuessMessage extends Message {
    type: 'GUESS';
    data: {
        room_id: string;
        user_id: string;
        artist_guess: string;
        title_guess: string;
    }
}

export interface Player {
    id: string;
    name: string;
    score: number;
    ws: WebSocket | null;
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
    playing: boolean;

    // Guess management
    index: number; // Index of the current cover
    timer: NodeJS.Timeout | null;
    currently_guessed: boolean; // Has someone guessed the cover, only true during timer

    // Settings
    case_sensitive: boolean;
    allow_misspelling: number;
    replace_special_chars: boolean;
    time_to_answer_after_first_guess: number;
}