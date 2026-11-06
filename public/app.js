const imageInput = document.querySelector("#imageInput");
const preview = document.querySelector("#preview");
const extraDetails = document.querySelector("#extraDetails");
const analyzeBtn = document.querySelector("#analyzeBtn");
const statusText = document.querySelector("#status");
const resultCard = document.querySelector("#resultCard");
const analysisResult = document.querySelector("#analysisResult");
const facebookPost = document.querySelector("#facebookPost");
const copyBtn = document.querySelector("#copyBtn");
let selectedFile = null;

imageInput.addEventListener("change", () => {
  selectedFile = imageInput.files?.[0] || null;
  statusText.textContent = "";
  resultCard.classList.add("hidden");
  if (!selectedFile) return preview.classList.add("hidden");
  preview.src = URL.createObjectURL(selectedFile);
  preview.classList.remove("hidden");
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    statusText.className = "status error";
    statusText.textContent = "กรุณาเลือกรูปก่อน";
    return;
  }
  if (selectedFile.size > 7 * 1024 * 1024) {
    statusText.className = "status error";
    statusText.textContent = "ไฟล์ใหญ่เกิน 7 MB กรุณาลดขนาดรูป";
    return;
  }

  analyzeBtn.disabled = true;
  statusText.className = "status";
  statusText.textContent = "กำลังส่งรูปให้ AI วิเคราะห์...";

  try {
    const imageBase64 = await fileToBase64(selectedFile);
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        extraDetails: extraDetails.value.trim()
      })
    });
    const data = await response.json();
    if (!response.ok || data.success === false) throw new Error(data.message || "เกิดข้อผิดพลาด");

    analysisResult.textContent = data.analysis || "ไม่มีผลวิเคราะห์";
    facebookPost.value = data.facebookPost || "";
    resultCard.classList.remove("hidden");
    statusText.textContent = "วิเคราะห์เรียบร้อย";
  } catch (error) {
    statusText.className = "status error";
    statusText.textContent = error.message;
  } finally {
    analyzeBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", async () => {
  if (!facebookPost.value) return;
  await navigator.clipboard.writeText(facebookPost.value);
  copyBtn.textContent = "คัดลอกแล้ว";
  setTimeout(() => copyBtn.textContent = "คัดลอก", 1500);
});
