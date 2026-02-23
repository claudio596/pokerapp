import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

let socket = null;

export function initSocket() {
  socket = io("https://pokerapp-k2qf.onrender.com");
  return socket;
}

export function getSocket() {
  return socket;
}
