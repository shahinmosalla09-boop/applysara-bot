const TOKEN = '8645931418:AAE-oWacVIm98KdmNcQdZOLCiXE3ouRTHtQ';
const API = 'https://api.telegram.org/bot' + TOKEN;
const SITE = 'http://applysara.ir';
const ADMIN_PASS = 'change-me-now-123';
const NOTIFY_SECRET = 'as-notify-7391';
const BOT_SECRET = 'as-bot-8267';
let adminId = null;
const S = new Map();

async function tg(method, params) {
  const r = await fetch(API + '/' + method, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
  return r.json();
}
function send(chatId, text, kb) {
  const p = { chat_id: chatId, text: text, parse_mode: 'HTML' };
  if (kb) p.reply_markup = kb;
  return tg('sendMessage', p);
}
const mainKb = { keyboard: [[{ text: '🛒 ثبت سفارش' }], [{ text: '💰 قیمت‌ها' }, { text: '🌍 کشوریاب رایگان' }], [{ text: '⏱ زمان تحویل' }, { text: '❓ SOP چیست؟' }], [{ text: '📞 پشتیبانی' }]], resize_keyboard: true };

const PLANS = {
  paye: { t: 'پایه', p: '۴۹۰ هزار تومان', d: 'یک SOP کامل + یک نوبت بازنویسی' },
  herfei: { t: 'حرفه‌ای', p: '۸۹۰ هزار تومان', d: 'SOP + انگیزه‌نامه + ویرایش نامحدود ۳ روز' },
  full: { t: 'فول اپلای', p: '۱.۴۹ میلیون تومان', d: 'همه اسناد + ویرایش نامحدود ۱ هفته + پیگیری فوری' }
};

const OSTEPS = [
  { k: 'name', q: '👤 <b>مرحله ۱ از ۸</b>\n\nنام و نام خانوادگی‌ت رو بنویس:' },
  { k: 'phone', q: '📱 <b>مرحله ۲ از ۸</b>\n\nشماره موبایلت رو بنویس (مثلاً 09123456789):' },
  { k: 'degree', q: '🎓 <b>مرحله ۳ از ۸</b>\n\nمقطع و رشته هدفت چیه؟\n(مثلاً: کارشناسی ارشد مهندسی کامپیوتر)' },
  { k: 'target', q: '🌍 <b>مرحله ۴ از ۸</b>\n\nکشور و دانشگاه(های) هدفت؟\n(مثلاً: آلمان — TU Munich و RWTH)' },
  { k: 'edu', q: '📚 <b>مرحله ۵ از ۸</b>\n\nسوابق تحصیلی: دانشگاه، رشته و معدل فعلیت رو بنویس:' },
  { k: 'work', q: '💼 <b>مرحله ۶ از ۸</b>\n\nسوابق کاری، پژوهشی یا مقاله (اگه نداری بنویس «ندارم»):' },
  { k: 'goal', q: '🎯 <b>مرحله ۷ از ۸</b>\n\nانگیزه و هدفت از این رشته و کشور رو در چند جمله بنویس:' },
  { k: 'deadline', q: '⏰ <b>مرحله ۸ از ۸</b>\n\nددلاین اپلایت کی هست؟ (مثلاً: ۱۵ دسامبر ۲۰۲۶)' }
];

const CF_Q = [
  { k: 'degree', q: '🎓 <b>سؤال ۱ از ۵</b> — مقطع تحصیلی هدف:', opts: [['کارشناسی', 'bachelor'], ['کارشناسی ارشد', 'master'], ['دکتری', 'phd']] },
  { k: 'gpa', q: '📊 <b>سؤال ۲ از ۵</b> — معدل تحصیلی:', opts: [['بالا (۱۶+)', '3'], ['متوسط (۱۴-۱۶)', '2'], ['پایین‌تر از ۱۴', '1']] },
  { k: 'budget', q: '💶 <b>سؤال ۳ از ۵</b> — بودجه سالانه:', opts: [['کم (تا ۵ هزار یورو)', '1'], ['متوسط (۵-۱۵ هزار)', '2'], ['بالا (۱۵+ هزار)', '3']] },
  { k: 'lang', q: '🗣 <b>سؤال ۴ از ۵</b> — وضعیت زبان:', opts: [['مدرک خوب دارم', 'en-strong'], ['متوسط / در حال گرفتن', 'en-weak'], ['مدرک ندارم', 'none']] },
  { k: 'priority', q: '⭐ <b>سؤال ۵ از ۵</b> — مهم‌ترین اولویت:', opts: [['کمترین هزینه', 'cheap'], ['کار و اقامت', 'work'], ['پذیرش سریع', 'fast'], ['اعتبار دانشگاه', 'prestige']] }
];

const CF_C = [
  { name: 'آلمان', flag: '🇩🇪', b: 1, g: 2, l: 'medium', tags: ['cheap', 'prestige'], info: 'شهریه نزدیک رایگان در دانشگاه دولتی؛ اقامت جویندگی کار ۱۸ ماهه' },
  { name: 'هلند', flag: '🇳🇱', b: 3, g: 2, l: 'strong', tags: ['prestige', 'work'], info: 'برنامه‌های انگلیسی گسترده؛ اقامت کار ۱ ساله بعد تحصیل' },
  { name: 'ایتالیا', flag: '🇮🇹', b: 1, g: 1, l: 'medium', tags: ['cheap', 'fast'], info: 'شهریه بر اساس درآمد خانواده؛ پذیرش ساده‌تر' },
  { name: 'لهستان', flag: '🇵🇱', b: 1, g: 1, l: 'medium', tags: ['cheap', 'fast'], info: 'از ارزان‌ترین‌های اروپا؛ جامعه ایرانی رو به رشد' },
  { name: 'مجارستان', flag: '🇭🇺', b: 2, g: 1, l: 'medium', tags: ['cheap', 'fast'], info: 'بورسیه دولتی Stipendium Hungaricum' },
  { name: 'چک', flag: '🇨🇿', b: 1, g: 1, l: 'medium', tags: ['cheap'], info: 'رایگان به زبان چکی؛ کیفیت خوب' },
  { name: 'کانادا', flag: '🇨🇦', b: 3, g: 2, l: 'strong', tags: ['work', 'prestige'], info: 'روشن‌ترین مسیر اقامت دائم' },
  { name: 'ترکیه', flag: '🇹🇷', b: 2, g: 1, l: 'medium', tags: ['fast', 'cheap'], info: 'نزدیک ایران؛ اپلای سریع' },
  { name: 'گرجستان', flag: '🇬🇪', b: 1, g: 1, l: 'basic', tags: ['cheap', 'fast'], info: 'مقرون‌به‌صرفه به‌ویژه پزشکی' },
  { name: 'مالزی', flag: '🇲🇾', b: 1, g: 1, l: 'basic', tags: ['cheap', 'fast'], info: 'انگلیسی‌زبان با هزینه زندگی پایین' }
];
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
async function notifyAdmin(text) {
  if (!adminId) await loadAdmin();
  if (adminId) { try { await tg('sendMessage', { chat_id: adminId, text: text, parse_mode: 'HTML' }); } catch (e) {} }
}

function startOrder(chatId) {
  S.set(chatId, { flow: 'order', step: -1, data: {} });
  const kb = { inline_keyboard: [
    [{ text: '📦 پایه — ۴۹۰ هزار تومان', callback_data: 'plan:paye' }],
    [{ text: '🚀 حرفه‌ای — ۸۹۰ هزار تومان', callback_data: 'plan:herfei' }],
    [{ text: '💎 فول اپلای — ۱.۴۹ میلیون تومان', callback_data: 'plan:full' }],
    [{ text: '❌ انصراف', callback_data: 'cancel' }]
  ] };
  return send(chatId, '🛒 <b>ثبت سفارش اپلای‌سرا</b>\n\nاول بسته‌ت رو انتخاب کن:\n\n📦 <b>پایه:</b> ' + PLANS.paye.d + '\n🚀 <b>حرفه‌ای:</b> ' + PLANS.herfei.d + '\n💎 <b>فول اپلای:</b> ' + PLANS.full.d, kb);
}

function orderSummary(d) {
  return '📋 <b>خلاصه سفارش:</b>\n\n' +
    '📦 بسته: ' + PLANS[d.plan].t + ' — ' + PLANS[d.plan].p + '\n' +
    '👤 نام: ' + d.name + '\n' +
    '📱 موبایل: ' + d.phone + '\n' +
    '🎓 مقطع/رشته: ' + d.degree + '\n' +
    '🌍 هدف: ' + d.target + '\n' +
    '📚 سوابق تحصیلی: ' + d.edu + '\n' +
    '💼 سوابق کاری: ' + d.work + '\n' +
    '🎯 انگیزه: ' + d.goal + '\n' +
    '⏰ ددلاین: ' + d.deadline;
}

async function finishOrder(chatId, sess) {
  const d = sess.data;
  const code = 'AS-' + (100000 + Math.floor(Math.random() * 900000));
  d.order_code = code;
  d.chat_id = String(chatId);
  try {
    await fetch(SITE + '/api/botorder.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ secret: BOT_SECRET }, d)) });
  } catch (e) {}
  await send(chatId, '🎉 <b>سفارشت با موفقیت ثبت شد!</b>\n\n🧾 کد پیگیری: <b>' + code + '</b>\n📦 بسته: ' + PLANS[d.plan].t + ' — ' + PLANS[d.plan].p + '\n\n💳 <b>مرحله بعد — پرداخت:</b>\nلینک پرداخت امن (زرین‌پال) به زودی همینجا برات ارسال میشه و همکار ما برای هماهنگی نهایی باهات تماس می‌گیره.\n\n☎️ پشتیبانی: 09128995799\n\nممنون که اپلای‌سرا رو انتخاب کردی 🌟', mainKb);
  await notifyAdmin('🛒 <b>سفارش جدید از بات!</b>\n\n🧾 ' + code + '\n' + orderSummary(d) + '\n\n🆔 چت مشتری: <code>' + chatId + '</code>\n\n⚡️ برای ارسال لینک پرداخت و هماهنگی، با مشتری تماس بگیر.');
  S.delete(chatId);
}

function startCF(chatId) {
  S.set(chatId, { flow: 'cf', step: -2, data: {} });
  return send(chatId, '🌍 <b>کشوریاب رایگان اپلای‌سرا</b> 🎁\n\nبا چند سؤال کوتاه، بهترین کشورها رو برای شرایطت پیدا می‌کنیم — <b>کاملاً رایگان!</b>\n\n👤 اول نام و نام خانوادگی‌ت رو بنویس:');
}

function cfAsk(chatId, idx) {
  const q = CF_Q[idx];
  const kb = { inline_keyboard: q.opts.map(function (o, i) { return [{ text: o[0], callback_data: 'cf:' + idx + ':' + i }]; }) };
  return send(chatId, q.q, kb);
}

function cfScore(c, a) {
  let s = 0;
  s += c.b <= Number(a.budget) ? 3 : -(c.b - Number(a.budget)) * 2;
  s += Number(a.gpa) >= c.g ? 2 : -2;
  const lm = { 'en-strong': { strong: 2, medium: 2, basic: 2 }, 'en-weak': { strong: -1, medium: 2, basic: 2 }, 'none': { strong: -2, medium: 0, basic: 2 } };
  s += lm[a.lang][c.l];
  if (c.tags.indexOf(a.priority) >= 0) s += 3;
  return s;
}

async function finishCF(chatId, sess) {
  const a = sess.data;
  const ranked = CF_C.map(function (c) { return Object.assign({}, c, { score: cfScore(c, a) }); }).sort(function (x, y) { return y.score - x.score; }).slice(0, 3);
  let out = '🎯 <b>' + a.name.split(' ')[0] + ' عزیز، نتیجه تحلیل شرایط تو:</b>\n';
  ranked.forEach(function (c, i) {
    const pct = Math.max(45, Math.min(97, Math.round(((c.score + 8) / 18) * 100)));
    out += '\n' + (i === 0 ? '🏆 ' : (i + 1) + '- ') + c.flag + ' <b>' + c.name + '</b> — ' + pct + '٪ تطابق\n' + c.info + '\n';
  });
  out += '\n💡 برای نوشتن SOP حرفه‌ای برای این کشورها، از منو «🛒 ثبت سفارش» رو بزن!';
  await send(chatId, out, mainKb);
  try {
    await fetch(SITE + '/api/lead.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: a.name, phone: a.phone, field: 'bot', degree: a.degree, gpa: a.gpa, budget: a.budget, lang: a.lang, priority: a.priority, results: ranked.map(function (c) { return c.name; }).join('، ') }) });
  } catch (e) {}
  await notifyAdmin('🎯 <b>لید جدید کشوریاب (بات)</b>\n\n👤 ' + a.name + '\n📱 ' + a.phone + '\n🌍 ' + ranked.map(function (c) { return c.name; }).join('، '));
  S.delete(chatId);
}
function answer(text, firstName) {
  if (/قیمت|تعرفه|هزینه|💰/.test(text)) return '💰 <b>تعرفه‌های اپلای‌سرا:</b>\n\n📦 <b>پایه — ۴۹۰ هزار تومان</b>\n' + PLANS.paye.d + '\n\n🚀 <b>حرفه‌ای — ۸۹۰ هزار تومان</b>\n' + PLANS.herfei.d + '\n\n💎 <b>فول اپلای — ۱.۴۹ میلیون تومان</b>\n' + PLANS.full.d + '\n\n👈 برای ثبت سفارش از منو «🛒 ثبت سفارش» رو بزن!';
  if (/زمان|تحویل|⏱/.test(text)) return '⏱ <b>زمان تحویل:</b>\n\nپیش‌نویس اول بین <b>۲۴ تا ۴۸ ساعت</b> آماده میشه.\nبسته فول اپلای پیگیری فوری داره 🚀';
  if (/sop|اس او پی|❓/i.test(text)) return '📄 <b>SOP چیست؟</b>\n\nStatement of Purpose مهم‌ترین سند اپلای توئه — نامه‌ای که به دانشگاه میگه کی هستی و چرا باید قبولت کنن.\n\nما از صفر بر اساس داستان خودت می‌نویسیمش ✨';
  if (/پشتیبان|تماس|مشاوره|📞|شماره/.test(text)) return '📞 <b>پشتیبانی اپلای‌سرا</b>\n\nپیامت رو همینجا بنویس، در اسرع وقت جواب میدیم!\n\n☎️ تماس مستقیم: 09128995799';
  if (/سلام|درود/.test(text)) return 'سلام ' + firstName + '! 👋 چه کمکی می‌تونم بکنم؟\n\nاز منوی پایین انتخاب کن 👇';
  if (/ممنون|مرسی|تشکر/.test(text)) return 'خواهش می‌کنم! 🌟 موفق باشی.';
  return null;
}

async function handleCallback(cb) {
  const chatId = cb.message.chat.id;
  const data = cb.data || '';
  try { await tg('answerCallbackQuery', { callback_query_id: cb.id }); } catch (e) {}
  const sess = S.get(chatId);

  if (data === 'cancel') { S.delete(chatId); return send(chatId, '❌ عملیات لغو شد. هر وقت خواستی از منو شروع کن!', mainKb); }

  if (data.indexOf('plan:') === 0 && sess && sess.flow === 'order') {
    sess.data.plan = data.slice(5);
    sess.step = 0;
    await send(chatId, '✅ بسته <b>' + PLANS[sess.data.plan].t + '</b> انتخاب شد!\n\n📝 حالا چند تا سؤال کوتاه — هر جا خواستی لغو کنی بنویس /cancel');
    return send(chatId, OSTEPS[0].q);
  }

  if (data.indexOf('cf:') === 0 && sess && sess.flow === 'cf') {
    const parts = data.split(':');
    const qi = Number(parts[1]), oi = Number(parts[2]);
    sess.data[CF_Q[qi].k] = CF_Q[qi].opts[oi][1];
    if (qi + 1 < CF_Q.length) { sess.step = qi + 1; return cfAsk(chatId, qi + 1); }
    return finishCF(chatId, sess);
  }

  if (data === 'order:ok' && sess && sess.flow === 'order') return finishOrder(chatId, sess);
}

async function handle(u) {
  if (u.callback_query) return handleCallback(u.callback_query);
  const msg = u.message;
  if (!msg) return;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const firstName = (msg.from && msg.from.first_name) || 'دوست عزیز';

  if (text === '/cancel') { S.delete(chatId); return send(chatId, '❌ لغو شد.', mainKb); }
  if (text.indexOf('/admin ') === 0) {
    if (text.slice(7).trim() === ADMIN_PASS) { await saveAdmin(chatId); return send(chatId, '✅ شما ادمین شدید!\n\n/stats — آمار سایت و سفارش‌ها'); }
    return send(chatId, '❌ رمز اشتباه است.');
  }
  if (text === '/myid') return send(chatId, '🆔 <code>' + chatId + '</code>');
  if (text === '/stats') {
    if (adminId && String(chatId) === adminId) {
      let out = '📊 <b>آمار اپلای‌سرا</b>\n';
      try { const r = await fetch(SITE + '/api/lead.php?list=1&pass=' + encodeURIComponent(ADMIN_PASS)); const d = await r.json(); out += '\n👥 لیدهای کشوریاب: ' + d.total + ' (امروز: ' + d.today + ')'; } catch (e) {}
      try { const r2 = await fetch(SITE + '/api/botorder.php?list=1&pass=' + encodeURIComponent(ADMIN_PASS)); const d2 = await r2.json(); out += '\n🛒 سفارش‌های بات: ' + d2.total + ' (امروز: ' + d2.today + ')'; if ((d2.orders || []).length) out += '\n\nآخرین سفارش‌ها:\n' + d2.orders.slice(0, 5).map(function (o) { return '• ' + o.order_code + ' — ' + o.name + ' (' + o.phone + ')'; }).join('\n'); } catch (e) {}
      return send(chatId, out);
    }
    return;
  }

  const sess = S.get(chatId);
  if (sess && sess.flow === 'order' && sess.step >= 0) {
    const st = OSTEPS[sess.step];
    if (st.k === 'name' && text.length < 3) return send(chatId, '⚠️ نام کاملت رو وارد کن:');
    if (st.k === 'phone') {
      const ph = text.replace(/[^0-9]/g, '');
      if (!/^09[0-9]{9}$/.test(ph)) return send(chatId, '⚠️ شماره معتبر وارد کن (مثلاً 09123456789):');
      sess.data.phone = ph;
    } else { sess.data[st.k] = text.slice(0, 500); }
    sess.step++;
    if (sess.step < OSTEPS.length) return send(chatId, OSTEPS[sess.step].q);
    const kb = { inline_keyboard: [[{ text: '✅ تایید نهایی سفارش', callback_data: 'order:ok' }], [{ text: '❌ انصراف', callback_data: 'cancel' }]] };
    return send(chatId, orderSummary(sess.data) + '\n\nهمه چیز درسته؟', kb);
  }
  if (sess && sess.flow === 'cf' && sess.step < 0) {
    if (sess.step === -2) {
      if (text.length < 3) return send(chatId, '⚠️ نام کاملت رو بنویس:');
      sess.data.name = text.slice(0, 100);
      sess.step = -1;
      return send(chatId, '📱 شماره موبایلت رو بنویس:');
    }
    const ph = text.replace(/[^0-9]/g, '');
    if (!/^09[0-9]{9}$/.test(ph)) return send(chatId, '⚠️ شماره معتبر وارد کن (مثلاً 09123456789):');
    sess.data.phone = ph;
    sess.step = 0;
    return cfAsk(chatId, 0);
  }

  if (text === '/start') return send(chatId, 'سلام ' + firstName + '! 👋\n\nبه <b>اپلای‌سرا</b> خوش اومدی 🎓\nنگارش تخصصی SOP، انگیزه‌نامه و اسناد اپلای\n\n🛒 ثبت سفارش کامل همینجا توی بات\n🌍 کشوریاب رایگان\n\nاز منوی پایین انتخاب کن:', mainKb);
  if (/ثبت سفارش|🛒|سفارش/.test(text)) return startOrder(chatId);
  if (/کشوریاب|کشور|🌍/.test(text)) return startCF(chatId);

  const reply = answer(text, firstName);
  if (reply) return send(chatId, reply, mainKb);

  await send(chatId, '✅ پیامت دریافت شد!\n\nتیم پشتیبانی به زودی جوابت رو میده ⏳', mainKb);
  if (adminId && adminId !== String(chatId)) {
    const uname = msg.from && msg.from.username ? '@' + msg.from.username : 'بدون یوزرنیم';
    await send(adminId, '💬 <b>پیام جدید:</b>\n\n👤 ' + firstName + ' (' + uname + ')\n🆔 <code>' + chatId + '</code>\n\n📩 «' + text + '»');
  }
}

async function poll() {
  await loadAdmin();
  try { await fetch(API + '/deleteWebhook'); } catch (e) {}
  let offset = 0;
  console.log('ApplySara bot v2 polling started');
  while (true) {
    try {
      const r = await fetch(API + '/getUpdates?timeout=50&offset=' + offset);
      const d = await r.json();
      const arr = d.result || [];
      for (let i = 0; i < arr.length; i++) {
        offset = arr[i].update_id + 1;
        try { await handle(arr[i]); } catch (e) { console.error('handle err', e.message); }
      }
    } catch (e) { await new Promise(function (res) { setTimeout(res, 3000); }); }
  }
}

const http = require('http');
http.createServer(function (req, res) {
  if (req.method === 'POST' && req.url === '/notify') {
    let body = '';
    req.on('data', function (c) { body += c; });
    req.on('end', async function () {
      try {
        const d = JSON.parse(body || '{}');
        if (d.secret !== NOTIFY_SECRET) { res.writeHead(403); return res.end('{"ok":false}'); }
        await notifyAdmin(String(d.text || '').slice(0, 3800));
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

// ═══ v3 overrides: Zibal payment + support texts ═══
async function finishOrder(chatId, sess) {
  const d = sess.data;
  const code = 'AS-' + (100000 + Math.floor(Math.random() * 900000));
  d.order_code = code;
  d.chat_id = String(chatId);
  try {
    await fetch(SITE + '/api/botorder.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ secret: BOT_SECRET }, d)) });
  } catch (e) {}
  let payUrl = null;
  try {
    const pr = await fetch(SITE + '/api/botpay.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret: BOT_SECRET, order_code: code, plan: d.plan }) });
    const pd = await pr.json();
    if (pd.ok && pd.url) payUrl = pd.url;
  } catch (e) {}
  if (payUrl) {
    const kb = { inline_keyboard: [[{ text: '💳 پرداخت آنلاین امن (زیبال)', url: payUrl }]] };
    await send(chatId, '🎉 <b>سفارشت ثبت شد!</b>\n\n🧾 کد پیگیری: <b>' + code + '</b>\n📦 بسته: ' + PLANS[d.plan].t + ' — ' + PLANS[d.plan].p + '\n\n💳 برای نهایی شدن سفارش، از دکمه زیر پرداخت رو انجام بده.\nپرداخت از طریق درگاه امن <b>زیبال</b> (شاپرک) انجام میشه.\n\nبعد از پرداخت، تاییدیه همینجا برات میاد ✅', kb);
    await send(chatId, 'سؤالی داشتی؟ پشتیبانی: @Applysara', mainKb);
  } else {
    await send(chatId, '🎉 <b>سفارشت ثبت شد!</b>\n\n🧾 کد پیگیری: <b>' + code + '</b>\n📦 بسته: ' + PLANS[d.plan].t + ' — ' + PLANS[d.plan].p + '\n\n💳 لینک پرداخت به زودی همینجا ارسال میشه.\n💬 پشتیبانی: @Applysara', mainKb);
  }
  await notifyAdmin('🛒 <b>سفارش جدید از بات!</b>\n\n🧾 ' + code + '\n' + orderSummary(d) + '\n\n🆔 چت مشتری: <code>' + chatId + '</code>' + (payUrl ? '\n\n💳 لینک پرداخت ارسال شد — منتظر پرداخت.' : '\n\n⚠️ لینک پرداخت ساخته نشد! دستی پیگیری کن.'));
  S.delete(chatId);
}

function answer(text, firstName) {
  if (/قیمت|تعرفه|هزینه|💰/.test(text)) return '💰 <b>تعرفه‌های اپلای‌سرا:</b>\n\n📦 <b>پایه — ۴۹۰ هزار تومان</b>\n' + PLANS.paye.d + '\n\n🚀 <b>حرفه‌ای — ۸۹۰ هزار تومان</b>\n' + PLANS.herfei.d + '\n\n💎 <b>فول اپلای — ۱.۴۹ میلیون تومان</b>\n' + PLANS.full.d + '\n\n💳 پرداخت آنلاین امن با زیبال\n👈 «🛒 ثبت سفارش» رو بزن!';
  if (/زمان|تحویل|⏱/.test(text)) return '⏱ <b>زمان تحویل:</b>\n\nپیش‌نویس اول بین <b>۲۴ تا ۴۸ ساعت</b> آماده میشه.\nبسته فول اپلای پیگیری فوری داره 🚀';
  if (/sop|اس او پی|❓/i.test(text)) return '📄 <b>SOP چیست؟</b>\n\nStatement of Purpose مهم‌ترین سند اپلای توئه — نامه‌ای که به دانشگاه میگه کی هستی و چرا باید قبولت کنن.\n\nما از صفر بر اساس داستان خودت می‌نویسیمش ✨';
  if (/پشتیبان|تماس|مشاوره|📞|شماره/.test(text)) return '📞 <b>پشتیبانی اپلای‌سرا</b>\n\nپیامت رو همینجا بنویس یا مستقیم پیام بده:\n💬 @Applysara\n\nدر اسرع وقت جواب میدیم!';
  if (/سلام|درود/.test(text)) return 'سلام ' + firstName + '! 👋 چه کمکی می‌تونم بکنم؟\n\nاز منوی پایین انتخاب کن 👇';
  if (/ممنون|مرسی|تشکر/.test(text)) return 'خواهش می‌کنم! 🌟 موفق باشی.';
  return null;
}

const announcedLocal = new Set();
async function checkPaid() {
  try {
    const r = await fetch(SITE + '/api/botorder.php?paid_unannounced=1&secret=' + encodeURIComponent(BOT_SECRET));
    const d = await r.json();
    for (const o of (d.orders || [])) {
      if (announcedLocal.has(o.order_code)) continue;
      announcedLocal.add(o.order_code);
      if (o.chat_id) {
        await send(o.chat_id, '✅ <b>پرداختت با موفقیت تایید شد!</b> 🎉\n\n🧾 کد سفارش: <b>' + o.order_code + '</b>\n\nسفارشت وارد صف نگارش شد و پیش‌نویس اول رو ظرف <b>۲۴ تا ۴۸ ساعت</b> همینجا دریافت می‌کنی.\n\nممنون از اعتمادت 🌟', mainKb);
      }
      await notifyAdmin('💰 <b>پرداخت موفق!</b>\n\n🧾 ' + o.order_code + '\n👤 ' + o.name + ' — ' + o.phone + '\n📦 ' + (PLANS[o.plan] ? PLANS[o.plan].t : o.plan) + '\n\n⚡️ نگارش رو شروع کن!');
      try {
        await fetch(SITE + '/api/botorder.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret: BOT_SECRET, announced: o.order_code }) });
      } catch (e) {}
    }
  } catch (e) {}
}
setInterval(checkPaid, 60000);
