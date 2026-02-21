let socket;
const client = supabase.createClient(
  "https://wktoqnsagqazlfmeelgk.supabase.co",
  "sb_publishable_LaLNLi8aEojSrbkCgFRSWQ_1kG6Pnj5"
);

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
    appendMessage(`you: ${message}`);// il messaggio che invi vieni appeso anche alla propria chat
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
    messageElement.classList.add('message-content');
    messageElement.innerText = message;
   messageContainer.appendChild(messageElement);
}

//controllo connessione server
async function waitForServer(url) {
  let ready = false;
    const p = document.querySelector(".connection-state p");
    const bodyContent= document.querySelector(".body");
    const div= document.querySelector(".connection-state");
  while (!ready) {
    const result = await checkServerStatus(url, 5000);

    if (!result.loading) {
        div.style.display="none";
        bodyContent.style.display = "block";
        document.body.style.backgroundColor = "green";
      ready = true;
      return true;
    }

    p.textContent = "Server in avvio..., ci possono volere 20-60 secondi";
    await new Promise(r => setTimeout(r, 3000));
  }
}
async function checkServerStatus(url, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });

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

socket.emit('joinTable', { 
  tableId: sessionStorage.getItem("table_id"),
  userName: sessionStorage.getItem("user_name")
});
socket.emit("ping-test");

socket.emit('new-user', { 
  name: sessionStorage.getItem("user_name"), 
  tableId: sessionStorage.getItem("table_id") 
});


appendMessage(`you joined`);
}



function setupSocketEvents(){

    //controllo connessione
socket.on("connect", () => {
  console.log("Connesso al server! ID:", socket.id);
  const li = document.createElement("li");
  li.textContent = "Connesso al server! ID: " + socket.id;
  document.querySelector(".connection-info").appendChild(li);
  socket.emit("ping-test");
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
appendMessage(`${data.name}: ${data.message}`);
})

//user-connected
socket.on('user-connected', data => {
    appendPlayerList(data.name);
  document.querySelector(".num-player .num").textContent = data.num;
       if (data.name === sessionStorage.getItem("user_name")) return;
    appendMessage(`${data.name} joined`);
})

socket.on('utente-disconnected', data => {
    appendMessage(`${data.name} left`);
  document.querySelector(".num-player .num").textContent = data.num;
})

}

window.addEventListener('load', async() => {
   await waitForServer("https://pokerapp-k2qf.onrender.com/ping");
   socket = io("https://pokerapp-k2qf.onrender.com");

  setupSocketEvents(); // ora i listener vengono registrati

  loadUser();
  const tableid = sessionStorage.getItem("table_id");
document.getElementById("tableid").textContent = tableid;

});