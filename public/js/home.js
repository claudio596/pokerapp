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
document.getElementById("imp-create-table").addEventListener("click", () => {
  
  // Genera ID tavolo unico

const div = document.querySelector(".gioca");
div.innerHTML=`
<form id="imp-table">
<label for="numFiches">numero di fiches:</label>
<input type="number" id="numFiches" required>
<label for="valFiches">valore fiches:</label>
<div class="flex"> 
<input type="number" id="valFiches" required>
<p>€<p>
</div>
<label for="cashEntry">cash entry:</label>
<div class="flex">
<input type="number" id="cashEntry" required>
<p>€<p>
</div>
<label for="smallBlind">puntata minima:</label>
<label for="none">no</label>
<input type="radio" id="none" name="smallBlind" value="no" checked>
<label for="yes">si</label>
<input type="radio" id="yes" name="smallBlind" value="yes">

<button id="createTable" type="button">crea tavolo</button>
</form>
`;
  
  
});

document.querySelector(".createTable").addEventListener("click", () => {
    const tableId = Math.random().toString(36).substring(2, 8);
  sessionStorage.setItem("table_id", tableId);
  const selected = document.querySelector('input[name="smallBlind"]:checked');
  const numFiches = document.getElementById("numFiches").value;
  const valFiches = document.getElementById("valFiches").value;
  const cashEntry = document.getElementById("cashEntry").value;
  let smallBlind;
    if (!selected) {
        console.log("Nessuna scelta selezionata");
        return;
    }else{
       smallBlind = selected.value;
    }


  // Invia al server
  socket.emit("createTable", {
    tableId: tableId,
    smallBlind: smallBlind,
    numFiches: numFiches,
    valFiches: valFiches,
    cashEntry: cashEntry
  });
  
  const connect = document.querySelector(".connect");
  document.querySelector(".body").style.display="none";
  connect.style.display = "block";
})


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