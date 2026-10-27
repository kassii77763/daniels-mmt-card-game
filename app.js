/**
 * MMT GRADE — Daniels Tactical Card Engine
 * 臨床カルタ・オセロ式 MMTバトルの新スコア対戦システム
 */

// 内蔵マスターカード（画像パス付き）
const DEFAULT_CARDS = [
  { id: 1, title: "頸部屈曲", region: "頸部", muscle: "胸鎖乳突筋", grade: "G5/4", pos: "背臥位", image: "assets/cards/neck_flexion.jpg", vector: "↓ 前額部加圧" },
  { id: 2, title: "頸部伸展", region: "頸部", muscle: "頭板状筋", grade: "G5/4", pos: "腹臥位", image: "assets/cards/neck_extension.jpg", vector: "↓ 後頭部加圧" },
  { id: 3, title: "体幹屈曲", region: "体幹", muscle: "腹直筋", grade: "G5", pos: "背臥位", image: "assets/cards/trunk_flexion.jpg", vector: "⇡ 頭後ろ手組み" },
  { id: 4, title: "体幹伸展", region: "体幹", muscle: "脊柱起立筋", grade: "G5", pos: "腹臥位", image: "assets/cards/trunk_extension.jpg", vector: "↓ 足首固定" },
  { id: 5, title: "肩関節屈曲", region: "上肢", muscle: "三角筋前部", grade: "G5/4", pos: "座位", image: "assets/cards/shoulder_flexion.jpg", vector: "↓ 上腕遠位加圧" },
  { id: 6, title: "肩関節外転", region: "上肢", muscle: "三角筋中部", grade: "G5/4", pos: "座位", image: "assets/cards/shoulder_abduction.jpg", vector: "↓ 上腕遠位加圧" },
  { id: 7, title: "肘関節屈曲", region: "上肢", muscle: "上腕二頭筋", grade: "G5/4", pos: "座位", image: "assets/cards/elbow_flexion.jpg", vector: "↓ 前腕遠位抵抗" },
  { id: 8, title: "手関節伸展", region: "上肢", muscle: "橈側手根伸筋群", grade: "G5/4", pos: "前腕支持", image: "assets/cards/wrist_extension.jpg", vector: "↓ 手背面加圧" },
  { id: 9, title: "股関節屈曲", region: "下肢", muscle: "腸腰筋", grade: "G5/4", pos: "端座位", image: "assets/cards/hip_flexion.jpg", vector: "↓ 大腿遠位加圧" },
  { id: 10, title: "膝関節伸展", region: "下肢", muscle: "大腿四頭筋", grade: "G5/4", pos: "端座位", image: "assets/cards/knee_extension.jpg", vector: "↓ 下腿遠位加圧" },
  { id: 11, title: "膝関節伸展 (G2)", region: "下肢", muscle: "大腿四頭筋", grade: "G2", pos: "側臥位", image: "assets/cards/knee_extension_g2.jpg", vector: "⤹ 屈曲位から前方伸展円弧" },
  { id: 12, title: "手関節伸展 (G2)", region: "上肢", muscle: "橈側手根伸筋群", grade: "G2", pos: "前腕中間位", image: "assets/cards/wrist_extension_g2.jpg", vector: "➔ 水平背屈スライド" },
  { id: 13, title: "体幹屈曲 (G4)", region: "体幹", muscle: "腹直筋", grade: "G4", pos: "背臥位", image: "assets/cards/trunk_flexion_g4.jpg", vector: "⇡ 胸の前腕組み" },
  { id: 14, title: "足関節底屈", region: "下肢", muscle: "下腿三頭筋", grade: "G5", pos: "立位", image: "assets/cards/ankle_plantar_g5.jpg", vector: "↑ 片脚立ち踵上げ25回" },
  { id: 15, title: "足関節背屈", region: "下肢", muscle: "前脛骨筋", grade: "G5/4", pos: "端座位", image: "assets/cards/ankle_dorsi_g5.jpg", vector: "↓ 前足部外返し加圧" }
];

const POSITIONS = ["背臥位", "腹臥位", "座位", "端座位", "側臥位", "前腕支持", "前腕中間位", "立位"];
const SUB_REGIONS = ["上肢", "下肢", "体幹", "頸部"];
const SUB_MOTIONS = ["屈曲", "伸展", "外転", "底屈", "背屈"];

// フローチャート用関節マスター
const FLOW_JOINTS_DATA = [
  { id: "knee_ext", name: "膝関節伸展", muscle: "大腿四頭筋", agPos: "端座位（下腿前上方伸展）", gePos: "側臥位（下腿を検者が支持）", palpation: "大腿四頭筋腱 / 膝蓋骨上部" },
  { id: "shoulder_abd", name: "肩関節外転", muscle: "三角筋中部", agPos: "座位（腕を真横90°挙上）", gePos: "背臥位（机・シーツ上を水平スライド）", palpation: "三角筋中部（肩峰外側直下）" },
  { id: "elbow_flex", name: "肘関節屈曲", muscle: "上腕二頭筋", agPos: "座位（前腕回外位で屈曲）", gePos: "座位（前腕を机上支持して水平屈曲）", palpation: "上腕二頭筋腱（肘窩中央深部）" },
  { id: "hip_flex", name: "股関節屈曲", muscle: "腸腰筋", agPos: "端座位（大腿を座面から持ち上げる）", gePos: "側臥位（検者が上肢・対側下肢を支持）", palpation: "鼠径靭帯直下（大腿三角）" },
  { id: "wrist_ext", name: "手関節伸展", muscle: "橈側手根伸筋群", agPos: "前腕支持（手首を机から反らす）", gePos: "前腕中間位（小指側接地・手刀姿勢で背屈）", palpation: "手関節背側橈側（長・短橈側手根伸筋腱）" },
  { id: "ankle_plantar", name: "足関節底屈", muscle: "下腿三頭筋", agPos: "立位（片脚立ち踵上げ25回）", gePos: "腹臥位 / 側臥位（足関節底屈）", palpation: "アキレス腱 / 腓腹筋筋腹" },
  { id: "ankle_dorsi", name: "足関節背屈", muscle: "前脛骨筋", agPos: "端座位（つま先を内反・背屈）", gePos: "側臥位（足部を検者が支持）", palpation: "前脛骨筋腱（足関節前内側）" },
  { id: "neck_flex", name: "頸部屈曲", muscle: "胸鎖乳突筋", agPos: "背臥位（顎を引いて頭部を浮かす）", gePos: "側臥位（頭部を検者が支持）", palpation: "胸鎖乳突筋前縁（頸部側面前方）" },
  { id: "trunk_flex", name: "体幹屈曲", muscle: "腹直筋", agPos: "背臥位（頭の後ろ手組み・肩甲骨離床）", gePos: "背臥位（骨盤前傾アシスト）", palpation: "腹直筋筋腹（正中線両側）" }
];

let selectedFlowJointId = "knee_ext";
let cardDatabase = [...DEFAULT_CARDS];
let drawDeck = [];
let discardPile = [];
let playerHand = [];
let cpuHand = [];

let currentField = null;
let nextField = null;

let playerWins = 0;
let cpuWins = 0;
let carryOverStars = 1; // DRAW時のキャリーオーバー
let bedRotateCount = 1; // 1試合1回限定
let isAnimating = false;
let isWaitingNextTurn = false;
let matchOver = false;

let cpuPersona = "pt"; // "pt" | "rookie" | "gravity"
let mistakeCardIds = new Set(); // 弱点カルテ（ミスしたカードIDの記録）
let currentEncFilter = "all"; // "all" | "weak"

// ============================================================================
// Web Audio API によるシンセサイズ効果音エンジン（外部ファイル不要）
// ============================================================================
let audioCtx = null;
let isSoundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  const btn = document.getElementById('btn-sound-toggle');
  if (btn) {
    if (isSoundEnabled) {
      btn.innerText = "🔊 ON";
      btn.classList.remove('muted');
      playSound('card');
    } else {
      btn.innerText = "🔇 OFF";
      btn.classList.add('muted');
    }
  }
}

function playSound(type) {
  if (!isSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (type === 'card') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'bonus') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'penalty') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(196, now);
      osc.frequency.setValueAtTime(164.81, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.22, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } else if (type === 'critical') {
      const rootNotes = [130.81, 261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      rootNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = (idx < 2) ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.25, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } else if (type === 'lose') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(349.23, now);
      osc.frequency.exponentialRampToValueAtTime(174.61, now + 0.28);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'draw') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(440, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.log("Audio play error:", e);
  }
}

// ============================================================================
// CPU キャラクター選択
// ============================================================================
function selectCpuPersona(personaKey) {
  cpuPersona = personaKey;
  playSound('card');

  ['p-pt', 'p-rookie', 'p-gravity'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`p-${personaKey}`);
  if (activeBtn) activeBtn.classList.add('active');

  const nameLabel = document.getElementById('cpu-name-label');
  if (nameLabel) {
    if (personaKey === 'pt') nameLabel.innerText = "指導者PT";
    else if (personaKey === 'rookie') nameLabel.innerText = "1年後輩";
    else if (personaKey === 'gravity') nameLabel.innerText = "重力マスター";
  }

  const ticker = document.getElementById('result-ticker');
  if (ticker) {
    if (personaKey === 'pt') ticker.innerText = "対戦相手を「指導者PT（王道の正確な判定）」に設定しました";
    else if (personaKey === 'rookie') ticker.innerText = "対戦相手を「1年後輩（たまに代償ミスをする）」に設定しました";
    else if (personaKey === 'gravity') ticker.innerText = "対戦相手を「重力マスター（G2逆転を狙ってくる）」に設定しました";
  }
}

// ============================================================================
// カードデータおよびゲーム進行ロジック
// ============================================================================

// 外部JSON読み込み
async function loadCardDatabase() {
  try {
    const res = await fetch('data/cards.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cardDatabase = data;
      }
    }
  } catch (e) {
    console.log("Using embedded card data:", e);
  }
}

// カードのGrade数値化
function getCardGradeValue(card) {
  if (!card || !card.grade) return 5;
  if (card.grade.includes('5')) return 5;
  if (card.grade.includes('4')) return 4;
  if (card.grade.includes('3')) return 3;
  if (card.grade.includes('2')) return 2;
  if (card.grade.includes('1')) return 1;
  return 0;
}

// 単一フィールドの生成
function generateSingleField(preferCardList = null) {
  let pos = "";
  if (preferCardList && preferCardList.length > 0 && Math.random() < 0.75) {
    pos = preferCardList[Math.floor(Math.random() * preferCardList.length)].pos;
  } else {
    pos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  }

  const isGravity = (pos === "側臥位" || pos === "前腕中間位");
  const subRegion = SUB_REGIONS[Math.floor(Math.random() * SUB_REGIONS.length)];
  const subMotion = SUB_MOTIONS[Math.floor(Math.random() * SUB_MOTIONS.length)];

  return { pos, isGravity, subRegion, subMotion };
}

// ゲーム初期化（新規マッチ開始）
function initGame() {
  matchOver = false;
  isWaitingNextTurn = false;
  playerWins = 0;
  cpuWins = 0;
  carryOverStars = 1;
  bedRotateCount = 1;
  discardPile = [];

  // 山札作成 & シャッフル
  drawDeck = cardDatabase.map((c, i) => ({ ...c, uid: `${c.id}_${Date.now()}_${i}` }))
    .sort(() => Math.random() - 0.5);

  // 初期手札5枚ずつ
  playerHand = drawDeck.splice(0, 5);
  cpuHand = drawDeck.splice(0, 5);

  currentField = generateSingleField(playerHand);
  nextField = generateSingleField(null);

  updateBedButton();
  updateFieldUI();
  updateLamps();
  updateCarryOverUI();
  renderBoard();

  // スロット・ボタンリセット
  const pSlot = document.getElementById('p1-slot');
  const cSlot = document.getElementById('cpu-slot');
  if (pSlot && cSlot) {
    pSlot.className = 'clash-slot';
    cSlot.className = 'clash-slot';
    pSlot.innerHTML = '<span class="slot-placeholder">あなたの札</span>';
    cSlot.innerHTML = '<span class="slot-placeholder">相手の札</span>';
  }
  
  const memo = document.getElementById('clinical-memo');
  const nextBtn = document.getElementById('btn-next-turn');
  if (memo) memo.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';

  document.getElementById('result-ticker').innerText = "場のお題に合致するカードを手札から選んでください";
}

// 山札から1枚引く
function drawSingleCard() {
  if (drawDeck.length === 0) {
    if (discardPile.length > 0) {
      drawDeck = discardPile.sort(() => Math.random() - 0.5);
      discardPile = [];
    } else {
      drawDeck = cardDatabase.map((c, i) => ({ ...c, uid: `${c.id}_${Date.now()}_${i}` }))
        .sort(() => Math.random() - 0.5);
    }
  }
  return drawDeck.pop();
}

// フィールド更新（NEXTからスライド）
function rollField() {
  if (nextField) {
    currentField = nextField;
  } else {
    currentField = generateSingleField(playerHand);
  }
  nextField = generateSingleField(null);

  updateFieldUI();
}

// フィールドUIの更新
function updateFieldUI() {
  const fieldBadge = document.getElementById('field-badge');
  const fieldName = document.getElementById('field-name');
  const fieldSubName = document.getElementById('field-sub-name');
  const fieldNextName = document.getElementById('field-next-name');

  if (fieldName) {
    fieldName.innerText = currentField.pos + (currentField.isGravity ? " (重力除去位)" : "");
  }
  if (fieldSubName) {
    fieldSubName.innerText = `${currentField.subRegion} / ${currentField.subMotion}`;
  }
  if (fieldNextName && nextField) {
    fieldNextName.innerText = nextField.pos + (nextField.isGravity ? "(重力除去)" : "");
  }

  if (fieldBadge) {
    if (currentField.isGravity) {
      fieldBadge.classList.add('gravity-mode');
    } else {
      fieldBadge.classList.remove('gravity-mode');
    }
    fieldBadge.style.transform = "scale(0.92)";
    setTimeout(() => { fieldBadge.style.transform = "scale(1)"; }, 180);
  }
}

// 3勝ランプゲージの更新
function updateLamps() {
  for (let i = 1; i <= 3; i++) {
    const pLamp = document.getElementById(`p-lamp-${i}`);
    const cLamp = document.getElementById(`c-lamp-${i}`);
    if (pLamp) {
      if (i <= playerWins) pLamp.classList.add('player-lit');
      else pLamp.classList.remove('player-lit');
    }
    if (cLamp) {
      if (i <= cpuWins) cLamp.classList.add('cpu-lit');
      else cLamp.classList.remove('cpu-lit');
    }
  }
}

// キャリーオーバーバッジの更新
function updateCarryOverUI() {
  const badge = document.getElementById('carry-over-badge');
  const starsSpan = document.getElementById('carry-over-stars');
  if (!badge) return;

  if (carryOverStars > 1) {
    badge.style.display = 'block';
    if (starsSpan) starsSpan.innerText = carryOverStars;
  } else {
    badge.style.display = 'none';
  }
}

// 体位変更（ベッド操作）ボタン処理
function useBedRotate() {
  if (isAnimating || isWaitingNextTurn || matchOver || bedRotateCount <= 0) return;

  playSound('card');
  bedRotateCount--;
  updateBedButton();
  
  currentField = generateSingleField(playerHand);
  updateFieldUI();
  renderBoard();

  const ticker = document.getElementById('result-ticker');
  if (ticker) {
    ticker.innerText = `🛏️ ベッド操作発動！場のお題を【${currentField.pos}】に変更しました！`;
  }
}

// 体位変更ボタンの見た目更新
function updateBedButton() {
  const btn = document.getElementById('btn-bed-rotate');
  if (!btn) return;
  if (bedRotateCount > 0) {
    btn.disabled = false;
    btn.innerHTML = `🛏️ 体位変更［${bedRotateCount}回］`;
  } else {
    btn.disabled = true;
    btn.innerHTML = `🛏️ 体位変更［使用済］`;
  }
}

// スコア計算ロジック
function calculateScore(card, field) {
  const base = getCardGradeValue(card);
  const isGravityField = field.isGravity || field.pos === "側臥位" || field.pos === "前腕中間位";
  const isG2 = (card.grade && card.grade.includes("2"));
  const isPosMatch = (card.pos === field.pos);

  let posBonus = 0;
  let isG2Special = false;

  if (isPosMatch) {
    if (isGravityField && isG2) {
      posBonus = 5; // 重力除去位でG2一致！特大ボーナス +5点
      isG2Special = true;
    } else {
      posBonus = 2; // 通常の一致 +2点
    }
  } else {
    posBonus = -2; // 肢位不一致（代償測定） -2点
  }

  // サブ条件（部位一致または運動方向一致で +1点）
  let subBonus = 0;
  const matchRegion = (card.region === field.subRegion);
  const matchMotion = (card.title.includes(field.subMotion) || (card.vector && card.vector.includes(field.subMotion)));
  if (matchRegion || matchMotion) {
    subBonus = 1;
  }

  const total = Math.max(0, base + posBonus + subBonus);

  // 内訳テキスト作成
  const parts = [`G${base}`];
  if (isG2Special) {
    parts.push(`重力除去特効+5`);
  } else if (posBonus > 0) {
    parts.push(`一致+2`);
  } else {
    parts.push(`不一致-2`);
  }
  if (subBonus > 0) {
    parts.push(`特効+1`);
  }

  return {
    total,
    base,
    posBonus,
    subBonus,
    isPosMatch,
    isG2Special,
    matchRegion,
    matchMotion,
    breakdownText: `${parts.join(' ')} ＝ ${total}点`
  };
}

// 臨床ワンポイント解説の自動生成
function generateClinicalFeedback(pCard, pScore, cpuCard, cScore) {
  if (pScore.isG2Special) {
    return `⚡ 重力除去位クリティカル！【${pCard.title}】のGrade 2は摩擦・重力を最小化する「${pCard.pos}」が標準肢位です（+5pt特効！）`;
  }
  if (pScore.isPosMatch && !cScore.isPosMatch) {
    return `⚠️ 相手の代償測定ミス！【${cpuCard.title}】の正しい標準肢位は「${cpuCard.pos}」であり、「${currentField.pos}」では代償が混入します（-2pt）`;
  }
  if (!pScore.isPosMatch && cScore.isPosMatch) {
    return `⚠️ 代償測定ペナルティ！【${pCard.title}】を「${currentField.pos}」で測ると正しい筋力が出ません（標準は「${pCard.pos}」）`;
  }
  if (pScore.isPosMatch && cScore.isPosMatch && pScore.subBonus > 0 && cScore.subBonus === 0) {
    return `🎯 特効コンボ決着！【${pCard.title}】が場のボーナス条件（${currentField.subRegion} / ${currentField.subMotion}）を満たし、同点対決を制しました（+1pt）`;
  }
  if (pScore.isPosMatch) {
    return `⭕ 正しい測定肢位！【${pCard.title}（${pCard.muscle}）】は「${pCard.pos}」にて抗重力位で正確に測定します（+2pt）`;
  }
  return `⚖️ 互角の臨床測定！両者とも【${currentField.pos}】に対する測定精度が同点となりました`;
}

// ボード描画
function renderBoard() {
  document.getElementById('player-rem-count').innerText = playerHand.length;
  document.getElementById('deck-rem-count').innerText = drawDeck.length;

  // CPU Hand UI (裏面ヒント・属性チラ見せデザイン)
  const cpuContainer = document.getElementById('cpu-hand-container');
  cpuContainer.innerHTML = cpuHand.map(c => `
    <div class="cpu-mini-card">
      <span class="cpu-card-hint-region">${c.region}</span>
      <span class="cpu-card-hint-grade">${c.grade || 'G5'}</span>
    </div>
  `).join('');

  // Player Hand UI (直感オーラ表示)
  const playerContainer = document.getElementById('player-hand-container');
  playerContainer.innerHTML = playerHand.map((c, i) => {
    const isPosMatch = (c.pos === currentField.pos);
    const isGravityField = currentField.isGravity || currentField.pos === "側臥位" || currentField.pos === "前腕中間位";
    const isG2 = (c.grade && c.grade.includes("2"));

    let auraClass = "match-dim";
    if (isPosMatch) {
      if (isGravityField && isG2) {
        auraClass = "match-gravity";
      } else {
        auraClass = "match-normal";
      }
    }

    const scorePrev = calculateScore(c, currentField);

    return `
      <div class="k-card ${auraClass}" onclick="playCard(${i})">
        <div class="kc-top">
          <span class="kc-region-badge">${c.region}</span>
          <span class="kc-grade-badge">${c.grade || 'G5'}</span>
        </div>
        
        <div class="kc-art-window">
          ${c.image 
            ? `<img src="${c.image}" alt="${c.title}" loading="lazy">` 
            : `<div class="kc-art-placeholder">MMT<br>${c.pos}</div>`
          }
        </div>

        <div class="kc-meta">
          <div class="kc-title">${c.title}</div>
          <div class="kc-muscle">${c.muscle}</div>
        </div>

        <div class="kc-footer">
          <span>予想:${scorePrev.total}点</span>
          <span class="kc-pos">${c.pos}</span>
        </div>
      </div>
    `;
  }).join('');
}

// カードをプレイ
function playCard(index) {
  if (isAnimating || isWaitingNextTurn || matchOver) return;
  const pCard = playerHand[index];
  if (!pCard) return;

  isAnimating = true;
  playSound('card');

  // プレイヤー手札から抜き出し
  playerHand.splice(index, 1);

  // CPU思考ロジック（ペルソナ別）
  let cpuIndex = 0;
  if (cpuPersona === "rookie" && Math.random() < 0.35) {
    // 1年後輩: 35%の確率で適当に選んで代償ミス
    cpuIndex = Math.floor(Math.random() * cpuHand.length);
  } else if (cpuPersona === "gravity") {
    // 重力マスター: 重力除去位ならG2最優先、通常時はG2温存
    const isGravityField = currentField.isGravity || currentField.pos === "側臥位" || currentField.pos === "前腕中間位";
    let foundG2 = cpuHand.findIndex(c => c.grade && c.grade.includes("2"));
    if (isGravityField && foundG2 !== -1) {
      cpuIndex = foundG2;
    } else {
      let bestScore = -999;
      cpuHand.forEach((c, idx) => {
        if (!isGravityField && c.grade && c.grade.includes("2")) return;
        const scoreObj = calculateScore(c, currentField);
        if (scoreObj.total > bestScore) {
          bestScore = scoreObj.total;
          cpuIndex = idx;
        }
      });
    }
  } else {
    // 指導者PT (王道)
    let bestScore = -999;
    cpuHand.forEach((c, idx) => {
      const scoreObj = calculateScore(c, currentField);
      let evalVal = scoreObj.total + (Math.random() * 0.4);
      if (evalVal > bestScore) {
        bestScore = evalVal;
        cpuIndex = idx;
      }
    });
  }

  const cpuCard = cpuHand.splice(cpuIndex, 1)[0];
  discardPile.push(pCard, cpuCard);

  // 要素取得
  const pSlot = document.getElementById('p1-slot');
  const cSlot = document.getElementById('cpu-slot');
  const ticker = document.getElementById('result-ticker');
  const memo = document.getElementById('clinical-memo');
  const nextBtn = document.getElementById('btn-next-turn');
  const battleBoard = document.getElementById('battle-board');

  if (memo) memo.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';

  // スコア事前計算
  const pScore = calculateScore(pCard, currentField);
  const cScore = calculateScore(cpuCard, currentField);

  // プレイヤーが代償ミス（不一致）した場合は弱点カルテに記録！
  if (!pScore.isPosMatch) {
    mistakeCardIds.add(pCard.id);
    updateWeakCount();
  }

  // 0.0秒（オープン）：お互いのカードが場に出る
  pSlot.className = 'clash-slot filled suspense';
  cSlot.className = 'clash-slot filled suspense';

  pSlot.innerHTML = renderCountUpSlotCard(pCard, "あなた", "var(--accent-blue)", pScore.base, "基礎Grade");
  cSlot.innerHTML = renderCountUpSlotCard(cpuCard, "相手", "var(--accent-red)", cScore.base, "基礎Grade");

  ticker.innerText = `⚔️ カード対峙！基礎Grade（あなた ${pScore.base} vs 相手 ${cScore.base}）`;
  renderBoard();

  // 0.7秒（スコア加算）
  setTimeout(() => {
    pSlot.classList.remove('suspense');
    cSlot.classList.remove('suspense');

    pSlot.innerHTML = renderSlotCard(pCard, "あなた", "var(--accent-blue)", pScore, true);
    cSlot.innerHTML = renderSlotCard(cpuCard, "相手", "var(--accent-red)", cScore, true);

    const isBonus = (pScore.posBonus > 0 || pScore.subBonus > 0);
    playSound(isBonus ? 'bonus' : 'penalty');

    ticker.innerText = `⚖️ スコア確定！ あなた ${pScore.total}点 (${pScore.breakdownText}) vs 相手 ${cScore.total}点`;

    // 1.4秒（勝敗確定＆一時停止）
    setTimeout(() => {
      let resultMsg = "";
      const isCritical = (pScore.total >= 7 || pScore.isG2Special || cScore.total >= 7 || cScore.isG2Special);

      if (pScore.total > cScore.total) {
        pSlot.classList.add('winner');
        cSlot.classList.add('loser');

        if (isCritical) {
          playSound('critical');
          if (battleBoard) {
            battleBoard.classList.remove('shake', 'flash-gold', 'flash-purple');
            void battleBoard.offsetWidth;
            battleBoard.classList.add('shake', pScore.isG2Special ? 'flash-purple' : 'flash-gold');
          }
        } else {
          playSound('win');
        }

        const wonStars = carryOverStars;
        playerWins += wonStars;
        carryOverStars = 1;

        if (pScore.isG2Special) {
          resultMsg = `🔥 重力除去位で大逆転！【${pCard.title}】が相手を圧倒！ ★${wonStars > 1 ? wonStars + '個' : ''}獲得！`;
        } else if (pScore.total >= 8) {
          resultMsg = `⚡ 8点クリティカル勝利！完全一致フルコンボ！ ★${wonStars > 1 ? wonStars + '個' : ''}獲得！`;
        } else {
          resultMsg = `🎉 あなたの勝ち！【${pCard.title}】＞ 相手(${cScore.total}点) ★${wonStars > 1 ? wonStars + '個' : ''}獲得！`;
        }
      } else if (pScore.total < cScore.total) {
        cSlot.classList.add('winner');
        pSlot.classList.add('loser');
        playSound('lose');

        const wonStars = carryOverStars;
        cpuWins += wonStars;
        carryOverStars = 1;

        resultMsg = `💦 相手の勝ち！相手の【${cpuCard.title}】＞ あなた(${pScore.total}点)`;
      } else {
        playSound('draw');
        carryOverStars++;
        resultMsg = `⚖️ 引き分け（DRAW）！勝敗は次ターンへ持ち越し（キャリーオーバー ★${carryOverStars}個！）`;
      }

      updateLamps();
      updateCarryOverUI();
      ticker.innerText = resultMsg;

      const clinicalText = generateClinicalFeedback(pCard, pScore, cpuCard, cScore);
      if (memo) {
        memo.innerText = clinicalText;
        memo.style.display = 'block';
      }

      if (nextBtn) {
        nextBtn.style.display = 'inline-block';
      }

      isAnimating = false;
      isWaitingNextTurn = true;
    }, 700);
  }, 700);
}

// 「次のターンへ ▶」処理
function proceedToNextTurn() {
  if (!isWaitingNextTurn) return;
  isWaitingNextTurn = false;
  isAnimating = true;

  playSound('card');

  const pSlot = document.getElementById('p1-slot');
  const cSlot = document.getElementById('cpu-slot');
  const ticker = document.getElementById('result-ticker');
  const memo = document.getElementById('clinical-memo');
  const nextBtn = document.getElementById('btn-next-turn');
  const battleBoard = document.getElementById('battle-board');

  if (nextBtn) nextBtn.style.display = 'none';
  if (memo) memo.style.display = 'none';

  pSlot.classList.add('exit-fade');
  cSlot.classList.add('exit-fade');
  ticker.innerText = "✨ 測定完了... 次の肢位へ移行中";

  setTimeout(() => {
    if (battleBoard) {
      battleBoard.classList.remove('shake', 'flash-gold', 'flash-purple');
    }
    pSlot.className = 'clash-slot';
    cSlot.className = 'clash-slot';
    pSlot.innerHTML = '<span class="slot-placeholder">あなたの札</span>';
    cSlot.innerHTML = '<span class="slot-placeholder">相手の札</span>';

    playerHand.push(drawSingleCard());
    cpuHand.push(drawSingleCard());

    isAnimating = false;

    if (playerWins >= 3 || cpuWins >= 3) {
      matchOver = true;
      const isWinner = playerWins >= 3;
      if (isWinner) playSound('critical');
      else playSound('lose');

      ticker.innerText = isWinner
        ? "🏆 3勝達成！あなたのマッチ完全勝利です！「勝負」タブで再戦できます。"
        : "💀 相手が3勝達成しました...！「勝負」タブで再戦できます。";
      setTimeout(() => {
        if (confirm(isWinner ? "🏆 3勝先取！マッチ完全勝利！もう一度遊びますか？" : "💀 相手が3勝先取しました。もう一度挑戦しますか？")) {
          initGame();
        }
      }, 500);
    } else {
      rollField();
      renderBoard();
      ticker.innerText = "場のお題に合致するカードを手札から選んでください";
    }
  }, 950);
}

// 段階的カウントアップ中のスロットカード描画ヘルパー
function renderCountUpSlotCard(c, ownerLabel, labelColor, currentDisplayScore, stepLabel) {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:2px;">
      <span style="font-size:0.68rem; color:${labelColor}; font-weight:800;">${ownerLabel}</span>
      <span style="font-size:0.75rem; background:var(--text-primary); color:#FFF; padding:2px 8px; border-radius:999px; font-weight:900; box-shadow:0 1px 3px rgba(0,0,0,0.2);">
        ${currentDisplayScore}点
      </span>
    </div>
    <div style="width:100%; height:105px; border-radius:6px; overflow:hidden; margin:4px 0; background:var(--bg-bone); border:1px solid var(--border-hairline);">
      ${c.image 
        ? `<img src="${c.image}" style="width:100%; height:100%; object-fit:cover;" alt="">` 
        : `<div style="height:100%; display:flex; align-items:center; justify-content:center; font-size:0.68rem; color:var(--text-muted); font-weight:700;">${c.title}</div>`
      }
    </div>
    <div style="font-size:0.82rem; font-weight:900; color:var(--text-primary); line-height:1.2;">${c.title}</div>
    <div style="font-size:0.65rem; color:var(--accent-amber); font-weight:800; margin-top:2px; line-height:1.2;">
      ${stepLabel}
    </div>
  `;
}

// 確定時スロットカード描画ヘルパー
function renderSlotCard(c, ownerLabel, labelColor, scoreObj, isRevealed) {
  const scoreBadgeHtml = isRevealed
    ? `<span style="font-size:0.75rem; background:var(--text-primary); color:#FFF; padding:2px 8px; border-radius:999px; font-weight:900; box-shadow:0 1px 3px rgba(0,0,0,0.2);">${scoreObj.total}点</span>`
    : `<span style="font-size:0.68rem; background:var(--accent-amber-bg); color:var(--accent-amber); border:1px solid var(--accent-amber); padding:1px 6px; border-radius:999px; font-weight:800;">⏳ 判定中</span>`;

  const footerText = isRevealed
    ? `<div style="font-size:0.68rem; color:${scoreObj.posBonus > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight:800; margin-top:2px; line-height:1.2;">
        ${scoreObj.breakdownText}
       </div>`
    : `<div style="font-size:0.65rem; color:var(--text-muted); font-weight:700; margin-top:2px;">
        肢位: ${c.pos}
       </div>`;

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:2px;">
      <span style="font-size:0.68rem; color:${labelColor}; font-weight:800;">${ownerLabel}</span>
      ${scoreBadgeHtml}
    </div>
    <div style="width:100%; height:105px; border-radius:6px; overflow:hidden; margin:4px 0; background:var(--bg-bone); border:1px solid var(--border-hairline);">
      ${c.image 
        ? `<img src="${c.image}" style="width:100%; height:100%; object-fit:cover;" alt="">` 
        : `<div style="height:100%; display:flex; align-items:center; justify-content:center; font-size:0.68rem; color:var(--text-muted); font-weight:700;">${c.title}</div>`
      }
    </div>
    <div style="font-size:0.82rem; font-weight:900; color:var(--text-primary); line-height:1.2;">${c.title}</div>
    ${footerText}
  `;
}

// ============================================================================
// 判定フローチャート（段階3スタート・別タブ）ロジック
// ============================================================================
function initFlowChart() {
  const container = document.getElementById('flow-joint-buttons');
  if (!container) return;

  container.innerHTML = FLOW_JOINTS_DATA.map(j => `
    <button class="joint-btn ${j.id === selectedFlowJointId ? 'active' : ''}" onclick="selectFlowJoint('${j.id}')">
      ${j.name}
    </button>
  `).join('');

  renderFlowChartContent();
}

function selectFlowJoint(jointId) {
  selectedFlowJointId = jointId;
  playSound('card');

  document.querySelectorAll('.joint-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.joint-btn')).find(b => b.innerText.includes(FLOW_JOINTS_DATA.find(x => x.id === jointId).name));
  if (activeBtn) activeBtn.classList.add('active');

  renderFlowChartContent();
}

function renderFlowChartContent() {
  const joint = FLOW_JOINTS_DATA.find(x => x.id === selectedFlowJointId) || FLOW_JOINTS_DATA[0];

  const titleEl = document.getElementById('flow-joint-title');
  const agPosEl = document.getElementById('flow-ag-pos');
  const gePosEl = document.getElementById('flow-ge-pos');
  const touchEl = document.getElementById('flow-palpation');

  if (titleEl) titleEl.innerText = `${joint.name}（${joint.muscle}）`;
  if (agPosEl) agPosEl.innerText = joint.agPos;
  if (gePosEl) gePosEl.innerText = joint.gePos;
  if (touchEl) touchEl.innerText = joint.palpation;
}

// ============================================================================
// 図鑑 ＆ 弱点カルテ（ミス記録）ロジック
// ============================================================================
function updateWeakCount() {
  const countEl = document.getElementById('weak-count');
  if (countEl) countEl.innerText = mistakeCardIds.size;
}

function filterEncyclopedia(filterType) {
  currentEncFilter = filterType;
  playSound('card');

  const btnAll = document.getElementById('filter-all');
  const btnWeak = document.getElementById('filter-weak');
  if (filterType === 'all') {
    if (btnAll) btnAll.classList.add('active');
    if (btnWeak) btnWeak.classList.remove('active');
  } else {
    if (btnAll) btnAll.classList.remove('active');
    if (btnWeak) btnWeak.classList.add('active');
  }

  renderEncyclopedia();
}

function renderEncyclopedia() {
  const container = document.getElementById('encyclopedia-container');
  if (!container) return;

  let displayCards = cardDatabase;
  if (currentEncFilter === 'weak') {
    displayCards = cardDatabase.filter(c => mistakeCardIds.has(c.id));
  }

  if (displayCards.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
        🎉 要復習の代償ミスカードはありません！全問パーフェクト測定中！
      </div>
    `;
    return;
  }

  container.innerHTML = displayCards.map(c => {
    const isWeak = mistakeCardIds.has(c.id);
    return `
      <div class="k-card ${isWeak ? 'weak-mark' : ''}" style="height:140px; cursor:default;">
        <div class="kc-top">
          <span class="kc-region-badge">${c.region}</span>
          <span class="kc-grade-badge">${c.grade || 'G5'}</span>
        </div>
        <div class="kc-art-window" style="height:62px;">
          ${c.image 
            ? `<img src="${c.image}" alt="${c.title}" loading="lazy">` 
            : `<div class="kc-art-placeholder">MMT<br>${c.pos}</div>`
          }
        </div>
        <div class="kc-meta">
          <div class="kc-title">${c.title}</div>
          <div class="kc-muscle">${c.muscle}</div>
        </div>
        <div class="kc-footer">
          <span>${c.vector || '標準'}</span>
          <span class="kc-pos">${c.pos}</span>
        </div>
      </div>
    `;
  }).join('');
}

// タブ切り替え
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('card');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.add('active');

    if (tabId === 'flow') initFlowChart();
    if (tabId === 'list') {
      updateWeakCount();
      renderEncyclopedia();
    }
    if (tabId === 'battle' && matchOver) initGame();
  });
});

// 起動
(async function() {
  await loadCardDatabase();
  initGame();
  initFlowChart();
})();
