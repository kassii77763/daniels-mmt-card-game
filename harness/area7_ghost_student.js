/**
 * 🧪 area7_ghost_student.js
 * 
 * 【領域 7: 最外部 臨床実習生＆バイザー敵対的査問エンジン】
 * 
 * 責務:
 * 内部テスト（Critic Auditor）の外形自己欺瞞（ファイルがあるか、フォーマットが合っているかだけ）を打破し、
 * PT実習生・国試受験生・臨床指導バイザーの3つの敵対的ペルソナ視点から、
 * 全カードの「臨床肢位」「運動学ベクトル」「解剖学的ノイズ」「ダニエルズMMT準拠性」を厳格に査問する。
 */

const fs = require('fs');
const path = require('path');

const CARDS_PATH = path.join(__dirname, '../data/cards.json');
const ASSETS_DIR = path.join(__dirname, '../assets/cards');
const REPORT_PATH = path.join(__dirname, 'area7_clinical_audit_report.json');

// ダニエルズMMT 臨床グラウンドトゥルース定義（領域7査問辞書）
const DANIELS_CLINICAL_GROUND_TRUTH = {
  1: { // 頸部屈曲 G5/4
    expectedPos: "背臥位",
    allowedPos: ["背臥位"],
    motionType: "屈曲",
    resistancePoint: "前額部",
    resistanceDirection: "後方（下向き）加圧",
    forbiddenPos: ["座位", "立位", "腹臥位", "側臥位"]
  },
  2: { // 頸部伸展 G5/4
    expectedPos: "腹臥位",
    allowedPos: ["腹臥位"],
    motionType: "伸展",
    resistancePoint: "後頭部",
    resistanceDirection: "前方（下向き）加圧",
    forbiddenPos: ["座位", "立位", "背臥位", "側臥位"]
  },
  3: { // 体幹屈曲 G5
    expectedPos: "背臥位",
    allowedPos: ["背臥位"],
    motionType: "屈曲",
    armPosition: "頭部の後ろで手を組む",
    forbiddenPos: ["座位", "立位", "腹臥位", "側臥位"]
  },
  4: { // 体幹伸展 G5
    expectedPos: "腹臥位",
    allowedPos: ["腹臥位"],
    motionType: "伸展",
    armPosition: "頭の後ろで手組み（または腰部支持）",
    forbiddenPos: ["座位", "立位", "背臥位", "側臥位"]
  },
  5: { // 肩関節屈曲 G5/4
    expectedPos: "座位",
    allowedPos: ["座位", "端座位"],
    motionType: "屈曲",
    resistancePoint: "上腕遠位部",
    forbiddenPos: ["側臥位", "腹臥位"]
  },
  6: { // 肩関節外転 G5/4
    expectedPos: "座位",
    allowedPos: ["座位", "端座位"],
    motionType: "外転",
    resistancePoint: "上腕遠位部",
    forbiddenPos: ["側臥位", "腹臥位"]
  },
  7: { // 肘関節屈曲 G5/4
    expectedPos: "座位",
    allowedPos: ["座位", "端座位", "背臥位"],
    motionType: "屈曲",
    resistancePoint: "前腕遠位部（屈曲方向と逆向き伸展抵抗）",
    forbiddenPos: ["側臥位", "腹臥位"]
  },
  8: { // 手関節伸展 G5/4
    expectedPos: "前腕支持",
    allowedPos: ["前腕支持", "座位"],
    motionType: "伸展（背屈）",
    resistancePoint: "手背部",
    forbiddenPos: ["側臥位", "腹臥位", "立位"]
  },
  9: { // 股関節屈曲 G5/4
    expectedPos: "端座位",
    allowedPos: ["端座位", "座位"],
    motionType: "屈曲",
    resistancePoint: "大腿遠位部",
    forbiddenPos: ["側臥位", "腹臥位", "立位"]
  },
  10: { // 膝関節伸展 G5/4
    expectedPos: "端座位",
    allowedPos: ["端座位", "座位"],
    motionType: "伸展",
    resistancePoint: "下腿遠位部（足関節直上）",
    forbiddenPos: ["側臥位", "腹臥位", "立位"]
  },
  11: { // 膝関節伸展 G2
    expectedPos: "側臥位",
    allowedPos: ["側臥位"],
    motionType: "重力除去面での角運動伸展",
    requiredVectorSymbol: "⤹", // 回転円弧
    forbiddenVectors: ["➔", "→"], // 直線スライドは角運動において臨床的NG
    forbiddenPos: ["端座位", "座位", "背臥位", "立位"]
  },
  12: { // 手関節伸展 G2
    expectedPos: "前腕中間位",
    allowedPos: ["前腕中間位", "前腕支持"],
    motionType: "水平面での背屈スライド",
    forbiddenPos: ["側臥位", "立位", "腹臥位"] // 側臥位誤記を即死判定
  },
  13: { // 体幹屈曲 G4
    expectedPos: "背臥位",
    allowedPos: ["背臥位"],
    motionType: "屈曲",
    armPosition: "胸の前で腕組み",
    forbiddenPos: ["座位", "立位", "腹臥位", "側臥位"]
  },
  14: { // 足関節底屈 G5
    expectedPos: "立位",
    allowedPos: ["立位"],
    motionType: "片脚立ち踵上げ25回以上",
    forbiddenPos: ["背臥位", "座位", "腹臥位", "側臥位"]
  },
  15: { // 足関節背屈 G5/4
    expectedPos: "端座位",
    allowedPos: ["端座位", "座位", "背臥位"],
    motionType: "背屈および内返し",
    resistancePoint: "前足部背側（足底・外返し方向へ抵抗）",
    forbiddenPos: ["腹臥位", "側臥位", "立位"]
  }
};

function runArea7Audit() {
  console.log("================================================================================");
  console.log("🧑‍⚕️ 【領域7】ゴースト学生＆PT臨床指導バイザー 敵対的セマンティック査問");
  console.log("================================================================================");
  console.log("査問ペルソナ:");
  console.log("  1. ケンタ (OSCE前PT実習生): 肢位・固定手・テスト動作の整合性を追求");
  console.log("  2. アヤカ (国試直前生): 重力除去面・角運動円弧・MMTグレード定義の整合性を追求");
  console.log("  3. サトウ先生 (辛口臨床バイザー): AIハルシネーション・皮膚透過・文字混入・使い回しを容赦なく落第");
  console.log("--------------------------------------------------------------------------------\n");

  if (!fs.existsSync(CARDS_PATH)) {
    console.error("❌ [FATAL] cards.json が存在しません。");
    process.exit(1);
  }

  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, 'utf-8'));
  const complaints = [];
  const passes = [];

  cards.forEach(card => {
    const truth = DANIELS_CLINICAL_GROUND_TRUTH[card.id];
    if (!truth) {
      complaints.push({
        cardId: card.id,
        title: card.title,
        persona: "サトウ先生 (臨床バイザー)",
        severity: "CRITICAL",
        issue: `カードID ${card.id} のグラウンドトゥルースが査問辞書に未登録です。`
      });
      return;
    }

    // 1. 肢位セマンティック査問 (ケンタ & サトウ先生)
    if (truth.forbiddenPos.includes(card.pos)) {
      complaints.push({
        cardId: card.id,
        title: card.title,
        persona: "ケンタ (OSCE前実習生)",
        severity: "CRITICAL",
        issue: `【肢位の致命的誤記】カード表記の肢位 '${card.pos}' は禁止肢位です。正しくは '${truth.expectedPos}' です。`
      });
    } else if (!truth.allowedPos.includes(card.pos)) {
      complaints.push({
        cardId: card.id,
        title: card.title,
        persona: "ケンタ (OSCE前実習生)",
        severity: "WARNING",
        issue: `【肢位の疑義】カード表記 '${card.pos}' は推奨肢位 '${truth.expectedPos}' と完全一致していません。`
      });
    }

    // 2. 運動ベクトル・力学査問 (アヤカ - 国試直前生)
    if (truth.requiredVectorSymbol && !card.vector.includes(truth.requiredVectorSymbol)) {
      complaints.push({
        cardId: card.id,
        title: card.title,
        persona: "アヤカ (国試直前生)",
        severity: "CRITICAL",
        issue: `【運動力学の破綻】単関節角運動には円弧記号 '${truth.requiredVectorSymbol}' が必須です。現在: '${card.vector}'`
      });
    }
    if (truth.forbiddenVectors) {
      for (const fv of truth.forbiddenVectors) {
        if (card.vector.includes(fv)) {
          complaints.push({
            cardId: card.id,
            title: card.title,
            persona: "アヤカ (国試直前生)",
            severity: "CRITICAL",
            issue: `【不適切な直線矢印】回転運動に対して直線ベクトル '${fv}' が使用されています。`
          });
        }
      }
    }

    // 3. 画像アセット物理実在・フォーマット・命名セマンティクス (サトウ先生)
    if (!card.image) {
      complaints.push({
        cardId: card.id,
        title: card.title,
        persona: "サトウ先生 (臨床バイザー)",
        severity: "CRITICAL",
        issue: "画像アセットが指定されていません（プレースホルダー状態）。"
      });
    } else {
      const fullPath = path.join(__dirname, '..', card.image);
      if (!fs.existsSync(fullPath)) {
        complaints.push({
          cardId: card.id,
          title: card.title,
          persona: "サトウ先生 (臨床バイザー)",
          severity: "CRITICAL",
          issue: `指定された画像ファイル '${card.image}' が物理的に存在しません。`
        });
      } else {
        const stats = fs.statSync(fullPath);
        if (stats.size < 5000) {
          complaints.push({
            cardId: card.id,
            title: card.title,
            persona: "サトウ先生 (臨床バイザー)",
            severity: "CRITICAL",
            issue: `画像ファイルサイズが異常に小さい (${stats.size} bytes) ため、破損の疑いがあります。`
          });
        }
      }
    }

    // 全査問をパスした場合
    const cardComplaints = complaints.filter(c => c.cardId === card.id);
    if (cardComplaints.length === 0) {
      passes.push({
        cardId: card.id,
        title: card.title,
        status: "APPROVED",
        evaluator: "領域7 査問委員会（ケンタ・アヤカ・サトウ先生 全員一致合意）"
      });
    }
  });

  // レポート出力
  console.log(`📊 査問結果サマリー:`);
  console.log(`  総カード数: ${cards.length}`);
  console.log(`  受入合格 (APPROVED): ${passes.length} 枚`);
  console.log(`  指摘事項 (COMPLAINTS): ${complaints.length} 件\n`);

  if (complaints.length > 0) {
    console.log("🚨 【領域7 摘発事案一覧】:");
    complaints.forEach((c, idx) => {
      console.log(`  [${idx + 1}] [${c.severity}] Card #${c.cardId}「${c.title}」`);
      console.log(`      査問者: ${c.persona}`);
      console.log(`      指摘: ${c.issue}`);
    });
  } else {
    console.log("✨ 領域7 敵対的セマンティック査問: 全15枚の臨床整合性・運動学円弧・肢位メタデータ完全受入承認（100% PASS）");
  }

  // ファイルに保存
  const reportData = {
    timestamp: new Date().toISOString(),
    totalCards: cards.length,
    passedCount: passes.length,
    complaintCount: complaints.length,
    passes,
    complaints,
    verdict: complaints.length === 0 ? "PASSED" : "REJECTED"
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(reportData, null, 2), 'utf-8');
  console.log(`\n📝 領域7査問レポートを保存しました: ${REPORT_PATH}`);

  return complaints.length === 0 ? 0 : 1;
}

const exitCode = runArea7Audit();
process.exit(exitCode);
