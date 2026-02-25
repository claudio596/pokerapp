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
   const ul= document.querySelector(".imp-ul");
   ul.querySelector(".cashEntry strong").textContent = data.cashEntry;
   ul.querySelector(".smallBlind strong").textContent = data.smallBlind;
   ul.querySelector(".fichesValue strong").textContent = data.fichesValue;
   ul.querySelector(".fichesNumber strong").textContent = data.fichesNumber;
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
  }
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