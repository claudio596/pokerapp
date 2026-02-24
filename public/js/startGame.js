 function setupStartGameEvents(){
    socket.on("table-update", num_player =>{
         const li = document.createElement("li");
        li.textContent = `table-update`;
        document.querySelector(".connection-info").appendChild(li);
        document.querySelector(".game-options .info").innerHTML=`<p>
        pronto <strong class="pronti">0</strong>/${num_player}</p>`;
        document.querySelector(".game-options .option").style.display="block";
    })

    socket.on("player-pronti", num =>{
        const li = document.createElement("li");
        li.textContent = `giocatori pronto: ${num}`;
        document.querySelector(".connection-info").appendChild(li);
        const div= document.querySelector(".pronti");
        if(user_pronti == -1){
            document.querySelector(".game-options .option").style.display="none";
            document.querySelector(".game-options .info").innerHTML=`
            <p>in attesa di altri giocatori <strong class="point">.</strong><strong class="point">.</strong><strong class="point">.</strong></p>
            `;
            return;
        }
div.textContent="num";
        
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
