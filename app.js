/**
 * MMT GRADE — Daniels Tactical Card Engine
 * 臨床カルタ・オセロ式 MMTバトルの新スコア対戦システム
 */

// 過去の古いIndexedDB（文字ノイズ・モザイク画像キャッシュ）を物理抹消
try {
  if (typeof indexedDB !== 'undefined') {
    indexedDB.deleteDatabase('DanielsMmtImagesDB');
  }
} catch (e) {
  // ignore
}

// 内蔵マスターカード（画像パス＋支配神経・髄節データ完備）
const DEFAULT_CARDS = [
  {
    "id": 1,
    "imgId": "neck_flex_g543",
    "title": "頸部屈曲 (G5/4/3)",
    "region": "頸部",
    "muscle": "胸鎖乳突筋・頭長筋",
    "nerve": "副神経(第Ⅺ脳神経)・頸神経叢",
    "root": "C2〜C3",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "image": "assets/mmt/neck_flex_g543.png",
    "vector": "↓ 前額部加圧（ブレイクテスト）",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード4〜5、前額部へのブレイクテストに耐えて……",
    "shimo": "顎を引いて頭部を浮かす頸部屈曲はどれ？"
  },
  {
    "id": 2,
    "imgId": "neck_flex_g2",
    "title": "頸部屈曲 (G2/1)",
    "region": "頸部",
    "muscle": "胸鎖乳突筋",
    "nerve": "副神経・頸神経叢",
    "root": "C2〜C3",
    "grade": "G2",
    "pos": "背臥位",
    "image": "assets/mmt/neck_flex_g2.png",
    "vector": "🔍 重力最小位で一部可動域 / 胸鎖乳突筋触診",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード2、重力を最小にして頭部をわずかに離床または……",
    "shimo": "胸鎖乳突筋の収縮を触診する頸部屈曲はどれ？"
  },
  {
    "id": 3,
    "imgId": "trunk_flex_g5",
    "title": "体幹屈曲 (G5)",
    "region": "体幹",
    "muscle": "腹直筋",
    "nerve": "肋間神経",
    "root": "Th7〜Th12",
    "grade": "G5",
    "pos": "背臥位",
    "image": "assets/mmt/trunk_flex_g5.png",
    "vector": "⇡ 後頭部手組み・肩甲骨離床（自重）",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード5、両手を後頭部で組んだ状態で……",
    "shimo": "肩甲骨下角が浮くまで体幹を屈曲するのはどれ？"
  },
  {
    "id": 4,
    "imgId": "trunk_flex_g4",
    "title": "体幹屈曲 (G4)",
    "region": "体幹",
    "muscle": "腹直筋",
    "nerve": "肋間神経",
    "root": "Th7〜Th12",
    "grade": "G4",
    "pos": "背臥位",
    "image": "assets/mmt/trunk_flex_g4.png",
    "vector": "⇡ 胸の前腕交差・肩甲骨離床（自重）",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード4、両腕を胸の前で交差させて……",
    "shimo": "肩甲骨下角が浮くまで体幹を屈曲するのはどれ？"
  },
  {
    "id": 5,
    "imgId": "trunk_flex_g3",
    "title": "体幹屈曲 (G3)",
    "region": "体幹",
    "muscle": "腹直筋",
    "nerve": "肋間神経",
    "root": "Th7〜Th12",
    "grade": "G3",
    "pos": "背臥位",
    "image": "assets/mmt/trunk_flex_g3.png",
    "vector": "⇡ 上肢前方伸展・肩甲骨離床（自重）",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード3、両腕を前方に伸ばした状態で……",
    "shimo": "肩甲骨下角が浮くまで体幹を屈曲するのはどれ？"
  },
  {
    "id": 6,
    "imgId": "trunk_flex_g2",
    "title": "体幹屈曲 (G2/1)",
    "region": "体幹",
    "muscle": "腹直筋",
    "nerve": "肋間神経",
    "root": "Th7〜Th12",
    "grade": "G2",
    "pos": "背臥位",
    "image": "assets/mmt/trunk_flex_g2.png",
    "vector": "🔍 重力最小位で頭部挙上・腹直筋触診",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード2、頭部挙上のみで肩甲骨は離床せず……",
    "shimo": "白線両側の腹直筋収縮を触診する体幹屈曲はどれ？"
  },
  {
    "id": 7,
    "imgId": "trunk_ext_g54",
    "title": "体幹伸展 (G5/4)",
    "region": "体幹",
    "muscle": "脊柱起立筋（最長筋・腸肋筋・棘筋）",
    "nerve": "脊髄神経後枝",
    "root": "Th1〜L5",
    "grade": "G5/4",
    "pos": "腹臥位",
    "image": "assets/mmt/trunk_ext_g54.png",
    "vector": "⇡ 後頭部手組み・胸部離床（自重抵抗）",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード5/4、後頭部手組みで下肢を固定され……",
    "shimo": "剣状突起・胸部が浮くまで体幹を伸展するのはどれ？"
  },
  {
    "id": 8,
    "imgId": "trunk_ext_g3",
    "title": "体幹伸展 (G3)",
    "region": "体幹",
    "muscle": "脊柱起立筋",
    "nerve": "脊髄神経後枝",
    "root": "Th1〜L5",
    "grade": "G3",
    "pos": "腹臥位",
    "image": "assets/mmt/trunk_ext_g3.png",
    "vector": "⇡ 上肢体側・胸部離床（自重）",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード3、両腕を体側に置いた状態で……",
    "shimo": "剣状突起が浮くまで体幹を伸展するのはどれ？"
  },
  {
    "id": 9,
    "imgId": "trunk_ext_g2",
    "title": "体幹伸展 (G2/1)",
    "region": "体幹",
    "muscle": "脊柱起立筋",
    "nerve": "脊髄神経後枝",
    "root": "Th1〜L5",
    "grade": "G2",
    "pos": "腹臥位",
    "image": "assets/mmt/trunk_ext_g2.png",
    "vector": "🔍 重力最小位で一部挙上・腰背部起立筋触診",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード2、胸部は浮かないが一部挙上または……",
    "shimo": "脊柱両側の起立筋収縮を触診する体幹伸展はどれ？"
  },
  {
    "id": 10,
    "imgId": "scap_abd_g543",
    "title": "肩甲骨外転・上方回旋",
    "region": "上肢",
    "muscle": "前鋸筋",
    "nerve": "長胸神経",
    "root": "C5〜C7",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/scap_abd_g543.png",
    "vector": "➔ 肩130°屈曲位から前方突き出し（手掌抵抗）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、肩関節130°屈曲位から前方へ突き出し……",
    "shimo": "前鋸筋で肩甲骨を外転・上方回旋するのはどれ？"
  },
  {
    "id": 11,
    "imgId": "scap_abd_g2",
    "title": "肩甲骨外転・上方回旋 (G2/1)",
    "region": "上肢",
    "muscle": "前鋸筋",
    "nerve": "長胸神経",
    "root": "C5〜C7",
    "grade": "G2",
    "pos": "端座位",
    "image": "assets/mmt/scap_abd_g2.png",
    "vector": "🔍 肩90°支持位で重力最小運動・腋窩触診",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード2、検者が上肢を90°で支持し重力を最小にして……",
    "shimo": "腋下胸郭側面の筋腹を触診する肩甲骨外転はどれ？"
  },
  {
    "id": 12,
    "imgId": "scap_dep_g543",
    "title": "肩甲骨下制・内転",
    "region": "上肢",
    "muscle": "僧帽筋下部線維",
    "nerve": "副神経・頸神経叢",
    "root": "C3〜C4",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "image": "assets/mmt/scap_dep_g543.png",
    "vector": "↓ 前腕遠位部への下向き抵抗（第10版基準）",
    "kami": "腹臥位（肩145°外転・親指天井）で……",
    "naka": "グレード4〜5、第10版基準の前腕遠位への抵抗に耐えて……",
    "shimo": "肩甲骨を下制・内転（僧帽筋下部）するのはどれ？"
  },
  {
    "id": 13,
    "imgId": "sh_flex_g543",
    "title": "肩関節屈曲",
    "region": "上肢",
    "muscle": "三角筋前部・棘上筋・烏口腕筋",
    "nerve": "腋窩神経・肩甲上神経・筋皮神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/sh_flex_g543.png",
    "vector": "↓ 上腕遠位加圧（ブレイクテスト）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、肩90度屈曲位で上腕遠位のブレイクテストに耐えて……",
    "shimo": "肩関節を前方90度に屈曲（三角筋前部・棘上筋）するのはどれ？"
  },
  {
    "id": 14,
    "imgId": "sh_flex_g2",
    "title": "肩関節屈曲 (G2/1)",
    "region": "上肢",
    "muscle": "三角筋前部・烏口腕筋",
    "nerve": "腋窩神経・筋皮神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "側臥位",
    "image": "assets/mmt/sh_flex_g2.png",
    "vector": "➔ 重力を最小にした側臥位での水平屈曲",
    "kami": "側臥位（そくがい）で……",
    "naka": "グレード2、第10版基準の側臥位で重力を最小にして……",
    "shimo": "検者の水平面支持で肩関節を屈曲するのはどれ？"
  },
  {
    "id": 15,
    "imgId": "sh_ext_g543",
    "title": "肩関節伸展",
    "region": "上肢",
    "muscle": "広背筋・大円筋・三角筋後部",
    "nerve": "胸背神経・肩甲下神経・腋窩神経",
    "root": "C5〜C8",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "image": "assets/mmt/sh_ext_g543.png",
    "vector": "↓ 上肢後方挙上・上腕遠位加圧",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、上肢を後上方へ持ち上げ上腕遠位抵抗に耐えて……",
    "shimo": "肩関節を伸展（広背筋・大円筋）するのはどれ？"
  },
  {
    "id": 16,
    "imgId": "sh_ext_g2",
    "title": "肩関節伸展 (G2/1)",
    "region": "上肢",
    "muscle": "広背筋・大円筋",
    "nerve": "胸背神経・肩甲下神経",
    "root": "C5〜C8",
    "grade": "G2",
    "pos": "側臥位",
    "image": "assets/mmt/sh_ext_g2.png",
    "vector": "➔ 重力最小位（側臥位）での後方スライド",
    "kami": "側臥位（そくがい）で……",
    "naka": "グレード2、側臥位で検者の水平面支持を受けながら後方へ……",
    "shimo": "重力を最小にして肩関節を伸展するのはどれ？"
  },
  {
    "id": 17,
    "imgId": "sh_abd_g543",
    "title": "肩関節外転",
    "region": "上肢",
    "muscle": "三角筋中部・棘上筋",
    "nerve": "腋窩神経・肩甲上神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/sh_abd_g543.png",
    "vector": "↓ 上腕遠位加圧（ブレイクテスト）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、真横90度外転で上腕遠位の抵抗に耐えて……",
    "shimo": "肩関節を外転（三角筋中部・棘上筋）するのはどれ？"
  },
  {
    "id": 18,
    "imgId": "sh_abd_g2",
    "title": "肩関節外転 (G2/1)",
    "region": "上肢",
    "muscle": "三角筋中部",
    "nerve": "腋窩神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "背臥位",
    "image": "assets/mmt/sh_abd_g2.png",
    "vector": "➔ 重力最小位（背臥位）でのベッド上水平スライド",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード2、ベッド上を水平に腕を外側へ滑らせて……",
    "shimo": "重力を最小にして肩関節を外転するのはどれ？"
  },
  {
    "id": 19,
    "imgId": "sh_er_g543",
    "title": "肩関節外旋",
    "region": "上肢",
    "muscle": "棘下筋・小円筋",
    "nerve": "肩甲上神経・腋窩神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/sh_er_g543.png",
    "vector": "➔ 前腕遠位外側へ内旋抵抗（第10版標準：端座位、別法：腹臥位）",
    "kami": "端座位（第10版標準：肘90°体側）で……",
    "naka": "グレード4〜5、前腕を外側へ動かし検者の内旋抵抗に耐えて……",
    "shimo": "肩関節を外旋（棘下筋・小円筋）するのはどれ？"
  },
  {
    "id": 20,
    "imgId": "sh_er_g2",
    "title": "肩関節外旋 (G2/1)",
    "region": "上肢",
    "muscle": "棘下筋・小円筋",
    "nerve": "肩甲上神経・腋窩神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "端座位",
    "image": "assets/mmt/sh_er_g2.png",
    "vector": "➔ 重力を最小にした机上水平回旋（別法：腹臥位下垂）",
    "kami": "端座位（第10版：机上支持）で……",
    "naka": "グレード2、重力を最小にして机上水平面で前腕を外旋させて……",
    "shimo": "肩関節を外旋（棘下筋）するのはどれ？"
  },
  {
    "id": 21,
    "imgId": "sh_ir_g543",
    "title": "肩関節内旋",
    "region": "上肢",
    "muscle": "肩甲下筋・大胸筋・広背筋・大円筋",
    "nerve": "肩甲下神経・胸筋神経・胸背神経",
    "root": "C5〜C8",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/sh_ir_g543.png",
    "vector": "➔ 前腕遠位内側へ外旋抵抗（第10版標準：端座位、別法：腹臥位）",
    "kami": "端座位（第10版標準：肘90°体側）で……",
    "naka": "グレード4〜5、前腕をお腹へ引き寄せ検者の外旋抵抗に耐えて……",
    "shimo": "肩関節を内旋（肩甲下筋）するのはどれ？"
  },
  {
    "id": 22,
    "imgId": "sh_ir_g2",
    "title": "肩関節内旋 (G2/1)",
    "region": "上肢",
    "muscle": "肩甲下筋",
    "nerve": "肩甲下神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "端座位",
    "image": "assets/mmt/sh_ir_g2.png",
    "vector": "➔ 重力を最小にした机上水平回旋（別法：腹臥位下垂）",
    "kami": "端座位（第10版：机上支持）で……",
    "naka": "グレード2、重力を最小にして机上水平面でお腹側へ内旋させて……",
    "shimo": "肩関節を内旋（肩甲下筋）するのはどれ？"
  },
  {
    "id": 23,
    "imgId": "elbow_flex_g543",
    "title": "肘関節屈曲",
    "region": "上肢",
    "muscle": "上腕二頭筋・上腕筋・腕橈骨筋",
    "nerve": "筋皮神経・橈骨神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/elbow_flex_g543.png",
    "vector": "↓ 前腕遠位伸展抵抗（ブレイクテスト）",
    "kami": "端座位（たんざい）前腕回外位で……",
    "naka": "グレード4〜5、前腕遠位への伸展ブレイクテストに耐えて……",
    "shimo": "肘関節を力強く屈曲（上腕二頭筋）するのはどれ？"
  },
  {
    "id": 24,
    "imgId": "elbow_flex_g2",
    "title": "肘関節屈曲 (G2/1)",
    "region": "上肢",
    "muscle": "上腕二頭筋",
    "nerve": "筋皮神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "側臥位",
    "image": "assets/mmt/elbow_flex_g2.png",
    "vector": "➔ 重力最小位（側臥位または机上支持）での水平屈曲",
    "kami": "側臥位（そくがい）で……",
    "naka": "グレード2、重力を最小にした水平面上で検者の支持を受け……",
    "shimo": "机上やシーツ上を滑らせて肘を屈曲するのはどれ？"
  },
  {
    "id": 25,
    "imgId": "elbow_ext_g543",
    "title": "肘関節伸展",
    "region": "上肢",
    "muscle": "上腕三頭筋",
    "nerve": "橈骨神経",
    "root": "C6〜C8",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "image": "assets/mmt/elbow_ext_g543.png",
    "vector": "↓ 前腕遠位加圧（肩90°外転位）",
    "kami": "腹臥位（肩外転90°）で……",
    "naka": "グレード4〜5、下垂した前腕を水平まで伸展し抵抗に耐えて……",
    "shimo": "肘関節を伸展（上腕三頭筋）するのはどれ？"
  },
  {
    "id": 26,
    "imgId": "elbow_ext_g2",
    "title": "肘関節伸展 (G2/1)",
    "region": "上肢",
    "muscle": "上腕三頭筋",
    "nerve": "橈骨神経",
    "root": "C6〜C8",
    "grade": "G2",
    "pos": "端座位",
    "image": "assets/mmt/elbow_ext_g2.png",
    "vector": "➔ 重力最小位（端座位・肩90°水平面支持）での肘伸展",
    "kami": "端座位（肩外転90°）で……",
    "naka": "グレード2、検者が上肢を水平面で支持し重力を最小にして……",
    "shimo": "机上水平面で肘を伸展するのはどれ？"
  },
  {
    "id": 27,
    "imgId": "forearm_pron_sup_g5432",
    "title": "前腕回外・回内",
    "region": "上肢",
    "muscle": "回外筋・上腕二頭筋 ／ 円回内筋・方形回内筋",
    "nerve": "橈骨神経・筋皮神経 ／ 正中神経",
    "root": "C5〜C8",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/forearm_pron_sup_g5432.png",
    "vector": "➔ 橈骨遠位への回旋抵抗（第10版：全Grade端座位・肘90°統一）",
    "kami": "端座位（肘90°体側・第10版統一）で……",
    "naka": "グレード4〜5、手首を回す回旋抵抗に耐えて……",
    "shimo": "前腕を回外・回内するのはどれ？"
  },
  {
    "id": 28,
    "imgId": "wrist_ext_g543",
    "title": "手関節伸展",
    "region": "上肢",
    "muscle": "長・短橈側手根伸筋・尺側手根伸筋",
    "nerve": "橈骨神経",
    "root": "C6〜C8",
    "grade": "G5/4/3",
    "pos": "前腕支持",
    "image": "assets/mmt/wrist_ext_g543.png",
    "vector": "↓ 手背加圧（回内位机上支持）",
    "kami": "前腕回内・机上支持で……",
    "naka": "グレード4〜5、手背への下向きブレイクテストに耐えて……",
    "shimo": "手関節を背屈・伸展するのはどれ？"
  },
  {
    "id": 29,
    "imgId": "wrist_ext_g2",
    "title": "手関節伸展 (G2/1)",
    "region": "上肢",
    "muscle": "橈側手根伸筋群",
    "nerve": "橈骨神経",
    "root": "C6〜C7",
    "grade": "G2",
    "pos": "前腕中間位",
    "image": "assets/mmt/wrist_ext_g2.png",
    "vector": "➔ 重力最小位（前腕中間位・手刀）での水平背屈スライド",
    "kami": "前腕中間位（手刀姿勢）で……",
    "naka": "グレード2、重力を最小にして机上を水平に滑らせて……",
    "shimo": "手関節を水平面で伸展するのはどれ？"
  },
  {
    "id": 30,
    "imgId": "hip_flex_g543",
    "title": "股関節屈曲",
    "region": "下肢",
    "muscle": "腸腰筋（大腰筋・腸骨筋）",
    "nerve": "大腿神経・腰神経叢",
    "root": "L1〜L3",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/hip_flex_g543.png",
    "vector": "↓ 大腿遠位加圧（ブレイクテスト）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、大腿遠位への下向きブレイクテストに耐えて……",
    "shimo": "股関節を座面から持ち上げて屈曲（腸腰筋）するのはどれ？"
  },
  {
    "id": 31,
    "imgId": "hip_flex_g2",
    "title": "股関節屈曲 (G2/1)",
    "region": "下肢",
    "muscle": "腸腰筋",
    "nerve": "大腿神経",
    "root": "L1〜L3",
    "grade": "G2",
    "pos": "側臥位",
    "image": "assets/mmt/hip_flex_g2.png",
    "vector": "➔ 重力最小位（側臥位）での大腿前方水平屈曲",
    "kami": "側臥位（そくがい）で……",
    "naka": "グレード2、検者が上側下肢を支持し重力を最小にして……",
    "shimo": "大腿を前方へ水平屈曲するのはどれ？"
  },
  {
    "id": 32,
    "imgId": "hip_ext_g543",
    "title": "股関節伸展",
    "region": "下肢",
    "muscle": "大殿筋・ハムストリングス",
    "nerve": "下殿神経・坐骨神経",
    "root": "L5〜S2",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "image": "assets/mmt/hip_ext_g543.png",
    "vector": "↓ 大腿遠位後面加圧",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、下肢を天井へ挙上し大腿後面抵抗に耐えて……",
    "shimo": "股関節を力強く伸展（大殿筋）するのはどれ？"
  },
  {
    "id": 33,
    "imgId": "hip_ext_g2",
    "title": "股関節伸展 (G2/1)",
    "region": "下肢",
    "muscle": "大殿筋",
    "nerve": "下殿神経",
    "root": "L5〜S2",
    "grade": "G2",
    "pos": "側臥位",
    "image": "assets/mmt/hip_ext_g2.png",
    "vector": "➔ 重力最小位（側臥位）での後方水平伸展",
    "kami": "側臥位（そくがい）で……",
    "naka": "グレード2、検者の水平面支持で重力を最小にして後方へ……",
    "shimo": "股関節を水平面で伸展するのはどれ？"
  },
  {
    "id": 34,
    "imgId": "hip_abd_g543",
    "title": "股関節外転",
    "region": "下肢",
    "muscle": "中殿筋・小殿筋",
    "nerve": "上殿神経",
    "root": "L4〜S1",
    "grade": "G5/4/3",
    "pos": "側臥位",
    "image": "assets/mmt/hip_abd_g543.png",
    "vector": "↓ 膝関節外側・大腿遠位加圧",
    "kami": "側臥位（そくがい）で……",
    "naka": "グレード4〜5、上側の下肢を骨盤回旋なく上方へ挙上し……",
    "shimo": "股関節を外転（中殿筋）するのはどれ？"
  },
  {
    "id": 35,
    "imgId": "hip_abd_g2",
    "title": "股関節外転 (G2/1)",
    "region": "下肢",
    "muscle": "中殿筋",
    "nerve": "上殿神経",
    "root": "L4〜S1",
    "grade": "G2",
    "pos": "背臥位",
    "image": "assets/mmt/hip_abd_g2.png",
    "vector": "➔ 重力最小位（背臥位）でのベッド面水平スライド",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード2、ベッド面を水平に下肢を外側へ滑らせて……",
    "shimo": "重力を最小にして股関節を外転するのはどれ？"
  },
  {
    "id": 36,
    "imgId": "knee_flex_g543",
    "title": "膝関節屈曲",
    "region": "下肢",
    "muscle": "ハムストリングス（大腿二頭筋・半腱様筋・半膜様筋）",
    "nerve": "坐骨神経",
    "root": "L5〜S2",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "image": "assets/mmt/knee_flex_g543.png",
    "vector": "↓ 下腿遠位後面へ伸展抵抗",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、膝屈曲位で下腿遠位への伸展抵抗に耐えて……",
    "shimo": "膝関節を屈曲（ハムストリングス）するのはどれ？"
  },
  {
    "id": 37,
    "imgId": "knee_flex_g2",
    "title": "膝関節屈曲 (G2/1)",
    "region": "下肢",
    "muscle": "ハムストリングス",
    "nerve": "坐骨神経",
    "root": "L5〜S2",
    "grade": "G2",
    "pos": "側臥位",
    "image": "assets/mmt/knee_flex_g2.png",
    "vector": "➔ 重力最小位（側臥位）での水平面膝屈曲",
    "kami": "側臥位（そくがい）で……",
    "naka": "グレード2、検者が下肢を支持した水平面上で……",
    "shimo": "重力を最小にして膝関節を屈曲するのはどれ？"
  },
  {
    "id": 38,
    "imgId": "knee_ext_g543",
    "title": "膝関節伸展",
    "region": "下肢",
    "muscle": "大腿四頭筋（大腿直筋・内側広筋・外側広筋・中間広筋）",
    "nerve": "大腿神経",
    "root": "L2〜L4",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/knee_ext_g543.png",
    "vector": "↓ 下腿遠位加圧（ブレイクテスト）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、下腿遠位への強力なブレイクテストに耐えて……",
    "shimo": "膝関節を完全伸展（大腿四頭筋）するのはどれ？"
  },
  {
    "id": 39,
    "imgId": "knee_ext_g2",
    "title": "膝関節伸展 (G2/1)",
    "region": "下肢",
    "muscle": "大腿四頭筋",
    "nerve": "大腿神経",
    "root": "L2〜L4",
    "grade": "G2",
    "pos": "側臥位",
    "image": "assets/mmt/knee_ext_g2.png",
    "vector": "➔ 重力最小位（側臥位）での屈曲位から前方伸展円弧",
    "kami": "側臥位（そくがい）で……",
    "naka": "グレード2、重力を最小にした水平面上で検者の支持を受け……",
    "shimo": "膝関節を前方へ伸展するのはどれ？"
  },
  {
    "id": 40,
    "imgId": "ankle_pf_g543",
    "title": "足関節底屈",
    "region": "下肢",
    "muscle": "腓腹筋・ヒラメ筋",
    "nerve": "脛骨神経",
    "root": "S1〜S2",
    "grade": "G5/4/3",
    "pos": "立位",
    "image": "assets/mmt/ankle_pf_g543.png",
    "vector": "↑ 片脚立ち踵上げ（G5:25回/G4:2〜24回/G3:1回）",
    "kami": "立位（りつい）片脚立ちで……",
    "naka": "グレード5、自重で完全フォームの踵上げを……",
    "shimo": "25回完遂する足関節底屈はどれ？"
  },
  {
    "id": 41,
    "imgId": "ankle_pf_g2",
    "title": "足関節底屈 (G2/1)",
    "region": "下肢",
    "muscle": "腓腹筋・ヒラメ筋",
    "nerve": "脛骨神経",
    "root": "S1〜S2",
    "grade": "G2",
    "pos": "腹臥位",
    "image": "assets/mmt/ankle_pf_g2.png",
    "vector": "➔ 重力最小位（腹臥位・足部下垂）での底屈",
    "kami": "腹臥位（足部ベッド端下垂）で……",
    "naka": "グレード2、ベッド端から足部を出して重力を最小にして底屈させ……",
    "shimo": "足関節底屈を行うのはどれ？"
  },
  {
    "id": 42,
    "imgId": "ankle_df_g5432",
    "title": "足関節背屈・内反",
    "region": "下肢",
    "muscle": "前脛骨筋",
    "nerve": "深腓骨神経",
    "root": "L4〜L5",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "image": "assets/mmt/ankle_df_g5432.png",
    "vector": "↓ 前足部外返し方向加圧（第10版標準：背臥位、別法：端座位）",
    "kami": "背臥位（第10版標準肢位）で……",
    "naka": "グレード4〜5、前足部外返し方向の抵抗に耐えて……",
    "shimo": "足部を内反・背屈（前脛骨筋）するのはどれ？"
  },
  {
    "id": 43,
    "imgId": "ankle_df_g5432",
    "title": "足関節背屈・内反 (G2/1)",
    "region": "下肢",
    "muscle": "前脛骨筋",
    "nerve": "深腓骨神経",
    "root": "L4〜L5",
    "grade": "G2",
    "pos": "背臥位",
    "image": "assets/mmt/ankle_df_g5432.png",
    "vector": "🔍 重力最小位で部分可動域 / 前脛骨筋腱触診",
    "kami": "背臥位（第10版標準肢位）で……",
    "naka": "グレード2、部分的な可動域または……",
    "shimo": "足関節前内側で前脛骨筋腱を触診するのはどれ？"
  },
  {
    "id": 44,
    "imgId": "neck_ext_g543",
    "title": "頸部伸展 (G5/4/3)",
    "region": "頸部",
    "muscle": "頭・頸板状筋・半棘筋",
    "nerve": "頸神経後枝",
    "root": "C2〜C8",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "image": "assets/mmt/neck_ext_g543.png",
    "vector": "↓ 後頭部加圧（胸部固定・頭部挙上）",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、後頭部へのブレイクテストに耐えて……",
    "shimo": "頭部を伸展（頭・頸板状筋）するのはどれ？"
  },
  {
    "id": 45,
    "imgId": "neck_ext_g2",
    "title": "頸部伸展 (G2/1)",
    "region": "頸部",
    "muscle": "頭・頸板状筋",
    "nerve": "頸神経後枝",
    "root": "C2〜C8",
    "grade": "G2",
    "pos": "背臥位",
    "image": "assets/mmt/neck_ext_g2.png",
    "vector": "🔍 頭部支持位での水平伸展 / 後頸部筋触診",
    "kami": "背臥位（後頭部支持）で……",
    "naka": "グレード2、検者が頭部を支持し重力を最小にして……",
    "shimo": "後頸部筋腹を触診する頸部伸展はどれ？"
  },
  {
    "id": 46,
    "imgId": "trunk_rot_g5",
    "title": "体幹回旋 (G5)",
    "region": "体幹",
    "muscle": "外腹斜筋・内腹斜筋",
    "nerve": "肋間神経・腸骨下腹神経",
    "root": "Th7〜L1",
    "grade": "G5",
    "pos": "背臥位",
    "image": "assets/mmt/trunk_rot_g5.png",
    "vector": "⇡ 後頭部手組み・対角肘膝方向回旋（自重）",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード5、両手を後頭部で組んだ状態で……",
    "shimo": "対角の肘を反対側膝へ向けて体幹を回旋するのはどれ？"
  },
  {
    "id": 47,
    "imgId": "trunk_rot_g4",
    "title": "体幹回旋 (G4)",
    "region": "体幹",
    "muscle": "外腹斜筋・内腹斜筋",
    "nerve": "肋間神経・腸骨下腹神経",
    "root": "Th7〜L1",
    "grade": "G4",
    "pos": "背臥位",
    "image": "assets/mmt/trunk_rot_g4.png",
    "vector": "⇡ 胸の前腕交差・対角回旋（自重）",
    "kami": "背臥位（胸の前腕交差）で……",
    "naka": "グレード4、両腕を胸の前で交差させて……",
    "shimo": "肩甲骨下角が浮くまで体幹を斜め回旋するのはどれ？"
  },
  {
    "id": 48,
    "imgId": "trunk_rot_g2",
    "title": "体幹回旋 (G2/1)",
    "region": "体幹",
    "muscle": "外腹斜筋・内腹斜筋",
    "nerve": "肋間神経・腸骨下腹神経",
    "root": "Th7〜L1",
    "grade": "G2",
    "pos": "背臥位",
    "image": "assets/mmt/trunk_rot_g2.png",
    "vector": "🔍 上肢前方伸展・腹壁斜走線維触診",
    "kami": "背臥位（腕前方伸展）で……",
    "naka": "グレード2、頭部挙上のみで肩甲骨は離床せず……",
    "shimo": "側腹部の腹斜筋収縮を触診する体幹回旋はどれ？"
  },
  {
    "id": 49,
    "imgId": "scap_elev_g543",
    "title": "肩甲骨挙上",
    "region": "上肢",
    "muscle": "僧帽筋上部線維・肩甲挙筋",
    "nerve": "副神経・頸神経叢",
    "root": "C3〜C5",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/scap_elev_g543.png",
    "vector": "↓ 両側肩峰下向き加圧（肩すくめブレイクテスト）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、両肩をすくめ肩峰への下向き抵抗に耐えて……",
    "shimo": "肩甲骨を挙上（僧帽筋上部・肩甲挙筋）するのはどれ？"
  },
  {
    "id": 50,
    "imgId": "scap_add_g543",
    "title": "肩甲骨内転",
    "region": "上肢",
    "muscle": "僧帽筋中部線維",
    "nerve": "副神経・頸神経叢",
    "root": "C3〜C4",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "image": "assets/mmt/scap_add_g543.png",
    "vector": "↓ 肩90°外転位・前腕下垂・肩甲骨内転抵抗",
    "kami": "腹臥位（肩90°外転・肘90°屈曲）で……",
    "naka": "グレード4〜5、前腕下垂位から上肢を天井へ引き上げ……",
    "shimo": "肩甲骨を脊柱方向へ内転（僧帽筋中部）するのはどれ？"
  },
  {
    "id": 51,
    "imgId": "scap_rhomb_g543",
    "title": "肩甲骨内転・下方回旋",
    "region": "上肢",
    "muscle": "大菱形筋・小菱形筋",
    "nerve": "肩甲背神経",
    "root": "C4〜C5",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "image": "assets/mmt/scap_rhomb_g543.png",
    "vector": "↓ 腰背部に置いた手・肘加圧抵抗",
    "kami": "腹臥位（手を腰の後ろに回す）で……",
    "naka": "グレード4〜5、手を腰から天井へ持ち上げ肘抵抗に耐えて……",
    "shimo": "肩甲骨を内転・下方回旋（菱形筋）するのはどれ？"
  },
  {
    "id": 52,
    "imgId": "scap_rhomb_g2",
    "title": "肩甲骨内転・下方回旋 (G2/1)",
    "region": "上肢",
    "muscle": "大・小菱形筋",
    "nerve": "肩甲背神経",
    "root": "C4〜C5",
    "grade": "G2",
    "pos": "端座位",
    "image": "assets/mmt/scap_rhomb_g2.png",
    "vector": "🔍 端座位で手を腰の後ろ・肩甲骨内縁触診",
    "kami": "端座位（手を腰の後ろ）で……",
    "naka": "グレード2、検者が上肢を支持し肩甲骨内転を誘導して……",
    "shimo": "肩甲骨脊椎縁深層の菱形筋を触診するのはどれ？"
  },
  {
    "id": 53,
    "imgId": "sh_habd_g543",
    "title": "肩関節水平外転",
    "region": "上肢",
    "muscle": "三角筋後部",
    "nerve": "腋窩神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "image": "assets/mmt/sh_habd_g543.png",
    "vector": "↓ 上腕遠位部下向き加圧（肩90°外転位水平挙上）",
    "kami": "腹臥位（肩90°外転・肘伸展）で……",
    "naka": "グレード4〜5、上肢を天井方向へ水平外転し抵抗に耐えて……",
    "shimo": "肩関節を水平外転（三角筋後部）するのはどれ？"
  },
  {
    "id": 54,
    "imgId": "sh_hadd_g543",
    "title": "肩関節水平内転",
    "region": "上肢",
    "muscle": "大胸筋（胸肋部・鎖骨部）",
    "nerve": "内側・外側胸筋神経",
    "root": "C5〜T1",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "image": "assets/mmt/sh_hadd_g543.png",
    "vector": "↓ 前腕遠位内側加圧（肩90°外転位水平内転）",
    "kami": "背臥位（肩90°外転）で……",
    "naka": "グレード4〜5、上肢を身体前面を横切るように水平内転し……",
    "shimo": "肩関節を水平内転（大胸筋）するのはどれ？"
  },
  {
    "id": 55,
    "imgId": "wrist_flex_g543",
    "title": "手関節屈曲",
    "region": "上肢",
    "muscle": "橈側手根屈筋・尺側手根屈筋",
    "nerve": "正中神経・尺骨神経",
    "root": "C6〜C8",
    "grade": "G5/4/3",
    "pos": "前腕支持",
    "image": "assets/mmt/wrist_flex_g543.png",
    "vector": "↓ 手掌面加圧（前腕回外位机上支持）",
    "kami": "前腕支持（回外位で机上設置）で……",
    "naka": "グレード4〜5、手掌面への伸展抵抗に耐えて……",
    "shimo": "手首を掌屈（橈側・尺側手根屈筋）するのはどれ？"
  },
  {
    "id": 56,
    "imgId": "hip_add_g543",
    "title": "股関節内転",
    "region": "下肢",
    "muscle": "大内転筋・長内転筋・短内転筋",
    "nerve": "閉鎖神経・坐骨神経",
    "root": "L2〜L4",
    "grade": "G5/4/3",
    "pos": "側臥位",
    "image": "assets/mmt/hip_add_g543.png",
    "vector": "↓ 下側大腿遠位内側加圧（下肢挙上保持）",
    "kami": "側臥位（検者が上側の脚を保持）で……",
    "naka": "グレード4〜5、下側の脚をベッドから持ち上げ抵抗に耐えて……",
    "shimo": "股関節を内転（内転筋群）するのはどれ？"
  },
  {
    "id": 57,
    "imgId": "hip_add_g2",
    "title": "股関節内転 (G2/1)",
    "region": "下肢",
    "muscle": "大内転筋・長内転筋",
    "nerve": "閉鎖神経",
    "root": "L2〜L4",
    "grade": "G2",
    "pos": "背臥位",
    "image": "assets/mmt/hip_add_g2.png",
    "vector": "➔ 重力最小位（背臥位）での水平面内転スライド",
    "kami": "背臥位（対側下肢外転位保持）で……",
    "naka": "グレード2、検者が下肢重量を支持し重力を最小にして……",
    "shimo": "ベッド面で股関節を中心方向へ内転するのはどれ？"
  },
  {
    "id": 58,
    "imgId": "hip_er_g543",
    "title": "股関節外旋",
    "region": "下肢",
    "muscle": "梨状筋・内閉鎖筋・大腿方形筋",
    "nerve": "仙骨神経叢・坐骨神経",
    "root": "L5〜S2",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/hip_er_g543.png",
    "vector": "➔ 下腿遠位内側へ外旋抵抗（第10版標準：端座位）",
    "kami": "端座位（第10版標準肢位）で……",
    "naka": "グレード4〜5、足首を内側へ引く下腿抵抗に耐えて大腿を外旋し……",
    "shimo": "股関節を外旋（深層外旋六筋）するのはどれ？"
  },
  {
    "id": 59,
    "imgId": "hip_ir_g543",
    "title": "股関節内旋",
    "region": "下肢",
    "muscle": "中臀筋前部・小臀筋・大腿筋膜張筋",
    "nerve": "上臀神経",
    "root": "L4〜S1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/hip_ir_g543.png",
    "vector": "➔ 下腿遠位外側へ内旋抵抗（第10版標準：端座位）",
    "kami": "端座位（第10版標準肢位）で……",
    "naka": "グレード4〜5、足首を外側へ引く下腿抵抗に耐えて大腿を内旋し……",
    "shimo": "股関節を内旋（中臀筋前部・小臀筋）するのはどれ？"
  },
  {
    "id": 60,
    "imgId": "foot_inv_g543",
    "title": "足部内反",
    "region": "下肢",
    "muscle": "後脛骨筋",
    "nerve": "脛骨神経",
    "root": "L4〜S1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/foot_inv_g543.png",
    "vector": "➔ 足底屈・内反位への外返し方向抵抗（第10版標準：端座位）",
    "kami": "端座位（または背臥位）で……",
    "naka": "グレード4〜5、前足部内側への外返し抵抗に耐えて足部を内反し……",
    "shimo": "足関節を底屈・内反（後脛骨筋）するのはどれ？"
  },
  {
    "id": 61,
    "imgId": "foot_ev_g543",
    "title": "足部外反",
    "region": "下肢",
    "muscle": "長腓骨筋・短腓骨筋",
    "nerve": "浅腓骨神経",
    "root": "L5〜S1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "image": "assets/mmt/foot_ev_g543.png",
    "vector": "➔ 足底屈・外反位への内返し方向抵抗（第10版標準：端座位）",
    "kami": "端座位（または背臥位）で……",
    "naka": "グレード4〜5、前足部外側への内返し抵抗に耐えて足部を外反し……",
    "shimo": "足関節を外反（長・短腓骨筋）するのはどれ？"
  }
];


// ============================================================================
// 🎨 画像解決エンジン (全60枚 ダニエルズ解剖線画 直接ロード)
// ============================================================================

// カードの図解画像パスを解決（assets/mmt/{imgId}.png ➔ card.image ➔ fallback）
function getCardResolvedImage(card) {
  if (!card) return '';
  if (card.imgId) {
    return `assets/mmt/${card.imgId}.png`;
  }
  return card.image || '';
}

function hasCustomImage() {
  return false;
}

// カード画像タグ生成（乗算ブレンド＆コントラスト補正＋SVGフォールバック付き）
function renderCardImageTag(card, extraClass = '', alt = '') {
  if (!card) return '';
  const src = getCardResolvedImage(card);
  const title = alt || card.title || 'MMT検査';
  const posText = card.pos || 'MMT';
  const svgXml = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 100'><rect width='160' height='100' fill='#F4EFE6'/><text x='80' y='55' font-size='13' text-anchor='middle' fill='#78716C' font-weight='bold'>${posText}</text></svg>`;
  const fallbackSvg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgXml);
  
  if (!src) {
    return `<div class="kc-art-placeholder">MMT<br>${card.pos}</div>`;
  }
  return `<img src="${src}" alt="${title}" class="mmt-blend-img ${extraClass}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackSvg}';">`;
}

// Global exports for testing & external calls
window.getCardResolvedImage = getCardResolvedImage;
window.hasCustomImage = hasCustomImage;
window.renderEncyclopedia = renderEncyclopedia;
window.filterEncyclopedia = filterEncyclopedia;

const POSITIONS = ["背臥位", "腹臥位", "座位", "端座位", "側臥位", "前腕支持", "前腕中間位", "立位"];
const SUB_REGIONS = ["上肢", "下肢", "体幹", "頸部"];
const SUB_MOTIONS = ["屈曲", "伸展", "外転", "底屈", "背屈"];

// フローチャート用関節マスター（支配神経・髄節完備）
const FLOW_JOINTS_DATA = [
  {
    "id": "knee_ext",
    "name": "膝関節伸展",
    "muscle": "大腿四頭筋",
    "nerve": "大腿神経",
    "root": "L2〜L4",
    "agPos": "端座位（下腿前上方伸展）",
    "gePos": "側臥位（下腿を検者が支持）",
    "palpation": "大腿四頭筋腱 / 膝蓋骨上部"
  },
  {
    "id": "shoulder_abd",
    "name": "肩関節外転",
    "muscle": "三角筋中部・棘上筋",
    "nerve": "腋窩神経・肩甲上神経",
    "root": "C5〜C6",
    "agPos": "端座位（腕を真横90°挙上）",
    "gePos": "背臥位（机・シーツ上を水平スライド）",
    "palpation": "三角筋中部（肩峰外側直下）"
  },
  {
    "id": "shoulder_er",
    "name": "肩関節外旋",
    "muscle": "棘下筋・小円筋",
    "nerve": "肩甲上神経・腋窩神経",
    "root": "C5〜C6",
    "agPos": "端座位（肘90°屈曲・前腕外側回旋 第10版標準）",
    "gePos": "端座位（机上支持水平外旋）",
    "palpation": "肩甲棘下窩（棘下筋筋腹）"
  },
  {
    "id": "shoulder_ir",
    "name": "肩関節内旋",
    "muscle": "肩甲下筋",
    "nerve": "肩甲下神経",
    "root": "C5〜C6",
    "agPos": "端座位（肘90°屈曲・前腕内側回旋 第10版標準）",
    "gePos": "端座位（机上支持水平内旋）",
    "palpation": "腋窩深部（肩甲下筋）"
  },
  {
    "id": "elbow_flex",
    "name": "肘関節屈曲",
    "muscle": "上腕二頭筋・上腕筋・腕橈骨筋",
    "nerve": "筋皮神経・橈骨神経",
    "root": "C5〜C6",
    "agPos": "端座位（前腕回外位で屈曲）",
    "gePos": "側臥位／端座位（前腕机上支持で水平屈曲）",
    "palpation": "上腕二頭筋腱（肘窩中央深部）"
  },
  {
    "id": "hip_flex",
    "name": "股関節屈曲",
    "muscle": "腸腰筋",
    "nerve": "大腿神経・腰神経叢",
    "root": "L1〜L3",
    "agPos": "端座位（大腿を座面から持ち上げる）",
    "gePos": "側臥位（検者が上肢・対側下肢を支持）",
    "palpation": "鼠径靭帯直下（大腿三角）"
  },
  {
    "id": "wrist_ext",
    "name": "手関節伸展",
    "muscle": "橈側手根伸筋群",
    "nerve": "橈骨神経",
    "root": "C6〜C7",
    "agPos": "前腕回内支持（手首を机から反らす）",
    "gePos": "前腕中間位（小指側接地・手刀姿勢で背屈）",
    "palpation": "手関節背側橈側（長・短橈側手根伸筋腱）"
  },
  {
    "id": "ankle_plantar",
    "name": "足関節底屈",
    "muscle": "下腿三頭筋（腓腹筋・ヒラメ筋）",
    "nerve": "脛骨神経",
    "root": "S1〜S2",
    "agPos": "立位（片脚立ち踵上げ25回）",
    "gePos": "腹臥位（足部ベッド端下垂で底屈）",
    "palpation": "アキレス腱 / 腓腹筋筋腹"
  },
  {
    "id": "ankle_dorsi",
    "name": "足関節背屈・内反",
    "muscle": "前脛骨筋",
    "nerve": "深腓骨神経",
    "root": "L4〜L5",
    "agPos": "背臥位（第10版標準：つま先を内反・背屈）",
    "gePos": "背臥位（重力最小位で前脛骨筋腱触診）",
    "palpation": "前脛骨筋腱（足関節前内側）"
  },
  {
    "id": "neck_flex",
    "name": "頸部屈曲",
    "muscle": "胸鎖乳突筋・頭長筋",
    "nerve": "副神経・頸神経叢",
    "root": "C2〜C3",
    "agPos": "背臥位（顎を引いて頭部を浮かす）",
    "gePos": "背臥位（重力最小位で胸鎖乳突筋触診）",
    "palpation": "胸鎖乳突筋前縁（頸部側面前方）"
  },
  {
    "id": "trunk_flex",
    "name": "体幹屈曲",
    "muscle": "腹直筋",
    "nerve": "肋間神経",
    "root": "Th7〜Th12",
    "agPos": "背臥位（頭の後ろ手組み・肩甲骨離床）",
    "gePos": "背臥位（頭部挙上・腹直筋触診）",
    "palpation": "腹直筋筋腹（正中線両側）"
  }
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

let cpuPersona = "pt"; // "pt" | "rookie" | "gravity" | "pvp"
let pvpCurrentTurn = 1; // 1: 1P(あなた), 2: 2P(相手)
let pvpCard1 = null;
let pvpCard2 = null;
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
    } else if (type === 'correct') {
      // 軽快で爽快な上昇アルペジオ
      const notes = [659.25, 880, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.15);
      });
    } else if (type === 'wrong') {
      // 鋭い警告ブザー
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'tick') {
      // 残り1秒未満の短いパルスティック
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'fever') {
      // 5コンボごとのFEVERファンファーレ
      const feverNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      feverNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.2, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.2);
      });
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
// CPU / 対面2P キャラクター選択
// ============================================================================
function selectCpuPersona(personaKey) {
  cpuPersona = personaKey;
  playSound('card');

  ['p-pt', 'p-rookie', 'p-gravity', 'p-pvp'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`p-${personaKey}`);
  if (activeBtn) activeBtn.classList.add('active');

  const nameLabel = document.getElementById('cpu-name-label');
  const oppLabel = document.getElementById('opponent-hand-label');
  const ticker = document.getElementById('result-ticker');

  pvpCurrentTurn = 1;
  pvpCard1 = null;
  pvpCard2 = null;

  if (personaKey === 'pvp') {
    if (nameLabel) nameLabel.innerText = "2P (相手)";
    if (oppLabel) oppLabel.innerHTML = `2Pの手札 (<span id="cpu-rem-count">${cpuHand.length}</span>枚)`;
    if (ticker) ticker.innerText = "👥 1台2人対戦（伏せオープン）を開始！まず1Pの手札から1枚選んでください";
  } else {
    if (nameLabel) {
      if (personaKey === 'pt') nameLabel.innerText = "指導者PT";
      else if (personaKey === 'rookie') nameLabel.innerText = "1年後輩";
      else if (personaKey === 'gravity') nameLabel.innerText = "重力マスター";
    }
    if (oppLabel) oppLabel.innerHTML = `相手の手札 (<span id="cpu-rem-count">${cpuHand.length}</span>枚)`;
    if (ticker) {
      if (personaKey === 'pt') ticker.innerText = "対戦相手を「指導者PT（王道の正確な判定）」に設定しました";
      else if (personaKey === 'rookie') ticker.innerText = "対戦相手を「1年後輩（たまに代償ミスをする）」に設定しました";
      else if (personaKey === 'gravity') ticker.innerText = "対戦相手を「重力マスター（G2逆転を狙ってくる）」に設定しました";
    }
  }

  initGame();
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
        cardDatabase = data.map(c => {
          const defaultRef = DEFAULT_CARDS.find(d => d.id === c.id) || {};
          return {
            ...defaultRef,
            ...c,
            nerve: c.nerve || defaultRef.nerve || '—',
            root: c.root || defaultRef.root || '—',
            kami: c.kami || defaultRef.kami || '体位で……',
            naka: c.naka || defaultRef.naka || '抵抗に耐えて……',
            shimo: c.shimo || defaultRef.shimo || 'この運動を行うのはどれ？'
          };
        });
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
  const isPvP = (cpuPersona === 'pvp');
  const activeHand = (isPvP && pvpCurrentTurn === 2) ? cpuHand : playerHand;

  const pRemEl = document.getElementById('player-rem-count');
  const dRemEl = document.getElementById('deck-rem-count');
  const cRemEl = document.getElementById('cpu-rem-count');
  const deckMetaLabel = document.querySelector('.deck-meta-bar .deck-label');

  if (pRemEl) pRemEl.innerText = activeHand.length;
  if (dRemEl) dRemEl.innerText = drawDeck.length;
  if (cRemEl) cRemEl.innerText = isPvP ? cpuHand.length : cpuHand.length;

  if (deckMetaLabel) {
    if (isPvP) {
      deckMetaLabel.innerHTML = (pvpCurrentTurn === 1)
        ? `✋ <strong>1P（あなた）の手番</strong> (<span id="player-rem-count">${playerHand.length}</span>枚) — 伏せる札を選んでください`
        : `✋ <strong>2P（相手）の手番</strong> (<span id="player-rem-count">${cpuHand.length}</span>枚) — 伏せる札を選んでください`;
    } else {
      deckMetaLabel.innerHTML = `✋ あなたの手札 (<span id="player-rem-count">${playerHand.length}</span>枚 / 山札:<span id="deck-rem-count">${drawDeck.length}</span>)`;
    }
  }

  // CPU Hand UI (2P対戦時は手札の完全伏せ・ブラインド保護)
  const cpuContainer = document.getElementById('cpu-hand-container');
  if (isPvP) {
    cpuContainer.innerHTML = cpuHand.map(() => `
      <div class="cpu-mini-card" style="background:#292524; border-color:#57534E;">
        <span class="cpu-card-hint-region" style="color:#A8A29E;">2P</span>
        <span class="cpu-card-hint-grade" style="color:#D6D3D1;">🃏</span>
      </div>
    `).join('');
  } else {
    cpuContainer.innerHTML = cpuHand.map(c => `
      <div class="cpu-mini-card">
        <span class="cpu-card-hint-region">${c.region}</span>
        <span class="cpu-card-hint-grade">${c.grade || 'G5'}</span>
      </div>
    `).join('');
  }

  // 手札 UI (PvP時は現在の手番のプレイヤーの手札を描画)
  const playerContainer = document.getElementById('player-hand-container');
  playerContainer.innerHTML = activeHand.map((c, i) => {
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

// 2P対戦：スマホ手渡し後の2P手番開始
function continuePvPTurn() {
  const modal = document.getElementById('pvp-pass-modal');
  if (modal) modal.style.display = 'none';

  pvpCurrentTurn = 2;
  playSound('card');
  renderBoard();

  const ticker = document.getElementById('result-ticker');
  if (ticker) ticker.innerText = `👉 2Pの番です。指定肢位【${currentField.pos}】に合わせてカードを1枚伏せてください`;
}

// カードをプレイ
function playCard(index) {
  if (isAnimating || isWaitingNextTurn || matchOver) return;

  const isPvP = (cpuPersona === 'pvp');

  if (isPvP) {
    if (pvpCurrentTurn === 1) {
      // 1Pの手番：カードを伏せてセットし、スマホ手渡しモーダル表示
      pvpCard1 = playerHand.splice(index, 1)[0];
      playSound('card');

      const pSlot = document.getElementById('p1-slot');
      if (pSlot) {
        pSlot.className = 'clash-slot facedown';
        pSlot.innerHTML = '<span class="facedown-icon">🃏</span><span class="facedown-text">1P 伏せ完了</span>';
      }

      const passModal = document.getElementById('pvp-pass-modal');
      const passTitle = document.getElementById('pvp-pass-title');
      const passDesc = document.getElementById('pvp-pass-desc');

      if (passTitle) passTitle.innerText = "📱 1Pセット完了！";
      if (passDesc) passDesc.innerText = "手札がバレないようにスマホを2P（相手）に渡してください。";
      if (passModal) passModal.style.display = 'flex';
      return;
    } else {
      // 2Pの手番：カードを伏せてセットし、せーのでオープン！
      pvpCard2 = cpuHand.splice(index, 1)[0];
      playSound('card');

      const cSlot = document.getElementById('cpu-slot');
      if (cSlot) {
        cSlot.className = 'clash-slot facedown';
        cSlot.innerHTML = '<span class="facedown-icon">🃏</span><span class="facedown-text">2P 伏せ完了</span>';
      }

      isAnimating = true;
      const ticker = document.getElementById('result-ticker');
      if (ticker) ticker.innerText = "⚡ 2人ともセット完了！せーの、オープン！！";

      setTimeout(() => {
        executeBattleClash(pvpCard1, pvpCard2);
      }, 650);
      return;
    }
  }

  // 通常のCPU戦
  const pCard = playerHand[index];
  if (!pCard) return;

  isAnimating = true;
  playSound('card');
  playerHand.splice(index, 1);

  // CPU思考ロジック（ペルソナ別）
  let cpuIndex = 0;
  if (cpuPersona === "rookie" && Math.random() < 0.35) {
    cpuIndex = Math.floor(Math.random() * cpuHand.length);
  } else if (cpuPersona === "gravity") {
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
  executeBattleClash(pCard, cpuCard);
}

// バトル激突・勝敗判定・サスペンス演出
function executeBattleClash(pCard, cpuCard) {
  discardPile.push(pCard, cpuCard);

  const isPvP = (cpuPersona === 'pvp');
  const pLabel = isPvP ? "1P (先攻)" : "あなた";
  const cLabel = isPvP ? "2P (後攻)" : "相手";

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

  // 代償ミス弱点カルテ記録（1P分）
  if (!pScore.isPosMatch) {
    mistakeCardIds.add(pCard.id);
    updateWeakCount();
  }

  // 0.0秒（オープン）：お互いのカードがバンッと表になる
  pSlot.className = 'clash-slot filled suspense';
  cSlot.className = 'clash-slot filled suspense';

  pSlot.innerHTML = renderCountUpSlotCard(pCard, pLabel, "var(--accent-blue)", pScore.base, "基礎Grade");
  cSlot.innerHTML = renderCountUpSlotCard(cpuCard, cLabel, "var(--accent-red)", cScore.base, "基礎Grade");

  ticker.innerText = `⚔️ せーのでオープン！ 基礎Grade（${pLabel} ${pScore.base} vs ${cLabel} ${cScore.base}）`;
  renderBoard();

  // 0.7秒（スコア加算）
  setTimeout(() => {
    pSlot.classList.remove('suspense');
    cSlot.classList.remove('suspense');

    pSlot.innerHTML = renderSlotCard(pCard, pLabel, "var(--accent-blue)", pScore, true);
    cSlot.innerHTML = renderSlotCard(cpuCard, cLabel, "var(--accent-red)", cScore, true);

    const isBonus = (pScore.posBonus > 0 || pScore.subBonus > 0);
    playSound(isBonus ? 'bonus' : 'penalty');

    ticker.innerText = `⚖️ スコア確定！ ${pLabel} ${pScore.total}点 vs ${cLabel} ${cScore.total}点`;

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
          resultMsg = `🔥 ${pLabel}が重力除去で大逆転！【${pCard.title}】が圧倒！ ★${wonStars > 1 ? wonStars + '個' : ''}獲得！`;
        } else {
          resultMsg = `🎉 ${pLabel}のラウンド勝利！【${pCard.title}】＞ ${cLabel}(${cScore.total}点) ★${wonStars > 1 ? wonStars + '個' : ''}獲得！`;
        }
      } else if (pScore.total < cScore.total) {
        cSlot.classList.add('winner');
        pSlot.classList.add('loser');
        playSound('lose');

        const wonStars = carryOverStars;
        cpuWins += wonStars;
        carryOverStars = 1;

        resultMsg = `🎉 ${cLabel}のラウンド勝利！【${cpuCard.title}】＞ ${pLabel}(${pScore.total}点) ★${wonStars > 1 ? wonStars + '個' : ''}獲得！`;
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

  pvpCurrentTurn = 1;
  pvpCard1 = null;
  pvpCard2 = null;

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
    pSlot.innerHTML = `<span class="slot-placeholder">${cpuPersona === 'pvp' ? '1Pの札' : 'あなたの札'}</span>`;
    cSlot.innerHTML = `<span class="slot-placeholder">${cpuPersona === 'pvp' ? '2Pの札' : '相手の札'}</span>`;

    playerHand.push(drawSingleCard());
    cpuHand.push(drawSingleCard());

    isAnimating = false;

    if (playerWins >= 3 || cpuWins >= 3) {
      matchOver = true;
      const isP1Won = playerWins >= 3;
      if (isP1Won) playSound('critical');
      else playSound('lose');

      const isPvP = (cpuPersona === 'pvp');
      const winLabel = isPvP ? (isP1Won ? "1P (先攻)" : "2P (後攻)") : (isP1Won ? "あなた" : "相手");

      ticker.innerText = `🏆 3勝達成！【${winLabel}】のマッチ完全勝利です！`;
      setTimeout(() => {
        if (confirm(`🏆 3勝先取！【${winLabel}】の勝利！もう一度対戦しますか？`)) {
          initGame();
        }
      }, 500);
    } else {
      rollField();
      renderBoard();
      if (cpuPersona === 'pvp') {
        ticker.innerText = "👥 1Pの番です。場のお題に合わせて手札からカードを伏せてください";
      } else {
        ticker.innerText = "場のお題に合致するカードを手札から選んでください";
      }
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
  const nerveEl = document.getElementById('flow-joint-nerve');

  if (titleEl) titleEl.innerText = `${joint.name}（${joint.muscle}）`;
  if (agPosEl) agPosEl.innerText = joint.agPos;
  if (gePosEl) gePosEl.innerText = joint.gePos;
  if (touchEl) touchEl.innerText = joint.palpation;
  if (nerveEl) nerveEl.innerText = `${joint.nerve || ''}（${joint.root || ''}）`;
}

// ============================================================================
// 図鑑 ＆ 弱点カルテ（ミス記録）ロジック
// ============================================================================
function updateWeakCount() {
  const countEl = document.getElementById('weak-count');
  if (countEl) countEl.textContent = mistakeCardIds.size;
}

function filterEncyclopedia(filterType) {
  currentEncFilter = filterType;
  playSound('card');

  const btnAll = document.getElementById('filter-all');
  const btnWeak = document.getElementById('filter-weak');
  if (btnAll) btnAll.classList.toggle('active', filterType === 'all');
  if (btnWeak) btnWeak.classList.toggle('active', filterType === 'weak');

  renderEncyclopedia();
}

function flipCard(el) {
  playSound('card');
  el.classList.toggle('flipped');
}

function renderEncyclopedia() {
  updateWeakCount();
  const container = document.getElementById('encyclopedia-container');
  if (!container) return;

  let displayCards = cardDatabase;
  if (currentEncFilter === 'weak') {
    displayCards = cardDatabase.filter(c => mistakeCardIds.has(c.id));
  }

  if (displayCards.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.8rem; line-height: 1.6;">
        🎉 要復習の代償ミスカードはありません！全問パーフェクト測定中！
      </div>
    `;
    return;
  }

  container.innerHTML = displayCards.map(c => {
    const isWeak = mistakeCardIds.has(c.id);

    return `
      <div class="k-card-flip-wrap ${isWeak ? 'weak-mark' : ''}" 
           data-id="${c.id}"
           onclick="flipCard(this)"
           title="タップで裏面（神経・髄節）を表示">
        <div class="k-card-inner">
          <!-- 表面 (Front): 検査肢位・ROM・イラスト -->
          <div class="k-card-face k-card-front">
            <div class="kc-top">
              <span class="kc-region-badge">${c.region}</span>
              <span class="kc-flip-hint">🔄 裏面</span>
              <span class="kc-grade-badge">${c.grade || 'G5'}</span>
            </div>
            
            <div class="kc-art-window" style="height:62px; position:relative;">
              ${renderCardImageTag(c, '', c.title)}
            </div>

            <div class="kc-meta">
              <div class="kc-title">${c.title}</div>
              <div class="kc-muscle">${c.muscle}</div>
            </div>
            <div class="kc-footer">
              <span style="font-size:0.68rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:130px;">${c.vector || '標準'}</span>
              <span class="kc-pos">${c.pos}</span>
            </div>
          </div>

          <!-- 裏面 (Back): 主動作筋 ＆ 支配神経・髄節レベル（国試・実習 必須知識） -->
          <div class="k-card-face k-card-back" onclick="flipCardFromBack(this, event)">
            <div class="kcb-top">
              <span class="kcb-badge">🧠 神経・髄節</span>
              <span class="kcb-region">${c.region}</span>
            </div>
            <div class="kcb-title">${c.title}</div>
            <div class="kcb-highlight-box">
              <div class="kcb-row">
                <span class="kcb-key">主動作筋</span>
                <strong class="kcb-muscle">${c.muscle}</strong>
              </div>
              <div class="kcb-row">
                <span class="kcb-key">支配神経</span>
                <strong class="kcb-nerve">${c.nerve || '—'}</strong>
              </div>
              <div class="kcb-row">
                <span class="kcb-key">髄節レベル</span>
                <strong class="kcb-root">${c.root || '—'}</strong>
              </div>
            </div>
            <div class="kcb-one-liner">
              💡 <strong>${c.muscle}</strong> ／ ${c.nerve || ''}（${c.root || ''}）
            </div>
            <div class="kcb-footer">
              <span>🔄 タップで表へ</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function flipCardFromBack(backEl, event) {
  if (event) event.stopPropagation();
  const wrap = backEl.closest('.k-card-flip-wrap');
  if (wrap) flipCard(wrap);
}

// タブ切り替え関数
function switchTab(tabId) {
  playSound('card');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const navBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (navBtn) navBtn.classList.add('active');

  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');

  if (tabId === 'flow') initFlowChart();
  if (tabId === 'list') {
    updateWeakCount();
    renderEncyclopedia();
  }
  if (tabId === 'battle' && matchOver) initGame();
  if (tabId === 'judge') initJudgeTab();
  if (tabId === 'karuta') initKarutaTab();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.getAttribute('data-tab');
    switchTab(tabId);
  });
});

// ============================================================================
// ⚡ MMT 3秒ジャッジ（高速スワイプ＆タップ臨床判定ゲーム）エンジン
// ============================================================================

// 臨床問題バンク（Daniels MMT基準・約20%の肢位エラーひっかけ混入）
const JUDGE_QUESTIONS_POOL = [
  // 1. 膝関節 伸展 (大腿四頭筋)
  {
    id: 101, cardId: 10, region: "下肢",
    title: "膝関節 伸展（大腿四頭筋）",
    pos: "端座位（下腿前上方伸展）", rom: "全可動域 完遂", finding: "下腿遠位への最大抵抗に耐える",
    correctAnswer: "G5", explanation: "端座位での抗重力全域完遂＋最大抵抗クリアは【Grade 5】です。",
    image: "assets/cards/knee_extension.jpg"
  },
  {
    id: 102, cardId: 10, region: "下肢",
    title: "膝関節 伸展（大腿四頭筋）",
    pos: "端座位（下腿前上方伸展）", rom: "全可動域 完遂", finding: "中等度抵抗に耐える（最大抵抗で崩れる）",
    correctAnswer: "G4", explanation: "中等度抵抗に耐え、最大抵抗で保持できない場合は【Grade 4】です。",
    image: "assets/cards/knee_extension.jpg"
  },
  {
    id: 103, cardId: 10, region: "下肢",
    title: "膝関節 伸展（大腿四頭筋）",
    pos: "端座位（下腿前上方伸展）", rom: "全可動域 完遂", finding: "徒手抵抗には負ける（自重のみ保持）",
    correctAnswer: "G3", explanation: "抗重力位で自重のみ全可動域動く場合は【Grade 3】です。",
    image: "assets/cards/knee_extension.jpg"
  },
  {
    id: 104, cardId: 11, region: "下肢",
    title: "膝関節 伸展（大腿四頭筋）",
    pos: "側臥位（下腿を検者が支持）", rom: "重力除去位で全ROM完遂", finding: "抵抗なし（摩擦低減）",
    correctAnswer: "G2", explanation: "重力除去肢位（側臥位）で全可動域動く場合は【Grade 2】です。",
    image: "assets/cards/knee_extension_g2.jpg"
  },
  {
    id: 105, cardId: 10, region: "下肢",
    title: "膝関節 伸展（大腿四頭筋）",
    pos: "側臥位（重力除去位）", rom: "関節運動なし", finding: "大腿四頭筋腱にわずかな収縮を触知",
    correctAnswer: "G1", explanation: "関節運動は起きず、筋腱の収縮のみ触知される場合は【Grade 1】です。",
    image: "assets/cards/knee_extension.jpg"
  },
  {
    id: 106, cardId: 10, region: "下肢",
    title: "膝関節 伸展（大腿四頭筋）",
    pos: "⚠️ 背臥位（ベッド上で膝屈曲から伸展）", rom: "全可動域 完遂", finding: "最大抵抗に耐えた",
    correctAnswer: "ERROR", explanation: "💡 膝伸展の抗重力位（G5/G4/G3）は「端座位」です。背臥位では抗重力になりません！",
    image: "assets/cards/knee_extension.jpg"
  },

  // 2. 肩関節 外転 (三角筋中部)
  {
    id: 107, cardId: 6, region: "上肢",
    title: "肩関節 外転（三角筋中部）",
    pos: "座位（腕を真横90°挙上）", rom: "全可動域 完遂", finding: "上腕遠位への最大抵抗に耐える",
    correctAnswer: "G5", explanation: "座位で真横90°挙上し最大抵抗クリアは【Grade 5】です。",
    image: "assets/cards/shoulder_abduction.jpg"
  },
  {
    id: 108, cardId: 6, region: "上肢",
    title: "肩関節 外転（三角筋中部）",
    pos: "座位（腕を真横90°挙上）", rom: "全可動域 完遂", finding: "中等度抵抗に耐える",
    correctAnswer: "G4", explanation: "中等度抵抗に耐える場合は【Grade 4】です。",
    image: "assets/cards/shoulder_abduction.jpg"
  },
  {
    id: 109, cardId: 6, region: "上肢",
    title: "肩関節 外転（三角筋中部）",
    pos: "座位（腕を真横90°挙上）", rom: "全可動域 完遂", finding: "自重のみ（徒手抵抗で落下）",
    correctAnswer: "G3", explanation: "自重のみ抗重力全域保持できる場合は【Grade 3】です。",
    image: "assets/cards/shoulder_abduction.jpg"
  },
  {
    id: 110, cardId: 6, region: "上肢",
    title: "肩関節 外転（三角筋中部）",
    pos: "背臥位（机・シーツ上を水平スライド）", rom: "重力除去で全ROM完遂", finding: "抵抗なし",
    correctAnswer: "G2", explanation: "背臥位で水平スライド全可動域完遂は【Grade 2】です。",
    image: "assets/cards/shoulder_abduction.jpg"
  },
  {
    id: 111, cardId: 6, region: "上肢",
    title: "肩関節 外転（三角筋中部）",
    pos: "⚠️ 立位（腕を体側に下垂したまま）", rom: "水平に動かした", finding: "重力除去位として判定",
    correctAnswer: "ERROR", explanation: "💡 肩外転の重力除去位（G2）は「背臥位」です。立位下垂位は誤りです！",
    image: "assets/cards/shoulder_abduction.jpg"
  },

  // 3. 肘関節 屈曲 (上腕二頭筋)
  {
    id: 112, cardId: 7, region: "上肢",
    title: "肘関節 屈曲（上腕二頭筋）",
    pos: "座位（前腕回外位で屈曲）", rom: "全可動域 完遂", finding: "前腕遠位への最大抵抗に耐える",
    correctAnswer: "G5", explanation: "座位・前腕回外位での最大抵抗クリアは【Grade 5】です。",
    image: "assets/cards/elbow_flexion.jpg"
  },
  {
    id: 113, cardId: 7, region: "上肢",
    title: "肘関節 屈曲（上腕二頭筋）",
    pos: "座位（前腕回外位で屈曲）", rom: "全可動域 完遂", finding: "中等度抵抗に耐える",
    correctAnswer: "G4", explanation: "中等度抵抗に耐える場合は【Grade 4】です。",
    image: "assets/cards/elbow_flexion.jpg"
  },
  {
    id: 114, cardId: 7, region: "上肢",
    title: "肘関節 屈曲（上腕二頭筋）",
    pos: "座位（机上に上腕を置き水平屈曲）", rom: "重力除去で全ROM完遂", finding: "抵抗なし",
    correctAnswer: "G2", explanation: "机上面での水平屈曲（重力除去位）完遂は【Grade 2】です。",
    image: "assets/cards/elbow_flexion.jpg"
  },
  {
    id: 115, cardId: 7, region: "上肢",
    title: "肘関節 屈曲（上腕二頭筋）",
    pos: "⚠️ 腹臥位（ベッド上で肘屈曲）", rom: "全可動域 完遂", finding: "最大抵抗に耐えた",
    correctAnswer: "ERROR", explanation: "💡 肘屈曲の抗重力位測定は「座位」で行います。腹臥位は誤りです！",
    image: "assets/cards/elbow_flexion.jpg"
  },

  // 4. 股関節 屈曲 (腸腰筋)
  {
    id: 116, cardId: 9, region: "下肢",
    title: "股関節 屈曲（腸腰筋）",
    pos: "端座位（大腿を座面から挙上）", rom: "全可動域 完遂", finding: "大腿遠位への最大抵抗に耐える",
    correctAnswer: "G5", explanation: "端座位で大腿を浮かせ最大抵抗クリアは【Grade 5】です。",
    image: "assets/cards/hip_flexion.jpg"
  },
  {
    id: 117, cardId: 9, region: "下肢",
    title: "股関節 屈曲（腸腰筋）",
    pos: "側臥位（検者が上肢・対側下肢支持）", rom: "重力除去で全ROM完遂", finding: "抵抗なし",
    correctAnswer: "G2", explanation: "側臥位（重力除去位）での全可動域完遂は【Grade 2】です。",
    image: "assets/cards/hip_flexion.jpg"
  },

  // 5. 手関節 伸展 (橈側手根伸筋群)
  {
    id: 118, cardId: 8, region: "上肢",
    title: "手関節 伸展（橈側手根伸筋群）",
    pos: "前腕支持（机上伏臥位で手首反らし）", rom: "全可動域 完遂", finding: "手背面への最大抵抗に耐える",
    correctAnswer: "G5", explanation: "前腕支持で手背への最大抵抗クリアは【Grade 5】です。",
    image: "assets/cards/wrist_extension.jpg"
  },
  {
    id: 119, cardId: 12, region: "上肢",
    title: "手関節 伸展（橈側手根伸筋群）",
    pos: "前腕中間位（手刀姿勢・小指接地）", rom: "机上を水平背屈スライド", finding: "全可動域 完遂",
    correctAnswer: "G2", explanation: "前腕中間位（手刀姿勢）での重力除去背屈は【Grade 2】です。",
    image: "assets/cards/wrist_extension_g2.jpg"
  },
  {
    id: 120, cardId: 8, region: "上肢",
    title: "手関節 伸展（橈側手根伸筋群）",
    pos: "前腕支持（机上伏臥位）", rom: "関節運動なし", finding: "橈側手根伸筋腱に収縮を触知",
    correctAnswer: "G1", explanation: "関節運動は起きず収縮触知のみは【Grade 1】です。",
    image: "assets/cards/wrist_extension.jpg"
  },

  // 6. 足関節 底屈 (下腿三頭筋)
  {
    id: 121, cardId: 14, region: "下肢",
    title: "足関節 底屈（下腿三頭筋）",
    pos: "立位（片脚立ち踵上げ）", rom: "完全フォームで25回完遂", finding: "抵抗なし（自重25回）",
    correctAnswer: "G5", explanation: "Daniels基準では立位・片脚立ち踵上げ25回完遂が【Grade 5】です。",
    image: "assets/cards/ankle_plantar_g5.jpg"
  },
  {
    id: 122, cardId: 14, region: "下肢",
    title: "足関節 底屈（下腿三頭筋）",
    pos: "立位（片脚立ち踵上げ）", rom: "完全フォームで12回で疲労", finding: "10〜24回完遂",
    correctAnswer: "G4", explanation: "片脚立ち踵上げ10〜24回完遂は【Grade 4】です。",
    image: "assets/cards/ankle_plantar_g5.jpg"
  },
  {
    id: 123, cardId: 14, region: "下肢",
    title: "足関節 底屈（下腿三頭筋）",
    pos: "腹臥位（足部ベッド端から下垂）", rom: "足底屈全可動域 完遂", finding: "重力除去位として完遂",
    correctAnswer: "G2", explanation: "腹臥位での底屈全ROM完遂は【Grade 2】です。",
    image: "assets/cards/ankle_plantar_g5.jpg"
  },

  // 7. 体幹 屈曲 (腹直筋)
  {
    id: 124, cardId: 3, region: "体幹",
    title: "体幹 屈曲（腹直筋）",
    pos: "背臥位（頭の後ろで手組み）", rom: "肩甲骨が完全に床から離床", finding: "完遂",
    correctAnswer: "G5", explanation: "背臥位・頭後ろ手組みでの体幹屈曲は【Grade 5】です。",
    image: "assets/cards/trunk_flexion.jpg"
  },
  {
    id: 125, cardId: 13, region: "体幹",
    title: "体幹 屈曲（腹直筋）",
    pos: "背臥位（胸の前で腕組み）", rom: "肩甲骨が完全に床から離床", finding: "完遂",
    correctAnswer: "G4", explanation: "背臥位・胸の前腕組みでの体幹屈曲は【Grade 4】です。",
    image: "assets/cards/trunk_flexion_g4.jpg"
  },
  {
    id: 126, cardId: 3, region: "体幹",
    title: "体幹 屈曲（腹直筋）",
    pos: "背臥位（両腕を前方に伸ばす）", rom: "肩甲骨下角が離床", finding: "完遂",
    correctAnswer: "G3", explanation: "両腕前腕伸ばしでの体幹屈曲は【Grade 3】です。",
    image: "assets/cards/trunk_flexion.jpg"
  },
  {
    id: 127, cardId: 3, region: "体幹",
    title: "体幹 屈曲（腹直筋）",
    pos: "⚠️ 腹臥位（頭の後ろ手組みで上体を反らす）", rom: "全可動域 完遂", finding: "最大抵抗クリア",
    correctAnswer: "ERROR", explanation: "💡 体幹「屈曲」は背臥位で行います。腹臥位は伸展（脊柱起立筋）の肢位です！",
    image: "assets/cards/trunk_flexion.jpg"
  },

  // 8. 頸部 屈曲 (胸鎖乳突筋)
  {
    id: 128, cardId: 1, region: "頸部",
    title: "頸部 屈曲（胸鎖乳突筋）",
    pos: "背臥位（顎を引き頭部離床）", rom: "全可動域 完遂", finding: "前額部への最大抵抗に耐える",
    correctAnswer: "G5", explanation: "背臥位で顎を引き、前額部最大抵抗クリアは【Grade 5】です。",
    image: "assets/cards/neck_flexion.jpg"
  },
  {
    id: 129, cardId: 1, region: "頸部",
    title: "頸部 屈曲（胸鎖乳突筋）",
    pos: "⚠️ 腹臥位（頭部を持ち上げる）", rom: "全可動域 完遂", finding: "後頭部抵抗クリア",
    correctAnswer: "ERROR", explanation: "💡 腹臥位＋後頭部抵抗は「頸部伸展」です。屈曲は背臥位で行います！",
    image: "assets/cards/neck_flexion.jpg"
  },

  // 9. 足関節 背屈 (前脛骨筋)
  {
    id: 130, cardId: 15, region: "下肢",
    title: "足関節 背屈（前脛骨筋）",
    pos: "端座位（つま先内反・背屈）", rom: "全可動域 完遂", finding: "前足部外返し方向の最大抵抗に耐える",
    correctAnswer: "G5", explanation: "端座位で足部内反背屈、最大抵抗クリアは【Grade 5】です。",
    image: "assets/cards/ankle_dorsi_g5.jpg"
  }
];

let judgeScore = 0;
let judgeCombo = 0;
let judgeMaxCombo = 0;
let judgeLives = 3;
let judgeCurrentIndex = 0;
let judgeQuestions = [];
let judgeTimerId = null;
let judgeBaseTime = 3.0; // 5, 3, 1.5, 0 (0は無制限)
let judgeTimeRemaining = 3.0;
let judgeTimeTotal = 3.0;
let judgeQuestionStartTime = 0;
let judgeResponseTimes = [];
let judgeWeaknesses = [];
let isJudgePlaying = false;
let isJudgePaused = false;

function selectJudgeTimeLimit(seconds) {
  judgeBaseTime = Number(seconds);
  playSound('card');

  document.querySelectorAll('.time-opt-btn').forEach(btn => {
    const val = Number(btn.getAttribute('data-time'));
    btn.classList.toggle('active', val === judgeBaseTime);
  });
}

function initJudgeTab() {
  const startScreen = document.getElementById('judge-start-screen');
  const cardWrap = document.getElementById('judge-card-wrapper');
  const feedbackModal = document.getElementById('judge-feedback-modal');
  const resultsScreen = document.getElementById('judge-results-screen');

  if (startScreen) startScreen.style.display = isJudgePlaying ? 'none' : 'flex';
  if (cardWrap) cardWrap.style.display = isJudgePlaying ? 'flex' : 'none';
  if (feedbackModal) feedbackModal.style.display = 'none';
  if (resultsScreen) resultsScreen.style.display = 'none';
}

function startJudgeGame() {
  playSound('card');
  judgeScore = 0;
  judgeCombo = 0;
  judgeMaxCombo = 0;
  judgeLives = 3;
  judgeCurrentIndex = 0;
  judgeResponseTimes = [];
  judgeWeaknesses = [];
  isJudgePlaying = true;
  isJudgePaused = false;

  // 15問シャッフル選出（エラーひっかけも適度に混入）
  const shuffled = [...JUDGE_QUESTIONS_POOL].sort(() => Math.random() - 0.5);
  judgeQuestions = shuffled.slice(0, 15);

  const startScreen = document.getElementById('judge-start-screen');
  const cardWrap = document.getElementById('judge-card-wrapper');
  const resultsScreen = document.getElementById('judge-results-screen');
  const feedbackModal = document.getElementById('judge-feedback-modal');

  if (startScreen) startScreen.style.display = 'none';
  if (resultsScreen) resultsScreen.style.display = 'none';
  if (feedbackModal) feedbackModal.style.display = 'none';
  if (cardWrap) cardWrap.style.display = 'flex';

  updateJudgeHUD();
  setupCardPointerEvents();
  loadJudgeQuestion();
}

function updateJudgeHUD() {
  const scoreEl = document.getElementById('judge-score');
  const comboEl = document.getElementById('judge-combo');
  const multEl = document.getElementById('judge-mult');
  const feverLabel = document.getElementById('judge-fever-label');
  const heartsEl = document.getElementById('judge-hearts');
  const qEl = document.getElementById('judge-current-q');

  if (scoreEl) scoreEl.innerText = judgeScore.toLocaleString();
  if (comboEl) comboEl.innerText = judgeCombo;

  // コンボ倍率
  let mult = 1.0;
  if (judgeCombo >= 10) mult = 3.0;
  else if (judgeCombo >= 5) mult = 2.0;
  else if (judgeCombo >= 3) mult = 1.5;

  if (multEl) multEl.innerText = `x${mult.toFixed(1)}`;
  if (feverLabel) {
    const isFever = judgeCombo >= 5;
    feverLabel.innerText = isFever ? "🔥 FEVER" : "COMBO";
    feverLabel.parentElement.classList.toggle('fever', isFever);
  }

  if (heartsEl) {
    let hearts = "";
    for (let i = 0; i < 3; i++) {
      hearts += (i < judgeLives) ? "❤️" : "🖤";
    }
    heartsEl.innerText = hearts;
  }

  if (qEl) qEl.innerText = Math.min(judgeCurrentIndex + 1, 15);
}

function loadJudgeQuestion() {
  if (judgeCurrentIndex >= judgeQuestions.length || judgeLives <= 0) {
    endJudgeGame();
    return;
  }

  const q = judgeQuestions[judgeCurrentIndex];
  isJudgePaused = false;

  // 選択秒数＆コンボに応じた制限時間加速
  if (judgeBaseTime === 0) {
    // 📖 無制限モード（じっくり学習）
    judgeTimeTotal = 0;
    judgeTimeRemaining = 0;
  } else {
    if (judgeCombo >= 10) judgeTimeTotal = Math.max(0.8, Number((judgeBaseTime * 0.6).toFixed(1)));
    else if (judgeCombo >= 5) judgeTimeTotal = Math.max(1.0, Number((judgeBaseTime * 0.8).toFixed(1)));
    else judgeTimeTotal = judgeBaseTime;
    judgeTimeRemaining = judgeTimeTotal;
  }

  judgeQuestionStartTime = performance.now();

  const card = document.getElementById('judge-card');
  if (card) {
    card.className = 'judge-card';
    card.style.transform = '';
  }

  hideAllStamps();

  // カード内容の反映
  const regionEl = document.getElementById('jcard-region');
  const titleEl = document.getElementById('jcard-title');
  const imgEl = document.getElementById('jcard-img');
  const posEl = document.getElementById('jcard-pos');
  const romEl = document.getElementById('jcard-rom');
  const findingEl = document.getElementById('jcard-finding');

  if (regionEl) regionEl.innerText = q.region;
  if (titleEl) titleEl.innerText = q.title;
  if (posEl) posEl.innerText = q.pos;
  if (romEl) romEl.innerText = q.rom;
  if (findingEl) findingEl.innerText = q.finding;

  if (imgEl) {
    imgEl.src = q.image;
    imgEl.alt = q.title;
  }

  updateJudgeHUD();
  startTimerGauge();
}

function startTimerGauge() {
  clearInterval(judgeTimerId);

  const fillEl = document.getElementById('judge-timer-bar');
  const textEl = document.getElementById('judge-timer-text');

  // 無制限モードの場合
  if (judgeBaseTime === 0) {
    if (fillEl) {
      fillEl.style.width = "100%";
      fillEl.className = 'judge-timer-fill';
    }
    if (textEl) {
      textEl.innerText = "♾️ 無制限";
    }
    return;
  }

  const intervalMs = 30;
  judgeTimerId = setInterval(() => {
    if (isJudgePaused) return;

    judgeTimeRemaining -= (intervalMs / 1000);
    if (judgeTimeRemaining <= 0) {
      judgeTimeRemaining = 0;
      clearInterval(judgeTimerId);
      handleJudgeTimeout();
      return;
    }

    const pct = Math.max(0, (judgeTimeRemaining / judgeTimeTotal) * 100);
    if (fillEl) {
      fillEl.style.width = pct + "%";
      fillEl.className = 'judge-timer-fill' + (pct < 33 ? ' danger' : (pct < 60 ? ' warn' : ''));
    }
    if (textEl) {
      textEl.innerText = judgeTimeRemaining.toFixed(1) + "s";
    }

    if (judgeTimeRemaining <= 1.0 && Math.floor(judgeTimeRemaining * 10) % 3 === 0) {
      playSound('tick');
    }
  }, intervalMs);
}

function submitJudgeAnswer(chosenAnswer) {
  if (!isJudgePlaying || isJudgePaused) return;

  clearInterval(judgeTimerId);
  const q = judgeQuestions[judgeCurrentIndex];
  const responseTimeSec = (performance.now() - judgeQuestionStartTime) / 1000;
  judgeResponseTimes.push(responseTimeSec);

  const isCorrect = (chosenAnswer === q.correctAnswer);

  if (isCorrect) {
    handleCorrectAnswer(chosenAnswer, responseTimeSec);
  } else {
    handleWrongAnswer(chosenAnswer, q);
  }
}

function handleCorrectAnswer(chosenAnswer, responseTimeSec) {
  playSound('correct');

  // スコア計算：基本200点 ＋ 残り時間ボーナス(最大100点) × 倍率
  let mult = 1.0;
  if (judgeCombo >= 10) mult = 3.0;
  else if (judgeCombo >= 5) mult = 2.0;
  else if (judgeCombo >= 3) mult = 1.5;

  let timeBonus = 50;
  if (judgeBaseTime > 0) {
    timeBonus = Math.round((judgeTimeRemaining / judgeTimeTotal) * 100);
  } else {
    // 無制限時は回答速度に応じた軽微なボーナス（5秒未満なら最大100点）
    timeBonus = Math.max(20, Math.round(100 - (responseTimeSec * 10)));
  }

  const earned = Math.round((200 + timeBonus) * mult);
  judgeScore += earned;

  judgeCombo++;
  if (judgeCombo > judgeMaxCombo) judgeMaxCombo = judgeCombo;

  if (judgeCombo === 5 || judgeCombo === 10) {
    playSound('fever');
  }

  // カードの軽快なフライアウトアニメーション
  const card = document.getElementById('judge-card');
  if (card) {
    let flyClass = 'fly-up';
    if (chosenAnswer === 'G3') flyClass = 'fly-right';
    else if (chosenAnswer === 'G2' || chosenAnswer === 'G1') flyClass = 'fly-left';
    else if (chosenAnswer === 'ERROR') flyClass = 'fly-down';
    card.classList.add(flyClass);
  }

  updateJudgeHUD();

  // 0.25秒で即座に次の問題へ！サクサク進む
  setTimeout(() => {
    judgeCurrentIndex++;
    loadJudgeQuestion();
  }, 250);
}

function handleWrongAnswer(chosenAnswer, q) {
  playSound('wrong');
  judgeCombo = 0;
  judgeLives--;
  isJudgePaused = true;

  // 弱点カルテに自動記録！
  if (q.cardId) {
    mistakeCardIds.add(q.cardId);
    updateWeakCount();
  }

  judgeWeaknesses.push({
    title: q.title,
    pos: q.pos,
    correct: q.correctAnswer,
    yourAnswer: chosenAnswer,
    memo: q.explanation
  });

  updateJudgeHUD();

  // ミスモーダル表示（タイマー停止して1行解説）
  const modal = document.getElementById('judge-feedback-modal');
  const badge = document.getElementById('feedback-badge');
  const ansEl = document.getElementById('feedback-correct-answer');
  const memoEl = document.getElementById('feedback-memo');

  if (badge) badge.innerText = "❌ 不正解！";
  if (ansEl) {
    let ansLabel = q.correctAnswer;
    if (q.correctAnswer === 'ERROR') ansLabel = "⚠️ 肢位エラー（再検査）";
    else if (q.correctAnswer === 'G5') ansLabel = "Grade 5 (最大抵抗)";
    else if (q.correctAnswer === 'G4') ansLabel = "Grade 4 (中等度抵抗)";
    else if (q.correctAnswer === 'G3') ansLabel = "Grade 3 (自重のみ抗重力)";
    else if (q.correctAnswer === 'G2') ansLabel = "Grade 2 (重力除去)";
    else if (q.correctAnswer === 'G1') ansLabel = "Grade 1 (筋収縮のみ)";
    ansEl.innerText = ansLabel;
  }
  if (memoEl) memoEl.innerText = q.explanation;

  if (modal) modal.style.display = 'flex';
}

function handleJudgeTimeout() {
  playSound('wrong');
  const q = judgeQuestions[judgeCurrentIndex];
  judgeResponseTimes.push(judgeTimeTotal);

  judgeCombo = 0;
  judgeLives--;
  isJudgePaused = true;

  if (q.cardId) {
    mistakeCardIds.add(q.cardId);
    updateWeakCount();
  }

  judgeWeaknesses.push({
    title: q.title,
    pos: q.pos,
    correct: q.correctAnswer,
    yourAnswer: "時間切れ",
    memo: q.explanation
  });

  updateJudgeHUD();

  const modal = document.getElementById('judge-feedback-modal');
  const badge = document.getElementById('feedback-badge');
  const ansEl = document.getElementById('feedback-correct-answer');
  const memoEl = document.getElementById('feedback-memo');

  if (badge) badge.innerText = "⏰ 時間切れ！";
  if (ansEl) {
    let ansLabel = q.correctAnswer;
    if (q.correctAnswer === 'ERROR') ansLabel = "⚠️ 肢位エラー（再検査）";
    else if (q.correctAnswer === 'G5') ansLabel = "Grade 5 (最大抵抗)";
    else if (q.correctAnswer === 'G4') ansLabel = "Grade 4 (中等度抵抗)";
    else if (q.correctAnswer === 'G3') ansLabel = "Grade 3 (自重のみ抗重力)";
    else if (q.correctAnswer === 'G2') ansLabel = "Grade 2 (重力除去)";
    else if (q.correctAnswer === 'G1') ansLabel = "Grade 1 (筋収縮のみ)";
    ansEl.innerText = ansLabel;
  }
  if (memoEl) memoEl.innerText = q.explanation;

  if (modal) modal.style.display = 'flex';
}

function nextJudgeQuestion() {
  playSound('card');
  const modal = document.getElementById('judge-feedback-modal');
  if (modal) modal.style.display = 'none';

  if (judgeLives <= 0) {
    endJudgeGame();
  } else {
    judgeCurrentIndex++;
    loadJudgeQuestion();
  }
}

function endJudgeGame() {
  isJudgePlaying = false;
  clearInterval(judgeTimerId);

  const cardWrap = document.getElementById('judge-card-wrapper');
  const resultsScreen = document.getElementById('judge-results-screen');
  const feedbackModal = document.getElementById('judge-feedback-modal');

  if (cardWrap) cardWrap.style.display = 'none';
  if (feedbackModal) feedbackModal.style.display = 'none';
  if (resultsScreen) resultsScreen.style.display = 'flex';

  const isSuccess = judgeLives > 0;
  if (isSuccess) playSound('win');
  else playSound('lose');

  // リザルト統計
  const scoreEl = document.getElementById('results-score');
  const maxComboEl = document.getElementById('results-max-combo');
  const clearedEl = document.getElementById('results-cleared-count');
  const avgSpeedEl = document.getElementById('results-avg-speed');
  const rankIconEl = document.getElementById('results-rank-icon');
  const rankTitleEl = document.getElementById('results-rank-title');
  const weakListEl = document.getElementById('results-weak-list');

  if (scoreEl) scoreEl.innerText = judgeScore.toLocaleString();
  if (maxComboEl) maxComboEl.innerText = judgeMaxCombo;
  if (clearedEl) clearedEl.innerText = `${Math.min(judgeCurrentIndex, 15)} / 15`;

  const avgSpeed = judgeResponseTimes.length > 0
    ? (judgeResponseTimes.reduce((a, b) => a + b, 0) / judgeResponseTimes.length).toFixed(2)
    : "1.50";
  if (avgSpeedEl) avgSpeedEl.innerText = `${avgSpeed}秒`;

  // 臨床ランク称号判定
  let rankIcon = "🐣";
  let rankTitle = "1年生ルーキー";
  if (judgeScore >= 3200) {
    rankIcon = "👑";
    rankTitle = "伝説の指導者級";
  } else if (judgeScore >= 2200) {
    rankIcon = "✨";
    rankTitle = "即戦力バイザー級";
  } else if (judgeScore >= 1200) {
    rankIcon = "💪";
    rankTitle = "臨床実習クリア級";
  }

  if (rankIconEl) rankIconEl.innerText = rankIcon;
  if (rankTitleEl) rankTitleEl.innerText = rankTitle;

  // 弱点振り返りリスト描画
  if (weakListEl) {
    if (judgeWeaknesses.length === 0) {
      weakListEl.innerHTML = `
        <div style="font-size:0.7rem; color:var(--accent-green); font-weight:800; text-align:center; padding:8px;">
          🎉 ミスなし！全問パーフェクト判定達成！完璧な臨床即応力です！
        </div>
      `;
    } else {
      weakListEl.innerHTML = judgeWeaknesses.map(w => `
        <div class="r-weak-item">
          <strong>${w.title}</strong> [${w.pos}]<br>
          正解: <span style="color:var(--accent-green); font-weight:800;">${w.correct}</span> (あなたの回答: ${w.yourAnswer})<br>
          <span style="color:var(--text-secondary);">${w.memo}</span>
        </div>
      `).join('');
    }
  }
}

// ============================================================================
// スワイプ（Pointer / Touch Events）物理制御
// ============================================================================
let dragStartX = 0;
let dragStartY = 0;
let isDragging = false;

function setupCardPointerEvents() {
  const card = document.getElementById('judge-card');
  if (!card) return;

  card.onpointerdown = (e) => {
    if (!isJudgePlaying || isJudgePaused) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    card.setPointerCapture(e.pointerId);
    card.style.transition = 'none';
  };

  card.onpointermove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    const rot = deltaX * 0.08;
    card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rot}deg)`;

    // スワイプスタンプの半透明表示
    hideAllStamps();
    if (deltaY < -50 && Math.abs(deltaY) > Math.abs(deltaX)) {
      showStamp('stamp-up');
    } else if (deltaX > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      showStamp('stamp-right');
    } else if (deltaX < -50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      showStamp('stamp-left');
    } else if (deltaY > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
      showStamp('stamp-down');
    }
  };

  const endDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    card.style.transition = 'transform 0.2s ease';

    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    hideAllStamps();

    const threshold = 70;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absY > threshold && absY > absX && deltaY < 0) {
      // ⬆️ 上スワイプ：G5 / G4（問題の所見に応じて自動判定、または所見がG4ならG4、G5ならG5）
      const q = judgeQuestions[judgeCurrentIndex];
      const autoAnswer = (q.correctAnswer === 'G4') ? 'G4' : 'G5';
      submitJudgeAnswer(autoAnswer);
    } else if (absX > threshold && absX > absY && deltaX > 0) {
      // ➡️ 右スワイプ：G3（抗重力自重のみ）
      submitJudgeAnswer('G3');
    } else if (absX > threshold && absX > absY && deltaX < 0) {
      // ⬅️ 左スワイプ：G2 / G1（重力除去・触診）
      const q = judgeQuestions[judgeCurrentIndex];
      const autoAnswer = (q.correctAnswer === 'G1') ? 'G1' : 'G2';
      submitJudgeAnswer(autoAnswer);
    } else if (absY > threshold && absY > absX && deltaY > 0) {
      // ⬇️ 下スワイプ：⚠️ 肢位エラー（再検査）
      submitJudgeAnswer('ERROR');
    } else {
      card.style.transform = '';
    }
  };

  card.onpointerup = endDrag;
  card.onpointercancel = endDrag;
}

function showStamp(stampId) {
  const el = document.getElementById(stampId);
  if (el) el.style.opacity = '1';
}

function hideAllStamps() {
  ['stamp-up', 'stamp-right', 'stamp-left', 'stamp-down'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '0';
  });
}

// キーボード操作リスナー (PC向け超高速回答)
window.addEventListener('keydown', (e) => {
  const key = e.key;

  // Space / Enterキーでスタートまたは「次へ」
  if (key === ' ' || key === 'Enter') {
    const feedbackModal = document.getElementById('judge-feedback-modal');
    const startScreen = document.getElementById('judge-start-screen');
    const tabJudge = document.getElementById('tab-judge');

    if (tabJudge && tabJudge.classList.contains('active')) {
      if (feedbackModal && feedbackModal.style.display === 'flex') {
        e.preventDefault();
        nextJudgeQuestion();
        return;
      }
      if (startScreen && startScreen.style.display === 'flex') {
        e.preventDefault();
        startJudgeGame();
        return;
      }
    }
  }

  // 数字キー & Eキーでのダイレクト判定
  if (isJudgePlaying && !isJudgePaused) {
    if (key === '5') submitJudgeAnswer('G5');
    else if (key === '4') submitJudgeAnswer('G4');
    else if (key === '3') submitJudgeAnswer('G3');
    else if (key === '2') submitJudgeAnswer('G2');
    else if (key === '1') submitJudgeAnswer('G1');
    else if (key === 'e' || key === 'E' || key === '0') submitJudgeAnswer('ERROR');
  }
});

// ============================================================================
// 🎴 対面2Pスプリット・3行読み上げカルタ ＆ イラスト4択バトル エンジン
// ============================================================================

let karutaSubMode = 'karuta'; // 'karuta' (3行読み上げカルタ) or 'quiz' (画像1枚➔4択ジャッジ)
let isKarutaSplit = true;     // true: 対面2Pスプリット(2P 180度反転), false: 1Pソロ
let karutaVoiceEnabled = true; // Web Speech API 音声読み上げ
let karutaScores = { p1: 0, p2: 0 };
let karutaCurrentChoices = []; // 場の4枚
let karutaTargetCard = null;   // 正解カード
let karutaCurrentStage = 1;    // 1: 上の句(+3pt), 2: 中の句(+2pt), 3: 下の句(+1pt)
let isKarutaRoundActive = false;
let karutaTimers = [];
let karutaRoundCount = 0;
let isKarutaLockedP1 = false;
let isKarutaLockedP2 = false;

// 音声読み上げ（Web Speech API）
function speakKarutaText(text) {
  if (!karutaVoiceEnabled || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ja-JP';
    utter.rate = 1.15;
    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.log("SpeechSynthesis error:", e);
  }
}

// 全タイマークリア
function clearKarutaTimers() {
  karutaTimers.forEach(t => clearTimeout(t));
  karutaTimers = [];
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch(e){}
  }
}

// サブモード切替 (karuta / quiz)
function setKarutaSubMode(mode) {
  karutaSubMode = mode;
  const btnK = document.getElementById('btn-mode-karuta');
  const btnQ = document.getElementById('btn-mode-quiz');
  if (btnK) btnK.classList.toggle('active', mode === 'karuta');
  if (btnQ) btnQ.classList.toggle('active', mode === 'quiz');
  playSound('card');
  startKarutaRound();
}

// 対面スプリット切替 (2P対面 / 1Pソロ)
function toggleKarutaSplit() {
  isKarutaSplit = !isKarutaSplit;
  const btn = document.getElementById('btn-split-toggle');
  if (btn) {
    btn.innerText = isKarutaSplit ? "👥 対面2P" : "👤 1Pソロ";
    btn.classList.toggle('toggled-on', isKarutaSplit);
  }
  const zoneP2 = document.getElementById('k-zone-p2');
  if (zoneP2) {
    zoneP2.style.display = isKarutaSplit ? 'flex' : 'none';
    zoneP2.classList.toggle('split-active', isKarutaSplit);
  }
  playSound('card');
}

// 音声読み上げトグル
function toggleKarutaVoice() {
  karutaVoiceEnabled = !karutaVoiceEnabled;
  const btn = document.getElementById('btn-voice-toggle');
  if (btn) {
    btn.innerText = karutaVoiceEnabled ? "🔊 読み上げ ON" : "🔇 読み上げ OFF";
    btn.classList.toggle('toggled-on', karutaVoiceEnabled);
  }
  if (!karutaVoiceEnabled && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch(e){}
  }
  playSound('card');
}

// タイプライター風テキスト出力
function typeKarutaLine(lineClass, text) {
  const els = document.querySelectorAll('.' + lineClass);
  els.forEach(el => el.textContent = '');
  let i = 0;
  function step() {
    if (i <= text.length) {
      els.forEach(el => el.textContent = text.slice(0, i));
      i++;
      karutaTimers.push(setTimeout(step, 36));
    }
  }
  step();
}

// ゾーン（1P, 2P）の描画
function renderKarutaZones() {
  const zoneP2 = document.getElementById('k-zone-p2');
  if (zoneP2) {
    zoneP2.style.display = isKarutaSplit ? 'flex' : 'none';
    zoneP2.classList.toggle('split-active', isKarutaSplit);
  }

  ['p1', 'p2'].forEach(pKey => {
    const isP1 = pKey === 'p1';
    const zone = document.getElementById(isP1 ? 'k-zone-p1' : 'k-zone-p2');
    if (!zone) return;

    zone.classList.remove('locked');

    if (karutaSubMode === 'karuta') {
      // モードA：3行読み上げ ➔ イラスト4枚（文字なし）から早押し
      zone.innerHTML = `
        <div class="k-p-header ${pKey}">
          <div class="k-p-title">
            <span>${isP1 ? '🔵 1P (あなた)' : '🔴 2P (対面相手)'}</span>
          </div>
          <span class="k-pt-badge">${karutaScores[pKey]} pt</span>
        </div>
        <div class="k-poem-box">
          <div class="k-poem-line line-1"></div>
          <div class="k-poem-line line-2"></div>
          <div class="k-poem-line line-3"></div>
        </div>
        <div class="k-choices-grid">
          ${karutaCurrentChoices.map((c) => `
            <button class="k-karuta-card-btn" data-id="${c.id}" onpointerdown="handleKarutaChoiceTap('${pKey}', ${c.id}, this)">
              <div class="k-illust-box">
                ${renderCardImageTag(c, '', '検査イラスト')}
              </div>
            </button>
          `).join('')}
        </div>
      `;
    } else {
      // モードB：中央にイラスト1枚（文字なし）➔ 手元に4択テキストボタン
      zone.innerHTML = `
        <div class="k-p-header ${pKey}">
          <div class="k-p-title">
            <span>${isP1 ? '🔵 1P (あなた)' : '🔴 2P (対面相手)'}</span>
          </div>
          <span class="k-pt-badge">${karutaScores[pKey]} pt</span>
        </div>
        <div class="k-single-illust-wrap">
          <div class="k-illust-card-c">
            ${renderCardImageTag(karutaTargetCard, '', '出題イラスト')}
          </div>
          <div class="k-illust-guide-text">
            ◀ この検査の<br>「体位・Grade・運動」<br>を早押し！
          </div>
        </div>
        <div class="k-choices-grid">
          ${karutaCurrentChoices.map(c => `
            <button class="k-quiz-choice-btn" data-id="${c.id}" onpointerdown="handleKarutaChoiceTap('${pKey}', ${c.id}, this)">
              <div class="k-c-header-row">
                <span class="k-tag-pos">${c.pos}</span>
                <span class="k-tag-grade">${c.grade}</span>
              </div>
              <div class="k-c-motion">${c.title}</div>
              <div class="k-c-muscle">${c.muscle}</div>
            </button>
          `).join('')}
        </div>
      `;
    }
  });
}

// ラウンド開始
function startKarutaRound() {
  clearKarutaTimers();
  isKarutaRoundActive = true;
  karutaCurrentStage = 1;
  karutaRoundCount++;

  const btnNext = document.getElementById('k-btn-next-round');
  if (btnNext) btnNext.style.display = 'none';

  // 正解カード選出
  const pool = [...cardDatabase];
  karutaTargetCard = pool[Math.floor(Math.random() * pool.length)];

  // 決まり字ロジック：正解と同じ体位を持つ別のカードを最低1枚混ぜる
  const samePosCards = pool.filter(c => c.pos === karutaTargetCard.pos && c.id !== karutaTargetCard.id);
  const otherPosCards = pool.filter(c => c.pos !== karutaTargetCard.pos);

  let choices = [karutaTargetCard];
  if (samePosCards.length > 0) {
    choices.push(samePosCards[Math.floor(Math.random() * samePosCards.length)]);
  }
  const remainingNeeded = 4 - choices.length;
  const shuffledOthers = [...otherPosCards].sort(() => Math.random() - 0.5);
  choices = choices.concat(shuffledOthers.slice(0, remainingNeeded));
  karutaCurrentChoices = choices.sort(() => Math.random() - 0.5);

  window.karutaTargetCard = karutaTargetCard;
  window.karutaCurrentChoices = karutaCurrentChoices;

  renderKarutaZones();

  const bannerText = document.getElementById('k-banner-text');

  if (karutaSubMode === 'karuta') {
    if (bannerText) bannerText.innerHTML = '📖 <strong>第一句（体位）読み上げ中…</strong> (正解で+3pt)';
    typeKarutaLine('line-1', '① ' + karutaTargetCard.kami);
    speakKarutaText(karutaTargetCard.kami);

    karutaTimers.push(setTimeout(() => {
      if (!isKarutaRoundActive) return;
      karutaCurrentStage = 2;
      if (bannerText) bannerText.innerHTML = '📖 <strong>第二句（Grade・抵抗）読み上げ中…</strong> (正解で+2pt)';
      typeKarutaLine('line-2', '② ' + karutaTargetCard.naka);
      speakKarutaText(karutaTargetCard.naka);
    }, 2400));

    karutaTimers.push(setTimeout(() => {
      if (!isKarutaRoundActive) return;
      karutaCurrentStage = 3;
      if (bannerText) bannerText.innerHTML = '📖 <strong>第三句（動作・主動作筋）確定！</strong> (正解で+1pt)';
      typeKarutaLine('line-3', '③ ' + karutaTargetCard.shimo);
      speakKarutaText(karutaTargetCard.shimo);
    }, 5000));
  } else {
    if (bannerText) bannerText.innerHTML = '⚡ <strong>イラストを見て4択から早押し！</strong> (+2pt)';
  }
}

// 回答タップ判定
function handleKarutaChoiceTap(player, cardId, btnEl) {
  if (!isKarutaRoundActive) return;

  if (player === 'p1' && isKarutaLockedP1) return;
  if (player === 'p2' && isKarutaLockedP2) return;

  const bannerText = document.getElementById('k-banner-text');
  const btnNext = document.getElementById('k-btn-next-round');

  if (cardId === karutaTargetCard.id) {
    // 正解！
    isKarutaRoundActive = false;
    clearKarutaTimers();

    const earned = karutaSubMode === 'karuta' ? (4 - karutaCurrentStage) : 2;
    karutaScores[player] += earned;
    playSound('correct');

    // 両画面の正解ボタンをハイライト
    document.querySelectorAll(`[data-id="${cardId}"]`).forEach(b => b.classList.add('correct'));

    // 全文を開示
    if (karutaSubMode === 'karuta') {
      document.querySelectorAll('.line-1').forEach(el => el.textContent = '① ' + karutaTargetCard.kami);
      document.querySelectorAll('.line-2').forEach(el => el.textContent = '② ' + karutaTargetCard.naka);
      document.querySelectorAll('.line-3').forEach(el => el.textContent = '③ ' + karutaTargetCard.shimo);
    }

    const pLabel = player === 'p1' ? '🔵 1P' : '🔴 2P';
    const timingLabel = karutaSubMode === 'karuta' ? `（第${karutaCurrentStage}句で先取！）` : '';
    if (bannerText) bannerText.innerHTML = `🎉 <strong>${pLabel} 正解！ +${earned}pt</strong> ${timingLabel}`;
    if (btnNext) btnNext.style.display = 'inline-block';

    // スコアバッジ更新
    document.querySelectorAll('.k-p-header.p1 .k-pt-badge').forEach(b => b.textContent = `${karutaScores.p1} pt`);
    document.querySelectorAll('.k-p-header.p2 .k-pt-badge').forEach(b => b.textContent = `${karutaScores.p2} pt`);

    // 5点先取でマッチ勝利判定
    if (karutaScores.p1 >= 5 || karutaScores.p2 >= 5) {
      setTimeout(() => {
        endKarutaGame(karutaScores.p1 >= 5 ? 1 : 2);
      }, 1000);
    }
  } else {
    // お手つき！
    playSound('wrong');
    btnEl.classList.add('wrong');
    setTimeout(() => btnEl.classList.remove('wrong'), 400);

    const isP1 = player === 'p1';
    if (isP1) isKarutaLockedP1 = true;
    else isKarutaLockedP2 = true;

    const zone = document.getElementById(isP1 ? 'k-zone-p1' : 'k-zone-p2');
    if (zone) zone.classList.add('locked');

    if (bannerText) bannerText.innerHTML = `⚠️ <strong>${isP1 ? '🔵 1P' : '🔴 2P'} お手つき！（2.5秒ロック）</strong>`;

    setTimeout(() => {
      if (isP1) isKarutaLockedP1 = false;
      else isKarutaLockedP2 = false;
      if (zone) zone.classList.remove('locked');
      if (isKarutaRoundActive && bannerText) {
        bannerText.innerHTML = karutaSubMode === 'karuta' ? `📖 競技カルタ早押し中…` : `⚡ イラストを見て4択から早押し！`;
      }
    }, 2500);
  }
}

// ゲーム終了（5点先取勝利モーダル）
function endKarutaGame(winner) {
  isKarutaRoundActive = false;
  clearKarutaTimers();
  playSound('fever');

  const resultScreen = document.getElementById('karuta-result-screen');
  const titleEl = document.getElementById('karuta-winner-title');
  const descEl = document.getElementById('karuta-winner-desc');
  const scoresEl = document.getElementById('karuta-final-scores');

  if (winner === 1) {
    if (titleEl) titleEl.innerText = "🔵 1P の完全勝利！！";
    if (descEl) descEl.innerText = "驚異的な反射神経とMMT臨床知識でマッチを制しました！";
  } else {
    if (titleEl) titleEl.innerText = "🔴 2P の完全勝利！！";
    if (descEl) descEl.innerText = "抜群の洞察力と解剖学的知識で相手を圧倒しました！";
  }

  if (scoresEl) {
    scoresEl.innerText = `🔵 1P: ${karutaScores.p1}pt  vs  🔴 2P: ${karutaScores.p2}pt`;
  }

  if (resultScreen) resultScreen.style.display = 'flex';
}

// リセットして再戦
function resetKarutaGame() {
  karutaScores = { p1: 0, p2: 0 };
  const resultScreen = document.getElementById('karuta-result-screen');
  if (resultScreen) resultScreen.style.display = 'none';
  startKarutaRound();
}

// スタートモーダルを閉じる
function closeKarutaStartScreen() {
  const startScreen = document.getElementById('karuta-start-screen');
  if (startScreen) startScreen.style.display = 'none';
  karutaScores = { p1: 0, p2: 0 };
  startKarutaRound();
}

// タブ初期化
function initKarutaTab() {
  const startScreen = document.getElementById('karuta-start-screen');
  if (!isKarutaRoundActive && karutaScores.p1 === 0 && karutaScores.p2 === 0) {
    if (startScreen) startScreen.style.display = 'flex';
  }
}

// 起動
(async function() {
  await loadCardDatabase();
  initGame();
  initFlowChart();
})();

