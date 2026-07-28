import { io, Socket } from "socket.io-client";
import { API_URL, getToken } from "./api";

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, { auth: { token: getToken() }, autoConnect: false });
  }
  if (!socket.connected) {
    socket.auth = { token: getToken() };
    socket.connect();
  }
  return socket;
}