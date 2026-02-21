import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
 
const app = express();
app.use(cors());
app.use(express.static("public"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

let tables = [];
let users = [];

io.on("connection", (socket) => {
  console.log("Nuovo client:", socket.id);

socket.on("leave-table", ({ tableId, name }) => {
  const table = tables.find(t => t.id === tableId);
  if (!table) return;

  // Rimuovi l’utente dalla lista
  users = users.filter(u => u.socketId !== socket.id);

  // Decrementa i giocatori
  table.players--;

  // Se il tavolo è vuoto → eliminalo
  if (table.players <= 0) {
    tables = tables.filter(t => t.id !== tableId);
    console.log("Tavolo eliminato:", tableId);
  }

  // Notifica gli altri utenti
  io.to(tableId).emit("utente-disconnected", {
    name,
    num: table.players
  });

  // Fai uscire il socket dalla stanza
  socket.leave(tableId);
});

  socket.on("disconnect", () => {
    const user = users.find(u => u.socketId === socket.id);
    if (!user) return;

    const table = tables.find(t => t.id === user.id);
    if (!table) return;

    table.players--;
    if (table.players <= 0) {
      tables = tables.filter(t => t.id !== user.id);
    }

    io.to(user.id).emit("utente-disconnected", {
      name: user.name,
      num: table.players
    });

    users = users.filter(u => u.socketId !== socket.id);
  });


  socket.on("ping-test", () => {
    console.log("PING ricevuto da", socket.id);
    socket.emit("pong-test");
  });

  socket.on("table-message", ({tableId, message,name}) => {
    io.to(tableId).emit("table-message", { name, message });
  });

  socket.on("createTable", ({ tableId, userName }) => {
      tables.push({ players: 0, id: tableId });

    socket.join(tableId);
    io.to(tableId).emit("table-created", tableId);
  });

socket.on("joinTable", ({ tableId, userName, socketId }) => {
  const table = tables.find(t => t.id === tableId);
  if (!table) {
    io.to(socket.id).emit("table-not-found", tableId);
    return;
  }

  tables.find(t => t.id === tableId).players++;

  // lista utenti già presenti
  const userPast = users.filter(u => u.id === tableId).map(u => u.name);

  // notifica SOLO gli altri utenti
  io.to(tableId).emit("user-connected", {
    name: userName,
    num: tables.find(t => t.id === tableId).players
  });

  users.push({ name: userName, id: tableId, socketId: socketId });
  // invia la lista completa SOLO al nuovo utente
  io.to(socket.id).emit("player-list-complete", userPast);
  socket.join(tableId);
});

});

// PORTA CORRETTA PER RENDER
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server avviato su porta", PORT);
});