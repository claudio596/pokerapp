 function setupStartGameEvents(){
    socket.on("table-update", num_player =>{
        document.querySelector(".game-options .info").innerHTML=`<p>
        pronto <strong class="pronti">0</strong>/${num_player}</p>`;
        document.querySelector(".game-options .option").style.display="block";
    })

    socket.on("player-pronti", user_pronti =>{
        console.log(user_pronti);
        const div= document.querySelector(".game-options .info p pronti");
        if(user_pronti == -1){
            document.querySelector(".game-options .option").style.display="none";
            document.querySelector(".game-options .info").innerHTML=`
            <p>in attesa di altri giocatori <strong class="point">.</strong><strong class="point">.</strong><strong class="point">.</strong></p>
            `;
            return;
        }
div.textContent=user_pronti;
        
    })
}
 function startPlayer(){
    let num= document.querySelector(" .pronti").textContent;
    console.log(num);
    socket.emit("player-pronti", {
        num:num,
        tableId: sessionStorage.getItem("table_id")
    });
}
