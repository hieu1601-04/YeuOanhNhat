# I LOVE YOU — 3D Love Rain

Một trang web 3D nhỏ dùng Three.js:
- Kéo chuột để xoay không gian.
- Lăn bánh xe để phóng to / thu nhỏ.
- Nền sao 3D.
- Chữ `I LOVE YOU` dạng khối 3D rơi liên tục từ trên xuống.
- Chạy được trên desktop và mobile.

## Chạy bằng VS Code

Yêu cầu: đã cài Node.js.

Mở Terminal tại thư mục project rồi chạy:

```bash
npm install
npm run dev
```

Sau đó mở đường link Vite hiển thị, thường là:

```text
http://localhost:5173
```

## Chỉnh câu chữ

Mở `src/main.js` và sửa:

```js
const MESSAGE = 'I LOVE YOU';
```

## Chỉnh tốc độ sinh chữ

```js
const SPAWN_EVERY_MS = 240;
```

Số càng nhỏ -> chữ xuất hiện càng nhiều.

## Chỉnh tốc độ rơi

```js
const FALL_MIN = 2.3;
const FALL_MAX = 5.2;
```

## Build để đưa lên web

```bash
npm run build
```

File web sau build nằm trong thư mục `dist`.
