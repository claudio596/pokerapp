const client = supabase.createClient(
  "https://wktoqnsagqazlfmeelgk.supabase.co",
  "sb_publishable_LaLNLi8aEojSrbkCgFRSWQ_1kG6Pnj5"
);

let socket;

window.addEventListener('load', async() => {
   await waitForServer("https://pokerapp-k2qf.onrender.com/ping");
   socket = io("https://pokerapp-k2qf.onrender.com", {
    transports: ["websocket"]
   });
  setupSocketEvents(); // ora i listener vengono registrati
  setupStartGameEvents();

});

const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const messageContainer =  document.getElementById('message-container');



function appendPlayerList(name){
  const li = document.createElement("li");
  li.innerHTML = `
<i class="fa-solid fa-person fa-xs" style="color: rgb(255, 255, 255);"></i>   
 <p>${name}</p>
  `;
  document.querySelector(".player-list").appendChild(li);
}

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessagetext("you", message);// il messaggio che invi vieni appeso anche alla propria chat
    const tableId = sessionStorage.getItem("table_id");
    socket.emit('table-message', {
        tableId,
        message,
        name: sessionStorage.getItem("user_name")
    });
    messageInput.value = '';

})


function appendMessage(message){
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-utils');
    messageElement.innerText = message;
   messageContainer.appendChild(messageElement);
}
function appendMessagetext(name, message){
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-table');
    messageElement.innerHTML = `
    <p class="name">${name}</p>
    <p class="message">${message}</p>
    `;
   messageContainer.appendChild(messageElement);
}

//controllo connessione server
async function waitForServer(url, {
  initialDelay = 100,
  pollInterval = 3000,
  maxAttempts = 40 // ~2 minuti
} = {}) {

  const p = document.querySelector(".connection-state p");
  const bodyContent = document.querySelector(".body");
  const div = document.querySelector(".connection-state");

  await delay(initialDelay);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await checkServerStatus(url, 5000);

    if (!result.loading) {
       div.style.display = "none";
  bodyContent.style.display = "block";
  document.body.style.backgroundColor = "rgb(82, 79, 79)";
      return true;
    }

    p.textContent = `Server in avvio... tentativo ${attempt}/${maxAttempts}`;
    await delay(pollInterval);
  }

  p.textContent = "Il server non risponde. Riprova più tardi.";
  return false;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function checkServerStatus(url, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal, 
      cache: "no-cache" 
    });

    clearTimeout(timer);

    if (!res.ok) {
      // Il server ha risposto ma non è ancora pronto
      return { loading: true, status: res.status };
    }

    // Il server è attivo
    return { loading: false, status: res.status };

  } catch (err) {
    clearTimeout(timer);

    // Timeout o errore → server probabilmente in fase di avvio
    return { loading: true, error: err.message };
  }
}

async function loadUser() {
  document.querySelector(".name").textContent = sessionStorage.getItem("user_name");
  const li = document.createElement("li"); 
  li.textContent = "Utente: " + sessionStorage.getItem("user_name");
  document.querySelector(".connection-info").appendChild(li);

  const li2 = document.createElement("li"); 
  li2.textContent = "Tavolo: " + sessionStorage.getItem("table_id");
  document.querySelector(".connection-info").appendChild(li2);

  if(!sessionStorage.getItem("user_uid")){
    sessionStorage.setItem("user_uid", crypto.randomUUID());
  }

  const user_uid = sessionStorage.getItem("user_uid");


socket.emit('joinTable', { 
  tableId: sessionStorage.getItem("table_id"),
  userName: sessionStorage.getItem("user_name"),
  user_uid: user_uid
});
socket.emit("ping-test");

appendMessage(`you joined`);
}



function setupSocketEvents(){

    //controllo connessione
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

socket.on("table-not-found", Id =>{
  const li = document.createElement("li");
  li.textContent = `Tavolo: ${Id} inesistente`;
  document.querySelector(".connection-info").appendChild(li);
})
  socket.on("connect_error", (err) => {
  console.error("Errore di connessione:", err.message);
  const li = document.createElement("li");
  li.textContent = "Errore di connessione: " + err.message;
  document.querySelector(".connection-info").appendChild(li);
});

socket.on("pong-test", () => {
  console.log("PONG dal server");
   const li = document.createElement("li");
  li.textContent = "PONG dal server";
  document.querySelector(".connection-info").appendChild(li);
});


//appende il messaggio nella chat
socket.on('table-message', data => {
     if (data.name === sessionStorage.getItem("user_name")) return;
appendMessagetext(data.name, data.message);
})

//user-connected
socket.on('user-connected', data => {
    appendPlayerList(data.name);
  document.querySelector(".num-player .num").textContent = data.num;
  
  /*
       if (data.name === sessionStorage.getItem("user_name")) return;
    */
   appendMessage(`${data.name} joined`);
})

socket.on('player-list-complete', data =>{
  document.querySelector(".player-list").innerHTML="";
    for(let i = 0; i < data.userPast.length; i++){
        appendPlayerList(data.userPast[i]);
    }
      document.querySelector(".num-player .num").textContent = data.num;
      document.querySelector(".reconnection").style.display="none";
})

socket.on('utente-disconnected', data => {
    appendMessage(`${data.name} left`);
    const li = [...document.querySelectorAll(".player-list li")]
  .find(li => li.querySelector("p")?.textContent === data.name);

if (li) li.remove();
  document.querySelector(".num-player .num").textContent = data.num;
})

socket.on("disconnect", (reason) => {
  console.log("Disconnesso:", reason);

  if (reason !== "io client disconnect") {
    showReconnectingOverlay(reason);
  }

});

}



function showReconnectingOverlay(reason){
  const reconnect= document.querySelector(".reconnection");
  document.querySelector(".body").style.display="none";
  document.body.style.backgroundColor = "white";
  reconnect.style.display = "grid";
  const p = document.querySelector(".reconnection p");
  p.textContent = `disconnessione: ${reason}`;

  attemptReconnect();
}


function attemptReconnect(){
  const user_uid=sessionStorage.getItem("user_uid");
  const userName=sessionStorage.getItem("user_name");
  const tableId=sessionStorage.getItem("table_id");
  const interval = setInterval(() => {
    if (socket.connected) {
      clearInterval(interval);

      // Chiedi al server se il tavolo esiste
      socket.emit("check-table", tableId, (exists) => {
        if (!exists) {
          // Ricrea il tavolo
          socket.emit("createTable", {tableId});
        }

        // Rientra nel tavolo
        socket.emit("joinTable", { tableId, userName, user_uid });

        document.querySelector(".body").style.display="block";
        document.querySelector(".reconnection").style.display="none";
        document.body.style.backgroundColor = "green";
      });
    }
  }, 2000);

}