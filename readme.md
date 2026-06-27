# ClinicOS — คู่มือการติดตั้งและใช้งาน

## สารบัญ
1. [ความต้องการของระบบ](#1-ความต้องการของระบบ)
2. [การติดตั้ง](#2-การติดตั้ง)
3. [ตั้งค่า Environment Variables](#3-ตั้งค่า-environment-variables)
4. [รันระบบ](#4-รันระบบ)
5. [เริ่มใช้งานครั้งแรก](#5-เริ่มใช้งานครั้งแรก)
6. [การใช้งานแต่ละฟีเจอร์](#6-การใช้งานแต่ละฟีเจอร์)
7. [ตั้งค่า Gmail SMTP](#7-ตั้งค่า-gmail-smtp)
8. [แก้ปัญหาที่พบบ่อย](#8-แก้ปัญหาที่พบบ่อย)

---

## 1. ความต้องการของระบบ

| รายการ | เวอร์ชัน |
|--------|---------|
| Node.js | 20+ |
| npm | 10+ |
| PostgreSQL | 14+ |

---

## 2. การติดตั้ง

```bash
# Clone หรือ copy โปรเจกต์ไปที่ต้องการ
cd clinic-app

# ติดตั้ง backend
cd backend
npm install

# ติดตั้ง frontend
cd ../frontend
npm install
```

### สร้างฐานข้อมูล

```bash
# เข้า psql แล้วสร้าง DB
psql -U postgres -h localhost
CREATE DATABASE clinic_app;
\q

# Push schema
cd backend
npx prisma db push
```

---

## 3. ตั้งค่า Environment Variables

แก้ไขไฟล์ `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:รหัสผ่าน@localhost:5432/clinic_app?schema=public"

# JWT (เปลี่ยนเป็นค่าสุ่มที่ปลอดภัย)
JWT_SECRET="เปลี่ยนเป็นค่าสุ่มยาวๆ"

# Port
PORT=3005

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"   ← App Password (ดูข้อ 7)
EMAIL_MOCK=false
```

---

## 4. รันระบบ

เปิด **2 terminal**:

**Terminal 1 — Backend:**
```bash
cd clinic-app/backend
npm run dev
# รันที่ http://localhost:3005
```

**Terminal 2 — Frontend:**
```bash
cd clinic-app/frontend
npm run dev
# รันที่ http://localhost:5173
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

---

## 5. เริ่มใช้งานครั้งแรก

### 5.1 สร้างคลินิก (ทำครั้งเดียว)

1. เปิด `http://localhost:5173/register`
2. กรอกข้อมูล:
   - **ชื่อคลินิก** — ชื่อที่แสดงในระบบ
   - **Slug** — ตัวอักษรภาษาอังกฤษ+ตัวเลข ไม่มีช่องว่าง เช่น `bloom-clinic`
   - **ชื่อผู้ดูแล / อีเมล / รหัสผ่าน** — สำหรับ Admin คนแรก
3. กด "สร้างคลินิก" → เข้าสู่ระบบอัตโนมัติ

> slug ใช้ login ทุกครั้ง อย่าลืม

### 5.2 ตั้งค่าเริ่มต้น (Settings)

ไปที่เมนู **ตั้งค่า** แล้วเพิ่ม:

**บริการ** — รายการบริการที่คลินิกให้บริการ เช่น:
- Botox | ราคา 3,500 | 30 นาที
- Filler | ราคา 8,000 | 45 นาที
- Laser | ราคา 5,000 | 60 นาที

**ทีมงาน** (ถ้ามีหลายคน) — เพิ่มแพทย์/พยาบาล กำหนด Role:
- `ADMIN` — จัดการทุกอย่าง
- `DOCTOR` — เข้าถึงข้อมูลคนไข้และนัด
- `STAFF` — จัดการนัด

---

## 6. การใช้งานแต่ละฟีเจอร์

### 6.1 จัดการคนไข้

**เพิ่มคนไข้ใหม่:**
1. เมนู **คนไข้** → กด "เพิ่มคนไข้"
2. กรอกชื่อ, เบอร์, **อีเมล** (สำคัญสำหรับแจ้งเตือน), ข้อมูลแพ้ยา
3. ระบบสร้างรหัสคนไข้ให้อัตโนมัติ เช่น `PT00001`

**แก้ไขข้อมูล:**
- กดชื่อคนไข้ → กดปุ่ม "แก้ไข" มุมบนขวา

### 6.2 จองนัดหมาย

1. เมนู **นัดหมาย** → กด "สร้างนัด"
2. เลือก: คนไข้ / บริการ / วันเวลา / หมายเหตุ
3. กด "บันทึกนัด"

**เปลี่ยนสถานะนัด** (คลิก dropdown ที่การ์ดนัด):
| สถานะ | ความหมาย |
|-------|---------|
| รอยืนยัน | นัดใหม่ ยังไม่ confirm |
| ยืนยันแล้ว | ยืนยันกับคนไข้แล้ว |
| กำลังรักษา | คนไข้อยู่ในคลินิก |
| เสร็จแล้ว | รักษาเสร็จ |
| ยกเลิก | ยกเลิกนัด |
| ไม่มา | คนไข้ไม่มาตามนัด |

**ส่ง Email แจ้งเตือน:**
- นัดที่คนไข้มีอีเมล → เห็นปุ่ม ✉️ สีน้ำเงิน
- กดปุ่ม → ส่ง reminder ไปที่อีเมลคนไข้ทันที

### 6.3 คอร์ส / แพ็กเกจ

**สร้างแพ็กเกจ:**
1. เมนู **คอร์ส/แพ็กเกจ** → "เพิ่มแพ็กเกจ"
2. กรอก: ชื่อ / จำนวนครั้ง / ราคา / วันหมดอายุ (ถ้ามี)

**คนไข้ซื้อคอร์ส:**
1. หน้าข้อมูลคนไข้ → "ซื้อคอร์ส"
2. เลือกแพ็กเกจ → บันทึก

**ใช้ Session:**
1. หน้าข้อมูลคนไข้ → ดู progress bar
2. กด "ใช้ session นี้" หลังรักษาเสร็จ
3. ระบบหักจำนวนครั้งและแสดงคงเหลือ

---

## 7. ตั้งค่า Gmail SMTP

Gmail บล็อก SMTP ด้วยรหัสผ่านปกติ — ต้องใช้ **App Password** แทน

### ขั้นตอน:

**1. เปิด 2-Step Verification ก่อน (ถ้ายังไม่ได้เปิด)**
- Google Account → Security → 2-Step Verification → เปิดใช้งาน

**2. สร้าง App Password**
- Google Account → Security → **App passwords**
- App name: `ClinicOS` → กด Create
- Copy รหัส **16 ตัว** ที่ได้ (เช่น `abcd efgh ijkl mnop`)

**3. ใส่ใน `.env`**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"   ← App Password ที่ได้มา
EMAIL_MOCK=false
```

**4. Restart backend**
```bash
# หยุด backend แล้วรันใหม่
cd backend
npm run dev
```

---

## 8. แก้ปัญหาที่พบบ่อย

### Backend ไม่อัปเดตหลังแก้ .env
ต้อง restart backend ทุกครั้งที่แก้ไฟล์ `.env`

### ลืมรหัสผ่าน
```bash
# ดู users ทั้งหมด
psql -U postgres -h localhost -d clinic_app -c 'SELECT id, name, email FROM "User";'

# Reset รหัสผ่านด้วย bcrypt hash (ใช้ node)
cd backend
node --input-type=module << 'EOF'
import bcrypt from 'bcryptjs'
const hash = await bcrypt.hash('new_password', 10)
console.log(hash)
EOF

# อัปเดตใน DB
psql -U postgres -h localhost -d clinic_app -c "UPDATE \"User\" SET password = 'HASH_ที่ได้' WHERE email = 'your@email.com';"
```

### ส่ง Email ไม่ได้ — `Invalid login`
- Gmail ต้องใช้ App Password เท่านั้น ไม่ใช่รหัส Gmail ปกติ
- ดูขั้นตอนในข้อ 7

### ส่ง Email ไม่ได้ — `Patient has no email`
- ไปแก้ไขข้อมูลคนไข้ → ใส่อีเมลให้ครบ

### Prisma error หลัง pull code ใหม่
```bash
cd backend
npx prisma db push
npx prisma generate
```

---

## Port Reference

| Service | Port |
|---------|------|
| Backend API | 3005 |
| Frontend | 5173 |
| PostgreSQL | 5432 |

## API Endpoints หลัก

| Method | Endpoint | คำอธิบาย |
|--------|----------|---------|
| POST | `/api/auth/register-clinic` | สร้างคลินิกใหม่ |
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| GET | `/api/patients` | รายชื่อคนไข้ |
| POST | `/api/patients` | เพิ่มคนไข้ |
| GET | `/api/appointments?date=YYYY-MM-DD` | นัดหมายตามวัน |
| POST | `/api/appointments` | สร้างนัด |
| POST | `/api/appointments/:id/send-email` | ส่ง email reminder |
| GET | `/api/packages` | รายการแพ็กเกจ |
| POST | `/api/packages/patient/:ppId/use` | หัก 1 session |
