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

> **ภาพรวมฟีเจอร์:** นัดหมาย (ผูกแพทย์/ผู้ช่วย/ห้อง) · คนไข้ · บุคลากร (แพทย์/ผู้ช่วย/พนักงาน) · ห้องบริการ · คอร์ส/แพ็กเกจ · สินค้า · วัสดุสิ้นเปลือง (ตัดสต๊อกอัตโนมัติ) · รายการที่ใช้กับคนไข้ · Email reminder

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
npx prisma generate      # สร้าง Prisma Client (จำเป็นหลังแก้ schema — ดูข้อ 8)
```

### (ทางเลือก) ล้างข้อมูล + สร้าง Admin เริ่มต้น

```bash
cd backend
npm run db:seed
```

คำสั่งนี้จะ **ล้างข้อมูลทุกตาราง** แล้วสร้างคลินิก + admin 1 คน พร้อมพิมพ์ credentials ออกทาง terminal:

| ช่อง | ค่าเริ่มต้น |
|------|-----------|
| slug | `demo` |
| email | `admin@clinic.local` |
| password | `admin1234` |

> ⚠️ `db:seed` เป็นการ **reset** — ข้อมูลเดิมทั้งหมดจะหาย ใช้ตอนเริ่มต้น/ทดสอบเท่านั้น
> แก้บัญชีเริ่มต้นได้ที่ตัวแปร `ADMIN` ในไฟล์ `backend/prisma/seed.js`

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

มี 2 ทางเลือก:
- **ก) ใช้ Admin เริ่มต้น** — ถ้ารัน `npm run db:seed` แล้ว ให้ login ด้วย slug `demo` / `admin@clinic.local` / `admin1234` ได้เลย (ข้ามไปข้อ 5.2)
- **ข) สร้างคลินิกใหม่เอง** — ทำตามข้อ 5.1

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

**บุคลากร** — เพิ่มทีมงานที่เมนู **บุคลากร** (ดูข้อ 6.4) กำหนด Role:
- `ADMIN` — จัดการทุกอย่าง
- `DOCTOR` — แพทย์ (มีข้อมูลความเชี่ยวชาญ + เลขใบประกอบวิชาชีพ)
- `ASSISTANT` — ผู้ช่วยแพทย์
- `STAFF` — พนักงานทั่วไป

**ห้องบริการ / สินค้า / วัสดุ** — ตั้งค่าที่เมนูของแต่ละหมวด (ดูข้อ 6.5–6.7) ก่อนเริ่มจองนัดและบันทึกการใช้งาน

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
2. เลือก: คนไข้ / บริการ / **แพทย์** / **ผู้ช่วยแพทย์** / **ห้อง** / วันเวลา / หมายเหตุ
3. กด "บันทึกนัด"

> การ์ดนัดจะแสดงชื่อแพทย์ 🩺 ผู้ช่วย 🤝 และห้อง 🚪 ที่กำหนดไว้

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

**บันทึกรายการที่ใช้กับคนไข้** (ตัดสต๊อกอัตโนมัติ):
1. ที่การ์ดนัด → กดปุ่ม 📦 (Boxes)
2. เลือก **วัสดุ** หรือ **สินค้า** → เลือกรายการ → ใส่จำนวน → กด "เพิ่มรายการ"
3. ระบบ **หักสต๊อก** ให้อัตโนมัติ (ลบรายการ = คืนสต๊อก)
4. ประวัติการใช้ดูได้ที่หน้าข้อมูลคนไข้ หัวข้อ "รายการที่ใช้"

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

### 6.4 บุคลากร (แพทย์ / ผู้ช่วย / พนักงาน)

เมนู **บุคลากร** — จัดการทีมงานทั้งหมด แยกดูตามแท็บ: ทั้งหมด / แพทย์ / ผู้ช่วยแพทย์ / พนักงาน / ผู้ดูแล

**เพิ่มบุคลากร** (เฉพาะ `ADMIN`):
1. กด "เพิ่มบุคลากร" → กรอกชื่อ, เลือกบทบาท, เบอร์โทร, ตำแหน่ง
2. บทบาท **แพทย์/ผู้ช่วย** จะมีช่องเพิ่ม: ความเชี่ยวชาญ + เลขใบประกอบวิชาชีพ
3. กรอก **อีเมล + รหัสผ่าน** (ใช้เข้าระบบ) → บันทึก

> ทุกคนมีบัญชีเข้าระบบได้ · การ "ลบ" คือการ **ปิดการใช้งาน** (ยังเก็บประวัติในนัดเดิม) · แก้ไขได้ แต่เปลี่ยนอีเมลเข้าระบบไม่ได้

### 6.5 ห้องบริการ

เมนู **ห้องบริการ** — จัดการห้อง เช่น ห้องเลเซอร์, ห้องทรีตเมนต์, ห้องหัตถการ
- เพิ่ม/แก้ไข/ลบ ห้อง พร้อมระบุประเภทและหมายเหตุ
- ห้องที่เปิดใช้งานจะเลือกได้ตอนสร้างนัด

### 6.6 สินค้า

เมนู **สินค้า** — รายการสินค้าขายหน้าร้าน (เซรั่ม, ครีม ฯลฯ)
- ฟิลด์: ชื่อ / SKU / หมวดหมู่ / หน่วย / ราคาขาย / ทุน / จำนวนคงเหลือ
- คงเหลือ ≤ 0 จะแสดงเป็นสีแดง
- ถูกตัดสต๊อกเมื่อบันทึกเป็น "รายการที่ใช้กับคนไข้" (ดูข้อ 6.2)

### 6.7 วัสดุสิ้นเปลือง

เมนู **วัสดุ** — วัสดุที่ใช้ในการรักษา (เข็ม, สำลี, gauze ฯลฯ)
- ฟิลด์: ชื่อ / SKU / หน่วย / ทุนต่อหน่วย / คงเหลือ / **จุดสั่งซื้อ (reorder level)**
- คงเหลือ ≤ จุดสั่งซื้อ → แสดงไอคอนเตือน ⚠️ "ใกล้หมด"
- ถูกตัดสต๊อกเมื่อบันทึกเป็น "รายการที่ใช้กับคนไข้" (ดูข้อ 6.2)

### 6.8 แผงควบคุมผู้ดูแล (Admin)

เมนู 🛡️ **ผู้ดูแล** (เห็นเฉพาะผู้ใช้ role `ADMIN`) — หน้าสรุปภาพรวมทั้งระบบไว้ตรวจสอบทุกอย่างในคลินิก
- การ์ดสรุปยอด: แพทย์ / ผู้ช่วย / พนักงาน / ผู้ดูแล / คนไข้ / นัดหมาย / ห้อง / คอร์ส / สินค้า / วัสดุ / รายการที่ใช้
- ตารางบุคลากรทั้งหมด, นัดหมายล่าสุด, รายการที่ใช้ล่าสุด, รายการสินค้า/วัสดุ/ห้อง/คอร์ส
- แถบเตือนวัสดุใกล้หมด

**ดู "admin คนไหนกำลังใช้งาน" ผ่าน console.log 2 จุด:**
1. **Terminal (backend):** ทุกครั้งที่ backend start จะพิมพ์รายชื่อ admin ทั้งหมด
   ```
   ===== ADMIN USERS =====
     #1  Super Admin <admin@clinic.local>  ·  clinic: ClinicOS Demo (slug: demo)
   =======================
   ```
2. **Browser (DevTools → Console):** เปิดหน้า "ผู้ดูแล" แล้วดู log ของ user ที่ล็อกอิน + ตารางข้อมูลทั้งหมด (`console.table`)

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

### อยากรีเซ็ตข้อมูลทั้งหมด / สร้าง admin ใหม่
```bash
cd backend
npm run db:seed   # ⚠️ ล้างทุกตาราง แล้วสร้าง admin เริ่มต้น (demo / admin@clinic.local / admin1234)
```

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

### แก้ schema แล้ว error `Cannot read properties of undefined (reading 'create')`
เกิดจาก Prisma Client ยังเป็นตัวเก่า (ไม่รู้จักโมเดลใหม่) — ในโปรเจกต์นี้ `db push` **ไม่ได้** regenerate client ให้อัตโนมัติ
```bash
cd backend
npx prisma db push      # อัปเดต schema เข้า DB
npx prisma generate     # ⚠️ สำคัญ: สร้าง client ใหม่
# แล้ว restart backend
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
| GET | `/api/admin/overview` | สรุปภาพรวมทั้งคลินิก (ADMIN เท่านั้น) |
| GET | `/api/patients` | รายชื่อคนไข้ |
| POST | `/api/patients` | เพิ่มคนไข้ |
| GET | `/api/staff?role=DOCTOR&active=1` | บุคลากร (กรองตามบทบาท) |
| POST | `/api/staff` | เพิ่มบุคลากร (ADMIN) |
| GET | `/api/rooms` | รายการห้องบริการ |
| POST | `/api/rooms` | เพิ่มห้อง |
| GET | `/api/appointments?date=YYYY-MM-DD` | นัดหมายตามวัน (รวม doctor/assistant/room) |
| POST | `/api/appointments` | สร้างนัด (รับ `doctorId`/`assistantId`/`roomId`) |
| POST | `/api/appointments/:id/send-email` | ส่ง email reminder |
| GET | `/api/packages` | รายการแพ็กเกจ |
| POST | `/api/packages/patient/:ppId/use` | หัก 1 session |
| GET / POST | `/api/products` | รายการ/เพิ่มสินค้า |
| GET / POST | `/api/materials` | รายการ/เพิ่มวัสดุ |
| GET | `/api/usages?patientId= \| ?appointmentId=` | รายการที่ใช้กับคนไข้ |
| POST | `/api/usages` | บันทึกการใช้ (ตัดสต๊อกอัตโนมัติ) |
| DELETE | `/api/usages/:id` | ลบรายการ (คืนสต๊อก) |
