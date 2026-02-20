import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const tables = [];
const users = [];

io.on("connection", (socket) => {
  console.log("Nuovo client:", socket.id);

  socket.on("new-user", ({name, tableId}) => {
    users.push = { name: name, id: tableId, socketId: socket.id };
    let table_players= tables.find(t => t.id === tableId).players;
    table_players= Number(table_players)+1;
    tables.find(t => t.id === tableId).players=table_players;
    io.to(tableId).emit("user-connected", {
      name:name,
      num:table_players
    });
  });

  socket.on("user-disconnected", ({name, tableId}) => {
    users=users.filter(u => u.socketId != socket.id);
    let table_players= tables.find(t => t.id === tableId).players;
    table_players= Number(table_players)-1;
    tables.find(t => t.id === tableId).players=table_players;


    io.to(tableId).emit("utente-disconnected", {
      name:name,
      num:table_players
    });
  
  });

  socket.on("ping-test", () => {
    console.log("PING ricevuto da", socket.id);
    socket.emit("pong-test");
  });

  socket.on("table-message", ({tableId, message}) => {
    const name = users[socket.id];
    io.to(tableId).emit("table-message", { name, message });
  });

  socket.on("createTable", ({ tableId, userName }) => {
      tables.push = { players: 0, id: tableId };

    socket.join(tableId);
    io.to(tableId).emit("table-created", tableId);
  });

  socket.on("joinTable", ({ tableId, userName }) => {
    if (!tables[tableId]) {
      socket.emit("errorMsg", "Tavolo inesistente");
      return;
    }

    tables[tableId].players.push({
      id: socket.id,
      name: userName
    });

    socket.join(tableId);
    io.to(tableId).emit("tableUpdate", tables[tableId]);
  });
});

// PORTA CORRETTA PER RENDER
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server avviato su porta", PORT);
});