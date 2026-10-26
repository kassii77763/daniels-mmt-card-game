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

let currentField = null;
let nextField = null;

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

  currentField = generateSingleField(playerHand);
  nextField = generateSingleField(null);

  updateBedButton();
  updateFieldUI();
  updateLamps();
  renderBoard();

  // スロットリセット
  const pSlot = document.getElementById('p1-slot');
  const cSlot = document.getElementById('cpu-slot');
  if (pSlot && cSlot) {
    pSlot.className = 'clash-slot';
    cSlot.className = 'clash-slot';
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

// 場のお題決定（NEXTからスライド）
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

// 体位変更（ベッド操作）ボタン処理
function useBedRotate() {
  if (isAnimating || matchOver || bedRotateCount <= 0) return;

  bedRotateCount--;
  updateBedButton();
  
  // 現在の場を即座に再生成
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

    // オーラクラス判定
    let auraClass = "match-dim";
    if (isPosMatch) {
      if (isGravityField && isG2) {
        auraClass = "match-gravity"; // 紫の特大オーラ
      } else {
        auraClass = "match-normal"; // 青のオーラ
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

// カードをプレイ（段階的カウントアップ ＆ クリティカルシェイク ＆ フェードアウト演出）
function playCard(index) {
  if (isAnimating || matchOver) return;
  const pCard = playerHand[index];
  if (!pCard) return;

  isAnimating = true;

  // プレイヤー手札から抜き出し
  playerHand.splice(index, 1);

  // CPU思考ロジック
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
  discardPile.push(pCard, cpuCard);

  // 要素取得
  const pSlot = document.getElementById('p1-slot');
  const cSlot = document.getElementById('cpu-slot');
  const ticker = document.getElementById('result-ticker');
  const battleBoard = document.querySelector('.battle-board');

  // スコア事前計算
  const pScore = calculateScore(pCard, currentField);
  const cScore = calculateScore(cpuCard, currentField);

  // ----------------------------------------------------------------
  // STEP 1: カード提示 ＆ 基礎Grade表示 (T = 0ms)
  // ----------------------------------------------------------------
  pSlot.className = 'clash-slot filled suspense';
  cSlot.className = 'clash-slot filled suspense';

  pSlot.innerHTML = renderCountUpSlotCard(pCard, "あなた", "var(--accent-blue)", pScore.base, "基礎Grade");
  cSlot.innerHTML = renderCountUpSlotCard(cpuCard, "相手", "var(--accent-red)", cScore.base, "基礎Grade");

  ticker.innerText = `⚔️ 測定開始！基礎Grade（あなた ${pScore.base} vs 相手 ${cScore.base}）で対峙中...`;
  renderBoard();

  // ----------------------------------------------------------------
  // STEP 2: 肢位一致判定 ＆ 加算 (T = 600ms)
  // ----------------------------------------------------------------
  setTimeout(() => {
    const pStep1Score = Math.max(0, pScore.base + pScore.posBonus);
    const cStep1Score = Math.max(0, cScore.base + cScore.posBonus);

    const pPosLabel = pScore.isG2Special ? "🔥 重力除去特効+5！" : (pScore.posBonus > 0 ? "✨ 体位一致+2！" : "代償測定-2");
    const cPosLabel = cScore.isG2Special ? "🔥 重力除去特効+5！" : (cScore.posBonus > 0 ? "✨ 体位一致+2！" : "代償測定-2");

    pSlot.innerHTML = renderCountUpSlotCard(pCard, "あなた", "var(--accent-blue)", pStep1Score, pPosLabel);
    cSlot.innerHTML = renderCountUpSlotCard(cpuCard, "相手", "var(--accent-red)", cStep1Score, cPosLabel);

    ticker.innerText = `⚖️ 肢位判定！ あなた[${pPosLabel}] ➜ ${pStep1Score}点 / 相手[${cPosLabel}] ➜ ${cStep1Score}点`;

    // ----------------------------------------------------------------
    // STEP 3: 特効コンボ加算 (T = 1200ms)
    // ----------------------------------------------------------------
    setTimeout(() => {
      pSlot.classList.remove('suspense');
      cSlot.classList.remove('suspense');

      pSlot.innerHTML = renderSlotCard(pCard, "あなた", "var(--accent-blue)", pScore, true);
      cSlot.innerHTML = renderSlotCard(cpuCard, "相手", "var(--accent-red)", cScore, true);

      // ----------------------------------------------------------------
      // STEP 4: 最終勝敗確定 ＆ クリティカルヒット演出 (T = 1700ms)
      // ----------------------------------------------------------------
      setTimeout(() => {
        let resultMsg = "";
        const isCritical = (pScore.total >= 7 || pScore.isG2Special || cScore.total >= 7 || cScore.isG2Special);

        // 画面シェイク ＆ フラッシュ演出
        if (isCritical && battleBoard) {
          battleBoard.classList.remove('shake', 'flash-gold', 'flash-purple');
          void battleBoard.offsetWidth; // リフロー強制
          battleBoard.classList.add('shake');
          if (pScore.isG2Special || cScore.isG2Special) {
            battleBoard.classList.add('flash-purple');
          } else {
            battleBoard.classList.add('flash-gold');
          }
        }

        if (pScore.total > cScore.total) {
          playerWins++;
          pSlot.classList.add('winner');
          cSlot.classList.add('loser');
          if (pScore.isG2Special) {
            resultMsg = `🔥 重力除去位で大逆転！【${pCard.title}】(${pScore.breakdownText}) が相手の${cScore.total}点を粉砕！`;
          } else if (pScore.total >= 8) {
            resultMsg = `⚡ 8点クリティカル勝利！【${pCard.title}】完全一致フルコンボ！`;
          } else {
            resultMsg = `🎉 あなたの勝ち！【${pCard.title}】(${pScore.breakdownText}) ＞ 相手(${cScore.total}点)`;
          }
        } else if (pScore.total < cScore.total) {
          cpuWins++;
          cSlot.classList.add('winner');
          pSlot.classList.add('loser');
          resultMsg = `💦 相手の勝ち！相手の【${cpuCard.title}】(${cScore.breakdownText}) ＞ あなた(${pScore.total}点)`;
        } else {
          resultMsg = `⚖️ 同点引き分け！両者とも ${pScore.total}点 で互角の測定！`;
        }

        updateLamps();
        ticker.innerText = resultMsg;

        // ----------------------------------------------------------------
        // STEP 5: カード消去・フェードアウト開始 (T = 3700ms)
        // ----------------------------------------------------------------
        setTimeout(() => {
          pSlot.classList.add('exit-fade');
          cSlot.classList.add('exit-fade');
          ticker.innerText = "✨ 測定完了... 次の肢位へ移行中";

          // ----------------------------------------------------------------
          // STEP 6: 完全消去 ＆ 次のターン開始 (T = 5000ms)
          // ----------------------------------------------------------------
          setTimeout(() => {
            if (battleBoard) {
              battleBoard.classList.remove('shake', 'flash-gold', 'flash-purple');
            }
            pSlot.className = 'clash-slot';
            cSlot.className = 'clash-slot';
            pSlot.innerHTML = '<span class="slot-placeholder">あなたの札</span>';
            cSlot.innerHTML = '<span class="slot-placeholder">相手の札</span>';

            // 1枚ずつ山札から即時ドロー
            playerHand.push(drawSingleCard());
            cpuHand.push(drawSingleCard());

            isAnimating = false;

            if (playerWins >= 3 || cpuWins >= 3) {
              matchOver = true;
              const isWinner = playerWins >= 3;
              ticker.innerText = isWinner
                ? "🏆 3勝先取！あなたの完全勝利です！「勝負」タブで再戦できます。"
                : "💀 相手が3勝先取しました...！「勝負」タブで再戦できます。";
              setTimeout(() => {
                if (confirm(isWinner ? "🏆 3勝先取！マッチ完全勝利！もう一度遊びますか？" : "💀 相手が3勝先取しました。もう一度挑戦しますか？")) {
                  initGame();
                }
              }, 600);
            } else {
              rollField();
              renderBoard();
              ticker.innerText = "場のお題に合致するカードを手札から選んでください";
            }
          }, 1250);
        }, 2000);
      }, 500);
    }, 600);
  }, 600);
}

// 段階的カウントアップ中のスロットカード描画ヘルパー
function renderCountUpSlotCard(c, ownerLabel, labelColor, currentDisplayScore, stepLabel) {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:2px;">
      <span style="font-size:0.68rem; color:${labelColor}; font-weight:800;">${ownerLabel}</span>
      <span style="font-size:0.75rem; background:var(--text-primary); color:#FFF; padding:2px 8px; border-radius:999px; font-weight:900; box-shadow:0 1px 3px rgba(0,0,0,0.2); transition:transform 0.2s ease;">
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
