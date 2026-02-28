 function setupStartGameEvents(){
    socket.on("table-update", num_player =>{
         const li = document.createElement("li");
        li.textContent = `table-update`;
        document.querySelector(".connection-info").appendChild(li);
        document.querySelector(".game-options .info").innerHTML=`<p>
        pronto <strong class="pronti">0</strong>/${num_player}</p>`;
        document.querySelector(".game-options .option").style.display="block";
    });

    socket.on("player-pronti", data =>{
        const num = data.num;
        const li = document.createElement("li");
        li.textContent = `giocatori pronto: ${num}`;
        document.querySelector(".connection-info").appendChild(li);
        const div= document.querySelector(".pronti");
        div.textContent=`${num}`;

const total_player= document.querySelector(".num-player .num").textContent;
if(total_player == num){
    document.querySelector(".game-options .option").innerHTML="";
    document.querySelector(".game-options .info").innerHTML=`
    <div class="game-utils check"> check </div> <div class="game-utils call"> call </div>
     `;
     const tableid= sessionStorage.getItem("table_id");
    const message = "start";
    socket.emit("game-message", {
        message:message,
        tableId: tableid
    });

    socket.emit("give-initial-card", tableid )
    socket.emit("remove-player-pronti-visual",tableid)

    const li=document.createElement("li");
    li.textContent = "avvio game";
    document.querySelector(".connection-info").appendChild(li);
}

//fine player pronti
    });


    socket.on("player-pronti-visual",name => {
        const div = document.getElementById(name);
        const p=div.querySelector(".event");
        p.style.display="block";
        p.innerText = "pronto";
        p.style.backgroundColor="blue";
    })

    socket.on("remove-player-pronti-visual",name => {
        const div = document.getElementById(name);
        const p=div.querySelector(".event");
        p.innerText = "";
        p.style.backgroundColor="";
        p.style.display="none";
    })

    socket.on("remove-general-event",users => {
        const li = document.createElement("li");
        li.textContent = "remove general event";
        document.querySelector(".connection-info").appendChild(li);
        users.forEach(user => {
            const div = document.getElementById(user);
            const p=div.querySelector(".event");
            p.innerText = "";
            p.style.backgroundColor="";
            p.style.display="none";
        });
    })

    socket.on("game-message", message => {
        const li = document.createElement("li");
        li.textContent = `game-message: ${message}`;
        document.querySelector(".connection-info").appendChild(li);
        const p = document.querySelector(".event-game");
        p.textContent =` ${message}`;
        p.classList.add("active");
        setTimeout(() => {
            p.classList.remove("active");
        }, 3000);
        
    });


    socket.on("give-initial-card", card=>{
        const li = document.createElement("li");
        li.textContent = `carta num: ${card.num_card}`;
        document.querySelector(".connection-info").appendChild(li);
        const div= document.querySelector(`.card-${card.num_card}`);
        div.style.backgroundImage=`url(image/${card.card}.jpg)`;
    })

    
    socket.on("give-scarto", ()=>{
        const li = document.createElement("li");
        li.textContent = "scarto";
        document.querySelector(".connection-info").appendChild(li);

        const div= document.querySelector(".scarto");
        div.style.backgroundImage="url(image/scarto.jpg)";
        socket.emit("prima-puntata", {
            tableId: sessionStorage.getItem("table_id")
        })
    })
}
 function startPlayer(){
    let num= document.querySelector(".pronti").textContent;
    console.log(num);
    socket.emit("player-pronti", {
        num:num,
        tableId: sessionStorage.getItem("table_id"),
        name: sessionStorage.getItem("user_name")
    });
      document.querySelector(".game-options .option").innerHTML=`
        <button onclick="rimuoviPronto();">rimuovi gioca</button>
        `;

}


function rimuoviPronto(){
     const num= document.querySelector(".pronti").textContent;
    socket.emit("remove-player-pronti", {
        num:num,
        tableId: sessionStorage.getItem("table_id"),
        name: sessionStorage.getItem("user_name")
    });

    document.querySelector(".game-options .option").innerHTML=`
          <button onclick="startPlayer();">gioca</button>
        `;
    
}