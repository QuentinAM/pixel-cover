import { WebSocket, WebSocketServer } from "ws";
import { CreateRoom } from "./handlers/create";
import { GuessCover } from "./handlers/guess";
import { JoinRoom } from "./handlers/join";
import { LeaveRoom } from "./handlers/leave";
import { NextRound } from "./handlers/next";
import { StartRoom } from "./handlers/start";
import type { CreateMessage, GuessMessage, JoinResponse, LeaveMessage, Message, NextMessage, Room, StartMessage, WebSocketPlayer } from "./types";

const wss = new WebSocketServer({ port: 8080 });
export const rooms = new Map<string, Room>();
export const wsStore = new Map<string, WebSocketPlayer[]>();

wss.on('listening', () => {
  console.log('listening on port 8080');
});

wss.on('connection', function connection(ws) {
    ws.on('message', function message(message) {
        const data = JSON.parse(message.toString()) as Message;
        switch (data.type) {
            case 'CREATE':
                CreateRoom(ws, data as CreateMessage);
                break;
            case 'UPDATE':
                break;
            case 'JOIN':
                JoinRoom(ws, data as JoinResponse);
                break;
            case 'LEAVE':
                LeaveRoom(ws, data as LeaveMessage);
                break;
            case 'START':
                StartRoom(ws, data as StartMessage);
                break;
            case 'GUESS':
                GuessCover(ws, data as GuessMessage);
                break;
            case 'NEXT':
                NextRound(ws, data as NextMessage);
                break;
            default:
                break;
        }
    });
});