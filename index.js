const TOKEN = '8645931418:AAE-oWacVIm98KdmNcQdZOLCiXE3ouRTHtQ';
const API = 'https://api.telegram.org/bot' + TOKEN;
const SITE = 'http://applysara.ir';
const ADMIN_PASS = 'change-me-now-123';
const NOTIFY_SECRET = 'as-notify-7391';
let adminId = null;

async function tg(method, params) {
  const r = await fetch(API + '/' + method, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
  return r.json();
}
function send(chatId, text, kb) {
  const p = { chat_id: chatId, text: text, parse_mode: 'HTML' };
  if (kb) p.reply_markup = kb;
  return tg('sendMessage', p);
}
const mainKb = { keyboard: [[{ text: '💰 قیمت‌ها' }, { text: '📝 نحوه سفارش' }], [{ text: '🌍 کشوریاب رایگان' }, { text: '⏱ زمان تحویل' }], [{ text: '📞 پشتیبانی' }, { text: '❓ SOP چیست؟' }]], resize_keyboard: true };

async function loadAdmin() {
  try {
    const r = await fetch(SITE + '/api/botadmin.php?pass=' + encodeURIComponent(ADMIN_PASS));
    const d = await r.json();
    if (d.chat_id) adminId = String(d.chat_id);
  } catch (e) {}
}
async function saveAdmin(id) {
  adminId = String(id);
  try {
    await fetch(SITE + '/api/botadmin.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pass: ADMIN_PASS, chat_id: String(id) }) });
  } catch (e) {}
}

function answer(text, firstName) {
  if (text === '/start') return 'سلام ' + firstName + '! 👋\n\nبه <b>اپلای‌سرا</b> خوش اومدی 🎓\nنگارش تخصصی SOP، انگیزه‌نامه و اسناد اپلای\n\nاز منوی پایین انتخاب کن یا سؤالت رو بنویس:';
  if (/قیمت|تعرفه|هزینه|💰/.test(text)) return '💰 <b>تعرفه‌های اپلای‌سرا:</b>\n\n📦 <b>پایه — ۴۹۰ هزار تومان</b>\nیک SOP کامل + یک نوبت بازنویسی\n\n🚀 <b>حرفه‌ای — ۸۹۰ هزار تومان</b>\nSOP + انگیزه‌نامه + ویرایش نامحدود ۳ روز\n\n💎 <b>فول اپلای — ۱.۴۹ میلیون تومان</b>\nهمه اسناد + ویرایش نامحدود ۱ هفته + پیگیری فوری\n\n👈 سفارش: applysara.ir';
  if (/سفارش|📝|چطور|شروع/.test(text)) return '📝 <b>مراحل سفارش:</b>\n\n۱️⃣ برو به سایت applysara.ir\n۲️⃣ فرم ۵ مرحله‌ای رو به فارسی پر کن\n۳️⃣ پرداخت امن با زرین‌پال\n۴️⃣ پیش‌نویس رو ۲۴-۴۸ ساعته بگیر\n۵️⃣ بازخورد بده تا نهایی بشه\n\nهمین الان شروع کن: applysara.ir';
  if (/کشوریاب|کشور|🌍/.test(text)) return '🌍 <b>کشوریاب رایگان اپلای‌سرا</b>\n\nبا ۵ سؤال کوتاه بهت میگیم کدوم کشورها برای بودجه، معدل و شرایط تو مناسب‌ترن — <b>کاملاً رایگان!</b>\n\n👈 امتحان کن: applysara.ir';
  if (/زمان|تحویل|⏱/.test(text)) return '⏱ <b>زمان تحویل:</b>\n\nپیش‌نویس اول بین <b>۲۴ تا ۴۸ ساعت</b> آماده میشه.\n\nبسته فول اپلای پیگیری فوری داره 🚀';
  if (/sop|اس او پی|❓/i.test(text)) return '📄 <b>SOP چیست؟</b>\n\nStatement of Purpose مهم‌ترین سند اپلای توئه — نامه‌ای که به دانشگاه میگه کی هستی، چی خوندی و چرا باید تو رو قبول کنن.\n\nما از صفر و بر اساس داستان واقعی خودت می‌نویسیمش — نه ترجمه، نه قالب تکراری ✨';
  if (/پشتیبان|تماس|مشاوره|📞|شماره/.test(text)) return '📞 <b>پشتیبانی اپلای‌سرا</b>\n\nپیامت رو همینجا بنویس، تیم ما در اسرع وقت جواب میده!\n\n☎️ تماس مستقیم: 09128995799';
  if (/سلام|درود/.test(text)) return 'سلام ' + firstName + '! 👋 چه کمکی می‌تونم بکنم؟\n\nاز منوی پایین انتخاب کن 👇';
  if (/ممنون|مرسی|تشکر/.test(text)) return 'خواهش می‌کنم! 🌟 موفق باشی. سؤال دیگه‌ای داشتی در خدمتم.';
  return null;
}

async function handle(u) {
  const msg = u.message;
  if (!msg) return;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const firstName = (msg.from && msg.from.first_name) || 'دوست عزیز';

  if (text.indexOf('/admin ') === 0) {
    if (text.slice(7).trim() === ADMIN_PASS) {
      await saveAdmin(chatId);
      await send(chatId, '✅ شما به عنوان ادمین ثبت شدید!\n\nاز این به بعد نوتیف لیدها و پیام مشتری‌ها به همینجا میاد.\n\nدستورات:\n/stats — آمار سایت');
    } else {
      await send(chatId, '❌ رمز اشتباه است.');
    }
    return;
  }
  if (text === '/myid') { await send(chatId, '🆔 <code>' + chatId + '</code>'); return; }
  if (text === '/stats') {
    if (adminId && String(chatId) === adminId) {
      try {
        const r = await fetch(SITE + '/api/lead.php?list=1&pass=' + encodeURIComponent(ADMIN_PASS));
        const d = await r.json();
        const last = (d.leads || []).slice(0, 5).map(function(l){ return '• ' + l.name + ' — ' + l.phone; }).join('\n');
        await send(chatId, '📊 <b>آمار اپلای‌سرا</b>\n\n👥 کل لیدهای کشوریاب: ' + d.total + '\n📅 لید امروز: ' + d.today + '\n\nآخرین لیدها:\n' + last);
      } catch (e) { await send(chatId, '⚠️ خطا در دریافت آمار از سایت.'); }
    }
    return;
  }

  const reply = answer(text, firstName);
  if (reply) { await send(chatId, reply, mainKb); return; }

  await send(chatId, '✅ پیامت دریافت شد!\n\nتیم پشتیبانی به زودی همینجا جوابت رو میده.\nمعمولاً کمتر از ۲ ساعت ⏳', mainKb);
  if (adminId && adminId !== String(chatId)) {
    const uname = msg.from && msg.from.username ? '@' + msg.from.username : 'بدون یوزرنیم';
    await send(adminId, '💬 <b>پیام جدید از مشتری:</b>\n\n👤 ' + firstName + ' (' + uname + ')\n🆔 <code>' + chatId + '</code>\n\n📩 «' + text + '»');
  }
}

async function poll() {
  await loadAdmin();
  try { await fetch(API + '/deleteWebhook'); } catch (e) {}
  let offset = 0;
  console.log('ApplySara bot polling started');
  while (true) {
    try {
      const r = await fetch(API + '/getUpdates?timeout=50&offset=' + offset);
      const d = await r.json();
      const arr = d.result || [];
      for (let i = 0; i < arr.length; i++) {
        offset = arr[i].update_id + 1;
        try { await handle(arr[i]); } catch (e) { console.error('handle err', e.message); }
      }
    } catch (e) {
      await new Promise(function(res){ setTimeout(res, 3000); });
    }
  }
}

const http = require('http');
http.createServer(function (req, res) {
  if (req.method === 'POST' && req.url === '/notify') {
    let body = '';
    req.on('data', function(c){ body += c; });
    req.on('end', async function () {
      try {
        const d = JSON.parse(body || '{}');
        if (d.secret !== NOTIFY_SECRET) { res.writeHead(403); return res.end('{"ok":false}'); }
        if (!adminId) await loadAdmin();
        if (adminId) await tg('sendMessage', { chat_id: adminId, text: String(d.text || '').slice(0, 3800) });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch (e) { res.writeHead(500); res.end('{"ok":false}'); }
    });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ApplySara Bot OK');
}).listen(process.env.PORT || 3000);

poll();

