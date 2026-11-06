# วิธีสร้าง Power Automate Flow

## 1) สร้าง AI Builder Prompt
ชื่อแนะนำ: `Analyze Property Photo and Create Facebook Post`

สร้าง Input 2 ตัว
- `PropertyImage` ชนิด Image or document
- `ExtraDetails` ชนิด Text

Prompt:

```text
คุณเป็นผู้ช่วยวิเคราะห์ภาพทรัพย์สินและเขียนข้อความประชาสัมพันธ์ภาษาไทย

วิเคราะห์เฉพาะสิ่งที่มองเห็นจากรูป {{PropertyImage}} และข้อมูลเพิ่มเติม {{ExtraDetails}}
ห้ามเดารายละเอียดที่มองไม่เห็น เช่น โครงสร้างภายใน กรรมสิทธิ์ ราคา หรือทำเล
ใช้ภาษาสุภาพ เป็นกลาง และระบุว่าผู้ใช้ควรตรวจสอบสภาพจริงอีกครั้ง

ตอบเป็น JSON เท่านั้นตามโครงสร้างนี้:
{
  "analysis": "สรุปสภาพที่มองเห็น จุดเด่น จุดที่ควรตรวจสอบ และข้อเสนอแนะก่อนเผยแพร่",
  "facebookPost": "ข้อความเชิญชวนสำหรับ Facebook ภาษาไทย มีหัวข้อ จุดเด่น คำชวนติดต่อ และแฮชแท็ก โดยไม่กล่าวอ้างเกินข้อมูล"
}
```

ตั้ง Output เป็น JSON ถ้าหน้า Prompt Builder รองรับ จากนั้น Save และ Test ด้วยรูปตัวอย่าง

## 2) สร้าง Instant cloud flow
Trigger: `When an HTTP request is received`
Method: POST

Request Body JSON Schema:

```json
{
  "type": "object",
  "properties": {
    "imageBase64": { "type": "string" },
    "fileName": { "type": "string" },
    "mimeType": { "type": "string" },
    "extraDetails": { "type": "string" }
  },
  "required": ["imageBase64", "fileName", "mimeType"]
}
```

## 3) Compose: Image data URI
เพิ่ม Compose ชื่อ `Compose_ImageDataUri`

Expression:

```text
concat('data:', triggerBody()?['mimeType'], ';base64,', triggerBody()?['imageBase64'])
```

## 4) Run a prompt
เลือก Prompt `Analyze Property Photo and Create Facebook Post`

Map Input:
- PropertyImage = Output ของ `Compose_ImageDataUri`
- ExtraDetails = `triggerBody()?['extraDetails']`

หมายเหตุ: ถ้า Image input ของ Prompt ใน environment ของคุณไม่รับ data URI โดยตรง ให้เพิ่ม `Create file` ใน OneDrive for Business หรือ SharePoint ด้วย expression `base64ToBinary(triggerBody()?['imageBase64'])` แล้ว map File content จากไฟล์นั้นเข้า PropertyImage ก่อน จากนั้นลบไฟล์ชั่วคราวหลังประมวลผล

## 5) Parse JSON
นำ Text output จาก `Run a prompt` เข้า Parse JSON

Schema:

```json
{
  "type": "object",
  "properties": {
    "analysis": { "type": "string" },
    "facebookPost": { "type": "string" }
  },
  "required": ["analysis", "facebookPost"]
}
```

## 6) Response
Status Code: `200`
Headers: `Content-Type` = `application/json`

Body:

```json
{
  "success": true,
  "analysis": "@{body('Parse_JSON')?['analysis']}",
  "facebookPost": "@{body('Parse_JSON')?['facebookPost']}"
}
```

เพิ่ม Scope สำหรับ Error handling ภายหลังได้ โดยตั้ง Run after = has failed / timed out และส่ง Response 500

## 7) นำ URL ไปใส่ในเว็บ
Save Flow แล้วคัดลอก HTTP POST URL ไปใส่ไฟล์ `.env`

```env
PORT=3000
POWER_AUTOMATE_URL=วาง_URL_ตรงนี้
```

อย่าใส่ Flow URL ในไฟล์ `public/app.js` เพราะผู้ใช้เปิด Developer Tools แล้วเห็นได้
