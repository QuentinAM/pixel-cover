export interface LocalUser {
    email: string;
    id: number;
    created: string;
    lives: number;
}

export interface CoverType {
    link: string;
    title: string;
    artist: string;
}

export interface GameParams {
    case_sensitive: boolean;
    allow_misspelling: number;
    replace_special_chars: boolean; 
}