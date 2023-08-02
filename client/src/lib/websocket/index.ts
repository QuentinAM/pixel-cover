import { room, success_msg, wssConnected } from "$lib/store";
import type { Message, SuccessMessage } from "./types";

const url = 'ws://localhost:8080';
export let ws = new WebSocket(url);
export let connectionEstablished = false;

ws.onopen = () => {
    console.log('connection established');
    connectionEstablished = true;
    wssConnected.set(true);
}

ws.onmessage = (event) => {
    const data: Message = JSON.parse(event.data) as Message;
    console.log('received message: ', data);
    switch (data.type) {
        case 'UPDATE':
            room.set(data.data.room);
            break;
        case 'SUCCESS':
            success_msg.set(data as SuccessMessage);
            break;
        default:
            break;
    }
}

ws.onclose = () => {
    console.log('connection closed');
    connectionEstablished = false;
    wssConnected.set(false);
}

export function SendMessage(message: Message) {
    if (connectionEstablished)
    {
        console.log('sending message: ', message);
        ws.send(JSON.stringify(message));
    }
}