import { WebSocketServer } from "ws";
import { CreateRoom } from "./handlers/create";
import { JoinRoom } from "./handlers/join";
import type { CreateMessage, JoinResponse, Message, Room } from "./types";

const wss = new WebSocketServer({ port: 8080 });
export const rooms = new Map<string, Room>();

wss.on('listening', () => {
  console.log('listening on port 8080');
});

wss.on('connection', (ws) => {
    console.log('connection established');
    ws.on('message', (message) => {

        const data = JSON.parse(message.toString()) as Message;
        console.log('message received: ', data);
        
        switch (data.type) {
            case 'CREATE':
                console.log('CREATE');
                CreateRoom(ws, data as CreateMessage);
                break;
            case 'UPDATE':
                console.log('UPDATE');
                break;
            case 'JOIN':
                console.log('JOIN');
                JoinRoom(ws, data as JoinResponse);
                break;
            case 'LEAVE':
                console.log('LEAVE');
                break;
            default:
                break;
        }
    });
});