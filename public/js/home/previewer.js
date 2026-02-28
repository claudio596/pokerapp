let cropper;

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
    if (cropper) cropper.destroy();

    cropper = new Cropper(cropImage, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: "move",
      background: false,
      zoomable: true,
      movable: true
    });
  };
});

document.getElementById("confirmCrop").addEventListener("click", () => {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas({
    width: 300,
    height: 300
  });

  const base64 = canvas.toDataURL("image/png");
  avatarPreview.style.backgroundImage = `url(${base64})`;

  editorBox.classList.add("hidden");
  cropper.destroy();
});