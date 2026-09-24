# เนิร์ดเนื้อ Influencer Directory

เว็บแอปฐานข้อมูล Influencer สำหรับทีมดูแลลูกค้า — เก็บว่าใครเป็นใคร อยู่แพลตฟอร์มไหน และคัดลอกที่อยู่จัดส่งไปแปะได้ในคลิกเดียว

## ฟีเจอร์

- ตารางรายชื่อพร้อมค้นหา กรองตามสถานะ/แพลตฟอร์ม และเรียงลำดับ
- ปุ่มคัดลอกที่อยู่จัดส่งแบบก้อนเดียว (ชื่อผู้รับ + เบอร์ + ที่อยู่) พร้อมแปะในระบบขนส่ง
- ให้ดาว 1-5 กดจากในตารางได้ทันที
- นับจำนวนชุดเนื้อที่ส่งไปแล้ว (กด + ทีละชุด หรือพิมพ์ตัวเลขในหน้าแก้ไข) พร้อมวันที่ส่งครั้งสุดท้าย
- เปลี่ยนสถานะจากดรอปดาวน์ในตารางได้เลย ไม่ต้องเปิดหน้าแก้ไข
- 1 คนมีได้หลายแพลตฟอร์ม (IG / TikTok / Facebook / YouTube / Lemon8 / X)
- นำเข้า CSV (รองรับหัวตารางไทย-อังกฤษ และไฟล์ encoding windows-874 จาก Excel ไทย) และส่งออก CSV
- แก้ที่เครื่องใครก็อัปเดตให้ทุกคนที่เปิดอยู่เห็นทันที (Supabase Realtime)

## สแตก

ไฟล์ HTML ไฟล์เดียว ไม่มี build step — โหลด `@supabase/supabase-js` จาก CDN และคุยกับ Supabase ตรงๆ

## การตั้งค่า

ค่าเชื่อมต่อเก็บใน environment variables สองตัว

| ตัวแปร | ตัวอย่าง |
| --- | --- |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |

`build.js` จะอ่านค่าพวกนี้ไปแทนที่ placeholder ใน `index.html` แล้วเขียนผลลัพธ์ลง `dist/` — ถ้าตัวแปรไม่ครบ build จะ fail ทันทีแทนที่จะ deploy เว็บที่ใช้งานไม่ได้ออกไป

บน Vercel ตั้งค่าที่ Settings → Environment Variables (build command กับ output directory ถูกกำหนดไว้แล้วใน `vercel.json`)

เปลี่ยนโปรเจกต์ Supabase = แก้ค่าใน Vercel แล้ว redeploy ไม่ต้องแตะโค้ด

publishable key ออกแบบมาให้เปิดเผยในฝั่ง client ได้อยู่แล้ว (สุดท้ายมันต้องถูกส่งไปถึงเบราว์เซอร์) ความปลอดภัยจริงอยู่ที่ RLS + allowlist ในฐานข้อมูล

## โครงสร้างฐานข้อมูล

ตาราง `public.influencers`

| คอลัมน์ | ชนิด | หมายเหตุ |
| --- | --- | --- |
| `id` | uuid | primary key |
| `name` | text | ต้องมี |
| `owner` | text | ผู้ดูแลในทีม |
| `platforms` | jsonb | `[{platform, handle, followers}]` |
| `phone` / `line_id` | text | ช่องทางติดต่อ |
| `recipient_name` | text | ชื่อผู้รับพัสดุ (ถ้าต่างจากชื่อ) |
| `address_text` | text | ที่อยู่จัดส่งเต็ม |
| `status` | text | `new` / `waiting` / `confirmed` / `shipped` / `closed` / `declined` |
| `rating` | smallint | 0-5 |
| `sets_sent` | integer | ส่งเนื้อให้แล้วกี่ชุด (กด +/− ในตารางได้) |
| `last_sent_on` | date | วันที่ส่งครั้งสุดท้าย (กด + จะตั้งเป็นวันนี้ให้) |
| `notes` | text | หมายเหตุ |
| `created_at` / `updated_at` | timestamptz | `updated_at` อัปเดตด้วย trigger |

## ระบบสิทธิ์

สองชั้น:

1. ต้องล็อกอินผ่าน Supabase Auth (ทีมใช้บัญชีเดียวร่วมกันได้)
2. อีเมลของบัญชีนั้นต้องอยู่ในตาราง `private.allowed_emails` ซึ่งอยู่นอก schema ที่ REST API มองเห็น ไคลเอนต์แก้ไม่ได้

RLS policy ทุกข้อบนตาราง `influencers` เรียก `private.is_team_member()` เพราะฉะนั้นคนที่ล็อกอินแต่ไม่อยู่ใน allowlist จะไม่เห็นข้อมูลเลย

เพิ่มสมาชิกใหม่ (รันใน Supabase SQL Editor):

```sql
insert into private.allowed_emails (email, note)
values (lower('someone@example.com'), 'ชื่อคน');
```

## รันในเครื่อง

```bash
cp .env.example .env    # แล้วใส่ค่าจริงของโปรเจกต์ Supabase
node build.js
cd dist && python -m http.server 5500
# เปิด http://localhost:5500
```
