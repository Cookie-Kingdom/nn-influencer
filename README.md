# เนิร์ดเนื้อ Influencer Directory

เว็บแอปฐานข้อมูล Influencer สำหรับทีมดูแลลูกค้า — เก็บว่าใครเป็นใคร อยู่แพลตฟอร์มไหน และคัดลอกที่อยู่จัดส่งไปแปะได้ในคลิกเดียว

## ฟีเจอร์

- ตารางรายชื่อพร้อมค้นหา กรองตามสถานะ/แพลตฟอร์ม และเรียงลำดับ
- ปุ่มคัดลอกที่อยู่จัดส่งแบบก้อนเดียว (ชื่อผู้รับ + เบอร์ + ที่อยู่) พร้อมแปะในระบบขนส่ง
- ให้ดาว 1-5 กดจากในตารางได้ทันที
- 1 คนมีได้หลายแพลตฟอร์ม (IG / TikTok / Facebook / YouTube / Lemon8 / X)
- นำเข้า CSV (รองรับหัวตารางไทย-อังกฤษ และไฟล์ encoding windows-874 จาก Excel ไทย) และส่งออก CSV
- แก้ที่เครื่องใครก็อัปเดตให้ทุกคนที่เปิดอยู่เห็นทันที (Supabase Realtime)

## สแตก

ไฟล์ HTML ไฟล์เดียว ไม่มี build step — โหลด `@supabase/supabase-js` จาก CDN และคุยกับ Supabase ตรงๆ

## การตั้งค่า

ค่าเชื่อมต่ออยู่ที่ต้นแท็ก `<script>` ใน `index.html`

```js
const SUPABASE_URL = "https://<project-ref>.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_...";
```

publishable key ออกแบบมาให้เปิดเผยในฝั่ง client ได้ ความปลอดภัยจริงอยู่ที่ RLS ในฐานข้อมูล

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
python -m http.server 5500
# เปิด http://localhost:5500
```
