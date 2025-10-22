## ระบบลงทะเบียนและประเมินนักศึกษาฝึกงาน

แอป Next.js สำหรับจัดการข้อมูลฝึกงานที่รวมบทบาทผู้ดูแล ครูนิเทศ ผู้ควบคุมสถานประกอบการ และนักศึกษา พร้อมระบบยืนยันตัวตนแบบ JWT, ฐานข้อมูล MongoDB (ผ่าน Mongoose) และ UI จาก FlyonUI

### จุดเด่น
- กำหนดสิทธิ์ 4 บทบาท (Admin / Teacher / Supervisor / Student) ด้วยชื่อผู้ใช้และรหัสผ่าน
- ลงทะเบียนนักศึกษา ครูนิเทศ และผู้ควบคุม รวมถึงรายละเอียดการฝึกงานและผลการประเมิน
- บันทึกผลประเมินจากครูนิเทศหรือผู้ควบคุม พร้อมสรุปคะแนนเฉลี่ยอัตโนมัติ
- แดชบอร์ดและแบบฟอร์มแยกตามบทบาท พร้อมกรองข้อมูลตามสิทธิ์อัตโนมัติ
- สคริปต์ seed ช่วยสร้างบัญชีผู้ดูแลระบบเริ่มต้น

### เทคโนโลยี
- Next.js 15 (App Router)
- MongoDB + Mongoose
- FlyonUI + Tailwind CSS v4
- JWT (jsonwebtoken) สำหรับการตรวจสอบสิทธิ์

### วิธีเริ่มต้น
1. ตั้งค่าไฟล์ `.env` (หรือใช้ไฟล์ `.env` ที่มีอยู่) ด้วยค่า เช่น
   ```
   MONGODB_URI=...
   JWT_ACCESS_SECRET=...
   JWT_REFRESH_SECRET=...
   ACCESS_TOKEN_EXPIRES=15m
   REFRESH_TOKEN_EXPIRES=30d
   ADMIN_NAME=Default Admin
   ADMIN_EMAIL=admin@example.com
   ADMIN_USERNAME=admin
  ADMIN_PASSWORD=changeme123
   ```
2. ติดตั้ง dependencies
   ```bash
   npm install
   ```
3. สร้างหรืออัปเดตบัญชีผู้ดูแลระบบ
   ```bash
   npm run seed:admin
   ```
4. รันโหมดพัฒนา
   ```bash
   npm run dev
   ```
5. เปิด [http://localhost:3000](http://localhost:3000)

### การเข้าสู่ระบบ
- **Admin / Teacher / Supervisor**: ใช้ชื่อผู้ใช้ (username) ตามที่กำหนด พร้อมรหัสผ่าน
- **Student**: ใช้รหัสนักศึกษา (studentId) เป็นชื่อผู้ใช้ และรหัสผ่านที่ได้รับจากครูนิเทศ

### บทบาทหลัก
- **Admin**: สร้างบัญชีครูนิเทศและผู้ควบคุม, ตรวจสอบข้อมูลการฝึกงานทั้งหมด
- **Teacher**: สร้างบัญชีนักศึกษา, ติดตามผลการประเมินและรายละเอียดการฝึกงาน
- **Supervisor**: บันทึกผลการประเมิน/สถานะ พร้อมสื่อสารกับครูนิเทศ
- **Student**: ตรวจสอบรายละเอียดการฝึกงานและคะแนนประเมินของตนเอง

### API สำคัญ
- `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`, `GET /api/auth/me`
- `POST /api/admin/users` (Admin) สร้างผู้ใช้บทบาทครู/ผู้ควบคุม
- `POST /api/teacher/students` (Teacher) สร้างนักศึกษา
- `GET /api/internships`, `POST /api/internships` (Admin/Teacher)
- `GET /api/evaluations`, `POST /api/evaluations` (Admin/Teacher/Supervisor)

ทุก endpoint จะตรวจสอบสิทธิ์จากคุกกี้ JWT และจำกัดข้อมูลตามบทบาทโดยอัตโนมัติ

### โครงสร้างที่น่าสนใจ
- `app/layout.js` — ตั้งค่าธีมและเมนูนำทางหลัก
- `app/(role)/` — หน้าแดชบอร์ดแยกตามบทบาท (admin/teacher/supervisor/student)
- `components/auth/` — ฟอร์มเข้าสู่ระบบ
- `components/admin/`, `components/teacher/`, `components/student/` — แบบฟอร์มและ UI เฉพาะบทบาท
- `components/dashboard/` — ตาราง/สรุปข้อมูลการฝึกงาน
- `lib/auth.js` — ฟังก์ชันจัดการรหัสผ่าน JWT และคุกกี้
- `models/` — สคีมา Mongoose สำหรับ User, Admin, Teacher, Student, Supervisor, Internship, Evaluation
- `app/api/**` — Route handlers ฝั่งเซิร์ฟเวอร์
- `scripts/seed-admin.mjs` — สคริปต์ seed บัญชีผู้ดูแล

### หมายเหตุเพิ่มเติม
- การเชื่อมต่อ MongoDB ถูก cache ผ่าน `globalThis` เพื่อรองรับสภาพแวดล้อม serverless
- `middleware.js` ใช้บังคับให้ผู้ใช้เข้าสู่ระบบก่อนเข้าถึงเส้นทางที่มีการจำกัดบทบาท
- ค่า `ADMIN_USERNAME` ต้องตั้งไว้ก่อนรัน `npm run seed:admin` เพื่อให้แอดมินสามารถเข้าสู่ระบบด้วยชื่อผู้ใช้ได้
