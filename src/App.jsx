import { useState, useEffect } from "react";

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO_STAFF = [
  { id: "s01", name: "Reina", nameJp: "麗奈", photo: "", intro: "東京出身。圧倒的な存在感と知性で、あなたの心の奥底まで支配いたします。初めての方も安心してお任せください。" },
  { id: "s02", name: "Yuki", nameJp: "雪姫", photo: "", intro: "冷酷な微笑みと鋭い眼差しが特徴。言葉一つであなたを虜にする、女王の中の女王。" },
  { id: "s03", name: "Mira", nameJp: "美羅", photo: "", intro: "優雅さと厳しさを兼ね備えた完璧な支配者。エレガントな責め苦をご提供いたします。" },
  { id: "s04", name: "Akane", nameJp: "朱音", photo: "", intro: "情熱的な性格と強烈なカリスマ性で、訪れる者すべてを虜にします。" },
  { id: "s05", name: "Sora", nameJp: "蒼空", photo: "", intro: "神秘的な雰囲気と深い洞察力で、あなたの内なる欲望を引き出します。" },
  { id: "s06", name: "Luna", nameJp: "月華", photo: "", intro: "月のように美しく、夜のように深い支配をご体験ください。" },
  { id: "s07", name: "Kei", nameJp: "桂", photo: "", intro: "凛とした佇まいと圧倒的な美貌。一言一句があなたの魂を縛ります。" },
  { id: "s08", name: "Nao", nameJp: "奈緒", photo: "", intro: "柔らかな声音の中に隠された鋼の意志。甘美な地獄へとご案内いたします。" },
  { id: "s09", name: "Hina", nameJp: "雛", photo: "", intro: "見た目の可愛らしさと内なる残酷さのギャップが魅力。虜になること間違いなし。" },
  { id: "s10", name: "Rin", nameJp: "凜", photo: "", intro: "清廉な美しさの裏に潜む漆黒の支配欲。完璧な服従をご体験いただけます。" },
  { id: "s11", name: "Ai", nameJp: "藍", photo: "", intro: "深い藍色の眼差しで心の奥まで見透かす、神秘の支配者。" },
  { id: "s12", name: "Mei", nameJp: "明", photo: "", intro: "明るい笑顔の奥に隠された絶対的な支配力。あなたを光と闇の境界へ誘います。" },
];

const DEMO_MENUS = [
  { id: "m01", name: "スタンダードコース", price: 15000, duration: 60 },
  { id: "m02", name: "プレミアムコース", price: 25000, duration: 90 },
  { id: "m03", name: "VIPコース", price: 40000, duration: 120 },
  { id: "m04", name: "ライトコース", price: 10000, duration: 45 },
];

const DEMO_OPTIONS = {
  default: [{ id: "o1", name: "コスチューム", price: 3000 }, { id: "o3", name: "延長30分", price: 8000 }, { id: "o4", name: "特別演出", price: 10000 }],
};

const DEMO_TRANSPORT = {
  default: [{ id: "t1", name: "山手線圏内", price: 3000 }, { id: "t2", name: "23区外", price: 5000 }, { id: "t3", name: "神奈川・埼玉・千葉", price: 8000 }],
};

function generateDemoShifts() {
  const shifts = {};
  const today = new Date();
  const hours = ["12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
  for (let d = 1; d < 30; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    shifts[dateStr] = {};
    DEMO_STAFF.forEach(staff => {
      const slots = [];
      hours.forEach(h => {
        if (Math.random() > 0.4) slots.push(h);
      });
      if (slots.length > 0) shifts[dateStr][staff.id] = slots;
    });
  }
  return shifts;
}
const DEMO_SHIFTS = generateDemoShifts();

// ─── GAS CODE ─────────────────────────────────────────────────────────────────
const GAS_CODE = `const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const ADMIN_EMAIL = 'info@dominant-tokyo.com';

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const staff = getSheetData(ss, 'スタッフ');
  const shifts = getShiftData(ss);
  const menus = getSheetData(ss, 'メニュー');
  const options = getSheetData(ss, 'オプション');
  const transport = getSheetData(ss, '交通費');
  const reservations = getSheetData(ss, '予約一覧');
  return jsonResponse({ staff, shifts, menus, options, transport, reservations });
}

function getShiftData(ss) {
  const sheet = ss.getSheetByName('シフト');
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0]; // staffId, date, 12:00, 13:00 ...
  const result = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const staffId = String(row[0]);
    const rawDate = row[1];
    let dateStr = '';
    if (rawDate instanceof Date) {
      const y = rawDate.getFullYear();
      const m = String(rawDate.getMonth()+1).padStart(2,'0');
      const d = String(rawDate.getDate()).padStart(2,'0');
      dateStr = y + '-' + m + '-' + d;
    } else {
      dateStr = String(rawDate).replace(/\\//g, '-');
    }
    const slots = [];
    for (let j = 2; j < headers.length; j++) {
      if (row[j] && String(row[j]).trim() !== '') {
        slots.push(String(headers[j]));
      }
    }
    if (slots.length > 0) result.push({ staffId, date: dateStr, slots });
  }
  return result;
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const resSheet = getOrCreateSheet(ss, '予約一覧');
  const existing = resSheet.getDataRange().getValues();
  for (let i = 1; i < existing.length; i++) {
    if (existing[i][3] === data.staffId && existing[i][4] === data.date && existing[i][5] === data.time && existing[i][12] !== 'キャンセル') {
      return jsonResponse({ success: false, error: 'この日時はすでに予約が入っています。' });
    }
  }
  const now = new Date();
  const resId = 'RES-' + now.getTime();
  resSheet.appendRow([resId, now, data.customerName, data.staffId, data.date, data.time, data.menuId, data.menuName, (data.options||[]).join(','), data.transportId||'', data.memberType, data.totalPrice, '確定', data.email, data.phone, data.notes||'']);
  updateCustomer(ss, data);
  sendCustomerEmail(data, resId);
  sendAdminEmail(data, resId);
  return jsonResponse({ success: true, reservationId: resId });
}

function getSheetData(ss, name) {
  try {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return [];
    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return [];
    const headers = values[0];
    return values.slice(1).map(row => { const obj = {}; headers.forEach((h,i) => { obj[h] = row[i]; }); return obj; });
  } catch(e) { return []; }
}

function getOrCreateSheet(ss, name) { return ss.getSheetByName(name) || ss.insertSheet(name); }

function updateCustomer(ss, data) {
  const sheet = getOrCreateSheet(ss, '顧客');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) { if (rows[i][2] === data.email) { sheet.getRange(i+1,6).setValue(rows[i][5]+1); return; } }
  sheet.appendRow([new Date(), data.customerName, data.email, data.phone, data.memberType, 1]);
}

function sendCustomerEmail(data, resId) {
  const subject = '【DOMINANT TOKYO】ご予約を承りました';
  const body = data.customerName + ' 様\\n\\nご予約ありがとうございます。\\n担当者から追ってメールにてご連絡いたします。\\n\\n予約番号: ' + resId + '\\n担当: ' + data.staffName + '\\n日時: ' + data.date + ' ' + data.time + '\\nメニュー: ' + data.menuName + '\\n合計: ¥' + Number(data.totalPrice).toLocaleString() + '\\n\\nDOMINANT TOKYO';
  GmailApp.sendEmail(data.email, subject, body, { from: ADMIN_EMAIL, replyTo: ADMIN_EMAIL, name: 'DOMINANT TOKYO' });
}

function sendAdminEmail(data, resId) {
  const subject = '【新規予約】' + data.customerName + '様';
  const body = '予約番号: ' + resId + '\\n顧客: ' + data.customerName + '\\nメール: ' + data.email + '\\n電話: ' + data.phone + '\\n担当: ' + data.staffName + '\\n日時: ' + data.date + ' ' + data.time + '\\nメニュー: ' + data.menuName + '\\n区分: ' + data.memberType + '\\n合計: ¥' + Number(data.totalPrice).toLocaleString();
  GmailApp.sendEmail(ADMIN_EMAIL, subject, body);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getInitials(name) { return name ? name.slice(0,2).toUpperCase() : "??"; }
function formatPrice(p) { return "¥" + Number(p).toLocaleString(); }
function getAvailableFromDate(now) {
  const d = new Date(now);
  d.setDate(d.getDate() + (d.getHours() >= 18 ? 2 : 1));
  d.setHours(0,0,0,0);
  return d;
}

// 時間文字列 "HH:MM" を分数に変換
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Avatar({ staff, size = 80 }) {
  const colors = ["#8B6914","#7B5A9E","#1A6B8A","#8A1A3B","#1A8A4A"];
  const id = staff.id || staff.ID || "s01";
  const colorIdx = id.charCodeAt(id.length - 1) % colors.length;
  if (staff.photo) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: "2px solid #C9A84C", flexShrink: 0 }}>
        <img src={staff.photo} alt={staff.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${colors[colorIdx]}88, ${colors[colorIdx]}33)`, border: "2px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 700, color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", flexShrink: 0, letterSpacing: "0.05em" }}>
      {getInitials(staff.name)}
    </div>
  );
}

function StepBar({ step }) {
  const steps = ["区分","指名","日時","メニュー","確認","完了"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, margin: "0 0 32px", overflowX: "auto", paddingBottom: 4 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 48 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: i < step ? "linear-gradient(135deg, #C9A84C, #8B6914)" : i === step ? "#C9A84C22" : "#1a1a1a", border: i <= step ? "2px solid #C9A84C" : "2px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: i < step ? "#0d0d0d" : i === step ? "#C9A84C" : "#555", transition: "all 0.3s", flexShrink: 0 }}>
              {i < step ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 10, color: i <= step ? "#C9A84C" : "#444", fontFamily: "'Noto Sans JP', sans-serif", whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: 24, height: 1, background: i < step ? "#C9A84C" : "#2a2a2a", margin: "0 2px", marginBottom: 20, flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#666", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}>
      ← 戻る
    </button>
  );
}

// STEP 0
function StepMemberType({ onNext }) {
  const [type, setType] = useState(null);
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <h2 style={styles.stepTitle}>ご利用区分 <span style={styles.stepTitleEn}>MEMBERSHIP</span></h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 28, fontFamily: "'Noto Sans JP',sans-serif" }}>はじめてのお客様はグループ新規をお選びください</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480, margin: "0 auto" }}>
        {[
          { value: "new", label: "グループ新規", labelEn: "NEW MEMBER", desc: "初回ご来店のお客様", badge: "入会金 ¥1,000", badgeColor: "#C9A84C" },
          { value: "member", label: "グループ会員", labelEn: "MEMBER", desc: "当グループ2回目以降ご利用の方" },
        ].map(opt => (
          <button key={opt.value} onClick={() => setType(opt.value)} style={{ background: type === opt.value ? "#1a1305" : "#0f0f0f", border: type === opt.value ? "1px solid #C9A84C" : "1px solid #2a2a2a", borderRadius: 8, padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s", textAlign: "left" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${type === opt.value ? "#C9A84C" : "#444"}`, background: type === opt.value ? "#C9A84C" : "transparent", flexShrink: 0 }} />
                <span style={{ color: "#e8d5a3", fontSize: 16, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600 }}>{opt.label}</span>
                <span style={{ color: "#666", fontSize: 11, letterSpacing: "0.1em" }}>{opt.labelEn}</span>
              </div>
              <p style={{ color: "#666", fontSize: 12, margin: 0, marginLeft: 30, fontFamily: "'Noto Sans JP',sans-serif" }}>{opt.desc}</p>
            </div>
            {opt.badge && <span style={{ background: opt.badgeColor + "22", border: `1px solid ${opt.badgeColor}55`, color: opt.badgeColor, fontSize: 11, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap", fontFamily: "'Noto Sans JP',sans-serif" }}>{opt.badge}</span>}
          </button>
        ))}
      </div>
      {type === "new" && (
        <div style={{ background: "#1a1305", border: "1px solid #C9A84C44", borderRadius: 8, padding: "14px 20px", margin: "20px auto", maxWidth: 480, color: "#C9A84C", fontSize: 13, fontFamily: "'Noto Sans JP',sans-serif" }}>
          ※ 初回ご来店時に入会金 <strong>¥1,000</strong> をいただいております
        </div>
      )}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <GoldButton disabled={!type} onClick={() => onNext(type)}>次へ進む →</GoldButton>
      </div>
    </div>
  );
}

// STEP 1
function StepStaff({ staffList, onNext, onBack }) {
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <BackButton onClick={onBack} />
      <h2 style={styles.stepTitle}>ご指名女王様 <span style={styles.stepTitleEn}>MISTRESS</span></h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24, fontFamily: "'Noto Sans JP',sans-serif" }}>ご希望の女王様をお選びください</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {staffList.map(staff => {
          const sid = staff.id || staff.ID;
          return (
            <div key={sid} onClick={() => setSelected(sid)} style={{ background: selected === sid ? "#1a1305" : "#0d0d0d", border: selected === sid ? "1px solid #C9A84C" : "1px solid #1e1e1e", borderRadius: 10, padding: "16px 20px", cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative" }}>
                  <Avatar staff={staff} size={64} />
                  {selected === sid && <div style={{ position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: "50%", background: "#C9A84C", border: "2px solid #0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#0d0d0d", fontWeight: 900 }}>✓</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: "#e8d5a3", fontSize: 18, fontFamily: "'Cormorant Garamond',serif", fontWeight: 700 }}>{staff.nameJp || staff.name}</span>
                    <span style={{ color: "#777", fontSize: 12, letterSpacing: "0.1em" }}>{staff.name}</span>
                  </div>
                  <p style={{ color: "#888", fontSize: 12, margin: 0, fontFamily: "'Noto Sans JP',sans-serif", lineHeight: 1.6, overflow: expanded === sid ? "visible" : "hidden", display: expanded === sid ? "block" : "-webkit-box", WebkitLineClamp: expanded === sid ? undefined : 2, WebkitBoxOrient: "vertical" }}>{staff.intro}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setExpanded(expanded === sid ? null : sid); }} style={{ background: "none", border: "1px solid #333", color: "#666", padding: "4px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer", flexShrink: 0 }}>{expanded === sid ? "閉じる" : "続きを読む"}</button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <GoldButton disabled={!selected} onClick={() => onNext(staffList.find(s => (s.id || s.ID) === selected))}>次へ進む →</GoldButton>
      </div>
    </div>
  );
}

// STEP 2 - シフト表示・所要時間考慮
function StepDateTime({ staff, shifts, reservations, selectedMenu, onNext, onBack }) {
  const now = new Date();
  const minDate = getAvailableFromDate(now);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const dates = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(minDate);
    d.setDate(minDate.getDate() + i);
    dates.push(d);
  }

  const sid = staff.id || staff.ID || "";
  const duration = selectedMenu ? Number(selectedMenu.duration) : 0;

  // シフトから利用可能な時間を取得（所要時間考慮）
  const getStaffSlots = (dateStr) => {
    const shiftData = shifts[dateStr]?.[sid];
    if (!shiftData) return [];

    // GASから来るデータ形式 { slots: [...] } または 配列
    let rawSlots = [];
    if (Array.isArray(shiftData)) {
      rawSlots = shiftData.map(s => typeof s === "string" ? s : s.time).filter(Boolean);
    } else if (shiftData.slots) {
      rawSlots = shiftData.slots;
    }

    return rawSlots.filter(time => {
      // ダブルブッキングチェック
      const booked = reservations.some(r => r.staffId === sid && r.date === dateStr && r.time === time && r.status !== "キャンセル");
      if (booked) return false;
      // 所要時間チェック：終了時間が24:00(1440分)を超えないか
      if (duration > 0) {
        const startMin = timeToMinutes(time);
        if (startMin + duration > 24 * 60) return false;
      }
      return true;
    });
  };

  const hasSlots = (d) => {
    const ds = d.toISOString().split("T")[0];
    return getStaffSlots(ds).length > 0;
  };

  const selectedDateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : null;
  const availableSlots = selectedDateStr ? getStaffSlots(selectedDateStr) : [];
  const dayNames = ["日","月","火","水","木","金","土"];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <BackButton onClick={onBack} />
      <h2 style={styles.stepTitle}>日時選択 <span style={styles.stepTitleEn}>DATE & TIME</span></h2>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 8, padding: "12px 16px" }}>
        <Avatar staff={staff} size={40} />
        <span style={{ color: "#e8d5a3", fontFamily: "'Cormorant Garamond',serif", fontSize: 16 }}>{staff.nameJp || staff.name} 女王様</span>
      </div>
      {selectedMenu && (
        <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 6, padding: "8px 14px", marginBottom: 16, color: "#888", fontSize: 12, fontFamily: "'Noto Sans JP',sans-serif" }}>
          選択中のメニュー：{selectedMenu.name}（{selectedMenu.duration}分）　※終了時間が24:00を超える枠は非表示
        </div>
      )}
      {now.getHours() >= 18 && (
        <div style={{ background: "#1a0d05", border: "1px solid #8B4513", borderRadius: 6, padding: "10px 14px", marginBottom: 16, color: "#CD853F", fontSize: 12, fontFamily: "'Noto Sans JP',sans-serif" }}>
          ※ 18:00以降のご予約は翌々日以降のみ受付可能です
        </div>
      )}
      <div style={{ marginBottom: 8, color: "#888", fontSize: 12, fontFamily: "'Noto Sans JP',sans-serif" }}>日付を選択</div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 24 }}>
        {dates.map((d, i) => {
          const active = hasSlots(d);
          const isSelected = selectedDateStr === d.toISOString().split("T")[0];
          return (
            <button key={i} onClick={() => { if (active) { setSelectedDate(d); setSelectedSlot(null); } }} style={{ minWidth: 56, padding: "10px 8px", borderRadius: 8, flexShrink: 0, background: isSelected ? "#1a1305" : "#0f0f0f", border: isSelected ? "1px solid #C9A84C" : "1px solid #1e1e1e", cursor: active ? "pointer" : "not-allowed", opacity: active ? 1 : 0.25, transition: "all 0.15s" }}>
              <div style={{ color: d.getDay() === 0 ? "#ff6b6b" : d.getDay() === 6 ? "#6bb5ff" : "#888", fontSize: 10, marginBottom: 2 }}>{dayNames[d.getDay()]}</div>
              <div style={{ color: isSelected ? "#C9A84C" : "#ccc", fontSize: 15, fontWeight: 700 }}>{d.getDate()}</div>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div>
          <div style={{ color: "#888", fontSize: 12, marginBottom: 10, fontFamily: "'Noto Sans JP',sans-serif" }}>
            {selectedDate.getMonth()+1}月{selectedDate.getDate()}日（{dayNames[selectedDate.getDay()]}）の案内可能時間
          </div>
          {availableSlots.length === 0 ? (
            <div style={{ color: "#555", textAlign: "center", padding: "24px 0", fontFamily: "'Noto Sans JP',sans-serif" }}>この日の案内可能時間はありません</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {availableSlots.map(time => (
                <button key={time} onClick={() => setSelectedSlot(time)} style={{ padding: "12px 20px", borderRadius: 6, background: selectedSlot === time ? "#1a1305" : "#111", border: selectedSlot === time ? "1px solid #C9A84C" : "1px solid #2a2a2a", color: selectedSlot === time ? "#C9A84C" : "#ccc", cursor: "pointer", fontSize: 15, fontWeight: 600, transition: "all 0.15s", fontFamily: "'Noto Sans JP',sans-serif" }}>
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <GoldButton disabled={!selectedSlot} onClick={() => onNext(selectedDate, selectedSlot)}>次へ進む →</GoldButton>
      </div>
    </div>
  );
}

// STEP 3
function StepMenu({ staff, menus, options, transport, memberType, onNext, onBack }) {
  const [menu, setMenu] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);

  const sid = staff.id || staff.ID || "";
  const staffOptions = options[sid] || options["default"] || [];
  const staffTransport = transport[sid] || transport["default"] || [];

  const toggleOption = (opt) => {
    setSelectedOptions(prev => prev.find(o => o.id === opt.id) ? prev.filter(o => o.id !== opt.id) : [...prev, opt]);
  };

  const total = (menu ? Number(menu.price) : 0) + selectedOptions.reduce((s,o) => s + Number(o.price), 0) + (selectedTransport ? Number(selectedTransport.price) : 0) + (memberType === "new" ? 1000 : 0);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <BackButton onClick={onBack} />
      <h2 style={styles.stepTitle}>メニュー選択 <span style={styles.stepTitleEn}>MENU</span></h2>
      <SectionLabel>メニュー</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {menus.map(m => (
          <button key={m.id || m.ID} onClick={() => setMenu(m)} style={{ background: menu?.id === (m.id||m.ID) ? "#1a1305" : "#0f0f0f", border: menu?.id === (m.id||m.ID) ? "1px solid #C9A84C" : "1px solid #1e1e1e", borderRadius: 8, padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: menu?.id === (m.id||m.ID) ? "#e8d5a3" : "#bbb", fontSize: 15, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600 }}>{m.name}</div>
              <div style={{ color: "#666", fontSize: 12, marginTop: 2, fontFamily: "'Noto Sans JP',sans-serif" }}>所要時間: {m.duration}分</div>
            </div>
            <div style={{ color: menu?.id === (m.id||m.ID) ? "#C9A84C" : "#888", fontSize: 15, fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 700 }}>{formatPrice(m.price)}</div>
          </button>
        ))}
      </div>

      {staffOptions.length > 0 && (
        <>
          <SectionLabel>オプション（複数選択可）</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {staffOptions.map(opt => {
              const checked = !!selectedOptions.find(o => o.id === opt.id);
              return (
                <button key={opt.id} onClick={() => toggleOption(opt)} style={{ background: checked ? "#1a1305" : "#0f0f0f", border: checked ? "1px solid #C9A84C88" : "1px solid #1e1e1e", borderRadius: 8, padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? "#C9A84C" : "#444"}`, background: checked ? "#C9A84C" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{checked && <span style={{ fontSize: 11, color: "#0d0d0d", fontWeight: 900 }}>✓</span>}</div>
                    <span style={{ color: "#bbb", fontSize: 14, fontFamily: "'Noto Sans JP',sans-serif" }}>{opt.name}</span>
                  </div>
                  <span style={{ color: "#888", fontSize: 14, fontFamily: "'Noto Sans JP',sans-serif" }}>+{formatPrice(opt.price)}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {staffTransport.length > 0 && (
        <>
          <SectionLabel>交通費区分</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            <button onClick={() => setSelectedTransport(null)} style={{ background: !selectedTransport ? "#1a1305" : "#0f0f0f", border: !selectedTransport ? "1px solid #C9A84C88" : "1px solid #1e1e1e", borderRadius: 8, padding: "10px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", transition: "all 0.15s" }}>
              <span style={{ color: "#bbb", fontSize: 14, fontFamily: "'Noto Sans JP',sans-serif" }}>交通費なし（来店）</span>
              <span style={{ color: "#888", fontSize: 14 }}>¥0</span>
            </button>
            {staffTransport.map(t => (
              <button key={t.id} onClick={() => setSelectedTransport(t)} style={{ background: selectedTransport?.id === t.id ? "#1a1305" : "#0f0f0f", border: selectedTransport?.id === t.id ? "1px solid #C9A84C88" : "1px solid #1e1e1e", borderRadius: 8, padding: "10px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", transition: "all 0.15s" }}>
                <span style={{ color: "#bbb", fontSize: 14, fontFamily: "'Noto Sans JP',sans-serif" }}>{t.name}</span>
                <span style={{ color: "#888", fontSize: 14, fontFamily: "'Noto Sans JP',sans-serif" }}>+{formatPrice(t.price)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "16px 20px", marginBottom: 24 }}>
        <div style={{ color: "#777", fontSize: 12, marginBottom: 10, fontFamily: "'Noto Sans JP',sans-serif" }}>料金内訳</div>
        {menu && <PriceLine label={menu.name} amount={menu.price} />}
        {selectedOptions.map(o => <PriceLine key={o.id} label={o.name} amount={o.price} />)}
        {selectedTransport && <PriceLine label={selectedTransport.name + "（交通費）"} amount={selectedTransport.price} />}
        {memberType === "new" && <PriceLine label="入会金" amount={1000} />}
        <div style={{ borderTop: "1px solid #2a2a2a", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#e8d5a3", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 14 }}>合計</span>
          <span style={{ color: "#C9A84C", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 20, fontWeight: 700 }}>{formatPrice(total)}</span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <GoldButton disabled={!menu} onClick={() => onNext(menu, selectedOptions, selectedTransport, total)}>次へ進む →</GoldButton>
      </div>
    </div>
  );
}

// STEP 4
function StepConfirm({ booking, onSubmit, onBack, loading }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", agree: false });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "お名前を入力してください";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "有効なメールアドレスを入力してください";
    if (!form.phone.match(/^[\d\-\+\(\) ]{10,}$/)) e.phone = "電話番号を正しく入力してください（必須）";
    if (!form.agree) e.agree = "利用規約に同意してください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const { staff, date, time, menu, options, transport, total, memberType } = booking;
  const dateStr = date ? `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日` : "";
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <BackButton onClick={onBack} />
      <h2 style={styles.stepTitle}>予約確認 <span style={styles.stepTitleEn}>CONFIRM</span></h2>
      <div style={{ background: "#0a0a0a", border: "1px solid #C9A84C33", borderRadius: 10, padding: "20px", marginBottom: 24 }}>
        <div style={{ color: "#C9A84C88", fontSize: 11, letterSpacing: "0.15em", marginBottom: 12 }}>RESERVATION DETAILS</div>
        <SummaryRow label="ご利用区分" value={memberType === "new" ? "グループ新規" : "グループ会員"} />
        <SummaryRow label="MISTRESS" value={<span style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar staff={staff} size={24} />{staff.nameJp || staff.name} 女王様</span>} />
        <SummaryRow label="日時" value={`${dateStr} ${time}`} />
        <SummaryRow label="メニュー" value={menu?.name} />
        {options?.length > 0 && <SummaryRow label="オプション" value={options.map(o => o.name).join("、")} />}
        {transport && <SummaryRow label="交通費" value={transport.name} />}
        <div style={{ borderTop: "1px solid #1e1e1e", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#888", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 13 }}>合計金額</span>
          <span style={{ color: "#C9A84C", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 22, fontWeight: 700 }}>{formatPrice(total)}</span>
        </div>
      </div>
      <SectionLabel>お客様情報</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        <FormField label="お名前" required error={errors.name}><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="例：山田 太郎" style={inputStyle} /></FormField>
        <FormField label="メールアドレス" required error={errors.email}><input value={form.email} onChange={e => set("email", e.target.value)} type="email" placeholder="例：example@email.com" style={inputStyle} /></FormField>
        <FormField label="電話番号" required error={errors.phone}><input value={form.phone} onChange={e => set("phone", e.target.value)} type="tel" placeholder="例：090-1234-5678" style={inputStyle} /></FormField>
        <FormField label="ご要望・備考" error={errors.notes}><textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="ご要望があればご記入ください" style={{ ...inputStyle, resize: "vertical" }} /></FormField>
      </div>
      <div style={{ background: "#0a0a0a", border: errors.agree ? "1px solid #f4433688" : "1px solid #2a2a2a", borderRadius: 8, padding: "16px 18px", marginBottom: 8 }}>
        <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
          <div onClick={() => set("agree", !form.agree)} style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1, border: `2px solid ${form.agree ? "#C9A84C" : "#444"}`, background: form.agree ? "#C9A84C" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{form.agree && <span style={{ fontSize: 12, color: "#0d0d0d", fontWeight: 900 }}>✓</span>}</div>
          <span style={{ color: "#888", fontSize: 13, fontFamily: "'Noto Sans JP',sans-serif", lineHeight: 1.6 }}>
            <a href="https://www.dominant-tokyo.com/caveat" target="_blank" rel="noopener noreferrer" style={{ color: "#C9A84C", textDecoration: "underline" }}>利用規約</a>を読み、内容に同意します（必須）
          </span>
        </label>
      </div>
      {errors.agree && <div style={{ color: "#f44336", fontSize: 12, marginBottom: 16, fontFamily: "'Noto Sans JP',sans-serif" }}>{errors.agree}</div>}
      <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "center" }}>
        <GoldButton onClick={() => { if (validate()) onSubmit(form); }} disabled={loading}>{loading ? "送信中..." : "予約を確定する"}</GoldButton>
      </div>
    </div>
  );
}

// STEP 5
function StepComplete({ booking, reservationId }) {
  return (
    <div style={{ animation: "fadeIn 0.6s ease", textAlign: "center", padding: "20px 0" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C33, #C9A84C11)", border: "2px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 32 }}>✓</div>
      <h2 style={{ color: "#e8d5a3", fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>ご予約完了</h2>
      <p style={{ color: "#C9A84C", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, letterSpacing: "0.1em", marginBottom: 24 }}>RESERVATION COMPLETE</p>
      {reservationId && (
        <div style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "12px 20px", display: "inline-block", marginBottom: 24 }}>
          <span style={{ color: "#666", fontSize: 12, fontFamily: "'Noto Sans JP',sans-serif" }}>予約番号: </span>
          <span style={{ color: "#C9A84C", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 16 }}>{reservationId}</span>
        </div>
      )}
      <div style={{ background: "#0d0d0d", border: "1px solid #C9A84C33", borderRadius: 10, padding: "24px", maxWidth: 400, margin: "0 auto 24px", textAlign: "left" }}>
        <SummaryRow label="MISTRESS" value={booking.staff?.nameJp || booking.staff?.name} />
        <SummaryRow label="日時" value={`${booking.date?.getMonth()+1}月${booking.date?.getDate()}日 ${booking.time}`} />
        <SummaryRow label="メニュー" value={booking.menu?.name} />
        <div style={{ borderTop: "1px solid #1e1e1e", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#888", fontSize: 13, fontFamily: "'Noto Sans JP',sans-serif" }}>合計</span>
          <span style={{ color: "#C9A84C", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 20, fontWeight: 700 }}>{formatPrice(booking.total)}</span>
        </div>
      </div>
      <div style={{ background: "#1a1305", border: "1px solid #C9A84C44", borderRadius: 8, padding: "16px 20px", maxWidth: 400, margin: "0 auto 32px", color: "#e8d5a3", fontSize: 14, fontFamily: "'Noto Sans JP',sans-serif", lineHeight: 1.8 }}>
        担当者から追ってメールにてご連絡いたします
      </div>
      <button onClick={() => window.location.reload()} style={{ background: "transparent", border: "1px solid #3a3a3a", color: "#888", borderRadius: 6, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif" }}>新しいご予約はこちら</button>
    </div>
  );
}

// GAS PANEL
function GasPanel({ gasUrl, setGasUrl, onClose }) {
  const [url, setUrl] = useState(gasUrl);
  const [showCode, setShowCode] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0d0d0d", border: "1px solid #C9A84C44", borderRadius: 12, padding: 28, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ color: "#e8d5a3", fontFamily: "'Cormorant Garamond',serif", fontSize: 20, margin: 0 }}>GAS URL 設定</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "#888", fontSize: 12, fontFamily: "'Noto Sans JP',sans-serif", display: "block", marginBottom: 6 }}>Google Apps Script デプロイURL</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..." style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <GoldButton onClick={() => { setGasUrl(url); onClose(); }}>保存</GoldButton>
          <button onClick={() => setShowCode(!showCode)} style={{ background: "transparent", border: "1px solid #3a3a3a", color: "#888", borderRadius: 6, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif" }}>{showCode ? "コードを隠す" : "GASコードを表示"}</button>
        </div>
        {showCode && (
          <pre style={{ background: "#050505", border: "1px solid #1e1e1e", borderRadius: 6, padding: 16, color: "#7ec8a0", fontSize: 11, lineHeight: 1.6, overflowX: "auto", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 400 }}>{GAS_CODE}</pre>
        )}
      </div>
    </div>
  );
}

// UI HELPERS
function GoldButton({ children, onClick, disabled, style = {} }) {
  return <button onClick={onClick} disabled={disabled} style={{ background: disabled ? "#2a2a2a" : "linear-gradient(135deg, #C9A84C, #8B6914)", color: disabled ? "#555" : "#0d0d0d", border: "none", borderRadius: 6, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'Cormorant Garamond',serif", letterSpacing: "0.05em", transition: "all 0.2s", ...style }}>{children}</button>;
}
function SectionLabel({ children }) {
  return <div style={{ color: "#C9A84C", fontSize: 11, letterSpacing: "0.15em", marginBottom: 10, fontFamily: "'Cormorant Garamond',serif" }}>{children.toUpperCase()}</div>;
}
function PriceLine({ label, amount }) {
  return <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "#888", fontSize: 13, fontFamily: "'Noto Sans JP',sans-serif" }}>{label}</span><span style={{ color: "#aaa", fontSize: 13, fontFamily: "'Noto Sans JP',sans-serif" }}>{formatPrice(amount)}</span></div>;
}
function SummaryRow({ label, value }) {
  return <div style={{ display: "flex", gap: 16, marginBottom: 8, alignItems: "center" }}><span style={{ color: "#666", fontSize: 12, fontFamily: "'Noto Sans JP',sans-serif", minWidth: 80, flexShrink: 0 }}>{label}</span><span style={{ color: "#ccc", fontSize: 13, fontFamily: "'Noto Sans JP',sans-serif", display: "flex", alignItems: "center" }}>{value}</span></div>;
}
function FormField({ label, required, error, children }) {
  return <div><label style={{ color: "#888", fontSize: 12, fontFamily: "'Noto Sans JP',sans-serif", display: "block", marginBottom: 5 }}>{label} {required && <span style={{ color: "#C9A84C" }}>*</span>}</label>{children}{error && <div style={{ color: "#f44336", fontSize: 12, marginTop: 4, fontFamily: "'Noto Sans JP',sans-serif" }}>{error}</div>}</div>;
}
const inputStyle = { background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#e0d0b0", padding: "10px 14px", fontSize: 14, width: "100%", boxSizing: "border-box", fontFamily: "'Noto Sans JP',sans-serif", outline: "none", transition: "border-color 0.2s" };
const styles = {
  stepTitle: { color: "#e8d5a3", fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "baseline", gap: 12 },
  stepTitleEn: { color: "#C9A84C88", fontSize: 12, letterSpacing: "0.2em", fontWeight: 400 },
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const GAS_URL = "https://script.google.com/macros/s/AKfycbyacp7AawmgSqgCHhWB1cR36zkSw4XnuaZjqNKNt14-Kmlh8648EulGkB5XjGjfFVfQnQ/exec";
  const [gasUrl, setGasUrl] = useState(GAS_URL);
  const [showGasPanel, setShowGasPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservationId, setReservationId] = useState(null);

  const [staffList, setStaffList] = useState(DEMO_STAFF);
  const [shifts, setShifts] = useState(DEMO_SHIFTS);
  const [menus, setMenus] = useState(DEMO_MENUS);
  const [optionsMap, setOptionsMap] = useState(DEMO_OPTIONS);
  const [transportMap, setTransportMap] = useState(DEMO_TRANSPORT);
  const [reservations, setReservations] = useState([]);

  const [memberType, setMemberType] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!gasUrl) return;
    setDataLoading(true);
    fetch(gasUrl + "?action=getData")
      .then(r => r.json())
      .then(data => {
        if (data.staff?.length) {
          setStaffList(data.staff.map(s => ({
            id: String(s.ID || s.id || ""),
            name: String(s["英語名"] || s.name || ""),
            nameJp: String(s["名前"] || s.nameJp || ""),
            photo: String(s["写真URL"] || s.photo || ""),
            intro: String(s["自己紹介"] || s.intro || "")
          })));
        }
        if (data.menus?.length) {
          setMenus(data.menus.map(m => ({
            id: String(m.ID || m.id || ""),
            name: String(m["名前"] || m.name || ""),
            price: Number(m["金額"] || m.price || 0),
            duration: Number(m["所要時間"] || m.duration || 60)
          })));
        }
        // シフトデータを変換 { dateStr: { staffId: ["12:00","13:00",...] } }
        if (data.shifts?.length) {
          const sm = {};
          data.shifts.forEach(s => {
            const dateStr = String(s.date || "");
            const staffId = String(s.staffId || "");
            const slots = Array.isArray(s.slots) ? s.slots : [];
            if (!sm[dateStr]) sm[dateStr] = {};
            sm[dateStr][staffId] = slots;
          });
          setShifts(sm);
        }
        if (data.options?.length) {
          const om = {};
          data.options.forEach(o => {
            const sid = String(o.staffId || o["staffId"] || "");
            if (!om[sid]) om[sid] = [];
            om[sid].push({ id: String(o["オプションID"] || o.id || ""), name: String(o["名前"] || o.name || ""), price: Number(o["金額"] || o.price || 0) });
          });
          setOptionsMap(om);
        }
        if (data.transport?.length) {
          const tm = {};
          data.transport.forEach(t => {
            const sid = String(t.staffId || "");
            if (!tm[sid]) tm[sid] = [];
            tm[sid].push({ id: String(t["交通費ID"] || t.id || ""), name: String(t["区分名"] || t.name || ""), price: Number(t["金額"] || t.price || 0) });
          });
          setTransportMap(tm);
        }
        if (data.reservations?.length) setReservations(data.reservations);
        setDataLoading(false);
      })
      .catch(() => setDataLoading(false));
  }, [gasUrl]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    const payload = {
      memberType,
      staffId: selectedStaff.id,
      staffName: selectedStaff.nameJp || selectedStaff.name,
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      menuId: selectedMenu.id,
      menuName: selectedMenu.name,
      options: selectedOptions.map(o => o.name),
      transportId: selectedTransport?.id,
      transportName: selectedTransport?.name,
      totalPrice,
      ...formData,
    };
    if (!gasUrl) {
      setTimeout(() => { setLoading(false); setReservationId("DEMO-" + Date.now()); setStep(5); }, 1200);
      return;
    }
    try {
      const res = await fetch(gasUrl, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.success) { setReservationId(data.reservationId); setStep(5); }
      else setError(data.error || "予約の送信に失敗しました");
    } catch (e) {
      setError("通信エラーが発生しました。しばらく経ってから再度お試しください。");
    }
    setLoading(false);
  };

  const booking = { staff: selectedStaff, date: selectedDate, time: selectedTime, menu: selectedMenu, options: selectedOptions, transport: selectedTransport, total: totalPrice, memberType };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Sans+JP:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        input:focus, textarea:focus { border-color: #C9A84C88 !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        a { color: #C9A84C; }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#080808", color: "#e0d0b0" }}>
        <div style={{ background: "#0a0a0a", borderBottom: "1px solid #1e1e1e", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#C9A84C", fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, letterSpacing: "0.2em" }}>RESERVATION</div>
            <div style={{ color: "#666", fontSize: 12, fontFamily: "'Noto Sans JP',sans-serif", marginTop: 2 }}>ご予約フォーム</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {dataLoading && <div style={{ color: "#C9A84C", fontSize: 11, fontFamily: "'Noto Sans JP',sans-serif" }}>読込中...</div>}
            <button onClick={() => setShowGasPanel(true)} style={{ background: "none", border: "1px solid #2a2a2a", color: "#888", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif" }}>⚙ GAS設定</button>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 60px" }}>
          {step < 5 && <StepBar step={step} />}
          {error && <div style={{ background: "#1a0505", border: "1px solid #f4433688", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#f44336", fontSize: 13, fontFamily: "'Noto Sans JP',sans-serif" }}>⚠ {error}</div>}
          {step === 0 && <StepMemberType onNext={t => { setMemberType(t); setStep(1); }} />}
          {step === 1 && <StepStaff staffList={staffList} onNext={s => { setSelectedStaff(s); setStep(2); }} onBack={() => setStep(0)} />}
          {step === 2 && <StepDateTime staff={selectedStaff} shifts={shifts} reservations={reservations} selectedMenu={selectedMenu} onNext={(d,t) => { setSelectedDate(d); setSelectedTime(t); setStep(3); }} onBack={() => setStep(1)} />}
          {step === 3 && <StepMenu staff={selectedStaff} menus={menus} options={optionsMap} transport={transportMap} memberType={memberType} onNext={(m,opts,tr,total) => { setSelectedMenu(m); setSelectedOptions(opts); setSelectedTransport(tr); setTotalPrice(total); setStep(4); }} onBack={() => setStep(2)} />}
          {step === 4 && <StepConfirm booking={booking} onSubmit={handleSubmit} onBack={() => setStep(3)} loading={loading} />}
          {step === 5 && <StepComplete booking={booking} reservationId={reservationId} />}
        </div>
        <div style={{ borderTop: "1px solid #1a1a1a", padding: "16px", textAlign: "center" }}>
          <div style={{ color: "#444", fontSize: 11, fontFamily: "'Cormorant Garamond',serif", letterSpacing: "0.2em" }}>DOMINANT TOKYO © 2024</div>
        </div>
      </div>
      {showGasPanel && <GasPanel gasUrl={gasUrl} setGasUrl={setGasUrl} onClose={() => setShowGasPanel(false)} />}
    </>
  );
}
