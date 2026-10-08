# React Race Lab

یک پروژهٔ React که عمداً race condition دارد. درخواست‌های جست‌وجو هم‌زمان اجرا می‌شوند و هر پاسخ بدون بررسی جدید یا قدیمی بودن، با `setResults(data.results)` داخل همان state نوشته می‌شود.

## اجرا

Node.js نسخهٔ 22.12 یا جدیدتر نیاز است.

```bash
npm install
npm run dev
```

آدرس: http://127.0.0.1:5173

API محلی همراه Vite اجرا می‌شود؛ سرور جداگانه، حساب کاربری یا API key لازم نیست.

## دیدن خطا

1. دکمهٔ «اجرای rea → react» را بزن. A برای `rea` شروع می‌شود و B حدود ۱۲۰ میلی‌ثانیه بعد برای `react`.
2. هر درخواست مستقل از بقیه، تأخیری تصادفی بین ۴۰۰ و ۲۴۰۰ میلی‌ثانیه می‌گیرد.
3. اگر B زودتر برسد و بعد A برسد، input همچنان `react` است اما نتیجه‌ها مربوط به `rea` می‌شوند.
4. نشان «پاسخ قدیمی نمایش داده شده» و ترتیب رویدادها این وضعیت را آشکار می‌کنند.
5. اگر ترتیب پاسخ‌ها A سپس B بود، دوباره اجرا کن؛ بروز این race در هر بار اجرا تضمین نشده است.

سرچ دستی هم فعال است. با هر تغییر عبارت غیرخالی درخواست جدید شروع می‌شود؛ debounce وجود ندارد. دادهٔ نمونه برای `rea` شامل عنوان‌هایی مثل `Reading JavaScript` و `Real-time search` است که در نتیجه‌های `react` نیستند، پس بازنویسی پاسخ قدیمی قابل مشاهده است.

## فایل اصلی تمرین

`src/App.jsx`، داخل `useEffect`:

```jsx
fetch(`/api/search?${params}`, { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    setResults(data.results); // intentionally vulnerable to stale responses
  });
```

هیچ AbortController، cleanup درخواست، ignore flag یا شرط latest-request پیاده‌سازی نشده است. requestId صرفاً برای نمایش لاگ است. نشان پاسخ قدیمی صرفاً مقایسهٔ نمایشی است و جلوی نوشتن هیچ پاسخی را نمی‌گیرد.

API یک HTTP endpoint واقعی است؛ بنابراین بعداً می‌توانی تمرین اصلاح با AbortController را روی همین fetch انجام بدهی. این نسخه عمداً راه‌حل را شامل نمی‌شود.

تأخیرها و داده‌ها: `server/search-api.mjs`.

## ساخت و پیش‌نمایش

```bash
npm run build
npm run preview
```

آدرس پیش‌نمایش: http://127.0.0.1:4173

پلاگین Vite، API را در حالت dev و preview فراهم می‌کند. برای اجرا روی هاست استاتیکِ صرف باید API را جداگانه میزبانی کنی؛ فایل‌های dist به تنهایی API ندارند.

مراجع: [React useEffect](https://react.dev/reference/react/useEffect) و [Vite Getting Started](https://vite.dev/guide/).
