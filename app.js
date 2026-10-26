/**
 * MMT GRADE — Daniels Tactical Card Engine
 * カルタ・オセロ式 臨床判定＆スプリング物理制御
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

let cardDatabase = [...DEFAULT_CARDS];
let playerHand = [];
let cpuHand = [];
let currentField = "端座位";
let wins = 0, losses = 0;
let isAnimating = false;

// 外部JSON読み込み（ある場合）
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

// ゲーム初期化（ディープクローン）
function initGame() {
  const cloned = cardDatabase.map(c => ({ ...c, used: false }));
  const shuffled = cloned.sort(() => Math.random() - 0.5);

  playerHand = shuffled.slice(0, 5);
  cpuHand = shuffled.slice(5, 10);

  rollField();
  renderBoard();
}

// 場のお題決定（手札に合わせて試合が成立しやすい確率調整）
function rollField() {
  const activeCards = playerHand.filter(c => !c.used);
  if (activeCards.length > 0 && Math.random() < 0.8) {
    currentField = activeCards[Math.floor(Math.random() * activeCards.length)].pos;
  } else {
    currentField = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  }

  const fieldBadge = document.getElementById('field-badge');
  const fieldName = document.getElementById('field-name');
  if (fieldName) {
    fieldName.innerText = currentField;
    // フリップ変形マイクロアニメーション
    if (fieldBadge) {
      fieldBadge.style.transform = "scale(0.92)";
      setTimeout(() => { fieldBadge.style.transform = "scale(1)"; }, 180);
    }
  }
}

// ボード描画
function renderBoard() {
  const pRem = playerHand.filter(c => !c.used).length;
  const cRem = cpuHand.filter(c => !c.used).length;

  document.getElementById('player-rem-count').innerText = pRem;
  document.getElementById('cpu-rem-count').innerText = cRem;
  document.getElementById('score-readout').innerText = `勝 ${wins} — ${losses} 負`;

  // CPU Hand UI (ミニマリスト・裏面風)
  const cpuContainer = document.getElementById('cpu-hand-container');
  cpuContainer.innerHTML = cpuHand.map(c => `
    <div class="cpu-mini-card ${c.used ? 'used' : ''}">
      <span style="color:var(--text-muted); font-size:0.52rem;">${c.region}</span>
      <strong style="color:var(--text-primary); font-size:0.58rem;">${c.used ? '済' : c.title}</strong>
    </div>
  `).join('');

  // Player Hand UI (額縁アートウィンドウ付きカルタ札)
  const playerContainer = document.getElementById('player-hand-container');
  playerContainer.innerHTML = playerHand.map((c, i) => `
    <div class="k-card ${c.used ? 'used' : ''}" onclick="playCard(${i})">
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
        <span>${c.vector || '標準'}</span>
        <span class="kc-pos">${c.pos}</span>
      </div>
    </div>
  `).join('');
}

// カードをプレイ
function playCard(index) {
  if (isAnimating) return;
  const pCard = playerHand[index];
  if (!pCard || pCard.used) return;

  isAnimating = true;
  pCard.used = true;

  // CPU思考ロジック（場の一致を賢く優先）
  const activeCpu = cpuHand.filter(c => !c.used);
  if (activeCpu.length === 0) return;

  const matchCpu = activeCpu.filter(c => c.pos === currentField);
  let cpuCard = (matchCpu.length > 0 && Math.random() < 0.75)
    ? matchCpu[0]
    : activeCpu[Math.floor(Math.random() * activeCpu.length)];

  cpuCard.used = true;

  // アリーナへカード展開（画像付き）
  const pSlot = document.getElementById('p1-slot');
  const cSlot = document.getElementById('cpu-slot');

  pSlot.classList.add('filled');
  cSlot.classList.add('filled');

  pSlot.innerHTML = renderSlotCard(pCard, "あなた", "var(--accent-blue)");
  cSlot.innerHTML = renderSlotCard(cpuCard, "相手", "var(--accent-red)");

  // 判定
  const pMatch = pCard.pos === currentField;
  const cpuMatch = cpuCard.pos === currentField;

  let resultMsg = "";
  if (pMatch && !cpuMatch) {
    wins++;
    resultMsg = `🎉 あなたの勝ち！【${pCard.title}】が指定肢位（${currentField}）と完全一致！`;
  } else if (!pMatch && cpuMatch) {
    losses++;
    resultMsg = `💦 相手の勝ち！相手が【${cpuCard.title}】（${cpuCard.pos}）で肢位を合わせました`;
  } else if (pMatch && cpuMatch) {
    resultMsg = `⚖️ 引き分け！両者とも指定肢位（${currentField}）で一致！`;
  } else {
    resultMsg = `⚡ 不成立（両者不一致）！どちらも【${currentField}】ではありませんでした`;
  }

  document.getElementById('result-ticker').innerText = resultMsg;
  renderBoard();

  // 次のターン進行
  setTimeout(() => {
    isAnimating = false;
    if (playerHand.every(c => c.used)) {
      document.getElementById('result-ticker').innerText = "🏁 全5回戦終了！新たなカードを配ります...";
      setTimeout(() => {
        initGame();
        pSlot.classList.remove('filled');
        cSlot.classList.remove('filled');
        pSlot.innerHTML = '<span class="slot-placeholder">あなたの札</span>';
        cSlot.innerHTML = '<span class="slot-placeholder">相手の札</span>';
        document.getElementById('result-ticker').innerText = "場のお題に合致するカードを手札から選んでください";
      }, 1300);
    } else {
      rollField();
    }
  }, 1000);
}

// アリーナ内カード描画ヘルパー
function renderSlotCard(c, ownerLabel, labelColor) {
  return `
    <span style="font-size:0.6rem; color:${labelColor}; font-weight:800;">${ownerLabel}</span>
    <div style="width:100%; height:75px; border-radius:4px; overflow:hidden; margin:3px 0; background:var(--bg-bone);">
      ${c.image 
        ? `<img src="${c.image}" style="width:100%; height:100%; object-fit:cover;" alt="">` 
        : `<div style="height:100%; display:flex; align-items:center; justify-content:center; font-size:0.6rem; color:var(--text-muted); font-weight:700;">${c.title}</div>`
      }
    </div>
    <div style="font-size:0.75rem; font-weight:900; color:var(--text-primary); line-height:1.2;">${c.title}</div>
    <div style="font-size:0.62rem; color:var(--accent-amber); font-weight:800; margin-top:2px;">${c.pos}</div>
  `;
}

// 図鑑描画
function renderEncyclopedia() {
  const container = document.getElementById('encyclopedia-container');
  if (!container) return;

  container.innerHTML = cardDatabase.map(c => `
    <div class="k-card" style="height:140px; cursor:default;">
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
  `).join('');
}

// タブ切り替え
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.add('active');

    if (tabId === 'list') renderEncyclopedia();
  });
});

// 起動
(async function() {
  await loadCardDatabase();
  initGame();
})();
