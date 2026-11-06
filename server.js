import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "12mb" }));
app.use(express.static("public"));

app.post("/api/analyze", async (req, res) => {
  try {
    if (!process.env.POWER_AUTOMATE_URL) {
      return res.status(500).json({ success: false, message: "ยังไม่ได้ตั้งค่า POWER_AUTOMATE_URL" });
    }

    const { imageBase64, fileName, mimeType, extraDetails = "" } = req.body;
    if (!imageBase64 || !fileName || !mimeType) {
      return res.status(400).json({ success: false, message: "ข้อมูลรูปภาพไม่ครบ" });
    }

    const flowResponse = await fetch(process.env.POWER_AUTOMATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, fileName, mimeType, extraDetails })
    });

    const raw = await flowResponse.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { data = { success: false, message: raw || "Flow ไม่ได้ส่ง JSON กลับมา" }; }

    return res.status(flowResponse.status).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "เรียก Power Automate ไม่สำเร็จ", detail: error.message });
  }
});

app.listen(port, () => console.log(`เปิดเว็บที่ http://localhost:${port}`));
