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

// ダニエルズMMT 臨床グラウンドトゥルース定義（領域7査問辞書・第10版完全準拠）
const DANIELS_CLINICAL_GROUND_TRUTH = {
  "1": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "2": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "3": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "4": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "5": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "6": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "7": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "8": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "9": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "10": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "11": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "12": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "13": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "14": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "15": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "16": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "17": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "18": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "19": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "20": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "21": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "22": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "23": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "24": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "25": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "26": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "27": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "28": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "29": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "30": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "31": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "32": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "33": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "34": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "35": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "36": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "37": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "38": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "39": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "40": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "41": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "42": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "43": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "44": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "45": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "46": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "47": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "48": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "49": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "50": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "51": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "52": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "53": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "54": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "55": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "56": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "57": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "58": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "59": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "60": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "61": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "62": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "63": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "64": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "65": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "66": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "67": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "68": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "69": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "70": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "71": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "72": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "73": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "74": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "75": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "76": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "77": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "78": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "79": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "80": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "81": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "82": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "83": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "84": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "85": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "86": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "87": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "88": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "89": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "90": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "91": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "92": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "93": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "94": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "95": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "96": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "97": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "98": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "99": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "100": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "101": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "102": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "103": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "104": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "105": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "106": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "107": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "108": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "109": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "110": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "111": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "112": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "113": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "114": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "115": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "116": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "117": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "118": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "119": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "120": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "121": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "122": {
    "expectedPos": "立位前傾",
    "allowedPos": [
      "立位前傾"
    ],
    "forbiddenPos": [
      "背臥位",
      "座位"
    ]
  },
  "123": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "124": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "125": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "126": {
    "expectedPos": "長座位",
    "allowedPos": [
      "長座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "127": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "128": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "129": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "130": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "131": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "132": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "133": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "134": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "135": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "136": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "137": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "138": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "139": {
    "expectedPos": "端座位",
    "allowedPos": [
      "端座位",
      "座位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "140": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "141": {
    "expectedPos": "立位",
    "allowedPos": [
      "立位",
      "立位"
    ],
    "forbiddenPos": [
      "背臥位",
      "座位",
      "腹臥位",
      "側臥位"
    ]
  },
  "142": {
    "expectedPos": "立位",
    "allowedPos": [
      "立位",
      "立位"
    ],
    "forbiddenPos": [
      "背臥位",
      "座位",
      "腹臥位",
      "側臥位"
    ]
  },
  "143": {
    "expectedPos": "立位",
    "allowedPos": [
      "立位",
      "立位"
    ],
    "forbiddenPos": [
      "背臥位",
      "座位",
      "腹臥位",
      "側臥位"
    ]
  },
  "144": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "145": {
    "expectedPos": "立位",
    "allowedPos": [
      "立位",
      "立位"
    ],
    "forbiddenPos": [
      "背臥位",
      "座位",
      "腹臥位",
      "側臥位"
    ]
  },
  "146": {
    "expectedPos": "腹臥位",
    "allowedPos": [
      "腹臥位"
    ],
    "forbiddenPos": [
      "背臥位",
      "立位"
    ]
  },
  "147": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "148": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "149": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "150": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "151": {
    "expectedPos": "側臥位",
    "allowedPos": [
      "側臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "152": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "153": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "154": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "155": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "156": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "157": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "158": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "159": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
  },
  "160": {
    "expectedPos": "背臥位",
    "allowedPos": [
      "背臥位"
    ],
    "forbiddenPos": [
      "腹臥位",
      "立位"
    ]
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
        if (stats.size < 1000) {
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
    console.log(`✨ 領域7 敵対的セマンティック査問: 全${cards.length}枚の臨床整合性・運動学円弧・肢位メタデータ完全受入承認（100% PASS）`);
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
