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
let tables_inGame=[];
 let open_start = false;
 let init_game=false;
 let card=["1F","2F","3F","4F","5F","6F","7F",
  "8F","9F","10F","JF","QF","KF"

 ];

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

    const a= table.players > 1 ? 0 : -1;
    if(a == -1){
      open_start = false;
    }

      io.to(user.id).emit("utente-disconnected", {
      name: user.name,
      num: table.players,
      tableId: user.id
    });
    

    if (table.players <= 0) {
      tables = tables.filter(t => t.id !== user.id);
    }

    users = users.filter(u => u.socketId !== socket.id);
  });


  socket.on("ping-test", () => {
    console.log("PING ricevuto da", socket.id);
    socket.emit("pong-test");
  });

  socket.on("table-message", ({tableId, message,name}) => {
    io.to(tableId).emit("table-message", { name, message });
  });

  socket.on("createTable", ({ 
    tableId,smallBlind,numFiches,valFiches,cashEntry }) => {

      tables.push({ players: 0, id: tableId, 
        smallBlind: smallBlind, numFiches: numFiches, 
        valFiches: valFiches, cashEntry: cashEntry,
        full:false
      });

    socket.join(tableId);
    socket.emit("table-created", tableId);
  });

socket.on("joinTable", ({ tableId, userName, user_uid }) => {
  const table = tables.find(t => t.id === tableId);
  if(table.full==true){
    socket.emit("table-full", tableId);
    return;
  }
  if (!table) {
    socket.emit("table-not-found", tableId);
    return;
  }

  const user = users.find(u => u.user_Id === user_uid);

  if(!user){
    //nuovo utente
    users.push({
    name: userName,
    id: tableId,
    socketId: socket.id,
    user_uid
  });
  }else{
    user.socketId = socket.id;
  }

  table.players = users.filter(u => u.id === tableId).length;
  const num_player = table.players;

  // Notifica agli altri
  socket.to(tableId).emit("user-connected", {
    name: userName,
    num: num_player,
    tableId: tableId
  });

  // Lista utenti già presenti
  const userPast = users
    .filter(u => u.id === tableId)
    .map(u => u.name);

  // Invia SOLO al nuovo utente
  socket.emit("player-list-complete", {
    userPast: userPast,
    num: num_player,
    tableId: tableId,
    name: userName,
    cashEntry: table.cashEntry,
    smallBlind: table.smallBlind,
    numFiches: table.numFiches,
    valFiches: table.valFiches
  });

  socket.join(tableId);

  if(num_player >1 && open_start==false){//deve stare sotto socket.join
    io.to(tableId).emit("table-update", num_player);
    open_start = true;
  }

});
socket.on("table-full", tableId =>{
  tables.find(t => t.id === tableId).full = true;
})
socket.on("table-not-full", tableId =>{
  tables.find(t => t.id === tableId).full = false;
})


socket.on("check-table", (tableId, callback) => {
  const exists = tables.some(t => t.id === tableId);
  callback(exists);
});

//game events

socket.on("player-pronti", ({num,tableId,name}) => {
  num = Number(num) +1;
  io.to(tableId).emit("player-pronti", num);
  socket.to(tableId).emit("player-pronti-visual", name);
});

socket.on("remove-player-pronti", ({num,tableId,name}) => {
  num = Number(num) -1;
  io.to(tableId).emit("player-pronti", num);
  socket.to(tableId).emit("remove-player-pronti-visual",name);
})

socket.on("game-message", ({message,tableId}) =>{
  if(message == "start" && init_game==false){
    init_game=true;
    const player= users.filter(u => u.id === tableId).map(u => u.name);
    const num_player= player.length;
    tables_inGame.push({player:player, tableId:tableId,
      num:num_player,first:0});
  }
  io.to(tableId).emit("game-message", message);
})

socket.on("give-initial-card", tableId =>{
  const table= tables_inGame.find(t => t.tableId === tableId);
  let k;let i;
  //suhffle card
  const deck = shuffle(card);
for( k=1; k<=2; k++){
    for( i=0; i<table.player; i++){
      const player = table.player[i];
      const id_player= users.find(u => u.name === player).socketId;
      const card = deck[0];
      socket.to(id_player).emit("give-initial-card", {
        card:card,
        num_card: k
      });
       deck.remove(card);
  }
}
io.to(tableId).emit("give-scarto");

})

});

// PORTA CORRETTA PER RENDER
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server avviato su porta", PORT);
});

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // swap
  }
  return array;
}
