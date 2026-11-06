# AI Property Photo Test Web App

เว็บทดสอบสำหรับอัปโหลดรูป ส่งไปยัง Power Automate เรียก AI Builder Prompt แล้วแสดง
1. ผลวิเคราะห์สภาพจากภาพ
2. ข้อความเชิญชวนสำหรับคัดลอกไป Facebook

## เริ่มใช้งาน
1. ติดตั้ง Node.js 18 ขึ้นไป
2. เปิดโฟลเดอร์นี้ด้วย VS Code
3. เปิด Terminal และรัน `npm install`
4. คัดลอก `.env.example` เป็น `.env`
5. วาง HTTP POST URL ของ Flow ใน `POWER_AUTOMATE_URL`
6. รัน `npm start`
7. เปิด `http://localhost:3000`

## โครงสร้าง
- `public/index.html` หน้าจอ อัปโหลดรูป ช่องข้อมูล ปุ่ม และผลลัพธ์
- `public/style.css` รูปแบบหน้าจอและ mobile responsive
- `public/app.js` อ่านไฟล์เป็น Base64 เรียก Backend แสดงผล และคัดลอกข้อความ
- `server.js` Backend proxy ปกปิด Flow URL และส่งข้อมูลไป Power Automate
- `.env` เก็บค่าลับ ไม่ควร commit เข้า Git
- `FLOW_SETUP_TH.md` ขั้นตอนสร้าง AI Builder Prompt และ Power Automate Flow

## ข้อมูลที่เว็บส่งเข้า Flow
```json
{
  "imageBase64": "...",
  "fileName": "room.jpg",
  "mimeType": "image/jpeg",
  "extraDetails": "คอนโดใกล้ BTS ราคา 3.5 ล้านบาท"
}
```

## ข้อมูลที่ Flow ต้องตอบกลับ
```json
{
  "success": true,
  "analysis": "สภาพโดยรวม...",
  "facebookPost": "ประกาศ..."
}
```

## หมายเหตุด้านความปลอดภัย
ตัวอย่างนี้เหมาะสำหรับ local proof of concept. ก่อนนำขึ้น production ให้เพิ่ม Microsoft Entra ID authentication, จำกัดผู้เรียก Flow และตรวจสอบชนิด/ขนาดไฟล์ที่ Backend อีกชั้น
