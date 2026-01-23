import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const URL = 'https://labour-ai.onrender.com';

export const socketService = {
    connect: (token?: string) => {
        if (socket) return socket;

        socket = io(URL, {
            auth: { token },
            autoConnect: false,
        });

        socket.connect();
        return socket;
    },

    disconnect: () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    },

    getSocket: () => socket,
};
