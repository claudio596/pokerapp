let cropper;
let blob;
const fileInput = document.getElementById("file");
const editorBox = document.getElementById("editorBox");
const cropImage = document.getElementById("cropImage");
const avatarPreview = document.querySelector(".preview");


fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  cropImage.src = URL.createObjectURL(file);
  editorBox.classList.remove("hidden");

  cropImage.onload = () => {
    console.log("IMG LOADED, CREATING CROPPER");

    if (cropper) cropper.destroy();

    cropper = new Cropper(cropImage, {
  aspectRatio: 1,          // quadrato → diventa cerchio con CSS
  viewMode: 1,
  dragMode: "move",
  background: false,
  zoomable: true,
  movable: true,
  scalable: false,
  rotatable: false,
  cropBoxResizable: false, // NON modificabile
  cropBoxMovable: false,   // NON spostabile
  ready() {
    // Imposta la crop box alla dimensione reale dell’avatar
    const avatarSize = 150; // <-- la tua dimensione reale
    const containerData = cropper.getContainerData();
    const left = (containerData.width - avatarSize) / 2;
    const top = (containerData.height - avatarSize) / 2;

    cropper.setCropBoxData({
      left,
      top,
      width: avatarSize,
      height: avatarSize
    });
  }
});

  };
});

document.getElementById("confirmCrop").addEventListener("click", () => {
  console.log("CROPPER AT CONFIRM:", cropper);

    if (!cropper) return;

  const canvas = cropper.getCroppedCanvas({
  width: 150,
  height: 150
});

// maschera circolare
const circleCanvas = document.createElement("canvas");
circleCanvas.width = 150;
circleCanvas.height = 150;

const ctx = circleCanvas.getContext("2d");
ctx.beginPath();
ctx.arc(75, 75, 75, 0, Math.PI * 2);
ctx.closePath();
ctx.clip();
ctx.drawImage(canvas, 0, 0, 150, 150);

const base64 = circleCanvas.toDataURL("image/png");
avatarPreview.style.backgroundImage = `url(${base64})`;
  console.log("CANVAS:", canvas);

  

  editorBox.classList.add("hidden");
  cropper.destroy();
   blob = base64ToBlob(base64);
});

async function  base64ToBlob(base64) {
  const parts = base64.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  let length = binary.length;
  let buffer = new Uint8Array(length);

  while (length--) {
    buffer[length] = binary.charCodeAt(length);
  }

  return new Blob([buffer], { type: mime });
}


 document.querySelector(".image-profile .button button").addEventListener("click", async () => {
    if (!blob) {
        alert("Carica e taglia un'immagine prima di salvare!");
        return;
    }

    // 1. Ottieni l'utente
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) return console.error("Utente non autenticato");

    const fileName = `avatar-${user.id}.png`;

    // 2. Upload del file blob su Supabase Storage
    const { error: uploadError } = await client.storage
        .from("avatars")
        .upload(fileName, blob, { upsert: true });

    if (uploadError) return console.error("Errore upload:", uploadError);

    // 3. Ottieni l'URL pubblico
    const { data: urlData } = client.storage
        .from("avatars")
        .getPublicUrl(fileName);

    // 4. Aggiorna il profilo nel database
    const { error: updateError } = await client
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);

    if (updateError) {
        console.error("Errore database:", updateError);
    } else {
        alert("Profilo aggiornato con successo!");
    }
});
