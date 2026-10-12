export type Method = 'local' | 'cookie' | 'http' | 'bff';
export type Scenario = 'login' | 'api' | 'reload' | 'xss' | 'refresh' | 'logout' | 'csrf';
export type NodeId = 'react' | 'store' | 'bff' | 'api' | 'auth';
export type Frame = { title:string; text:string; from:NodeId; to:NodeId; packet:string; code:string; browser:string; server:string; tone?:'risk'|'safe' };
export const methods: {id:Method; name:string; subtitle:string; title:string; description:string; benefit:string; risk:string; takeaway:string; location:string; visibility:string}[] = [
{id:'local',name:'Local Storage',subtitle:'ساده و ماندگار',title:'شروع آسان؛ دسترسی آسان‌تر.',description:'توکن را بعد از ورود در localStorage می‌گذاریم و در درخواست‌های React می‌خوانیم. پیاده‌سازی ساده است، اما همان دسترسی برای اسکریپت مخرب هم وجود دارد.',benefit:'بعد از رفرش و بستن مرورگر باقی می‌ماند.',risk:'یک XSS می‌تواند توکن را بخواند و خارج کند.',takeaway:'ماندگاری، به معنی امنیت نیست.',location:'localStorage',visibility:'قابل خواندن با JavaScript'},
{id:'cookie',name:'JS Cookie',subtitle:'تغییر ظرف، همان دسترسی',title:'کوکی به‌تنهایی محافظ نیست.',description:'وقتی document.cookie توکن را می‌نویسد، JavaScript می‌تواند آن را بخواند. حتی با Secure و SameSite هم امکان افزودن HttpOnly از JavaScript وجود ندارد.',benefit:'مرورگر کوکی منطبق را خودکار ارسال می‌کند.',risk:'هم دسترسی XSS داریم، هم نیاز به دفاع CSRF.',takeaway:'چه کسی کوکی را تنظیم می‌کند، مهم است.',location:'document.cookie',visibility:'قابل خواندن با JavaScript'},
{id:'http',name:'HttpOnly Cookie',subtitle:'کوکی تنظیم‌شده در سرور',title:'دسترسی JavaScript را قطع کن.',description:'سرور با Set-Cookie توکن را در کوکی HttpOnly قرار می‌دهد. React آن را نمی‌خواند؛ مرورگر برای API سازگار، خودکار ارسالش می‌کند. این نمونه، کوکی مستقیم API است.',benefit:'بدون پراکسی اضافه، خواندن مستقیم کوکی با JavaScript مسدود است.',risk:'API باید cookie auth و محافظت CSRF داشته باشد.',takeaway:'اگر API کوکی امن را پشتیبانی کند، الزاماً به BFF نیاز نیست.',location:'Server-set cookie',visibility:'خارج از دسترسی JavaScript'},
{id:'bff',name:'BFF',subtitle:'امنیت در برابر هزینه',title:'امنیت بیشتر؛ مسئولیت بیشتر.',description:'React فقط با بک‌اند هم‌دامنهٔ خودش حرف می‌زند. BFF توکن‌های access و refresh را نگه می‌دارد؛ مرورگر فقط یک شناسهٔ نشست تصادفی و غیرقابل‌خواندن با JavaScript دارد.',benefit:'توکن OAuth وارد کد و ذخیره‌سازی مرورگر نمی‌شود.',risk:'هزینهٔ میزبانی، نگهداری نشست، پایش، مقیاس‌پذیری و یک واسطهٔ دیگر در مسیر درخواست.',takeaway:'وقتی امنیت اولویت بالاتری دارد و هزینهٔ اجرا و نگهداری لایهٔ سرور را می‌پذیرید، BFF ارزش انتخاب دارد.',location:'Session ID only',visibility:'توکن‌ها فقط در سرور'}
];
export const scenarios: {id:Scenario;label:string;hint:string}[]=[{id:'login',label:'ورود کاربر',hint:'از شروع ورود تا آماده‌شدن نشست'},{id:'api',label:'درخواست به API',hint:'فرض: کاربر قبلاً وارد شده است'},{id:'reload',label:'رفرش صفحه',hint:'فرض: کاربر قبلاً وارد شده است'},{id:'xss',label:'تلاش XSS',hint:'فرض: اسکریپت مخرب در صفحه اجرا شده است'},{id:'refresh',label:'انقضای توکن',hint:'فرض: access token منقضی شده است'},{id:'logout',label:'خروج کاربر',hint:'فرض: کاربر قبلاً وارد شده است'},{id:'csrf',label:'درخواست از سایت دیگر',hint:'فرض: سایت مهاجم یک POST ارسال می‌کند'}];
export function frames(method:Method,scenario:Scenario):Frame[]{
const b=method==='bff', h=method==='http', c=method==='cookie';
const saved=b?'sid_demo · HttpOnly':h?'access_demo · HttpOnly':c?'access_demo · JS cookie':'access_demo · localStorage';
const backend=b?'access_demo + refresh_demo':'—';
const write=c?'document.cookie = `access=${token}; Secure; SameSite=Lax; Path=/`':h?'Set-Cookie: access=…; HttpOnly; Secure; SameSite=Lax; Path=/':'localStorage.setItem("access", token)';
const f=(title:string,text:string,from:NodeId,to:NodeId,packet:string,code:string,browser=saved,server=backend,tone?:'risk'|'safe'):Frame=>({title,text,from,to,packet,code,browser,server,tone});
if(scenario==='login')return b?[
f('شروع ورود در BFF','React کاربر را به مسیر ورود هم‌دامنه می‌فرستد. مسئولیت OAuth به سرور منتقل می‌شود.','react','bff','LOGIN','window.location.assign("/auth/login")','خالی','خالی'),
f('ورود در سرویس هویت','BFF با state و PKCE جریان Authorization Code را آغاز می‌کند؛ کاربر در سرویس هویت وارد می‌شود.','bff','auth','AUTHORIZE','Authorization Code + PKCE + state','خالی','تراکنش ورود'),
f('تبادل کد در سرور','پس از بررسی callback و state، BFF کد را با توکن‌ها مبادله می‌کند. مرورگر این توکن‌ها را دریافت نمی‌کند.','auth','bff','TOKENS','await exchangeCodeOnServer(code, verifier)','خالی',backend),
f('ساخت نشست امن','سرور توکن‌ها را به یک شناسهٔ تصادفی وصل می‌کند و فقط همان شناسه را در کوکی امن قرار می‌دهد.','bff','store','SESSION ID','Set-Cookie: __Host-session=sid_demo; HttpOnly; Secure; SameSite=Lax; Path=/'),
f('React آماده است','رابط فقط اطلاعات لازمِ کاربر را می‌گیرد. access token و refresh token در سرور باقی می‌مانند.','bff','react','USER DATA','GET /api/session → { user: { name: "Sara" } }',saved,backend,'safe')
]:[
f('آغاز ورود','کاربر وارد جریان احراز هویت می‌شود. جزئیات سرویس هویت برای تمرکز بر نگهداری توکن ساده شده‌اند.','react','auth','LOGIN','startSignIn()','خالی','—'),
f(h?'تنظیم کوکی در سرور':'دریافت access token',h?'API پس از احراز هویت، Set-Cookie می‌فرستد؛ توکن به JavaScript تحویل داده نمی‌شود.':'پس از احراز هویت، access token وارد محیط JavaScript مرورگر می‌شود.','auth',h?'store':'react',h?'SET-COOKIE':'ACCESS TOKEN',h?write:'const { accessToken } = await completeSignIn()',h?saved:'در اختیار JavaScript'),
f('نگهداری اعتبار ورود',h?'مرورگر کوکی HttpOnly را نگه می‌دارد؛ document.cookie آن را نشان نمی‌دهد.':'توکن ذخیره می‌شود. هر اسکریپتی با دسترسی به این origin می‌تواند آن را بخواند.',h?'auth':'react','store','SAVE',write,saved,'—',h?'safe':'risk'),
f('آماده برای درخواست','حالا سناریوی درخواست به API را انتخاب کنید تا نحوهٔ ارسال اعتبار را ببینید.','store','react','READY',h?'document.cookie // access cookie is hidden':'setAuthenticated(true)')];
if(scenario==='api')return b?[
f('درخواست هم‌دامنه','React تنها مسیر داخلی را می‌شناسد؛ هدر Authorization در فرانت‌اند ساخته نمی‌شود.','react','bff','REQUEST','fetch("/api/profile", { credentials: "same-origin" })'),
f('ارسال خودکار شناسهٔ نشست','مرورگر کوکی HttpOnly را همراه درخواست HTTPS می‌فرستد. BFF نشست و دسترسی کاربر را اعتبارسنجی می‌کند.','store','bff','SESSION ID','const session = await requireSession(request)'),
f('افزودن توکن در سرور','BFF از نشست، access token را پیدا می‌کند و به API مقصدِ مجاز می‌فرستد. این واسطه در مسیر درخواست به پایش و ظرفیت کافی نیاز دارد.','bff','api','BEARER TOKEN','Authorization: Bearer <server-side-access-token>'),
f('دریافت داده از API','API توکن و مجوز را بررسی می‌کند و داده را به BFF برمی‌گرداند.','api','bff','JSON','upstream → { name: "Sara" }'),
f('فقط داده به React می‌رسد','BFF پاسخ موردنیاز را برمی‌گرداند؛ توکن‌ها در پاسخ فرانت‌اند نیستند.','bff','react','USER DATA','return Response.json(profile, { headers: { "Cache-Control": "no-store" } })',saved,backend,'safe')
]:[
f(h||c?'کوکی را مرورگر می‌فرستد':'خواندن توکن',h?'JavaScript به مقدار کوکی دسترسی ندارد؛ مرورگر ارسال آن را مدیریت می‌کند.':c?'کوکی منطبق با دامنه، مسیر و SameSite خودکار به API ارسال می‌شود.':'React توکن را از محل نگهداری می‌گیرد تا به هدر درخواست اضافه کند.','store','react',h||c?'COOKIE':'READ TOKEN',h||c?'fetch("/api/profile", { credentials: "same-origin" })':'const token = localStorage.getItem("access")'),
f('درخواست مستقیم به API','در این نمونه، API و فرانت‌اند هم‌دامنه‌اند. API باید نوع اعتبار ارسالی را پشتیبانی کند.','react','api',h||c?'COOKIE':'BEARER TOKEN',h||c?'Cookie: access=access_demo':'Authorization: Bearer access_demo'),
f('اعتبارسنجی و دریافت پاسخ','API اعتبار و مجوز را بررسی می‌کند؛ React دادهٔ پروفایل را دریافت می‌کند.','api','react','USER DATA','200 OK → { name: "Sara" }')];
if(scenario==='reload')return [
f('صفحه دوباره بارگذاری می‌شود','رابط React دوباره ساخته می‌شود و باید وضعیت ورود کاربر را بازیابی کند.','react','react','RELOAD','window.location.reload()'),
f('اعتبار مرورگر هنوز موجود است',b?'شناسهٔ نشست در کوکی باقی است؛ هیچ توکن OAuth در مرورگر نیاز نیست.':'ذخیره‌سازی انتخاب‌شده با رفرش از بین نمی‌رود. اعتبار توکن هنوز باید در سرور بررسی شود.','store','react','RESTORE',b||h?'GET /api/session':'restoreAuthState()'),
f('بازیابی وضعیت کاربر','سرور نشست یا توکن را بررسی می‌کند و وضعیت ورود به UI برمی‌گردد.','react',b?'bff':'api','VALIDATE','200 OK → authenticated')];
if(scenario==='xss')return [
f('اجرای اسکریپت مخرب','این فقط شبیه‌سازی است؛ هیچ کد مخربی اجرا و هیچ داده‌ای ارسال نمی‌شود.','react','react','XSS','// simulated script execution'),
f(b||h?'خواندن کوکی مسدود می‌شود':'خواندن توکن امکان‌پذیر است',b||h?'HttpOnly مقدار کوکی را از document.cookie پنهان می‌کند.':'اسکریپت مخرب همان دسترسی JavaScript برنامه به محل نگهداری توکن را دارد.','react','store',b||h?'BLOCKED':'JS ACCESS',b||h?'document.cookie → no auth cookie':c?'document.cookie → "access=access_demo"':'localStorage.getItem("access") → "access_demo"',saved,backend,b||h?'safe':'risk'),
f(b?'توکن OAuth از مرورگر قابل سرقت نیست':h?'سرقت مستقیم کوکی متوقف شد':'اعتبار در معرض سوءاستفاده است',b?'access و refresh token در سرور هستند. با این حال XSS می‌تواند از نشست فعال درخواست بفرستد؛ جلوگیری از XSS همچنان لازم است.':h?'اسکریپت هنوز می‌تواند درخواست احرازشده ارسال کند؛ HttpOnly به معنی رفع XSS نیست.':'دسترسی غیرمجاز به توکن یا جریان درخواست می‌تواند به سوءاستفاده از حساب منجر شود.','react',b?'bff':'api',b||h?'SESSION REQUEST':'EXPOSURE',b||h?'// XSS prevention still required':'// client-side credential exposure',saved,backend,b||h?'safe':'risk')];
if(scenario==='refresh')return b?[
f('توکن API منقضی می‌شود','BFF انقضا را تشخیص می‌دهد یا یک پاسخ 401 معتبر از upstream دریافت می‌کند.','api','bff','EXPIRED','access token expired'),
f('تمدید فقط در سرور','BFF با refresh token سروری به سرویس هویت درخواست می‌دهد. برای یک نشست، تمدید هم‌زمان باید کنترل شود.','bff','auth','REFRESH','await refreshTokens(serverSession.refreshToken)'),
f('ذخیرهٔ توکن‌های جدید','توکن‌های تازه و refresh token چرخش‌یافته، مطابق سیاست سرویس هویت، در نشست سروری ذخیره می‌شوند.','auth','bff','NEW TOKENS','await sessions.update(sessionId, newTokens)',saved,'access_new + refresh_new'),
f('تکرار کنترل‌شدهٔ درخواست','BFF درخواست امن و قابل‌تکرار را یک بار تکرار می‌کند. اگر تمدید شکست بخورد، نشست باطل و ورود دوباره لازم است.','bff','api','RETRY','retrySafeRequestOnce()',saved,'access_new + refresh_new','safe')
]:[
f('access token منقضی می‌شود','API اعتبار منقضی را رد می‌کند؛ ماندن مقدار در storage آن را معتبر نمی‌کند.','api','react','401','401 Unauthorized'),
f('ذخیره‌سازی، راهکار تمدید نیست','این نمونهٔ مستقیم refresh token ندارد. افزودن آن به JavaScript یک اعتبار حساس دیگر را در همان محیط قرار می‌دهد.','react','store','EXPIRED','clearExpiredCredential()','خالی','—'),
f('ورود مجدد یا طراحی جداگانه','برای نشست پایدار، جریان تمدید باید جداگانه و متناسب با API و نیاز امنیتی طراحی شود؛ انتخاب محل ذخیره‌سازی به‌تنهایی کافی نیست.','react','auth','SIGN IN','startSignIn()','خالی','—')];
if(scenario==='logout')return b?[
f('درخواست خروج محافظت‌شده','React درخواست POST خروج را با دفاع CSRF به BFF می‌فرستد.','react','bff','LOGOUT','POST /auth/logout + CSRF protection'),
f('باطل‌کردن نشست در سرور','BFF رکورد نشست و توکن‌های نگهداری‌شده را حذف می‌کند و در صورت پشتیبانی، refresh token را revoke می‌کند.','bff','auth','REVOKE','await sessions.delete(id); await revokeIfSupported()','sid_demo · stale','حذف شده'),
f('پاک‌کردن کوکی','سرور با همان نام و مسیر، کوکی را منقضی می‌کند؛ نشست قبلی دیگر معتبر نیست.','bff','store','CLEAR','Set-Cookie: __Host-session=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax','خالی','حذف شده','safe')
]:[
f('شروع خروج',h?'React از API می‌خواهد کوکی HttpOnly را منقضی کند.':'React اعتبار محلی را پاک می‌کند.','react',h?'api':'store','LOGOUT',h?'POST /logout + CSRF protection':c?'document.cookie = "access=; Max-Age=0; Path=/; Secure; SameSite=Lax"':'localStorage.removeItem("access")',h?saved:'خالی'),
f('اعتبار محلی پاک شد','پاک‌کردن storage به‌تنهایی نسخهٔ سرقت‌شدهٔ access token را باطل نمی‌کند؛ انقضا یا ابطال سروری تعیین‌کننده است.',h?'api':'store','react','CLEARED',h?'Set-Cookie: access=; Max-Age=0; Path=/; HttpOnly; Secure':'setAuthenticated(false)','خالی','—')];
return [
f('درخواست از مبدأ دیگر','سایت مهاجم سعی می‌کند بدون قصد کاربر یک عملیات تغییردهنده اجرا کند.','auth',b?'bff':'api','CROSS-SITE POST','POST /api/change-email'),
f(b||h||c?'SameSite=Lax مانع ارسال کوکی می‌شود':'Bearer خودکار ارسال نمی‌شود',b||h||c?'در POST معمولیِ cross-site، مرورگر کوکی Lax را نمی‌فرستد. Same-site با same-origin یکسان نیست.':'توکن localStorage خودکار به درخواست سایت دیگر اضافه نمی‌شود.','store',b?'bff':'api','NO CREDENTIAL','Cookie / Authorization: absent',saved,backend,'safe'),
f('دفاع لایه‌ای در سرور',b||h||c?'برای عملیات حساس، Origin و CSRF token را نیز بررسی کنید؛ GET نباید تغییری در داده بدهد. SameSite به‌تنهایی همهٔ حالت‌ها را پوشش نمی‌دهد.':'API درخواست بدون اعتبار را رد می‌کند. این مزیت در برابر CSRF، خطر XSS را رفع نمی‌کند.',b?'bff':'api','react','REJECT','401 / 403 · reject request',saved,backend,'safe')];
}
