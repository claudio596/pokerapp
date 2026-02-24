 function setupStartGameEvents(){
    socket.on("table-update", num_player =>{
         const li = document.createElement("li");
        li.textContent = `table-update`;
        document.querySelector(".connection-info").appendChild(li);
        document.querySelector(".game-options .info").innerHTML=`<p>
        pronto <strong class="pronti">0</strong>/${num_player}</p>`;
        document.querySelector(".game-options .option").style.display="block";
    });

    socket.on("player-pronti", num =>{
        const li = document.createElement("li");
        li.textContent = `giocatori pronto: ${num}`;
        document.querySelector(".connection-info").appendChild(li);
        const div= document.querySelector(".pronti");
        if(num == -1){
            document.querySelector(".game-options .option").style.display="none";
            document.querySelector(".game-options .info").innerHTML=`
            <p>in attesa di altri giocatori <strong class="point">.</strong><strong class="point">.</strong><strong class="point">.</strong></p>
            `;
            return;
        }
div.textContent=`${num}`;
const total_player= document.querySelector(".num-player .num").textContent;
if(total_player == num){
    document.querySelector(".game-options .option").innerHtml="";
    document.querySelector(".game-options .info").innerHTML=`
    <div class="game-utils"> fold </div> <div class="game-utils"> call </div>
     `;
    const message = "start";
    socket.emit("game-message", {
        message:message,
        tableId: sessionStorage.getItem("table_id")
    });

    socket.emit("give-initial-card", {
        tableId: sessionStorage.getItem("table_id")
    })
}
    });

    socket.on("game-message", message => {
        const p = document.createElement("p");
        p.textContent = message;
        document.querySelector(".event-game").appendChild(p);

    });

    socket.on("give-initial-card", card=>{
        const div= document.querySelector(`.card-${card.num_card}`);
        div.style.backgroundImage=`url(image/${card.card}.jpg)`;
    })

    socket.on("give-scarto", ()=>{
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
        tableId: sessionStorage.getItem("table_id")
    });
}
