import express from "express";
import http from "http";
import { Server } from "socket.io";
const app = express();
const server = http.createServer(app);
app.use(express.static("public"));


const io = new Server(server, {
  cors: { origin: "*" }
});

const tables = {};
const users = {};

io.on("connection", (socket) => {
  console.log("Nuovo client:", socket.id);

  socket.on("new-user", ({name, tableId}) => {
    users[socket.id] = name;
    io.to(tableId).emit("user-connected", {
      name: name,
     player: tables[tableId]?.players?.length || 0
     });
  })

  socket.on("user-disconnected", ({name, tableId}) => {
    io.to(tableId).emit("utente-disconnected", name);
    delete users[socket.id];

    // Rimuovi dai tavoli
    for (const [tableId, table] of Object.entries(tables)) {
      table.players = table.players.filter(p => p.id !== socket.id);
      io.to(tableId).emit("tableUpdate", table);
    }
  });


  socket.on("ping-test", () => {
  console.log("PING ricevuto da", socket.id);
  socket.emit("pong-test");
});

//chat per tavolo
socket.on("table-message", ({tableId, message}) => {
  const name = users[socket.id];
  console.log(name, message);
  io.to(tableId).emit("table-message", {
    name, 
    message
  });
})


  // CREAZIONE TAVOLO
  socket.on("createTable", ({ tableId, userName }) => {
    console.log("createTable ricevuto:", tableId, userName);
    if (!tables[tableId]) {
      tables[tableId] = { players: [] };
    }

    tables[tableId].players.push({
      id: socket.id,
      name: userName
    });

    socket.join(tableId);

    
      io.to(tableId).emit("table-created", tableId);

  });

  // JOIN TAVOLO
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

    console.log("joinTable ricevuto:", tableId, userName);

  });
});

