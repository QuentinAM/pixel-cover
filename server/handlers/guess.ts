import { WebSocket } from "ws";
import type { Room, Player, CreateMessage, GuessMessage, Log } from "../types";
import { rooms } from "../index";
import { UpdateRoom } from "../update";

export function GuessCover(ws: WebSocket, data: GuessMessage) {
    const room_id = data.data.room_id;
    const player_id = data.data.user_id;

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

    if (data.data.artist_guess === undefined || data.data.title_guess === undefined) {
        const error = {
            type: 'ERROR',
            data: {
                message: `Artist or title guess is undefined`
            }
        };
        ws.send(JSON.stringify(error));
        return;
    }

    // Check if can still guess
    if (room.currently_guessed)
    {
        const error = {
            type: 'ERROR',
            data: {
                message: `Someone already guessed in room ${room_id}`
            }
        };
        ws.send(JSON.stringify(error));
        return;
    }

    // Check if guess is correct
   if (IsGuessCorrect(room, data.data.artist_guess, data.data.title_guess)) {
        console.log(`Player ${player_id} guessed correctly in room ${room_id}`);

        if (room.last_guess == null)
        {
            const guess_log: Log = {
                message: `${player.name} guessed correctly in first !`,
                date: new Date().toLocaleString()
            }
            room.logs.push(guess_log);

            room.covers[room.index].first_to_found_id = player_id;
            room.last_guess = new Date().toDateString();
            
            console.log(`Setting timeout for room ${room_id} to ${room.time_to_answer_after_first_guess} seconds`);
            setTimeout(() => {
                console.log(`Timeout for room ${room_id} has been reached`);
                if (!room) return;
                room.can_still_guess = false;

                // Switch back to normal cover
                console.log(`Putting back cover to normal as the timeout has been reached to reveal the anwser in room ${room_id}`);
                room.covers[room.index].link = room.real_covers[room.index].link;

                room.currently_guessed = true;
                UpdateRoom(room_id, room);
            }, room.time_to_answer_after_first_guess * 1000);

            room.players.find(player => player.id === player_id)!.score += 2;
            
            UpdateRoom(room_id, room);
            return;
        }

        // Check if player already guessed
        if (room.covers[room.index].others_to_found_id.includes(player_id) || room.covers[room.index].first_to_found_id === player_id) {
            const error = {
                type: 'ERROR',
                data: {
                    message: `Player ${player_id} already guessed in room ${room_id}`
                }
            };
            ws.send(JSON.stringify(error));
            return;
        }

        console.log(`Can still guess ${room.can_still_guess}`)
        if (!room.can_still_guess) {
            const error = {
                type: 'ERROR',
                data: {
                    message: `Too late to guess in room ${room_id}`
                }
            };
            ws.send(JSON.stringify(error));
            return;
        }

        const guess_log: Log = {
            message: `${player.name} guessed correctly`,
            date: new Date().toLocaleString()
        }
        room.logs.push(guess_log);
        room.covers[room.index].others_to_found_id.push(player_id);
        room.players.find(player => player.id === player_id)!.score += 1;
        UpdateRoom(room_id, room);
    }
}

function IsGuessCorrect(room: Room, artist_guess: string, title_guess: string)
{
    let artist_answer = room.covers[room.index].artist;
    let title_answer = room.covers[room.index].title;

    if (!room.case_sensitive)
    {
        artist_guess = artist_guess.toLowerCase();
        title_guess = title_guess.toLowerCase();

        artist_answer = artist_answer.toLowerCase();
        title_answer = title_answer.toLowerCase();
    }

    if (room.replace_special_chars)
    {
        // Only keep letters and numbers
        artist_guess = artist_guess.replace(/[^a-zA-Z0-9]/g, '');
        title_guess = title_guess.replace(/[^a-zA-Z0-9]/g, '');

        artist_answer = artist_answer.replace(/[^a-zA-Z0-9]/g, '');
        title_answer = title_answer.replace(/[^a-zA-Z0-9]/g, '');
    }

    // Check for levenstein distance
    return artist_guess === artist_answer && title_guess === title_answer;
}

function LevensteinDistance(a: string, b: string)
{
    return 0;
}