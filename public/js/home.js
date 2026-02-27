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
  }else if(sessionStorage.getItem("user_name").includes("Guest")){
    document.querySelector(".profile").innerHTML=`
    <p>${sessionStorage.getItem("user_name")}</p>
    <button onclick="window.location.href = 'loginRegister.html'"
    title="registrati per salvare i tuoi progressi e dati personali">
    sign up</button>
    `;
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
<div id="imp-table">
<div class="input-box">
<label for="numFiches">numero di fiches:</label>
<input type="number" id="numFiches" value="40" required>
</div>
<div class="input-box">
<label for="valFiches">valore fiches:</label>
<div class="flex"> 
<input type="number" id="valFiches" value="0.20" required>
<p>€<p>
</div>
</div>
<label for="smallBlind">puntata minima:</label>
<input type="radio" id="none" name="smallBlind" value="no" checked>
<label for="none">no</label>
<input type="radio" id="yes" name="smallBlind" value="yes">
<label for="yes">si</label>

<button id="createTable" onclick="createTable();" type="button">crea tavolo</button>
</div>
`;
  
  
});

function createTable(){
    const tableId = Math.random().toString(36).substring(2, 8);
  sessionStorage.setItem("table_id", tableId);
  const selected = document.querySelector('input[name="smallBlind"]:checked');
  const numFiches = document.getElementById("numFiches").value;
  const valFiches = document.getElementById("valFiches").value;
 const cashEntry= (Number(numFiches))*(Number(valFiches));
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
}


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