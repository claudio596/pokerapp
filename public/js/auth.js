const client = supabase.createClient(
  "https://wktoqnsagqazlfmeelgk.supabase.co",
  "sb_publishable_LaLNLi8aEojSrbkCgFRSWQ_1kG6Pnj5"
);

// REGISTRAZIONE
document.getElementById("signup").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("nameregister").value;
  const password = document.getElementById("passwordregister").value;

  // HASHING DELLA PASSWORD
  // Controlla se il nome esiste già
  const { data: existing } = await client
    .from("users_custom")
    .select("name")
    .eq("name", name)
    .single();

  if (existing) {
    alert("Nome già esistente");
    return;
  }

  // Inserisci nuovo utente
  const { data, error } = await client
    .from("users_custom")
    .insert({
      name,
      password,
    })
    .select()
    .single();

  if (error) {
    alert("Errore: " + error.message);
    return;
  }

  // Salva sessione locale
  sessionStorage.setItem("user_name", data.id);
  window.location.href = "home.html";
});


//login
document.getElementById("login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;

  const { data, error } = await client
    .from("users_custom")
    .select("*")
    .eq("name", name)
    .eq("password", password)
    .single();

  if (error || !data) {
    alert("Nome o password errati");
    return;
  }



  // Salva sessione locale
  sessionStorage.setItem("user_name", data.name);

  window.location.href = "home.html";
});



//login , signup form

document.querySelector(".login-p").addEventListener("click", () => {
  document.getElementById("signup-content").style.display = "none";
  document.getElementById("login-content").style.display = "block";
});

document.querySelector(".signup-p").addEventListener("click", () => {
  document.getElementById("signup-content").style.display = "block";
  document.getElementById("login-content").style.display = "none";
});

//entra come ospite
let num_guest=1;
document.querySelector(".guest").addEventListener("click", () => {
  const name=`Guest(${num_guest})`;
  num_guest++;
  sessionStorage.setItem("user_name", name);
  window.location.href = "home.html";
});


