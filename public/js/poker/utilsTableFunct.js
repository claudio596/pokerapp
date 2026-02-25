function utilsTableFunct() {
    socket.on("table-not-found", Id =>{
  const li = document.createElement("li");
  li.textContent = `Tavolo: ${Id} inesistente`;
  document.querySelector(".connection-info").appendChild(li);
})
socket.on('table-message', data => {
     if (data.name === sessionStorage.getItem("user_name")) return;
appendMessagetext(data.name, data.message);
})

//user-connected


socket.on('player-list-complete', data =>{
  document.querySelector(".player-list").innerHTML="";
    for(let i = 0; i < data.userPast.length; i++){
        appendPlayerList(data.userPast[i]);
           playerTableIcon(data.name);
    }
      document.querySelector(".num-player .num").textContent = data.num;
      document.querySelector(".reconnection").style.display="none";

        const ul= document.querySelector(".imp-ul");
   ul.querySelector(".cashEntry strong").textContent = `${data.cashEntry}`;
   ul.querySelector(".smallBlind strong").textContent = `${data.smallBlind}`;
   ul.querySelector(".fichesValue strong").textContent =`${data.valFiches}`;
   ul.querySelector(".fichesNumber strong").textContent = `${data.numFiches}`;
})

}