 function setupStartGameEvents(){
    socket.on("table-update", num_player =>{
        document.querySelector(".game-options .info").innerHTML=`pronto <strong>0</strong>/${num_player}`;
        document.querySelector(".game-options .option").style.display="block";
    })

    socket.on("player-pronti", user_pronti =>{
 document.querySelector(".game-options .info strong").textContent=user_pronti;
        
    })
}
 function startPlayer(){
    let num= document.querySelector(".game-options .info strong").textContent;
    socket.emit("player-pronti", num);
}
