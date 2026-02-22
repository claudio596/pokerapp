const client = supabase.createClient(
  "https://wktoqnsagqazlfmeelgk.supabase.co",
  "sb_publishable_LaLNLi8aEojSrbkCgFRSWQ_1kG6Pnj5"
);
// 🔌 Collegamento al server Socket.IO su Render
const socket = io("https://pokerapp-k2qf.onrender.com", {
  transports: ["websocket"]
});

async function loadUser() {
  
  if(sessionStorage.getItem("user_name") === null){
    window.location.href = "loginRegister.html";
  }else{
  document.querySelector(".name").textContent = sessionStorage.getItem("user_name");
  }
}

loadUser();


document.querySelector(".exit").addEventListener("click", () => {
  document.querySelector(".body").classList.toggle("dimmed");
  document.querySelector(".exit-content").style.display = "grid";
});

document.querySelector(".si-exit").addEventListener("click", () => {
  localStorage.removeItem("user_id");
  window.location.href = "loginRegister.html";
});

document.querySelector(".no-exit").addEventListener("click", () => {
  document.querySelector(".body").classList.toggle("dimmed");
  document.querySelector(".exit-content").style.display = "none";
});






// Quando clicchi "crea un tavolo"
document.getElementById("create-table").addEventListener("click", () => {
  
  // Genera ID tavolo unico
  const tableId = Math.random().toString(36).substring(2, 8);
  const userName = document.querySelector(".name").textContent;

  sessionStorage.setItem("table_id", tableId);


  // Invia al server
  socket.emit("createTable", {
    tableId,
    socketId: socket.id
  });

  console.log("Tavolo creato:", tableId);

});


socket.on("table-created", (id) => {
  console.log("Tavolo creato sul server:", id);
  window.location.href = "poker.html";
});

document.getElementById("join-Table").addEventListener("click", () => {
 document.querySelector(".gioca").innerHTML=`
 <form id="join">
 <label for="tableId">ID tavolo:</label>
 <input type="text" id="tableId" name="tableId" required>
 <button id="joinbtn" type="button">Unisciti</button>
 </form>
 `;

 document.getElementById("joinbtn").addEventListener("click", joinTable);
})





function joinTable(){
  const tableId = document.getElementById("tableId").value;
  sessionStorage.setItem("table_id", tableId);

   window.location.href = `poker.html`;
}