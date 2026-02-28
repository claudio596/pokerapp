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
  document.querySelector(".profile-menu .header p").textContent = sessionStorage.getItem("user_name");
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
function ImpCreateTable(){
  
  // Genera ID tavolo unico

const div = document.querySelector(".gioca");
div.innerHTML=`
<div id="imp-table">
<div class="header">
<i onclick="backHome();" class="fa-solid fa-arrow-left" id="backHome" style="color: rgb(0, 0, 0);"></i>
<h4>Table rules</h4>
</div>
<div class="input-box">
<input type="number" id="numFiches" value="40" required>
<label for="numFiches">numero di fiches</label>
</div>
<div class="input-box">
<input type="number" id="valFiches" value="0.20" step="0.10" required>
<label for="valFiches">valore fiches €</label>
</div>
<label for="smallBlind">puntata minima:</label>
<div class="radio-button">
<input type="radio" id="none" name="smallBlind" value="no" checked>
<label for="none">no</label>
<input type="radio" id="yes" name="smallBlind" value="yes">
<label for="yes">si</label>
</div>

<button id="createTable" onclick="createTable();" type="button">crea tavolo</button>
</div>
`;
  
  
}

function backHome(){
  const div = document.querySelector(".gioca");
  div.innerHTML=
 ` <h4>pokerizza il tutto</h4>
    <button onclick="ImpCreateTable()" id="imp-create-table" type="button">crea un tavolo</button>
    <button onclick="joinTableImp();" id="join-Table">unisciti ad un tavolo</button>`;
}

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

function joinTableImp(){
 document.querySelector(".gioca").innerHTML=`
 <form id="join">
 <div class="header">
 <i onclick="backHome();" class="fa-solid fa-arrow-left" id="backHome" style="color: rgb(0, 0, 0);"></i>
 <label for="tableId">ID tavolo:</label>
 </div>
 <input type="text" id="tableId" name="tableId" required>
 <button id="joinbtn" type="button">Unisciti</button>
 </form>
 `;

 document.getElementById("joinbtn").addEventListener("click", joinTable);
}

function joinTable(){
  const tableId = document.getElementById("tableId").value;
  sessionStorage.setItem("table_id", tableId);

   window.location.href = `poker.html`;
}

const openMenu= document.querySelector(".menu .profile");
const closeMenu= document.querySelector(".profile-menu .close p");
const profileMenu= document.querySelector(".profile-menu");
const logOut= document.querySelector(".logout");
openMenu.addEventListener("click", () => {
  profileMenu.classList.add("active");
  openMenu.style.pointerEvents="none";
})

closeMenu.addEventListener("click", () => {
  profileMenu.classList.remove("active");
  openMenu.style.pointerEvents="all";
})

logOut.addEventListener("click", () => {
  localStorage.removeItem("user_id");
  window.location.href = "loginRegister.html";
})

const AggiungiIMGprofile= document.querySelector(".profile-menu .option .imgProfile");
const windowAggiungiIMGprofile= document.querySelector(".image-profile");
const closeAggiungiIMGprofile=document.querySelector(".image-profile .close p");

closeAggiungiIMGprofile.addEventListener("click", () => {
  document.querySelector(".body").classList.toggle("dimmed");
  windowAggiungiIMGprofile.style.display = "none";
})

AggiungiIMGprofile.addEventListener("click", () => {
   document.querySelector(".body").classList.toggle("dimmed");
  windowAggiungiIMGprofile.style.display = "grid";
})
