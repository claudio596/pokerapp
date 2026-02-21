
//funzioni della pagina(non client)

document.querySelector(".exit").addEventListener("click", () => {
  document.querySelector(".body").classList.toggle("dimmed");
  document.querySelector(".exit-content").style.display = "grid";
});


document.querySelector(".si-exit").addEventListener("click", () => {
  
  socket.emit("leave-table", {
  tableId: sessionStorage.getItem("table_id"),
  name: sessionStorage.getItem("user_name")
});
window.location.href = "home.html";
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

document.querySelector(".num-player").addEventListener("click", () => {
  const elem = document.querySelector(".num-player");
  const menu = document.querySelector(".menu");
const leftposition = elem.getBoundingClientRect().left;
const div = document.querySelector(".player-list");
  const top = menu.getBoundingClientRect().height;
  div.style.display = "grid";
  div.style.left = `${leftposition}px`;
  div.style.top = `${top}px`;
})