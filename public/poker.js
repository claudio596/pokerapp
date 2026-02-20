const socket = io("https://pokerapp-k2qf.onrender.com");
const client = supabase.createClient(
  "https://wktoqnsagqazlfmeelgk.supabase.co",
  "sb_publishable_LaLNLi8aEojSrbkCgFRSWQ_1kG6Pnj5"
);

const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const messageContainer =  document.getElementById('message-container');

//controllo connessione
socket.on("connect", () => {
  console.log("Connesso al server! ID:", socket.id);
  const li = document.createElement("li");
  li.textContent = "Connesso al server! ID: " + socket.id;
  document.querySelector(".connection-info").appendChild(li);
  socket.emit("ping-test");
  console.log(socket.io.uri);
});

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
     if (data.name === localStorage.getItem("user_name")) return;
appendMessage(`${data.name}: ${data.message}`);
})

//user-connected
socket.on('user-connected', name => {
  const num_player = document.querySelector(".num-player .num").textContent;
  num_player=Number(num_player)+1;
  document.querySelector(".num-player .num").textContent = num_player;
       if (name === localStorage.getItem("user_name")) return;
    appendMessage(`${name} joined`);
})

socket.on('utente-disconnected', name => {
    appendMessage(`${name} left`);
})


messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`you: ${message}`);// il messaggio che invi vieni appeso anche alla propria chat
    const tableId = sessionStorage.getItem("table_id");
    socket.emit('table-message', {
        tableId,
        message
    });
    messageInput.value = '';

})

function appendMessage(message){
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-content');
    messageElement.innerText = message;
   messageContainer.appendChild(messageElement);
}

async function loadUser() {
  document.querySelector(".name").textContent = sessionStorage.getItem("user_name");

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
window.addEventListener('load', () => {
loadUser();
const tableid = sessionStorage.getItem("table_id");
document.getElementById("tableid").textContent = tableid;
});

window.addEventListener('beforeunload', () => {
  socket.emit('user-disconnected',{
    name: document.querySelector(".name").textContent,
    tableId: sessionStorage.getItem("table_id")
  });
});






//funzioni della pagina(non client)

document.querySelector(".exit").addEventListener("click", () => {
  document.querySelector(".body").classList.toggle("dimmed");
  document.querySelector(".exit-content").style.display = "grid";
});


document.querySelector(".si-exit").addEventListener("click", () => {
  window.location.href = "home.html";
  socket.emit('user-disconnected',{
    name: document.querySelector(".name").textContent,
    tableId: sessionStorage.getItem("table_id")
  });
});

document.querySelector(".no-exit").addEventListener("click", () => {
  document.querySelector(".body").classList.toggle("dimmed");
  document.querySelector(".exit-content").style.display = "none";
});

let open_connect_info = true;
document.querySelector(".websocket i").addEventListener("click", () => {
  const img = document.querySelector(".websocket i");
  const div = document.querySelector(".connection-info");
  if(open_connect_info){
    div.style.display = "none";
    img.classList.remove("fa-arrow-down");
    img.classList.add("fa-arrow-up");
  }else{
    div.style.display = "block";
    img.classList.remove("fa-arrow-up");
    img.classList.add("fa-arrow-down");
  }

  open_connect_info = !open_connect_info;
})