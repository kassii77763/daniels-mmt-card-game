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

let cardDatabase = [...DEFAULT_CARDS];
let drawDeck = [];
let discardPile = [];
let playerHand = [];
let cpuHand = [];
let currentField = {
  pos: "端座位",
  subRegion: "下肢",
  subMotion: "伸展",
  isGravity: false
};

let playerWins = 0;
let cpuWins = 0;
let bedRotateCount = 1; // 1試合1回限定
let isAnimating = false;
let matchOver = false;

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

// カードのGrade数値化 (G5/4 -> 5, G2 -> 2)
function getCardGradeValue(card) {
  if (!card || !card.grade) return 5;
  if (card.grade.includes('5')) return 5;
  if (card.grade.includes('4')) return 4;
  if (card.grade.includes('3')) return 3;
  if (card.grade.includes('2')) return 2;
  if (card.grade.includes('1')) return 1;
  return 0;
}

// ゲーム初期化（新規マッチ開始）
function initGame() {
  matchOver = false;
  playerWins = 0;
  cpuWins = 0;
  bedRotateCount = 1;
  discardPile = [];

  // 山札作成 & シャッフル
  drawDeck = cardDatabase.map((c, i) => ({ ...c, uid: `${c.id}_${Date.now()}_${i}` }))
    .sort(() => Math.random() - 0.5);

  // 初期手札5枚ずつ
  playerHand = drawDeck.splice(0, 5);
  cpuHand = drawDeck.splice(0, 5);

  updateBedButton();
  rollField();
  renderBoard();

  // スロットリセット
  const pSlot = document.getElementById('p1-slot');
  const cSlot = document.getElementById('cpu-slot');
  if (pSlot && cSlot) {
    pSlot.classList.remove('filled');
    cSlot.classList.remove('filled');
    pSlot.innerHTML = '<span class="slot-placeholder">あなたの札</span>';
    cSlot.innerHTML = '<span class="slot-placeholder">相手の札</span>';
  }
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

// 場のお題決定（指定肢位 & サブ特効条件）
function rollField() {
  // プレイヤー手札の肢位を少し優先して引きやすく調整
  if (playerHand.length > 0 && Math.random() < 0.75) {
    currentField.pos = playerHand[Math.floor(Math.random() * playerHand.length)].pos;
  } else {
    currentField.pos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  }

  // 重力除去位フラグ（側臥位・前腕中間位）
  currentField.isGravity = (currentField.pos === "側臥位" || currentField.pos === "前腕中間位");

  // サブ条件（部位＆運動）
  currentField.subRegion = SUB_REGIONS[Math.floor(Math.random() * SUB_REGIONS.length)];
  currentField.subMotion = SUB_MOTIONS[Math.floor(Math.random() * SUB_MOTIONS.length)];

  // UI更新
  const fieldBadge = document.getElementById('field-badge');
  const fieldName = document.getElementById('field-name');
  const fieldSubName = document.getElementById('field-sub-name');

  if (fieldName) {
    fieldName.innerText = currentField.pos + (currentField.isGravity ? " (重力除去位)" : "");
  }
  if (fieldSubName) {
    fieldSubName.innerText = `${currentField.subRegion} / ${currentField.subMotion}`;
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

// 体位変更（ベッド操作）ボタン処理
function useBedRotate() {
  if (isAnimating || matchOver || bedRotateCount <= 0) return;

  bedRotateCount--;
  updateBedButton();
  rollField();

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
      // 重力除去位でG2が一致！特大ボーナス +5点 (合計7点)
      posBonus = 5;
      isG2Special = true;
    } else {
      // 通常の一致 +2点
      posBonus = 2;
    }
  } else {
    // 肢位不一致（代償測定） -2点
    posBonus = -2;
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
    breakdownText: `${parts.join(' ')} ＝ ${total}点`
  };
}

// ボード描画
function renderBoard() {
  document.getElementById('player-rem-count').innerText = playerHand.length;
  document.getElementById('cpu-rem-count').innerText = cpuHand.length;
  document.getElementById('deck-rem-count').innerText = drawDeck.length;
  document.getElementById('score-readout').innerText = `★ ${playerWins}勝 — ${cpuWins}勝 (3勝先取)`;

  // CPU Hand UI
  const cpuContainer = document.getElementById('cpu-hand-container');
  cpuContainer.innerHTML = cpuHand.map(c => `
    <div class="cpu-mini-card">
      <span style="color:var(--text-muted); font-size:0.52rem;">${c.region}</span>
      <strong style="color:var(--text-primary); font-size:0.58rem;">${c.title}</strong>
    </div>
  `).join('');

  // Player Hand UI
  const playerContainer = document.getElementById('player-hand-container');
  playerContainer.innerHTML = playerHand.map((c, i) => {
    const isMatch = (c.pos === currentField.pos);
    const scorePrev = calculateScore(c, currentField);
    return `
      <div class="k-card ${isMatch ? 'highlight-match' : ''}" onclick="playCard(${i})">
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
  if (isAnimating || matchOver) return;
  const pCard = playerHand[index];
  if (!pCard) return;

  isAnimating = true;

  // プレイヤー手札から抜き出し
  playerHand.splice(index, 1);

  // CPUの思考ロジック（現在のお題で最もスコアが高くなる手を選択、たまにミス）
  let cpuIndex = 0;
  let bestScore = -999;
  cpuHand.forEach((c, idx) => {
    const scoreObj = calculateScore(c, currentField);
    let evalVal = scoreObj.total + (Math.random() * 0.4);
    if (evalVal > bestScore) {
      bestScore = evalVal;
      cpuIndex = idx;
    }
  });

  const cpuCard = cpuHand.splice(cpuIndex, 1)[0];

  // 捨て札へ追加
  discardPile.push(pCard, cpuCard);

  // スロット描画
  const pSlot = document.getElementById('p1-slot');
  const cSlot = document.getElementById('cpu-slot');
  pSlot.classList.add('filled');
  cSlot.classList.add('filled');

  // スコア判定
  const pScore = calculateScore(pCard, currentField);
  const cScore = calculateScore(cpuCard, currentField);

  pSlot.innerHTML = renderSlotCard(pCard, "あなた", "var(--accent-blue)", pScore);
  cSlot.innerHTML = renderSlotCard(cpuCard, "相手", "var(--accent-red)", cScore);

  let resultMsg = "";
  if (pScore.total > cScore.total) {
    playerWins++;
    if (pScore.isG2Special) {
      resultMsg = `🔥 重力除去位で大逆転！【${pCard.title}】(${pScore.breakdownText}) が相手の${cScore.total}点を圧倒！`;
    } else {
      resultMsg = `🎉 あなたの勝ち！【${pCard.title}】(${pScore.breakdownText}) ＞ 相手(${cScore.total}点)`;
    }
  } else if (pScore.total < cScore.total) {
    cpuWins++;
    resultMsg = `💦 相手の勝ち！相手の【${cpuCard.title}】(${cScore.breakdownText}) ＞ あなた(${pScore.total}点)`;
  } else {
    resultMsg = `⚖️ 同点引き分け！両者とも ${pScore.total}点 で互角の測定！`;
  }

  document.getElementById('result-ticker').innerText = resultMsg;
  renderBoard();

  // 次の展開（手札補充 ＆ 3勝判定）
  setTimeout(() => {
    isAnimating = false;

    // 1枚ずつ山札から即時ドロー（常時5枚キープ）
    playerHand.push(drawSingleCard());
    cpuHand.push(drawSingleCard());

    if (playerWins >= 3 || cpuWins >= 3) {
      matchOver = true;
      const isWinner = playerWins >= 3;
      document.getElementById('result-ticker').innerText = isWinner
        ? "🏆 3勝先取！あなたの完全勝利です！「勝負」タブで再戦できます。"
        : "💀 相手が3勝先取しました...！「勝負」タブで再戦できます。";
      setTimeout(() => {
        if (confirm(isWinner ? "🏆 3勝先取！マッチ勝利！もう一度遊びますか？" : "💀 相手が3勝先取しました。もう一度挑戦しますか？")) {
          initGame();
        }
      }, 700);
    } else {
      rollField();
      renderBoard();
    }
  }, 1400);
}

// アリーナ内カード描画ヘルパー（スコア内訳バッジ付き）
function renderSlotCard(c, ownerLabel, labelColor, scoreObj) {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
      <span style="font-size:0.6rem; color:${labelColor}; font-weight:800;">${ownerLabel}</span>
      <span style="font-size:0.65rem; background:var(--text-primary); color:#FFF; padding:1px 6px; border-radius:999px; font-weight:900;">${scoreObj ? scoreObj.total + '点' : ''}</span>
    </div>
    <div style="width:100%; height:70px; border-radius:4px; overflow:hidden; margin:3px 0; background:var(--bg-bone);">
      ${c.image 
        ? `<img src="${c.image}" style="width:100%; height:100%; object-fit:cover;" alt="">` 
        : `<div style="height:100%; display:flex; align-items:center; justify-content:center; font-size:0.6rem; color:var(--text-muted); font-weight:700;">${c.title}</div>`
      }
    </div>
    <div style="font-size:0.72rem; font-weight:900; color:var(--text-primary); line-height:1.2;">${c.title}</div>
    <div style="font-size:0.58rem; color:${scoreObj && scoreObj.posBonus > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight:800; margin-top:2px;">
      ${scoreObj ? scoreObj.breakdownText : c.pos}
    </div>
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
    if (tabId === 'battle' && matchOver) initGame();
  });
});

// 起動
(async function() {
  await loadCardDatabase();
  initGame();
})();
