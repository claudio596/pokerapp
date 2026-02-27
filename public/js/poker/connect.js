function setupConnect(){

    //connect
    socket.on("connect", () => {
  const li = document.createElement("li");
  li.textContent = "Connesso al server! ID: " + socket.id;
  document.querySelector(".connection-info").appendChild(li);
  socket.emit("ping-test");
    loadUser();
  const tableid = sessionStorage.getItem("table_id");
document.getElementById("tableid").textContent = tableid;
  console.log(socket.io.uri);
});



socket.on("connect_error", (err) => {
  console.error("Errore di connessione:", err.message);
  const li = document.createElement("li");
  li.textContent = "Errore di connessione: " + err.message;
  document.querySelector(".connection-info").appendChild(li);
});



socket.on('user-connected', data => {
    appendPlayerList(data.name);
  document.querySelector(".num-player .num").textContent = data.num;
  /* if (data.name === sessionStorage.getItem("user_name")) return; */
   appendMessage(`${data.name} joined`);
   playerTableIcon(data.name, data.tableId);
})

socket.on("table.full", ()=>{
  document.querySelector("connection-state").style.display="none";
  document.querySelector(".full-table").style.display="grid";

})


  

//disconnect
socket.on('utente-disconnected', data => {
    appendMessage(`${data.name} left`);
    const li = [...document.querySelectorAll(".player-list li")]
  .find(li => li.querySelector("p")?.textContent === data.name);

if (li) li.remove();
  document.querySelector(".num-player .num").textContent = data.num;

  if(data.num < 2){
     document.querySelector(".game-options .option").style.display="none";
            document.querySelector(".game-options .info").innerHTML=`
            <p>in attesa di altri giocatori <strong class="point">.</strong><strong class="point">.</strong><strong class="point">.</strong></p>
            `;
  }else{
      const attual_Num= document.querySelector(".pronti").textContent;
      const num= Number(attual_Num)-1;
      const div= document.querySelector(".pronti");
        div.textContent=`${num}`;
  }


  removeIconProfile(data.name,data.tableId);
})


socket.on("disconnect", (reason) => {
  console.log("Disconnesso:", reason);

  if (reason !== "io client disconnect") {
    showReconnectingOverlay(reason);
  }

});
//funzioni di test
socket.on("pong-test", () => {
  console.log("PONG dal server");
   const li = document.createElement("li");
  li.textContent = "PONG dal server";
  document.querySelector(".connection-info").appendChild(li);
});
}

let tableInfo={
  first:0,
  free:0,
  size:8
}
const tablePos=[
  {top:"30px", right:"-5px",pos:"t-r",next:1},{bottom:"30px", right:"-5px", pos:"b-r",next:2},
  {bottom:"-5px", right:"20px", pos:"b-r", next:3},{bottom:"-5px", right:"5px", pos:"b-r", next:4},
  {bottom:"-5px", left:"5px", pos:"b-l", next:5},{bottom:"-5px", left:"20px", pos:"b-l", next:6},
  {bottom:"30px", left:"-5px", pos:"b-l",next:7},{top:"30px", left:"-5px", pos:"t-l", next:8}
]


function playerTableIcon(name,tableId){
  const num_fiches= document.querySelector(".fichesNumber strong").textContent;
  const table= document.querySelector(".table");
  const div = document.createElement("div");
  div.id = name;
  div.dataset.itemid=tableInfo.free;
  if(name==sessionStorage.getItem("user_name")){
   div.innerHTML= `
      <p>You</p>
      <i class="fa-regular fa-circle-user fa-2xl" style="color: grey;"></i>
  `;
  div.classList.add("player-table-icon-self");
  }else{
    div.innerHTML= `
    <p>${name}</p>
    <i class="fa-regular fa-circle-user fa-2xl" style="color: grey;"></i>
    <p class="event">in attesa</p>
    <p class="cash">fiches: <strong>${num_fiches}</strong></p>
    <div class="time"><input type="range"><p><p></div>
  `;
  div.classList.add("player-table-icon");
  }
const style= tablePos[tableInfo.free];
switch(style.pos){
  case "t-r":
    div.style.top=style.top;
    div.style.right=style.right;
    break;
  case "b-r":
    div.style.bottom=style.bottom;
    div.style.right=style.right;
    break;
  case "b-l":
    div.style.bottom=style.bottom;
    div.style.left=style.left;
    break;
  case "t-l":
    div.style.top=style.top;
    div.style.left=style.left;
    break;
}
  if(tableInfo.free == tableInfo.size){
    socket.emit("table-full", tableId);
  }

  if(style.next== tableInfo.size){
    socket.emit("table-full", tableId);
  }else{
    tableInfo.free= style.next;
  }

  table.appendChild(div);
}

function removeIconProfile(name,tableId){
  const div = document.getElementById(name);
  div.remove();
  if(tableInfo.free == tableInfo.size){
    socket.emit("table-not-full", tableId);
  }
  style[div.dataset.itemid].next=tableInfo.free;
  tableInfo.free= div.dataset.itemid;

}