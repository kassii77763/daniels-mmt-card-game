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
    "imgId": "neck_cap_ext_g543",
    "slide": 35,
    "title": "頭部伸展 (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "後頭下筋群（大・小後頭直筋、上・下頭斜筋）・頭半棘筋",
    "nerve": "後頭下神経・大後頭神経",
    "root": "C1〜C3",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 後頭骨部前下方加圧（顎引き・上目づかい保持）",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、頭部をベッド端から出し後頭骨部への抵抗に抗して……",
    "shimo": "頭部を伸展（後頭下筋群）するのはどれ？",
    "image": "assets/mmt/neck_cap_ext_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 2,
    "imgId": "neck_cap_ext_g2",
    "slide": 31,
    "title": "頭部伸展 (G2/1)",
    "region": "頸部・体幹",
    "muscle": "後頭下筋群・頭半棘筋",
    "nerve": "後頭下神経・大後頭神経",
    "root": "C1〜C3",
    "grade": "G2",
    "pos": "腹臥位",
    "vector": "🔍 重力最小位で頭部後屈可動域 / 後頭下筋群触診",
    "kami": "腹臥位（頭部支持）で……",
    "naka": "グレード2、検者が頭部を支えた状態でわずかに後頭部を傾け……",
    "shimo": "頭部伸展の筋収縮を触診するのはどれ？",
    "image": "assets/mmt/neck_cap_ext_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 3,
    "imgId": "neck_cerv_ext_g543",
    "slide": 34,
    "title": "頸部伸展 (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "頸半棘筋・頸板状筋・頸最長筋・頸腸肋筋",
    "nerve": "頸神経後枝",
    "root": "C3〜C8",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 頭頂・後頭部加圧（胸椎伸展位で頭部を水平まで挙上）",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、頸部を伸展して頭部を水平まで持ち上げ……",
    "shimo": "頸部伸展（頸半棘筋・板状筋）に抗するのはどれ？",
    "image": "assets/mmt/neck_cerv_ext_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 4,
    "imgId": "neck_cerv_ext_g2",
    "slide": 35,
    "title": "頸部伸展 (G2/1)",
    "region": "頸部・体幹",
    "muscle": "頸半棘筋・頸板状筋",
    "nerve": "頸神経後枝",
    "root": "C3〜C8",
    "grade": "G2",
    "pos": "腹臥位",
    "vector": "🔍 頭部重量支持下での頸部後方傾斜 / 頸部傍脊柱筋触診",
    "kami": "腹臥位で頭部を支持され……",
    "naka": "グレード2、重力を除いた状態で頸部後方の筋肉を触診し……",
    "shimo": "頸部伸展筋の収縮を確認するのはどれ？",
    "image": "assets/mmt/neck_cerv_ext_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 5,
    "imgId": "neck_comb_ext_g543",
    "slide": 36,
    "title": "頭頸部複合伸展 (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "僧帽筋上部・板状筋群・頭半棘筋・頸半棘筋",
    "nerve": "副神経・頸神経後枝",
    "root": "C1〜C8",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 後頭部加圧（頭部と頸部の一括完全伸展）",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、頭部と頸部を一括して最大伸展位まで反らし……",
    "shimo": "頭頸部を複合伸展するのはどれ？",
    "image": "assets/mmt/neck_comb_ext_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 6,
    "imgId": "neck_comb_ext_g2",
    "slide": 37,
    "title": "頭頸部複合伸展 (G2/1)",
    "region": "頸部・体幹",
    "muscle": "僧帽筋上部・板状筋群",
    "nerve": "副神経・頸神経後枝",
    "root": "C1〜C8",
    "grade": "G2",
    "pos": "腹臥位",
    "vector": "🔍 検者両手での頭部支持 / 頸背移行部筋群触診",
    "kami": "腹臥位（頭部両手支持）で……",
    "naka": "グレード2、頸部背側の僧帽筋上部や板状筋の収縮を触知して……",
    "shimo": "頭頸部複合伸展の触診を行うのはどれ？",
    "image": "assets/mmt/neck_comb_ext_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 7,
    "imgId": "neck_cap_flex_g543",
    "slide": 39,
    "title": "頭部屈曲［チンタック］ (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "頭長筋・前頭直筋・外側頭直筋",
    "nerve": "頸神経前枝",
    "root": "C1〜C3",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↑ 下顎後上方押し戻し抵抗（頸部を浮かせず顎を引く）",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード4〜5、頭をベッドにつけたまま顎を引き下顎への抵抗に耐えて……",
    "shimo": "頭部屈曲［チンタック］を行うのはどれ？",
    "image": "assets/mmt/neck_cap_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 8,
    "imgId": "neck_cap_flex_g2",
    "slide": 40,
    "title": "頭部屈曲［チンタック］ (G2/1)",
    "region": "頸部・体幹",
    "muscle": "頭長筋・前頭直筋",
    "nerve": "頸神経前枝",
    "root": "C1〜C3",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "🔍 顎引き部分可動域 / 深頸屈筋群の収縮確認",
    "kami": "背臥位で頭部を動かさず……",
    "naka": "グレード2、わずかに顎を引く運動または深部の収縮を確認して……",
    "shimo": "頭部屈曲の微小可動域を判定するのはどれ？",
    "image": "assets/mmt/neck_cap_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 9,
    "imgId": "neck_cerv_flex_g543",
    "slide": 43,
    "title": "頸部屈曲 (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "頸長筋・斜角筋群（前・中・後斜角筋）",
    "nerve": "頸神経前枝",
    "root": "C2〜C7",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 胸骨上部固定・前頭部垂直加圧（顎を突き出さず首を持ち上げる）",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード4〜5、顎を突き出さずに首をまっすぐ持ち上げ……",
    "shimo": "頸部単独屈曲（頸長筋・斜角筋）を行うのはどれ？",
    "image": "assets/mmt/neck_cerv_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 10,
    "imgId": "neck_cerv_flex_g2",
    "slide": 44,
    "title": "頸部屈曲 (G2/1)",
    "region": "頸部・体幹",
    "muscle": "頸長筋・斜角筋群",
    "nerve": "頸神経前枝",
    "root": "C2〜C7",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "🔍 前頸部・胸鎖乳突筋深層の触診",
    "kami": "背臥位で頭部を支えられ……",
    "naka": "グレード2、首を持ち上げようとする際の深層筋収縮を触知して……",
    "shimo": "頸部屈曲筋群の収縮を触診するのはどれ？",
    "image": "assets/mmt/neck_cerv_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 11,
    "imgId": "neck_flex_g543",
    "slide": 45,
    "title": "頭頸部複合屈曲 (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "胸鎖乳突筋（両側）・前斜角筋・頭長筋",
    "nerve": "副神経・頸神経叢",
    "root": "C2〜C3",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 前頭部下向き加圧（ブレイクテスト）",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード4〜5、頭部を持ち上げ前頭部への強い下向き抵抗に耐えて……",
    "shimo": "頭頸部を複合屈曲（胸鎖乳突筋両側）するのはどれ？",
    "image": "assets/mmt/neck_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 12,
    "imgId": "neck_flex_g2",
    "slide": 46,
    "title": "頭頸部複合屈曲 (G2/1)",
    "region": "頸部・体幹",
    "muscle": "胸鎖乳突筋（両側）",
    "nerve": "副神経・頸神経叢",
    "root": "C2〜C3",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "➔ 頭部を左右へ水平回旋させ胸鎖乳突筋を触診",
    "kami": "背臥位（頭部ベッド上支持）で……",
    "naka": "グレード2、頭部を持ち上げられないため左右に回旋させて……",
    "shimo": "胸鎖乳突筋の収縮を触診するのはどれ？",
    "image": "assets/mmt/neck_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 13,
    "imgId": "neck_scm_iso_g543",
    "slide": 47,
    "title": "胸鎖乳突筋 片側分離テスト (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "片側胸鎖乳突筋",
    "nerve": "副神経・頸神経叢",
    "root": "C2〜C3",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 側頭部加圧（顔を反対側へ向けたまま頭部側屈挙上）",
    "kami": "背臥位で顔を左に向け……",
    "naka": "グレード4〜5、頭部をベッドから持ち上げ側頭部への抵抗に抗して……",
    "shimo": "右胸鎖乳突筋を単独テストするのはどれ？",
    "image": "assets/mmt/neck_scm_iso_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 14,
    "imgId": "neck_scm_iso_g2",
    "slide": 47,
    "title": "胸鎖乳突筋 片側分離テスト (G2/1)",
    "region": "頸部・体幹",
    "muscle": "片側胸鎖乳突筋",
    "nerve": "副神経・頸神経叢",
    "root": "C2〜C3",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "🔍 対側回旋位での胸鎖乳突筋腹触診",
    "kami": "背臥位で顔を横に向け……",
    "naka": "グレード2、頭部挙上は不能だが前頸部で筋腹が浮き上がるのを触知して……",
    "shimo": "片側胸鎖乳突筋を触診するのはどれ？",
    "image": "assets/mmt/neck_scm_iso_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 15,
    "imgId": "neck_rot_g543",
    "slide": 49,
    "title": "頸部回旋 (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "胸鎖乳突筋（対側）・頭板状筋（同側）・頸板状筋",
    "nerve": "副神経・頸神経後枝",
    "root": "C2〜C4",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "⤹ 下顎・側頭部への回旋阻止抵抗",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード4〜5、顔を横へ回旋させ下顎への押し戻し抵抗に抗して……",
    "shimo": "頸部回旋を行うのはどれ？",
    "image": "assets/mmt/neck_rot_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 16,
    "imgId": "neck_rot_g2",
    "slide": 50,
    "title": "頸部回旋 (G2/1)",
    "region": "頸部・体幹",
    "muscle": "胸鎖乳突筋・頭板状筋",
    "nerve": "副神経・頸神経後枝",
    "root": "C2〜C4",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 重力除去面（座位）での左右首振り回旋",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード2、重力の影響が少ない座位で首を左右に回旋させて……",
    "shimo": "重力を除いて頸部回旋を行うのはどれ？",
    "image": "assets/mmt/neck_rot_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 17,
    "imgId": "trunk_ext_lumbar_g54",
    "slide": 53,
    "title": "体幹伸展：腰椎 (G5/4)",
    "region": "頸部・体幹",
    "muscle": "腸肋筋（腰）・最長筋（胸腰部）・多裂筋",
    "nerve": "脊髄神経後枝",
    "root": "Th1〜L5",
    "grade": "G5/4",
    "pos": "腹臥位",
    "vector": "↑ 後頭部手組み・臍離床（自重抵抗）",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、両手を後頭部で組み臍が浮くまで体幹を持ち上げて……",
    "shimo": "腰椎部を力強く伸展するのはどれ？",
    "image": "assets/mmt/trunk_ext_lumbar_g54.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 18,
    "imgId": "trunk_ext_lumbar_g3",
    "slide": 53,
    "title": "体幹伸展：腰椎 (G3)",
    "region": "頸部・体幹",
    "muscle": "腸肋筋・最長筋・多裂筋",
    "nerve": "脊髄神経後枝",
    "root": "Th1〜L5",
    "grade": "G3",
    "pos": "腹臥位",
    "vector": "↑ 上肢体側・胸郭離床（自力完動）",
    "kami": "腹臥位で腕を体側に置き……",
    "naka": "グレード3、後頭部手組みは不能だが体幹をベッドから浮かせて……",
    "shimo": "自力で腰椎伸展を完遂するのはどれ？",
    "image": "assets/mmt/trunk_ext_lumbar_g3.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 19,
    "imgId": "trunk_ext_lumbar_g2",
    "slide": 54,
    "title": "体幹伸展：腰椎 (G2/1)",
    "region": "頸部・体幹",
    "muscle": "腸肋筋・最長筋・多裂筋",
    "nerve": "脊髄神経後枝",
    "root": "Th1〜L5",
    "grade": "G2",
    "pos": "腹臥位",
    "vector": "🔍 骨盤固定下での胸郭微小挙上 / 腰部傍脊柱筋触診",
    "kami": "腹臥位（骨盤固定）で……",
    "naka": "グレード2、離床はできないが腰部脊柱起立筋の緊張を触知して……",
    "shimo": "腰椎伸展筋の収縮を触診するのはどれ？",
    "image": "assets/mmt/trunk_ext_lumbar_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 20,
    "imgId": "trunk_ext_thoracic_g54",
    "slide": 55,
    "title": "体幹伸展：胸椎 (G5/4)",
    "region": "頸部・体幹",
    "muscle": "胸最長筋・胸棘筋・半棘筋",
    "nerve": "脊髄神経後枝",
    "root": "Th1〜Th12",
    "grade": "G5/4",
    "pos": "腹臥位",
    "vector": "↑ ベッド端から胸郭を乗り出し水平位保持（後頭部手組み）",
    "kami": "腹臥位でベッド端から上体を出し……",
    "naka": "グレード4〜5、乳頭レベルまで体幹を出し水平位まで持ち上げて……",
    "shimo": "胸椎伸展筋（胸最長筋・棘筋）をテストするのはどれ？",
    "image": "assets/mmt/trunk_ext_thoracic_g54.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 21,
    "imgId": "trunk_ext_thoracic_g3",
    "slide": 55,
    "title": "体幹伸展：胸椎 (G3)",
    "region": "頸部・体幹",
    "muscle": "胸最長筋・胸棘筋",
    "nerve": "脊髄神経後枝",
    "root": "Th1〜Th12",
    "grade": "G3",
    "pos": "腹臥位",
    "vector": "↑ ベッド端から上体乗り出し・腕体側での水平保持",
    "kami": "腹臥位で上体をベッド端から出し……",
    "naka": "グレード3、腕を体側に伸ばした状態で水平位まで体幹を持ち上げて……",
    "shimo": "自力で胸椎伸展を保持するのはどれ？",
    "image": "assets/mmt/trunk_ext_thoracic_g3.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 22,
    "imgId": "pelvis_elev_g54",
    "slide": 57,
    "title": "骨盤挙上［ハイキング］ (G5/4)",
    "region": "頸部・体幹",
    "muscle": "腰方形筋・広背筋・腹斜筋群",
    "nerve": "腰神経叢・肋間神経",
    "root": "Th12〜L4",
    "grade": "G5/4",
    "pos": "背臥位",
    "vector": "↓ 足関節牽引抵抗に抗して骨盤を胸郭へ引き上げる",
    "kami": "背臥位（または立位）で……",
    "naka": "グレード4〜5、検者の強力な足牽引に抗して骨盤を引き上げて……",
    "shimo": "骨盤を挙上（腰方形筋）するのはどれ？",
    "image": "assets/mmt/pelvis_elev_g54.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 23,
    "imgId": "pelvis_elev_g2",
    "slide": 58,
    "title": "骨盤挙上［ハイキング］ (G2/1)",
    "region": "頸部・体幹",
    "muscle": "腰方形筋",
    "nerve": "腰神経叢",
    "root": "Th12〜L4",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "➔ 下肢摩擦を軽減した状態での骨盤引き上げ / 腰部側腹触診",
    "kami": "背臥位で下肢を支えられ……",
    "naka": "グレード2、ベッド面上で骨盤を胸郭に向かってわずかに滑らせて……",
    "shimo": "腰方形筋の収縮を触診するのはどれ？",
    "image": "assets/mmt/pelvis_elev_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 24,
    "imgId": "trunk_flex_g5",
    "slide": 60,
    "title": "体幹屈曲 (G5)",
    "region": "頸部・体幹",
    "muscle": "腹直筋",
    "nerve": "肋間神経",
    "root": "Th7〜Th12",
    "grade": "G5",
    "pos": "背臥位",
    "vector": "↑ 両手後頭部組み・肩甲骨下角離床（最大自重抵抗）",
    "kami": "背臥位で手を頭の後ろに組み……",
    "naka": "グレード5、両肘を開いたまま肩甲骨下角が完全に浮くまで起き上がって……",
    "shimo": "腹直筋（Grade 5）を判定するのはどれ？",
    "image": "assets/mmt/trunk_flex_g5.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 25,
    "imgId": "trunk_flex_g4",
    "slide": 61,
    "title": "体幹屈曲 (G4)",
    "region": "頸部・体幹",
    "muscle": "腹直筋",
    "nerve": "肋間神経",
    "root": "Th7〜Th12",
    "grade": "G4",
    "pos": "背臥位",
    "vector": "↑ 胸前腕交差・肩甲骨下角離床",
    "kami": "背臥位で腕を胸の前で交差させ……",
    "naka": "グレード4、肩甲骨下角がベッドから完全に離れるまで丸めて……",
    "shimo": "腹直筋（Grade 4）を判定するのはどれ？",
    "image": "assets/mmt/trunk_flex_g4.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 26,
    "imgId": "trunk_flex_g3",
    "slide": 61,
    "title": "体幹屈曲 (G3)",
    "region": "頸部・体幹",
    "muscle": "腹直筋",
    "nerve": "肋間神経",
    "root": "Th7〜Th12",
    "grade": "G3",
    "pos": "背臥位",
    "vector": "↑ 両上肢前方伸展・肩甲骨下角離床",
    "kami": "背臥位で腕を前方に伸ばし……",
    "naka": "グレード3、腕を前に伸ばした状態で肩甲骨下角が浮くまでカールして……",
    "shimo": "腹直筋（Grade 3）を判定するのはどれ？",
    "image": "assets/mmt/trunk_flex_g3.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 27,
    "imgId": "trunk_flex_g2",
    "slide": 62,
    "title": "体幹屈曲 (G2)",
    "region": "頸部・体幹",
    "muscle": "腹直筋",
    "nerve": "肋間神経",
    "root": "Th7〜Th12",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "↑ 頭部のみ挙上（肩甲骨離床不可） / 胸郭下制",
    "kami": "背臥位で膝を立て……",
    "naka": "グレード2、肩甲骨下角は浮かないが頭部を浮かせ腹壁が硬くなるのを……",
    "shimo": "体幹屈曲（Grade 2）として確認するのはどれ？",
    "image": "assets/mmt/trunk_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 28,
    "imgId": "trunk_flex_g1",
    "slide": 63,
    "title": "体幹屈曲 (G1/0)",
    "region": "頸部・体幹",
    "muscle": "腹直筋",
    "nerve": "肋間神経",
    "root": "Th7〜Th12",
    "grade": "G1",
    "pos": "背臥位",
    "vector": "🔍 咳テスト（Cough）/ 白線両側触診",
    "kami": "背臥位で咳（せき）をしてもらい……",
    "naka": "グレード1、頭部挙上は不能だが咳嗽時に腹直筋腱画の緊張を触知して……",
    "shimo": "腹直筋の微小収縮を触診するのはどれ？",
    "image": "assets/mmt/trunk_flex_g1.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 29,
    "imgId": "trunk_rot_g5",
    "slide": 65,
    "title": "体幹回旋 (G5)",
    "region": "頸部・体幹",
    "muscle": "外腹斜筋（対側）・内腹斜筋（同側）",
    "nerve": "肋間神経・腸骨下腹神経",
    "root": "Th7〜L1",
    "grade": "G5",
    "pos": "背臥位",
    "vector": "⤹ 両手後頭部組み・対側膝へ向かって肩甲骨離床回旋",
    "kami": "背臥位で手を頭の後ろに組み……",
    "naka": "グレード5、右肘を左膝へ向けて対側肩甲骨が完全に浮くまで起き上がって……",
    "shimo": "体幹回旋（腹斜筋群 Grade 5）を行うのはどれ？",
    "image": "assets/mmt/trunk_rot_g5.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 30,
    "imgId": "trunk_rot_g4",
    "slide": 66,
    "title": "体幹回旋 (G4)",
    "region": "頸部・体幹",
    "muscle": "外腹斜筋・内腹斜筋",
    "nerve": "肋間神経・腸骨下腹神経",
    "root": "Th7〜L1",
    "grade": "G4",
    "pos": "背臥位",
    "vector": "⤹ 胸前腕交差・対側膝へ向かって回旋屈曲",
    "kami": "背臥位で胸の前で腕を組み……",
    "naka": "グレード4、肩甲骨下角が浮き上がるまで体幹を斜め上方へ持ち上げて……",
    "shimo": "体幹回旋（腹斜筋群 Grade 4）を行うのはどれ？",
    "image": "assets/mmt/trunk_rot_g4.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 31,
    "imgId": "trunk_rot_g3",
    "slide": 66,
    "title": "体幹回旋 (G3)",
    "region": "頸部・体幹",
    "muscle": "外腹斜筋・内腹斜筋",
    "nerve": "肋間神経・腸骨下腹神経",
    "root": "Th7〜L1",
    "grade": "G3",
    "pos": "背臥位",
    "vector": "⤹ 上肢前方伸展・対側膝方向への回旋挙上",
    "kami": "背臥位で腕を斜め前方に伸ばし……",
    "naka": "グレード3、腕を前に伸ばして肩甲骨がベッドから離れるまで回旋させて……",
    "shimo": "自重で体幹回旋を完遂するのはどれ？",
    "image": "assets/mmt/trunk_rot_g3.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 32,
    "imgId": "trunk_rot_g2",
    "slide": 68,
    "title": "体幹回旋 (G2/1)",
    "region": "頸部・体幹",
    "muscle": "外腹斜筋・内腹斜筋",
    "nerve": "肋間神経・腸骨下腹神経",
    "root": "Th7〜L1",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "🔍 頭部のみ斜め回旋挙上 / 側腹部腹斜筋触診",
    "kami": "背臥位で首を斜めに向け……",
    "naka": "グレード2、肩甲骨は浮かないが側腹部の腹斜筋が収縮するのを触知して……",
    "shimo": "腹斜筋群の収縮を触診するのはどれ？",
    "image": "assets/mmt/trunk_rot_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 33,
    "imgId": "core_plank_g5",
    "slide": 68,
    "title": "プローンプランクテスト (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "体幹コア筋群（腹横筋・多裂筋・大殿筋・前鋸筋）",
    "nerve": "体幹運動神経複合",
    "root": "Th〜L",
    "grade": "G5",
    "pos": "腹臥位",
    "vector": "⏱️ 前腕・足趾支持プランク（G5:120秒 / G4:90秒 / G3:肢位形成のみ）",
    "kami": "前腕とつま先で床を押し……",
    "naka": "グレード5、第10版コアテストで一直線の姿勢を120秒間完全に保持して……",
    "shimo": "プローンプランクテストを行うのはどれ？",
    "image": "assets/mmt/core_plank_g5.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 34,
    "imgId": "resp_diaphragm_g543",
    "slide": 70,
    "title": "安静吸気：横隔膜 (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "横隔膜・外肋間筋",
    "nerve": "膈神経",
    "root": "C3〜C5",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 心窩部加圧（最大吸気時の腹壁挙上抵抗）",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード4〜5、息を吸い込んだ際に心窩部（みぞおち）への下向き加圧に抗して……",
    "shimo": "横隔膜の吸気筋力をテストするのはどれ？",
    "image": "assets/mmt/resp_diaphragm_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 35,
    "imgId": "resp_diaphragm_g2",
    "slide": 71,
    "title": "安静吸気：横隔膜 (G2/1)",
    "region": "頸部・体幹",
    "muscle": "横隔膜",
    "nerve": "膈神経",
    "root": "C3〜C5",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "🔍 心窩部の微弱な腹壁膨隆触診",
    "kami": "背臥位で静かに息を吸い……",
    "naka": "グレード2、抵抗には耐えられないが心窩部がわずかに膨らむのを触知して……",
    "shimo": "横隔膜の微小収縮を判定するのはどれ？",
    "image": "assets/mmt/resp_diaphragm_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 36,
    "imgId": "resp_expiration_g543",
    "slide": 72,
    "title": "強制呼気 (G5/4/3)",
    "region": "頸部・体幹",
    "muscle": "内肋間筋・腹直筋・外腹斜筋・内腹斜筋・腹横筋",
    "nerve": "肋間神経・腰神経叢",
    "root": "Th7〜L1",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "💨 強力な咳嗽（せき）による呼気圧 / 腹壁急激収縮",
    "kami": "背臥位（または座位）で……",
    "naka": "グレード4〜5、力強い咳嗽を行い腹壁が瞬間的に硬く収縮するのを確認して……",
    "shimo": "強制呼気筋力を判定するのはどれ？",
    "image": "assets/mmt/resp_expiration_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 37,
    "imgId": "scap_abd_g543",
    "slide": 81,
    "title": "肩甲骨外転と上方回旋 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "前鋸筋",
    "nerve": "長胸神経",
    "root": "C5〜C7",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 肩130°屈曲位から前方突き出し抵抗（前腕遠位加圧）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、腕を130°前方へ突き出し手首への押し戻し抵抗に抗して……",
    "shimo": "肩甲骨を外転・上方回旋（前鋸筋）するのはどれ？",
    "image": "assets/mmt/scap_abd_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 38,
    "imgId": "scap_abd_g2",
    "slide": 82,
    "title": "肩甲骨外転と上方回旋 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "前鋸筋",
    "nerve": "長胸神経",
    "root": "C5〜C7",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 肩90°屈曲支持位での前方突き出し / 腋窩前鋸筋触診",
    "kami": "端座位で腕を支えられ……",
    "naka": "グレード2、肩90°屈曲位からわずかに前方へ腕を突き出して……",
    "shimo": "前鋸筋の筋収縮を触診するのはどれ？",
    "image": "assets/mmt/scap_abd_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 39,
    "imgId": "scap_elev_g543",
    "slide": 85,
    "title": "肩甲骨挙上 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "僧帽筋上部線維・肩甲挙筋",
    "nerve": "副神経・頸神経叢",
    "root": "C3〜C5",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 両側肩峰下向き加圧（肩すくめ抵抗）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、両肩を耳に近づけるようにすくめ下向きの強い加圧に耐えて……",
    "shimo": "肩甲骨を挙上（僧帽筋上部）するのはどれ？",
    "image": "assets/mmt/scap_elev_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 40,
    "imgId": "scap_elev_g2",
    "slide": 86,
    "title": "肩甲骨挙上 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "僧帽筋上部線維・肩甲挙筋",
    "nerve": "副神経・頸神経叢",
    "root": "C3〜C5",
    "grade": "G2",
    "pos": "腹臥位",
    "vector": "➔ 腹臥位または背臥位での肩すくめ運動 / 頸肩部触診",
    "kami": "腹臥位（または背臥位）で……",
    "naka": "グレード2、重力を除いた水平面上で肩を耳へ向けて滑らせて……",
    "shimo": "重力を除いて肩甲骨を挙上するのはどれ？",
    "image": "assets/mmt/scap_elev_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 41,
    "imgId": "scap_add_g543",
    "slide": 89,
    "title": "肩甲骨内転 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "僧帽筋中部線維・大菱形筋",
    "nerve": "副神経・頸神経",
    "root": "C3〜C4",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 肩90°外転位での肘水平挙上・肩外側部下向き加圧",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、肩を90°真横に開き肘を持ち上げ肩甲骨を背骨に寄せて……",
    "shimo": "肩甲骨を内転（僧帽筋中部）するのはどれ？",
    "image": "assets/mmt/scap_add_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 42,
    "imgId": "scap_add_g2",
    "slide": 89,
    "title": "肩甲骨内転 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "僧帽筋中部線維",
    "nerve": "副神経・頸神経",
    "root": "C3〜C4",
    "grade": "G2",
    "pos": "腹臥位",
    "vector": "🔍 上肢重量支持下での内転運動 / 肩甲棘内側触診",
    "kami": "腹臥位で腕の重さを支えられ……",
    "naka": "グレード2、肩甲骨の内側縁を脊柱に向かってわずかに引き寄せて……",
    "shimo": "僧帽筋中部線維の収縮を触診するのはどれ？",
    "image": "assets/mmt/scap_add_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 43,
    "imgId": "scap_dep_g543",
    "slide": 92,
    "title": "肩甲骨下制と内転 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "僧帽筋下部線維",
    "nerve": "副神経・頸神経",
    "root": "C3〜C4",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 肩145°挙上（耳の延長）位から前腕遠位下向き加圧（第10版準拠）",
    "kami": "腹臥位で腕を耳の斜め上に伸ばし……",
    "naka": "グレード4〜5、親指を天井に向け腕を持ち上げ前腕への下向き抵抗に抗して……",
    "shimo": "肩甲骨を下制・内転（僧帽筋下部）するのはどれ？",
    "image": "assets/mmt/scap_dep_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 44,
    "imgId": "scap_dep_g2",
    "slide": 93,
    "title": "肩甲骨下制と内転 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "僧帽筋下部線維",
    "nerve": "副神経・頸神経",
    "root": "C3〜C4",
    "grade": "G2",
    "pos": "腹臥位",
    "vector": "🔍 斜め上方への上肢支持 / 肩甲骨三角部下部触診",
    "kami": "腹臥位で斜め上に腕を支えられ……",
    "naka": "グレード2、腕は自力で持ち上がらないが肩甲骨下角の内下方の収縮を触知して……",
    "shimo": "僧帽筋下部の筋収縮を触診するのはどれ？",
    "image": "assets/mmt/scap_dep_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 45,
    "imgId": "scap_rhomb_g543",
    "slide": 96,
    "title": "肩甲骨内転と下方回旋 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "大菱形筋・小菱形筋",
    "nerve": "肩甲背神経",
    "root": "C4〜C5",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 手背を腰部に当て肘後方挙上・上腕遠位下方加圧",
    "kami": "腹臥位で手背を腰に当て……",
    "naka": "グレード4〜5、肘を天井に向かって持ち上げ前腕への押し戻しに耐えて……",
    "shimo": "肩甲骨を内転・下方回旋（菱形筋群）するのはどれ？",
    "image": "assets/mmt/scap_rhomb_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 46,
    "imgId": "scap_rhomb_g2",
    "slide": 97,
    "title": "肩甲骨内転と下方回旋 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "大菱形筋・小菱形筋",
    "nerve": "肩甲背神経",
    "root": "C4〜C5",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 手背腰部配置での肩甲骨内側縁・脊柱間触診",
    "kami": "端座位で手背を腰に回し……",
    "naka": "グレード2、肩甲骨の内側縁深層にある菱形筋の収縮を触知して……",
    "shimo": "菱形筋群の収縮を触診するのはどれ？",
    "image": "assets/mmt/scap_rhomb_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 47,
    "imgId": "scap_dep_lat_g543",
    "slide": 92,
    "title": "肩甲骨下制［広背筋・下部僧帽筋］ (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "広背筋・下部僧帽筋・小胸筋",
    "nerve": "胸背神経・副神経・内側胸筋神経",
    "root": "C6〜C8",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↑ 上肢体側から足部方向へ腕を押し下げ・上腕骨長軸牽引抵抗",
    "kami": "腹臥位で腕を足のほうへ伸ばし……",
    "naka": "グレード4〜5、肩甲骨を骨盤に向かって力強く引き下げ頭方向への牽引に抗して……",
    "shimo": "肩甲骨を下制（広背筋・下部僧帽筋）するのはどれ？",
    "image": "assets/mmt/scap_dep_lat_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 48,
    "imgId": "scap_pushup_g543",
    "slide": 101,
    "title": "肩甲骨下制［プッシュアップ別法］ (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "広背筋・下部僧帽筋・小胸筋",
    "nerve": "胸背神経・副神経",
    "root": "C6〜C8",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↑ 手掌で座面を押して殿部・大腿部を完全に浮き上がらせる",
    "kami": "端座位で両手を座面に置き……",
    "naka": "グレード4〜5、手のひらで座面を力強く押し下げ殿部をベッドから持ち上げて……",
    "shimo": "プッシュアップで肩甲骨を下制するのはどれ？",
    "image": "assets/mmt/scap_pushup_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 49,
    "imgId": "sh_flex_g543",
    "slide": 102,
    "title": "肩関節屈曲 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "三角筋前部・烏口腕筋・大胸筋鎖骨部",
    "nerve": "腋窩神経・筋皮神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 肩90°屈曲位保持・上腕遠位下向き加圧（ブレイクテスト）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、腕を前方に90°持ち上げ肘の上への強い下向き抵抗に耐えて……",
    "shimo": "肩関節を屈曲（三角筋前部）するのはどれ？",
    "image": "assets/mmt/sh_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 50,
    "imgId": "sh_flex_g2",
    "slide": 102,
    "title": "肩関節屈曲 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "三角筋前部・烏口腕筋",
    "nerve": "腋窩神経・筋皮神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位（第10版標準）での水平面前方屈曲スライド",
    "kami": "側臥位（第10版標準肢位）で……",
    "naka": "グレード2、検者に腕を支えられた水平面上で腕を前方に滑らせて……",
    "shimo": "重力を除いて肩関節を屈曲するのはどれ？",
    "image": "assets/mmt/sh_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 51,
    "imgId": "sh_ext_g543",
    "slide": 105,
    "title": "肩関節伸展 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "広背筋・大円筋・三角筋後部",
    "nerve": "胸背神経・肩甲下神経・腋窩神経",
    "root": "C5〜C8",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 腕を後上方へ伸展挙上・上腕遠位下方加圧",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、腕を天井に向けて後方に持ち上げ肘上への押し戻し抵抗に抗して……",
    "shimo": "肩関節を伸展（広背筋・大円筋）するのはどれ？",
    "image": "assets/mmt/sh_ext_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 52,
    "imgId": "sh_ext_g2",
    "slide": 105,
    "title": "肩関節伸展 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "広背筋・大円筋・三角筋後部",
    "nerve": "胸背神経・肩甲下神経・腋窩神経",
    "root": "C5〜C8",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位での水平面後方伸展スライド",
    "kami": "側臥位で腕の重さを支えられ……",
    "naka": "グレード2、水平面上で腕を後方に向かって滑らせて……",
    "shimo": "重力を除いて肩関節を伸展するのはどれ？",
    "image": "assets/mmt/sh_ext_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 53,
    "imgId": "sh_abd_g543",
    "slide": 110,
    "title": "肩関節外転 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "三角筋中部・棘上筋",
    "nerve": "腋窩神経・肩甲上神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 肩90°外転位保持・上腕遠位下向き加圧（ブレイクテスト）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、腕を真横に90°外転させ肘の上への強い下向き抵抗に耐えて……",
    "shimo": "肩関節を外転（三角筋中部）するのはどれ？",
    "image": "assets/mmt/sh_abd_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 54,
    "imgId": "sh_abd_g2",
    "slide": 111,
    "title": "肩関節外転 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "三角筋中部・棘上筋",
    "nerve": "腋窩神経・肩甲上神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "➔ 背臥位ベッド面上での水平外転スライド",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード2、ベッドの面を滑らせて腕を真横に外転させて……",
    "shimo": "重力を除いて肩関節を外転するのはどれ？",
    "image": "assets/mmt/sh_abd_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 55,
    "imgId": "sh_habd_g543",
    "slide": 114,
    "title": "肩関節水平外転 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "三角筋後部",
    "nerve": "腋窩神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 肩90°外転位から前腕垂直下垂・上腕後上方挙上抵抗",
    "kami": "腹臥位で腕をベッド端から下垂し……",
    "naka": "グレード4〜5、肘を曲げたまま上腕を天井へ引き上げ下向き抵抗に耐えて……",
    "shimo": "肩関節を水平外転（三角筋後部）するのはどれ？",
    "image": "assets/mmt/sh_habd_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 56,
    "imgId": "sh_habd_g2",
    "slide": 115,
    "title": "肩関節水平外転 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "三角筋後部",
    "nerve": "腋窩神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 端座位テーブル面上での水平外転スライド",
    "kami": "端座位で机の上に腕を乗せ……",
    "naka": "グレード2、テーブル面を水平に後方へ滑らせて……",
    "shimo": "重力を除いて肩関節を水平外転するのはどれ？",
    "image": "assets/mmt/sh_habd_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 57,
    "imgId": "sh_hadd_clav_g543",
    "slide": 119,
    "title": "肩関節水平内転：鎖骨部 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "大胸筋鎖骨部",
    "nerve": "外側胸筋神経",
    "root": "C5〜C7",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "⤹ 肩60°外転位から対側肩へ斜め上方内転・前腕遠位加圧",
    "kami": "背臥位で腕を斜め下から……",
    "naka": "グレード4〜5、対側の肩に向かって斜め上に腕を水平内転させて……",
    "shimo": "大胸筋鎖骨部を分離テストするのはどれ？",
    "image": "assets/mmt/sh_hadd_clav_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 58,
    "imgId": "sh_hadd_stern_g543",
    "slide": 119,
    "title": "肩関節水平内転：胸肋部 (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "大胸筋胸肋部",
    "nerve": "内側・外側胸筋神経",
    "root": "C7〜Th1",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "⤹ 肩120°外転位から対側骨盤へ斜め下方内転・前腕遠位加圧",
    "kami": "背臥位で腕をバンザイ気味から……",
    "naka": "グレード4〜5、対側の骨盤（ポケット）へ向かって斜め下に力強く引き下ろして……",
    "shimo": "大胸筋胸肋部を分離テストするのはどれ？",
    "image": "assets/mmt/sh_hadd_stern_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 59,
    "imgId": "sh_hadd_g2",
    "slide": 120,
    "title": "肩関節水平内転 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "大胸筋（全体）",
    "nerve": "外側・内側胸筋神経",
    "root": "C5〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 端座位テーブル面上での水平内転スライド",
    "kami": "端座位で机の上に腕を預け……",
    "naka": "グレード2、机の面を滑らせて胸の前へ腕を抱き寄せて……",
    "shimo": "重力を除いて大胸筋をテストするのはどれ？",
    "image": "assets/mmt/sh_hadd_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 60,
    "imgId": "sh_er_seat_g543",
    "slide": 122,
    "title": "肩関節外旋［第10版標準：端座位］ (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "棘下筋・小円筋",
    "nerve": "肩甲上神経・腋窩神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "➔ 端座位・肘90°屈曲位から前腕外方回旋抵抗（第10版完全準拠）",
    "kami": "端座位（第10版標準肢位）で……",
    "naka": "グレード4〜5、肘を体側につけたまま前腕を外側へ開き内向き抵抗に耐えて……",
    "shimo": "肩関節を外旋（棘下筋・小円筋）するのはどれ？",
    "image": "assets/mmt/sh_er_seat_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 61,
    "imgId": "sh_er_prone_g543",
    "slide": 123,
    "title": "肩関節外旋［別法：腹臥位］ (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "棘下筋・小円筋",
    "nerve": "肩甲上神経・腋窩神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↑ 肩90°外転位・前腕下垂から前腕水平後上方挙上抵抗",
    "kami": "腹臥位（別法）で腕を垂らし……",
    "naka": "グレード4〜5、肩を90°横に出し前腕を天井へ向けて跳ね上げて……",
    "shimo": "腹臥位別法で肩関節を外旋するのはどれ？",
    "image": "assets/mmt/sh_er_prone_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 62,
    "imgId": "sh_er_g2",
    "slide": 123,
    "title": "肩関節外旋 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "棘下筋・小円筋",
    "nerve": "肩甲上神経・腋窩神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 端座位テーブル面上での前腕外旋スライド / 棘下窩触診",
    "kami": "端座位で机の上に前腕を乗せ……",
    "naka": "グレード2、机の上で前腕を外側へ滑らせて肩甲棘の下を触知して……",
    "shimo": "重力を除いて肩関節外旋を行うのはどれ？",
    "image": "assets/mmt/sh_er_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 63,
    "imgId": "sh_ir_seat_g543",
    "slide": 126,
    "title": "肩関節内旋［第10版標準：端座位］ (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "肩甲下筋・大胸筋・広背筋・大円筋",
    "nerve": "肩甲下神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "➔ 端座位・肘90°屈曲位から前腕内方回旋抵抗（第10版完全準拠）",
    "kami": "端座位（第10版標準肢位）で……",
    "naka": "グレード4〜5、肘を体側に固定し前腕をお腹へ向けて引き寄せ外向き抵抗に耐えて……",
    "shimo": "肩関節を内旋（肩甲下筋）するのはどれ？",
    "image": "assets/mmt/sh_ir_seat_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 64,
    "imgId": "sh_ir_prone_g543",
    "slide": 127,
    "title": "肩関節内旋［別法：腹臥位］ (G5/4/3)",
    "region": "肩甲帯・肩",
    "muscle": "肩甲下筋",
    "nerve": "肩甲下神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↑ 肩90°外転位・前腕下垂から前腕後方挙上抵抗",
    "kami": "腹臥位（別法）で腕をベッドから垂らし……",
    "naka": "グレード4〜5、前腕を後方へ跳ね上げ手首への下向き抵抗に耐えて……",
    "shimo": "腹臥位別法で肩関節を内旋するのはどれ？",
    "image": "assets/mmt/sh_ir_prone_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 65,
    "imgId": "sh_ir_g2",
    "slide": 127,
    "title": "肩関節内旋 (G2/1)",
    "region": "肩甲帯・肩",
    "muscle": "肩甲下筋",
    "nerve": "肩甲下神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 端座位テーブル面上での前腕内旋スライド / 腋窩深部触診",
    "kami": "端座位で机の上に前腕を置き……",
    "naka": "グレード2、机の面をお腹に向かって前腕を滑らせて……",
    "shimo": "重力を除いて肩関節内旋を行うのはどれ？",
    "image": "assets/mmt/sh_ir_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 66,
    "imgId": "elbow_flex_biceps_g543",
    "slide": 134,
    "title": "肘関節屈曲：上腕二頭筋 (G5/4/3)",
    "region": "肘・前腕・手関節",
    "muscle": "上腕二頭筋（長頭・短頭）",
    "nerve": "筋皮神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕完全回外位での肘屈曲・前腕遠位伸展加圧",
    "kami": "端座位で手のひらを上に向け……",
    "naka": "グレード4〜5、前腕を完全回外して肘を曲げ手首への強力な引き下げに耐えて……",
    "shimo": "上腕二頭筋を単独テストするのはどれ？",
    "image": "assets/mmt/elbow_flex_biceps_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 67,
    "imgId": "elbow_flex_biceps_g2",
    "slide": 134,
    "title": "肘関節屈曲：上腕二頭筋 (G2/1)",
    "region": "肘・前腕・手関節",
    "muscle": "上腕二頭筋",
    "nerve": "筋皮神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位（または背臥位）水平面回外位屈曲スライド",
    "kami": "側臥位で腕を水平に支えられ……",
    "naka": "グレード2、手のひらを向けた回外位で肘を水平に曲げて……",
    "shimo": "重力を除いて上腕二頭筋をテストするのはどれ？",
    "image": "assets/mmt/elbow_flex_biceps_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 68,
    "imgId": "elbow_flex_brachialis_g543",
    "slide": 134,
    "title": "肘関節屈曲：上腕筋 (G5/4/3)",
    "region": "肘・前腕・手関節",
    "muscle": "上腕筋",
    "nerve": "筋皮神経・橈骨神経",
    "root": "C5〜C7",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕完全回内位での肘屈曲・前腕遠位伸展加圧",
    "kami": "端座位で手背を天井に向け……",
    "naka": "グレード4〜5、前腕を完全回内したまま肘を曲げ手首への伸展抵抗に耐えて……",
    "shimo": "上腕筋を単独テストするのはどれ？",
    "image": "assets/mmt/elbow_flex_brachialis_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 69,
    "imgId": "elbow_flex_brachialis_g2",
    "slide": 135,
    "title": "肘関節屈曲：上腕筋 (G2/1)",
    "region": "肘・前腕・手関節",
    "muscle": "上腕筋",
    "nerve": "筋皮神経・橈骨神経",
    "root": "C5〜C7",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位水平面回内位屈曲スライド / 肘窩深部触診",
    "kami": "側臥位で前腕を回内させ……",
    "naka": "グレード2、重力を除いた水平面上で手背を向けたまま肘を曲げて……",
    "shimo": "重力を除いて上腕筋をテストするのはどれ？",
    "image": "assets/mmt/elbow_flex_brachialis_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 70,
    "imgId": "elbow_flex_brachiorad_g543",
    "slide": 136,
    "title": "肘関節屈曲：腕橈骨筋 (G5/4/3)",
    "region": "肘・前腕・手関節",
    "muscle": "腕橈骨筋",
    "nerve": "橈骨神経",
    "root": "C5〜C6",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕中間位（母指上）での肘屈曲・前腕遠位伸展加圧",
    "kami": "端座位で親指を上に向け……",
    "naka": "グレード4〜5、前腕中間位で肘を曲げ前腕遠位への引き下げ抵抗に耐えて……",
    "shimo": "腕橈骨筋を単独テストするのはどれ？",
    "image": "assets/mmt/elbow_flex_brachiorad_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 71,
    "imgId": "elbow_flex_brachiorad_g2",
    "slide": 138,
    "title": "肘関節屈曲：腕橈骨筋 (G2/1)",
    "region": "肘・前腕・手関節",
    "muscle": "腕橈骨筋",
    "nerve": "橈骨神経",
    "root": "C5〜C6",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位水平面中間位屈曲スライド / 前腕外側触診",
    "kami": "側臥位で親指を上にしたまま……",
    "naka": "グレード2、水平面上で肘を曲げて前腕橈側の筋腹隆起を触知して……",
    "shimo": "重力を除いて腕橈骨筋をテストするのはどれ？",
    "image": "assets/mmt/elbow_flex_brachiorad_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 72,
    "imgId": "elbow_ext_g543",
    "slide": 134,
    "title": "肘関節伸展 (G5/4/3)",
    "region": "肘・前腕・手関節",
    "muscle": "上腕三頭筋（長頭・外側頭・内側頭）・肘筋",
    "nerve": "橈骨神経",
    "root": "C6〜C8",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 肩90°外転位・肘完全伸展保持・前腕遠位屈曲加圧（ブレイクテスト）",
    "kami": "腹臥位（ふくがい）で……",
    "naka": "グレード4〜5、肩を横に出し肘を完全に伸ばし手首への強い屈曲加圧に耐えて……",
    "shimo": "肘関節を伸展（上腕三頭筋）するのはどれ？",
    "image": "assets/mmt/elbow_ext_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 73,
    "imgId": "elbow_ext_g2",
    "slide": 135,
    "title": "肘関節伸展 (G2/1)",
    "region": "肘・前腕・手関節",
    "muscle": "上腕三頭筋",
    "nerve": "橈骨神経",
    "root": "C6〜C8",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 端座位・肩90°外転水平面での肘伸展スライド",
    "kami": "端座位で腕を横に支えられ……",
    "naka": "グレード2、重力を除いた水平面上で肘を曲げた状態からまっすぐ伸ばして……",
    "shimo": "重力を除いて上腕三頭筋をテストするのはどれ？",
    "image": "assets/mmt/elbow_ext_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 74,
    "imgId": "forearm_sup_g543",
    "slide": 139,
    "title": "前腕回外 (G5/4/3)",
    "region": "肘・前腕・手関節",
    "muscle": "回外筋・上腕二頭筋",
    "nerve": "橈骨神経・筋皮神経",
    "root": "C5〜C7",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "⤹ 端座位・肘90°屈曲・中間位から回内方向ねじり抵抗（第10版標準）",
    "kami": "端座位で肘を90度曲げ……",
    "naka": "グレード4〜5、親指上の位置から手のひらを上に向け回内方向の強い抵抗に耐えて……",
    "shimo": "前腕を回外（回外筋）するのはどれ？",
    "image": "assets/mmt/forearm_sup_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 75,
    "imgId": "forearm_sup_g2",
    "slide": 140,
    "title": "前腕回外 (G2/1)",
    "region": "肘・前腕・手関節",
    "muscle": "回外筋・上腕二頭筋",
    "nerve": "橈骨神経・筋皮神経",
    "root": "C5〜C7",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 端座位・肘90°屈曲位での部分回外 / 前腕近位背外側触診",
    "kami": "端座位で肘を曲げ……",
    "naka": "グレード2、抵抗には耐えられないが手のひらを上に向ける可動域を完遂して……",
    "shimo": "重力最小位で前腕回外を行うのはどれ？",
    "image": "assets/mmt/forearm_sup_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 76,
    "imgId": "forearm_pron_g543",
    "slide": 142,
    "title": "前腕回内 (G5/4/3)",
    "region": "肘・前腕・手関節",
    "muscle": "円回内筋・方形回内筋",
    "nerve": "正中神経",
    "root": "C6〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "⤹ 端座位・肘90°屈曲・中間位から回外方向ねじり抵抗（第10版標準）",
    "kami": "端座位で肘を90度曲げ……",
    "naka": "グレード4〜5、手のひらを下に向けるように回し回外方向の強い抵抗に耐えて……",
    "shimo": "前腕を回内（円回内筋・方形回内筋）するのはどれ？",
    "image": "assets/mmt/forearm_pron_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 77,
    "imgId": "forearm_pron_g2",
    "slide": 143,
    "title": "前腕回内 (G2/1)",
    "region": "肘・前腕・手関節",
    "muscle": "円回内筋・方形回内筋",
    "nerve": "正中神経",
    "root": "C6〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 端座位・肘90°屈曲位での部分回内 / 前腕近位掌側触診",
    "kami": "端座位で前腕を支えられ……",
    "naka": "グレード2、手のひらを下へ向ける回内運動を完了し円回内筋の緊張を触知して……",
    "shimo": "重力最小位で前腕回内を行うのはどれ？",
    "image": "assets/mmt/forearm_pron_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 78,
    "imgId": "wrist_flex_rad_g543",
    "slide": 148,
    "title": "手関節屈曲：橈側手根屈筋 (G5/4/3)",
    "region": "肘・前腕・手関節",
    "muscle": "橈側手根屈筋",
    "nerve": "正中神経",
    "root": "C6〜C7",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕回外位支持・橈屈位手関節屈曲・第2中手骨頭掌側加圧",
    "kami": "前腕を回外して机に置き……",
    "naka": "グレード4〜5、手首を親指側に曲げながら掌屈し第2中手骨への伸展抵抗に耐えて……",
    "shimo": "橈側手根屈筋を単独テストするのはどれ？",
    "image": "assets/mmt/wrist_flex_rad_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 79,
    "imgId": "wrist_flex_rad_g2",
    "slide": 149,
    "title": "手関節屈曲：橈側手根屈筋 (G2/1)",
    "region": "肘・前腕・手関節",
    "muscle": "橈側手根屈筋",
    "nerve": "正中神経",
    "root": "C6〜C7",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 前腕中間位・机上水平掌屈スライド / 前腕遠位橈側腱触診",
    "kami": "前腕を中間位にして小指側を下に置き……",
    "naka": "グレード2、机の面を滑らせて手首を曲げ橈骨手根部の腱浮き上がりを触知して……",
    "shimo": "重力を除いて橈側手根屈筋をテストするのはどれ？",
    "image": "assets/mmt/wrist_flex_rad_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 80,
    "imgId": "wrist_flex_uln_g543",
    "slide": 150,
    "title": "手関節屈曲：尺側手根屈筋 (G5/4/3)",
    "region": "肘・前腕・手関節",
    "muscle": "尺側手根屈筋",
    "nerve": "尺骨神経",
    "root": "C7〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕回外位支持・尺屈位手関節屈曲・第5中手骨頭掌側加圧",
    "kami": "前腕を回外して手首を小指側へ曲げ……",
    "naka": "グレード4〜5、尺屈位で手関節を屈曲させ第5中手骨への伸展抵抗に抗して……",
    "shimo": "尺側手根屈筋を単独テストするのはどれ？",
    "image": "assets/mmt/wrist_flex_uln_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 81,
    "imgId": "wrist_flex_uln_g2",
    "slide": 151,
    "title": "手関節屈曲：尺側手根屈筋 (G2/1)",
    "region": "肘・前腕・手関節",
    "muscle": "尺側手根屈筋",
    "nerve": "尺骨神経",
    "root": "C7〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 前腕中間位・机上水平掌屈スライド / 豆状骨近位腱触診",
    "kami": "小指側を下にした中間位で……",
    "naka": "グレード2、手首を小指側へ滑らせて曲げ豆状骨の上で腱を触知して……",
    "shimo": "重力を除いて尺側手根屈筋をテストするのはどれ？",
    "image": "assets/mmt/wrist_flex_uln_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 82,
    "imgId": "wrist_ext_rad_g543",
    "slide": 152,
    "title": "手関節伸展：橈側手根伸筋 (G5/4/3)",
    "region": "肘・前腕・手関節",
    "muscle": "長橈側手根伸筋・短橈側手根伸筋",
    "nerve": "橈骨神経",
    "root": "C6〜C7",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕回内位支持・橈屈位手関節伸展・第2-3中手骨背側加圧",
    "kami": "手のひらを下に向けて机に預け……",
    "naka": "グレード4〜5、手首を親指側へ反らせて手の甲への強い下向き抵抗に耐えて……",
    "shimo": "長・短橈側手根伸筋をテストするのはどれ？",
    "image": "assets/mmt/wrist_ext_rad_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 83,
    "imgId": "wrist_ext_rad_g2",
    "slide": 153,
    "title": "手関節伸展：橈側手根伸筋 (G2/1)",
    "region": "肘・前腕・手関節",
    "muscle": "長橈側手根伸筋・短橈側手根伸筋",
    "nerve": "橈骨神経",
    "root": "C6〜C7",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 前腕中間位・机上水平背屈スライド / 前腕遠位背橈側触診",
    "kami": "小指側を下にした肢位で……",
    "naka": "グレード2、手首を手の甲側へ滑らせて反らし橈骨背側の腱を触知して……",
    "shimo": "重力を除いて橈側手根伸筋をテストするのはどれ？",
    "image": "assets/mmt/wrist_ext_rad_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 84,
    "imgId": "wrist_ext_uln_g543",
    "slide": 154,
    "title": "手関節伸展：尺側手根伸筋 (G5/4/3)",
    "region": "肘・前腕・手関節",
    "muscle": "尺側手根伸筋",
    "nerve": "橈骨神経（後骨間神経）",
    "root": "C7〜C8",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕回内位支持・尺屈位手関節伸展・第5中手骨背側加圧",
    "kami": "前腕を回内し手首を小指側へ反らし……",
    "naka": "グレード4〜5、尺屈位で手関節を伸展させ第5中手骨背側への加圧に抗して……",
    "shimo": "尺側手根伸筋を単独テストするのはどれ？",
    "image": "assets/mmt/wrist_ext_uln_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 85,
    "imgId": "wrist_ext_uln_g2",
    "slide": 155,
    "title": "手関節伸展：尺側手根伸筋 (G2/1)",
    "region": "肘・前腕・手関節",
    "muscle": "尺側手根伸筋",
    "nerve": "橈骨神経（後骨間神経）",
    "root": "C7〜C8",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 前腕中間位・机上水平背屈スライド / 尺骨頭遠位腱触診",
    "kami": "前腕中間位で手首を滑らせ……",
    "naka": "グレード2、手首を小指・背屈側へ水平に動かし尺骨茎状突起近傍の腱を触知して……",
    "shimo": "重力を除いて尺側手根伸筋をテストするのはどれ？",
    "image": "assets/mmt/wrist_ext_uln_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 86,
    "imgId": "finger_mp_flex_g543",
    "slide": 158,
    "title": "手指MP関節屈曲 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "虫様筋（第1〜4虫様筋）・掌側/背側骨間筋",
    "nerve": "正中神経・尺骨神経",
    "root": "C8〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕回外・IP完全伸展位でMP屈曲・基節骨掌側加圧",
    "kami": "前腕回外で指先をピンと伸ばし……",
    "naka": "グレード4〜5、指の第1関節を曲げたまま（L字型）基節骨への伸展抵抗に耐えて……",
    "shimo": "手指MP屈曲（虫様筋・骨間筋）を行うのはどれ？",
    "image": "assets/mmt/finger_mp_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 87,
    "imgId": "finger_mp_flex_g2",
    "slide": 159,
    "title": "手指MP関節屈曲 (G2/1)",
    "region": "手指・母指",
    "muscle": "虫様筋・骨間筋",
    "nerve": "正中神経・尺骨神経",
    "root": "C8〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 前腕中間位・IP伸展位でのMP関節屈曲 / 手掌部触診",
    "kami": "前腕中間位で机に小指側を置き……",
    "naka": "グレード2、IP関節を伸ばしたままMP関節のみを曲げる運動を完遂して……",
    "shimo": "重力を除いて虫様筋テストを行うのはどれ？",
    "image": "assets/mmt/finger_mp_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 88,
    "imgId": "finger_pip_flex_g543",
    "slide": 162,
    "title": "手指PIP関節屈曲 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "浅指屈筋",
    "nerve": "正中神経",
    "root": "C7〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 隣接指完全伸展固定・中節骨掌側加圧（DIP完全弛緩）",
    "kami": "他の指をすべてベッドに押し広げて固定し……",
    "naka": "グレード4〜5、対象指の第2関節（PIP）だけを単独で曲げ下向き抵抗に抗して……",
    "shimo": "浅指屈筋を単独テストするのはどれ？",
    "image": "assets/mmt/finger_pip_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 89,
    "imgId": "finger_pip_flex_g2",
    "slide": 163,
    "title": "手指PIP関節屈曲 (G2/1)",
    "region": "手指・母指",
    "muscle": "浅指屈筋",
    "nerve": "正中神経",
    "root": "C7〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 隣接指伸展保持下でのPIP単独可動域 / 手掌腱触診",
    "kami": "他指をまっすぐ押さえられ……",
    "naka": "グレード2、対象指のPIP関節を自力で完全に屈曲させる可動域を確認して……",
    "shimo": "浅指屈筋の可動域を判定するのはどれ？",
    "image": "assets/mmt/finger_pip_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 90,
    "imgId": "finger_dip_flex_g543",
    "slide": 166,
    "title": "手指DIP関節屈曲 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "深指屈筋",
    "nerve": "正中神経（示・中指）・尺骨神経（環・小指）",
    "root": "C8〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 中節骨固定・末節骨掌側加圧（指先単独屈曲抵抗）",
    "kami": "指の第2関節をまっすぐ固定され……",
    "naka": "グレード4〜5、指先（第1関節・DIP）だけを曲げ爪の腹への伸展加圧に耐えて……",
    "shimo": "深指屈筋を単独テストするのはどれ？",
    "image": "assets/mmt/finger_dip_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 91,
    "imgId": "finger_dip_flex_g2",
    "slide": 167,
    "title": "手指DIP関節屈曲 (G2/1)",
    "region": "手指・母指",
    "muscle": "深指屈筋",
    "nerve": "正中神経・尺骨神経",
    "root": "C8〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 中節骨固定下でのDIP関節単独可動域 / 指腹触診",
    "kami": "中節骨をしっかり押さえられ……",
    "naka": "グレード2、抵抗には耐えられないが指先のDIP関節を完全に曲げて……",
    "shimo": "深指屈筋の可動域を判定するのはどれ？",
    "image": "assets/mmt/finger_dip_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 92,
    "imgId": "finger_mp_ext_g543",
    "slide": 170,
    "title": "手指MP関節伸展 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "総指伸筋・示指伸筋・小指伸筋",
    "nerve": "橈骨神経（後骨間神経）",
    "root": "C7〜C8",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕回内位・手関節中間固定・基節骨背側下向き加圧",
    "kami": "手のひらを机に伏せ……",
    "naka": "グレード4〜5、手首を固定したまま指の付け根（MP）を反らせ背側加圧に耐えて……",
    "shimo": "総指伸筋をテストするのはどれ？",
    "image": "assets/mmt/finger_mp_ext_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 93,
    "imgId": "finger_mp_ext_g2",
    "slide": 171,
    "title": "手指MP関節伸展 (G2/1)",
    "region": "手指・母指",
    "muscle": "総指伸筋・示指伸筋・小指伸筋",
    "nerve": "橈骨神経",
    "root": "C7〜C8",
    "grade": "G2",
    "pos": "端座位",
    "vector": "➔ 前腕中間位・机上水平面での指伸展スライド / 手背腱触診",
    "kami": "小指側を下にした肢位で……",
    "naka": "グレード2、机の上で指の付け根をまっすぐ後方に伸ばし手の甲の腱を触知して……",
    "shimo": "重力を除いて手指伸筋をテストするのはどれ？",
    "image": "assets/mmt/finger_mp_ext_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 94,
    "imgId": "finger_abd_g543",
    "slide": 174,
    "title": "手指外転 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "背側骨間筋（第1〜4）・小指外転筋",
    "nerve": "尺骨神経",
    "root": "C8〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "➔ 前腕回内支持・隣接指を強く広げ基節骨側面押し戻し抵抗",
    "kami": "手のひらを机に伏せて指を大きく開き……",
    "naka": "グレード4〜5、隣り合う指を閉じる方向への強い加圧に抗して指を開き続けて……",
    "shimo": "手指を外転（背側骨間筋）するのはどれ？",
    "image": "assets/mmt/finger_abd_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 95,
    "imgId": "finger_abd_g2",
    "slide": 175,
    "title": "手指外転 (G2/1)",
    "region": "手指・母指",
    "muscle": "背側骨間筋・小指外転筋",
    "nerve": "尺骨神経",
    "root": "C8〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 机上での指完全開き動作 / 第1背側骨間筋筋腹触診",
    "kami": "机の上で脱力した状態から……",
    "naka": "グレード2、指を自力で大きく広げ親指と人差し指の間の筋腹隆起を触知して……",
    "shimo": "背側骨間筋の収縮を触診するのはどれ？",
    "image": "assets/mmt/finger_abd_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 96,
    "imgId": "finger_add_g543",
    "slide": 178,
    "title": "手指内転 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "掌側骨間筋（第1〜3）",
    "nerve": "尺骨神経",
    "root": "C8〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "📄 隣接指間に挟んだ紙の引き抜き抵抗（用紙保持テスト）",
    "kami": "指と指の間に紙を1枚挟み……",
    "naka": "グレード4〜5、検者が紙を力強く引き抜こうとするのを指を密着させて保持して……",
    "shimo": "手指を内転（掌側骨間筋）するのはどれ？",
    "image": "assets/mmt/finger_add_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 97,
    "imgId": "finger_add_g2",
    "slide": 179,
    "title": "手指内転 (G2/1)",
    "region": "手指・母指",
    "muscle": "掌側骨間筋",
    "nerve": "尺骨神経",
    "root": "C8〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 開いた指を中指に向かって閉じる可動域 / 手掌骨間触診",
    "kami": "机の上で開いた指から……",
    "naka": "グレード2、中指に向かって自力で指を閉じ合わせる動作を完遂して……",
    "shimo": "掌側骨間筋の機能を判定するのはどれ？",
    "image": "assets/mmt/finger_add_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 98,
    "imgId": "thumb_mp_flex_g543",
    "slide": 182,
    "title": "母指MP関節屈曲 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "短母指屈筋（浅頭・深頭）",
    "nerve": "正中神経・尺骨神経",
    "root": "C8〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 手背机上支持・IP伸展位で母指基節骨掌側加圧",
    "kami": "手背を机につけ親指の先を伸ばし……",
    "naka": "グレード4〜5、親指の付け根（MP）だけを手掌を横切るように曲げ伸展加圧に耐えて……",
    "shimo": "短母指屈筋をテストするのはどれ？",
    "image": "assets/mmt/thumb_mp_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 99,
    "imgId": "thumb_mp_flex_g2",
    "slide": 183,
    "title": "母指MP関節屈曲 (G2/1)",
    "region": "手指・母指",
    "muscle": "短母指屈筋",
    "nerve": "正中神経・尺骨神経",
    "root": "C8〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 IP伸展位でのMP関節横断屈曲 / 母指球触診",
    "kami": "手背を机につけた肢位で……",
    "naka": "グレード2、母指の付け根を小指側へ滑らせて曲げ母指球の収縮を触知して……",
    "shimo": "短母指屈筋の収縮を確認するのはどれ？",
    "image": "assets/mmt/thumb_mp_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 100,
    "imgId": "thumb_ip_flex_g543",
    "slide": 184,
    "title": "母指IP関節屈曲 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "長母指屈筋",
    "nerve": "正中神経（前骨間神経）",
    "root": "C8〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 母指基節骨固定・末節骨掌側加圧（親指指先単独屈曲抵抗）",
    "kami": "親指の付け根をしっかり固定され……",
    "naka": "グレード4〜5、親指の第1関節（IP）だけを力強く曲げ指先への伸展抵抗に耐えて……",
    "shimo": "長母指屈筋をテストするのはどれ？",
    "image": "assets/mmt/thumb_ip_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 101,
    "imgId": "thumb_ip_flex_g2",
    "slide": 185,
    "title": "母指IP関節屈曲 (G2/1)",
    "region": "手指・母指",
    "muscle": "長母指屈筋",
    "nerve": "正中神経（前骨間神経）",
    "root": "C8〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 基節骨固定下での母指IP単独可動域 / 腱触診",
    "kami": "基節骨を押さえられ……",
    "naka": "グレード2、親指の先端を自力で完全に折り曲げる可動域を確認して……",
    "shimo": "長母指屈筋の可動域を判定するのはどれ？",
    "image": "assets/mmt/thumb_ip_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 102,
    "imgId": "thumb_mp_ext_g543",
    "slide": 186,
    "title": "母指MP関節伸展 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "短母指伸筋",
    "nerve": "橈骨神経（後骨間神経）",
    "root": "C7〜C8",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 第1中手骨固定・母指基節骨背側屈曲加圧",
    "kami": "手掌を机に伏せ第1中手骨を固定し……",
    "naka": "グレード4〜5、親指の付け根（MP）を反らせ基節骨への押し下げ抵抗に耐えて……",
    "shimo": "短母指伸筋をテストするのはどれ？",
    "image": "assets/mmt/thumb_mp_ext_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 103,
    "imgId": "thumb_mp_ext_g2",
    "slide": 187,
    "title": "母指MP関節伸展 (G2/1)",
    "region": "手指・母指",
    "muscle": "短母指伸筋",
    "nerve": "橈骨神経（後骨間神経）",
    "root": "C7〜C8",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 解剖学的嗅覚窩（スナッフボックス）橈側腱触診",
    "kami": "手首の親指側くぼみで……",
    "naka": "グレード2、親指の付け根を反らせた際に嗅覚窩の内側腱が緊張するのを触知して……",
    "shimo": "短母指伸筋腱を触診するのはどれ？",
    "image": "assets/mmt/thumb_mp_ext_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 104,
    "imgId": "thumb_ip_ext_g543",
    "slide": 188,
    "title": "母指IP関節伸展 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "長母指伸筋",
    "nerve": "橈骨神経（後骨間神経）",
    "root": "C7〜C8",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 母指基節骨固定・末節骨背側屈曲加圧（親指反らし抵抗）",
    "kami": "親指の付け根を机に固定され……",
    "naka": "グレード4〜5、親指の先端（IP）をグッと反らせ爪への押し下げ加圧に耐えて……",
    "shimo": "長母指伸筋（EPL）をテストするのはどれ？",
    "image": "assets/mmt/thumb_ip_ext_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 105,
    "imgId": "thumb_ip_ext_g2",
    "slide": 189,
    "title": "母指IP関節伸展 (G2/1)",
    "region": "手指・母指",
    "muscle": "長母指伸筋",
    "nerve": "橈骨神経",
    "root": "C7〜C8",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 解剖学的嗅覚窩尺側縁（リスター結節回り込み腱）触診",
    "kami": "親指を大きく反らせた際に……",
    "naka": "グレード2、手首背側のリスター結節を回り込む太い腱の浮き上がりを触知して……",
    "shimo": "長母指伸筋腱を触診するのはどれ？",
    "image": "assets/mmt/thumb_ip_ext_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 106,
    "imgId": "thumb_palmar_abd_g543",
    "slide": 190,
    "title": "母指掌側外転 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "短母指外転筋",
    "nerve": "正中神経",
    "root": "C8〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕回外位・手掌面から垂直前方へ母指挙上・第1中手骨頭加圧",
    "kami": "手のひらを上に向け手背を机につけ……",
    "naka": "グレード4〜5、親指を手掌面から天井へ垂直に持ち上げ下向き加圧に耐えて……",
    "shimo": "短母指外転筋（掌側外転）をテストするのはどれ？",
    "image": "assets/mmt/thumb_palmar_abd_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 107,
    "imgId": "thumb_palmar_abd_g2",
    "slide": 191,
    "title": "母指掌側外転 (G2/1)",
    "region": "手指・母指",
    "muscle": "短母指外転筋",
    "nerve": "正中神経",
    "root": "C8〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 前腕中間位での母指掌側垂直挙上 / 母指球外側触診",
    "kami": "前腕中間位で親指を持ち上げ……",
    "naka": "グレード2、手のひらから垂直に親指を離す可動域と母指球外側の収縮を確認して……",
    "shimo": "掌側外転の筋収縮を触診するのはどれ？",
    "image": "assets/mmt/thumb_palmar_abd_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 108,
    "imgId": "thumb_radial_abd_g543",
    "slide": 192,
    "title": "母指橈側外転 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "長母指外転筋",
    "nerve": "橈骨神経（後骨間神経）",
    "root": "C7〜C8",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 前腕中間位・手掌面と平行に母指外転・第1中手骨外側加圧",
    "kami": "小指側を下にした肢位で……",
    "naka": "グレード4〜5、手掌面と平行に親指を真横に開き第1中手骨への押し戻し抵抗に耐えて……",
    "shimo": "長母指外転筋（橈側外転）をテストするのはどれ？",
    "image": "assets/mmt/thumb_radial_abd_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 109,
    "imgId": "thumb_radial_abd_g2",
    "slide": 193,
    "title": "母指橈側外転 (G2/1)",
    "region": "手指・母指",
    "muscle": "長母指外転筋",
    "nerve": "橈骨神経",
    "root": "C7〜C8",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 手掌面平行外転可動域 / 手根部橈側腱触診",
    "kami": "前腕中間位で机に置き……",
    "naka": "グレード2、手首の親指側で最も掌側にある腱の浮き上がりを触知して……",
    "shimo": "長母指外転筋腱を触診するのはどれ？",
    "image": "assets/mmt/thumb_radial_abd_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 110,
    "imgId": "thumb_add_g543",
    "slide": 195,
    "title": "母指内転 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "母指内転筋（横頭・斜頭）",
    "nerve": "尺骨神経",
    "root": "C8〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↑ 前腕回内位・第1中手骨内側加圧に抗して第2中手骨へ母指密着",
    "kami": "手のひらを机に伏せ……",
    "naka": "グレード4〜5、親指を人差し指の付け根に強く押し付け引き離し抵抗に耐えて……",
    "shimo": "母指内転筋をテストするのはどれ？",
    "image": "assets/mmt/thumb_add_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 111,
    "imgId": "thumb_add_g2",
    "slide": 195,
    "title": "母指内転 (G2/1)",
    "region": "手指・母指",
    "muscle": "母指内転筋",
    "nerve": "尺骨神経",
    "root": "C8〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 第1指間隙手掌側深部触診",
    "kami": "親指を人差し指に引き寄せる動作で……",
    "naka": "グレード2、親指と人差し指の間の手掌側水かき深層にある筋腹を触知して……",
    "shimo": "母指内転筋の収縮を触診するのはどれ？",
    "image": "assets/mmt/thumb_add_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 112,
    "imgId": "thumb_opp_g543",
    "slide": 196,
    "title": "母指と小指の対立 (G5/4/3)",
    "region": "手指・母指",
    "muscle": "母指対立筋・小指対立筋",
    "nerve": "正中神経・尺骨神経",
    "root": "C8〜Th1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "➔ 母指球と小指球を対向させ指腹密着・第1-第5中手骨引き離し抵抗",
    "kami": "手のひらを上に向け親指と小指を合わせ……",
    "naka": "グレード4〜5、指腹同士を力強く押し合わせ検者の引き離し加圧に耐えて……",
    "shimo": "母指・小指対立筋をテストするのはどれ？",
    "image": "assets/mmt/thumb_opp_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 113,
    "imgId": "thumb_opp_g2",
    "slide": 197,
    "title": "母指と小指の対立 (G2/1)",
    "region": "手指・母指",
    "muscle": "母指対立筋・小指対立筋",
    "nerve": "正中神経・尺骨神経",
    "root": "C8〜Th1",
    "grade": "G2",
    "pos": "端座位",
    "vector": "🔍 母指・小指の指腹接触動作 / 母指球外側縁触診",
    "kami": "前腕を机に乗せて……",
    "naka": "グレード2、抵抗には耐えられないが親指と小指の腹を向かい合わせて接触させ……",
    "shimo": "対立運動の可動域を確認するのはどれ？",
    "image": "assets/mmt/thumb_opp_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 114,
    "imgId": "hip_flex_g543",
    "slide": 199,
    "title": "股関節屈曲 (G5/4/3)",
    "region": "股・膝",
    "muscle": "腸腰筋（大腰筋・腸骨筋）",
    "nerve": "大腿神経・腰神経叢",
    "root": "L1〜L4",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 端座位・大腿遠位下向き加圧（ブレイクテスト）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、大腿を座面から持ち上げ膝のすぐ上への強力な下向き加圧に耐えて……",
    "shimo": "股関節を屈曲（腸腰筋）するのはどれ？",
    "image": "assets/mmt/hip_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 115,
    "imgId": "hip_flex_g2",
    "slide": 196,
    "title": "股関節屈曲 (G2/1)",
    "region": "股・膝",
    "muscle": "腸腰筋",
    "nerve": "大腿神経・腰神経叢",
    "root": "L1〜L4",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位（下側脚支持）での水平面股屈曲スライド",
    "kami": "側臥位（そくがい）で……",
    "naka": "グレード2、検者が下肢の重さを支えた水平面上で膝を胸に引き寄せて……",
    "shimo": "重力を除いて股関節を屈曲するのはどれ？",
    "image": "assets/mmt/hip_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 116,
    "imgId": "hip_sartorius_g543",
    "slide": 199,
    "title": "縫工筋テスト［股屈曲・外転・外旋］ (G5/4/3)",
    "region": "股・膝",
    "muscle": "縫工筋",
    "nerve": "大腿神経",
    "root": "L2〜L3",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 踵を対側脛に沿って引き上げ・大腿遠位下向き＆足関節内向き抵抗",
    "kami": "端座位で踵を反対側のすねに沿わせ……",
    "naka": "グレード4〜5、踵を膝に向かって滑り上げ大腿と足首への押し戻し抵抗に耐えて……",
    "shimo": "縫工筋を単独テストするのはどれ？",
    "image": "assets/mmt/hip_sartorius_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 117,
    "imgId": "hip_sartorius_g2",
    "slide": 199,
    "title": "縫工筋テスト (G2/1)",
    "region": "股・膝",
    "muscle": "縫工筋",
    "nerve": "大腿神経",
    "root": "L2〜L3",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "➔ 背臥位で踵を対側脛に沿って滑り上げる可動域確認",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード2、踵を反対側のすねに当てて膝まで滑り上げる動作を完遂して……",
    "shimo": "重力を除いて縫工筋テストを行うのはどれ？",
    "image": "assets/mmt/hip_sartorius_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 118,
    "imgId": "hip_ext_comp_g543",
    "slide": 203,
    "title": "股関節伸展：複合テスト (G5/4/3)",
    "region": "股・膝",
    "muscle": "大殿筋・ハムストリングス（半腱・半膜様筋・大腿二頭筋）",
    "nerve": "下殿神経・坐骨神経",
    "root": "L4〜S2",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 腹臥位・膝完全伸展位で下肢後方挙上・大腿遠位下向き加圧",
    "kami": "腹臥位で膝を伸ばしたまま……",
    "naka": "グレード4〜5、脚を天井に向けて持ち上げ太もも裏への強い押し下げ抵抗に耐えて……",
    "shimo": "股関節を伸展（大殿筋・ハム複合）するのはどれ？",
    "image": "assets/mmt/hip_ext_comp_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 119,
    "imgId": "hip_ext_comp_g2",
    "slide": 204,
    "title": "股関節伸展：複合テスト (G2/1)",
    "region": "股・膝",
    "muscle": "大殿筋・ハムストリングス",
    "nerve": "下殿神経・坐骨神経",
    "root": "L4〜S2",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位水平面での膝伸展位股関節後方伸展スライド",
    "kami": "側臥位で下肢の重さを支えられ……",
    "naka": "グレード2、水平面上で膝を伸ばしたまま脚を後方へ滑らせて……",
    "shimo": "重力を除いて股関節伸展を行うのはどれ？",
    "image": "assets/mmt/hip_ext_comp_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 120,
    "imgId": "hip_ext_glute_g543",
    "slide": 205,
    "title": "股関節伸展：大殿筋分離テスト (G5/4/3)",
    "region": "股・膝",
    "muscle": "大殿筋",
    "nerve": "下殿神経",
    "root": "L5〜S2",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 膝90°屈曲位（ハム弛緩）で大腿後方挙上・大腿後面下向き加圧",
    "kami": "腹臥位で膝を90度曲げ……",
    "naka": "グレード4〜5、ハムストリングスを弛緩させた状態で太ももを持ち上げ大殿筋に抗して……",
    "shimo": "大殿筋を単独分離テストするのはどれ？",
    "image": "assets/mmt/hip_ext_glute_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 121,
    "imgId": "hip_ext_glute_g2",
    "slide": 206,
    "title": "股関節伸展：大殿筋分離テスト (G2/1)",
    "region": "股・膝",
    "muscle": "大殿筋",
    "nerve": "下殿神経",
    "root": "L5〜S2",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位・膝屈曲位での水平後方伸展 / 大殿筋筋腹触診",
    "kami": "側臥位で膝を曲げたまま……",
    "naka": "グレード2、水平面上で脚を後方へ動かしお尻の筋肉の盛り上がりを触知して……",
    "shimo": "大殿筋の単独収縮を触診するのはどれ？",
    "image": "assets/mmt/hip_ext_glute_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 122,
    "imgId": "hip_ext_contracture_g543",
    "slide": 209,
    "title": "股関節伸展：屈曲拘縮時別法 (G5/4/3)",
    "region": "股・膝",
    "muscle": "大殿筋・ハムストリングス",
    "nerve": "下殿神経・坐骨神経",
    "root": "L4〜S2",
    "grade": "G5/4/3",
    "pos": "立位前傾",
    "vector": "↑ 立位前傾（体幹をベッド支持）から下肢後方伸展挙上",
    "kami": "ベッドに体幹を預けて前傾し……",
    "naka": "グレード4〜5、股関節屈曲拘縮がある患者で立位から脚を後方に持ち上げて……",
    "shimo": "屈曲拘縮時の別法で股関節伸展をテストするのはどれ？",
    "image": "assets/mmt/hip_ext_contracture_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 123,
    "imgId": "hip_abd_g543",
    "slide": 212,
    "title": "股関節外転 (G5/4/3)",
    "region": "股・膝",
    "muscle": "中殿筋・小殿筋",
    "nerve": "上殿神経",
    "root": "L4〜S1",
    "grade": "G5/4/3",
    "pos": "側臥位",
    "vector": "↓ 側臥位・膝伸展・軽度伸展外旋位で下肢挙上・足関節上部下向き加圧",
    "kami": "側臥位（そくがい）で……",
    "naka": "グレード4〜5、骨盤を動かさずに上側の脚を真上に持ち上げ足首への強い加圧に耐えて……",
    "shimo": "股関節を外転（中殿筋）するのはどれ？",
    "image": "assets/mmt/hip_abd_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 124,
    "imgId": "hip_abd_g2",
    "slide": 217,
    "title": "股関節外転 (G2/1)",
    "region": "股・膝",
    "muscle": "中殿筋・小殿筋",
    "nerve": "上殿神経",
    "root": "L4〜S1",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "➔ 背臥位ベッド面上での水平外転スライド / 大転子上方触診",
    "kami": "背臥位（はいがい）で……",
    "naka": "グレード2、ベッドの面を水平に外側へ脚を滑らせて……",
    "shimo": "重力を除いて股関節外転を行うのはどれ？",
    "image": "assets/mmt/hip_abd_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 125,
    "imgId": "hip_tfl_g543",
    "slide": 214,
    "title": "大腿筋膜張筋テスト［TFL］ (G5/4/3)",
    "region": "股・膝",
    "muscle": "大腿筋膜張筋（TFL）",
    "nerve": "上殿神経",
    "root": "L4〜S1",
    "grade": "G5/4/3",
    "pos": "側臥位",
    "vector": "↓ 側臥位・股45°屈曲位から下肢外転挙上・大腿遠位下向き加圧",
    "kami": "側臥位で股関節を斜め前45度に曲げ……",
    "naka": "グレード4〜5、斜め前方から脚を真上に持ち上げ膝上への加圧に抗して……",
    "shimo": "大腿筋膜張筋（TFL）を分離テストするのはどれ？",
    "image": "assets/mmt/hip_tfl_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 126,
    "imgId": "hip_tfl_g2",
    "slide": 216,
    "title": "大腿筋膜張筋テスト［TFL］ (G2/1)",
    "region": "股・膝",
    "muscle": "大腿筋膜張筋",
    "nerve": "上殿神経",
    "root": "L4〜S1",
    "grade": "G2",
    "pos": "長座位",
    "vector": "➔ 半長座位（股45°屈曲位）での水平外転スライド",
    "kami": "長座位で上体を後ろに預け……",
    "naka": "グレード2、股関節を曲げた肢位からベッド上で脚を真横に滑らせて……",
    "shimo": "重力を除いて大腿筋膜張筋をテストするのはどれ？",
    "image": "assets/mmt/hip_tfl_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 127,
    "imgId": "hip_add_g543",
    "slide": 220,
    "title": "股関節内転 (G5/4/3)",
    "region": "股・膝",
    "muscle": "長内転筋・短内転筋・大内転筋・薄筋・恥骨筋",
    "nerve": "閉鎖神経・坐骨神経",
    "root": "L2〜L4",
    "grade": "G5/4/3",
    "pos": "側臥位",
    "vector": "↓ 上側下肢支持下で下側下肢を上方挙上・大腿内側加圧",
    "kami": "側臥位で上の脚を抱えられ……",
    "naka": "グレード4〜5、下の脚をベッドから天井に向かって持ち上げ膝上への抵抗に耐えて……",
    "shimo": "股関節を内転（内転筋群）するのはどれ？",
    "image": "assets/mmt/hip_add_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 128,
    "imgId": "hip_add_g2",
    "slide": 220,
    "title": "股関節内転 (G2/1)",
    "region": "股・膝",
    "muscle": "内転筋群",
    "nerve": "閉鎖神経",
    "root": "L2〜L4",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "➔ 背臥位ベッド面上での水平内転スライド / 恥骨結合外側触診",
    "kami": "背臥位で脚を開いた状態から……",
    "naka": "グレード2、ベッドの面を滑らせて反対側の脚へ引き寄せて……",
    "shimo": "重力を除いて股関節内転を行うのはどれ？",
    "image": "assets/mmt/hip_add_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 129,
    "imgId": "hip_er_g543",
    "slide": 224,
    "title": "股関節外旋 (G5/4/3)",
    "region": "股・膝",
    "muscle": "外旋六筋（梨状筋・上/下双子筋・内/外閉鎖筋・大腿方形筋）・大殿筋",
    "nerve": "仙骨神経叢・坐骨神経",
    "root": "L5〜S2",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "➔ 端座位・膝90°屈曲位から下腿内方回旋・下腿遠位内側加圧",
    "kami": "端座位で膝を90度曲げ……",
    "naka": "グレード4〜5、足先を内側へ振るようにして股関節を外旋させ外向き加圧に耐えて……",
    "shimo": "股関節を外旋（外旋六筋）するのはどれ？",
    "image": "assets/mmt/hip_er_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 130,
    "imgId": "hip_er_g2",
    "slide": 225,
    "title": "股関節外旋 (G2/1)",
    "region": "股・膝",
    "muscle": "外旋六筋",
    "nerve": "仙骨神経叢",
    "root": "L5〜S2",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "➔ 背臥位伸展位での下肢外旋ローリング / 大転子後方触診",
    "kami": "背臥位で脚をまっすぐ伸ばし……",
    "naka": "グレード2、つま先をベッドの外側へ倒すように回して大転子後方を触知して……",
    "shimo": "重力を除いて股関節外旋を行うのはどれ？",
    "image": "assets/mmt/hip_er_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 131,
    "imgId": "hip_ir_g543",
    "slide": 227,
    "title": "股関節内旋 (G5/4/3)",
    "region": "股・膝",
    "muscle": "中殿筋前部・小殿筋・大腿筋膜張筋",
    "nerve": "上殿神経",
    "root": "L4〜S1",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "➔ 端座位・膝90°屈曲位から下腿外方回旋・下腿遠位外側加圧",
    "kami": "端座位で膝を揃え……",
    "naka": "グレード4〜5、足先を外側へ振るようにして股関節を内旋させ内向き加圧に耐えて……",
    "shimo": "股関節を内旋（中殿筋前部・小殿筋）するのはどれ？",
    "image": "assets/mmt/hip_ir_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 132,
    "imgId": "hip_ir_g2",
    "slide": 228,
    "title": "股関節内旋 (G2/1)",
    "region": "股・膝",
    "muscle": "中殿筋前部・小殿筋",
    "nerve": "上殿神経",
    "root": "L4〜S1",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "➔ 背臥位伸展位での下肢内旋ローリング",
    "kami": "背臥位で脚を伸ばし……",
    "naka": "グレード2、つま先を内側へ倒すように脚全体を内方に転がして……",
    "shimo": "重力を除いて股関節内旋を行うのはどれ？",
    "image": "assets/mmt/hip_ir_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 133,
    "imgId": "knee_flex_comp_g543",
    "slide": 231,
    "title": "膝関節屈曲：複合テスト (G5/4/3)",
    "region": "股・膝",
    "muscle": "ハムストリングス（大腿二頭筋・半腱様筋・半膜様筋）",
    "nerve": "坐骨神経（脛骨神経・総腓骨神経）",
    "root": "L5〜S2",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 腹臥位・下腿中間位で膝屈曲・足関節上部伸展方向加圧",
    "kami": "腹臥位で膝を直角に曲げ……",
    "naka": "グレード4〜5、下腿をまっすぐ保ち足首の上への引き下げ抵抗に力強く耐えて……",
    "shimo": "ハムストリングス全体をテストするのはどれ？",
    "image": "assets/mmt/knee_flex_comp_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 134,
    "imgId": "knee_flex_comp_g2",
    "slide": 232,
    "title": "膝関節屈曲：複合テスト (G2/1)",
    "region": "股・膝",
    "muscle": "ハムストリングス",
    "nerve": "坐骨神経",
    "root": "L5〜S2",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位（下肢支持）水平面での膝屈曲スライド",
    "kami": "側臥位で脚を支えられ……",
    "naka": "グレード2、重力を除いた水平面上で踵をお尻に向かって引き寄せて……",
    "shimo": "重力を除いて膝関節屈曲を行うのはどれ？",
    "image": "assets/mmt/knee_flex_comp_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 135,
    "imgId": "knee_flex_med_g543",
    "slide": 231,
    "title": "膝関節屈曲：内側ハムストリングス (G5/4/3)",
    "region": "股・膝",
    "muscle": "半腱様筋・半膜様筋",
    "nerve": "坐骨神経（脛骨神経部）",
    "root": "L5〜S2",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 下腿内旋位（つま先内向き）で膝屈曲・伸展方向加圧",
    "kami": "腹臥位でつま先を内側に向け……",
    "naka": "グレード4〜5、下腿を内旋させた状態で膝を曲げ内側腱の緊張を保って抵抗に耐えて……",
    "shimo": "半腱様筋・半膜様筋を分離テストするのはどれ？",
    "image": "assets/mmt/knee_flex_med_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 136,
    "imgId": "knee_flex_med_g2",
    "slide": 234,
    "title": "膝関節屈曲：内側ハムストリングス (G2/1)",
    "region": "股・膝",
    "muscle": "半腱様筋・半膜様筋",
    "nerve": "坐骨神経（脛骨神経部）",
    "root": "L5〜S2",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位・下腿内旋位での水平面膝屈曲 / 膝窩内側腱触診",
    "kami": "側臥位で下腿を内旋させ……",
    "naka": "グレード2、膝を曲げた際に膝裏の内側で太い索状腱を触知して……",
    "shimo": "内側ハムストリングス腱を触診するのはどれ？",
    "image": "assets/mmt/knee_flex_med_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 137,
    "imgId": "knee_flex_lat_g543",
    "slide": 231,
    "title": "膝関節屈曲：外側ハムストリングス (G5/4/3)",
    "region": "股・膝",
    "muscle": "大腿二頭筋（長頭・短頭）",
    "nerve": "坐骨神経（脛骨部・総腓骨部）",
    "root": "L5〜S2",
    "grade": "G5/4/3",
    "pos": "腹臥位",
    "vector": "↓ 下腿外旋位（つま先外向き）で膝屈曲・伸展方向加圧",
    "kami": "腹臥位でつま先を外側に向け……",
    "naka": "グレード4〜5、下腿を外旋させたまま膝を曲げ腓骨頭へ向かう腱の抵抗に耐えて……",
    "shimo": "大腿二頭筋を単独分離テストするのはどれ？",
    "image": "assets/mmt/knee_flex_lat_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 138,
    "imgId": "knee_flex_lat_g2",
    "slide": 237,
    "title": "膝関節屈曲：外側ハムストリングス (G2/1)",
    "region": "股・膝",
    "muscle": "大腿二頭筋",
    "nerve": "坐骨神経",
    "root": "L5〜S2",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位・下腿外旋位での水平面膝屈曲 / 腓骨頭近位腱触診",
    "kami": "側臥位で下腿を外旋させ……",
    "naka": "グレード2、膝を曲げた際に膝裏の外側（腓骨頭）に向かう腱を触知して……",
    "shimo": "大腿二頭筋腱を触診するのはどれ？",
    "image": "assets/mmt/knee_flex_lat_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 139,
    "imgId": "knee_ext_g543",
    "slide": 237,
    "title": "膝関節伸展 (G5/4/3)",
    "region": "股・膝",
    "muscle": "大腿四頭筋（大腿直筋・外側広筋・中間広筋・内側広筋）",
    "nerve": "大腿神経",
    "root": "L2〜L4",
    "grade": "G5/4/3",
    "pos": "端座位",
    "vector": "↓ 端座位・膝完全伸展位保持・下腿遠位前面下向き加圧（ブレイクテスト）",
    "kami": "端座位（たんざい）で……",
    "naka": "グレード4〜5、膝をまっすぐ前方に伸ばし足首の上への強力な押し戻しに耐えて……",
    "shimo": "膝関節を伸展（大腿四頭筋）するのはどれ？",
    "image": "assets/mmt/knee_ext_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 140,
    "imgId": "knee_ext_g2",
    "slide": 238,
    "title": "膝関節伸展 (G2/1)",
    "region": "股・膝",
    "muscle": "大腿四頭筋",
    "nerve": "大腿神経",
    "root": "L2〜L4",
    "grade": "G2",
    "pos": "側臥位",
    "vector": "➔ 側臥位（下肢支持）水平面での屈曲位から前方伸展円弧",
    "kami": "側臥位で脚を水平に支えられ……",
    "naka": "グレード2、膝を曲げた状態から前方へ向かってまっすぐ脚を伸ばして……",
    "shimo": "重力を除いて膝関節伸展を行うのはどれ？",
    "image": "assets/mmt/knee_ext_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 141,
    "imgId": "ankle_pf_g5",
    "slide": 241,
    "title": "足関節底屈：腓腹筋＋ヒラメ筋 (G5)",
    "region": "足関節・足趾",
    "muscle": "腓腹筋（内側頭・外側頭）・ヒラメ筋",
    "nerve": "脛骨神経",
    "root": "S1〜S2",
    "grade": "G5",
    "pos": "立位",
    "vector": "↑ 立位片脚立ち・膝完全伸展位での完全フォーム踵上げ 25回完遂",
    "kami": "立位片脚立ち（膝完全伸展）で……",
    "naka": "グレード5、指先2本支持のみで完全な高さの踵上げを正確に25回完遂して……",
    "shimo": "足関節底屈（Grade 5）を達成するのはどれ？",
    "image": "assets/mmt/ankle_pf_g5.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 142,
    "imgId": "ankle_pf_g4",
    "slide": 241,
    "title": "足関節底屈：腓腹筋＋ヒラメ筋 (G4)",
    "region": "足関節・足趾",
    "muscle": "腓腹筋・ヒラメ筋",
    "nerve": "脛骨神経",
    "root": "S1〜S2",
    "grade": "G4",
    "pos": "立位",
    "vector": "↑ 立位片脚立ち・膝伸展位での完全フォーム踵上げ 2〜24回完遂",
    "kami": "立位片脚立ちで……",
    "naka": "グレード4、2回から24回の完全な踵上げを完遂し疲労でストップして……",
    "shimo": "足関節底屈（Grade 4）を判定するのはどれ？",
    "image": "assets/mmt/ankle_pf_g4.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 143,
    "imgId": "ankle_pf_g3",
    "slide": 241,
    "title": "足関節底屈：腓腹筋＋ヒラメ筋 (G3)",
    "region": "足関節・足趾",
    "muscle": "腓腹筋・ヒラメ筋",
    "nerve": "脛骨神経",
    "root": "S1〜S2",
    "grade": "G3",
    "pos": "立位",
    "vector": "↑ 立位片脚立ち・膝伸展位での完全フォーム踵上げ 1回完遂",
    "kami": "立位片脚立ちで……",
    "naka": "グレード3、正しいフォームで1回だけ完全な踵上げを達成して……",
    "shimo": "自重での足関節底屈（Grade 3）を行うのはどれ？",
    "image": "assets/mmt/ankle_pf_g3.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 144,
    "imgId": "ankle_pf_g2",
    "slide": 242,
    "title": "足関節底屈：非立位テスト (G2/1)",
    "region": "足関節・足趾",
    "muscle": "腓腹筋・ヒラメ筋",
    "nerve": "脛骨神経",
    "root": "S1〜S2",
    "grade": "G2",
    "pos": "腹臥位",
    "vector": "➔ 腹臥位（足部下垂）・前足部足底面への最大底屈抵抗",
    "kami": "腹臥位で足部をベッド端から出し……",
    "naka": "グレード2、立位不能患者で足底への押し上げ抵抗に抗してつま先を押し下げ……",
    "shimo": "非立位で足関節底屈をテストするのはどれ？",
    "image": "assets/mmt/ankle_pf_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 145,
    "imgId": "ankle_soleus_g543",
    "slide": 241,
    "title": "足関節底屈：ヒラメ筋分離テスト (G5/4/3)",
    "region": "足関節・足趾",
    "muscle": "ヒラメ筋",
    "nerve": "脛骨神経",
    "root": "S1〜S2",
    "grade": "G5/4/3",
    "pos": "立位",
    "vector": "↑ 立位片脚立ち・膝軽度屈曲位（腓腹筋弛緩）での踵上げ",
    "kami": "片脚立ちで膝を軽く曲げ……",
    "naka": "グレード4〜5、腓腹筋を緩めた状態で膝屈曲位を保ちながら踵を持ち上げて……",
    "shimo": "ヒラメ筋を単独分離テストするのはどれ？",
    "image": "assets/mmt/ankle_soleus_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 146,
    "imgId": "ankle_soleus_g2",
    "slide": 245,
    "title": "足関節底屈：ヒラメ筋分離テスト (G2/1)",
    "region": "足関節・足趾",
    "muscle": "ヒラメ筋",
    "nerve": "脛骨神経",
    "root": "S1〜S2",
    "grade": "G2",
    "pos": "腹臥位",
    "vector": "➔ 腹臥位・膝90°屈曲位での足底加圧底屈抵抗 / アキレス腱遠位触診",
    "kami": "腹臥位で膝を直角に曲げ……",
    "naka": "グレード2、膝屈曲位でつま先を天井へ向け押し出しアキレス腱深層を触知して……",
    "shimo": "非立位でヒラメ筋をテストするのはどれ？",
    "image": "assets/mmt/ankle_soleus_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 147,
    "imgId": "ankle_df_g5432",
    "slide": 249,
    "title": "足関節背屈ならびに内反 (G5/4/3)",
    "region": "足関節・足趾",
    "muscle": "前脛骨筋",
    "nerve": "深腓骨神経",
    "root": "L4〜L5",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 背臥位（第10版標準）・前足部背側内側から外返し方向への強い加圧",
    "kami": "背臥位（第10版完全準拠）で……",
    "naka": "グレード4〜5、足首を反らしながら内返しし足先への強い押し下げに耐えて……",
    "shimo": "前脛骨筋をテストするのはどれ？",
    "image": "assets/mmt/ankle_df_g5432.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 148,
    "imgId": "ankle_df_g2",
    "slide": 249,
    "title": "足関節背屈ならびに内反 (G2/1)",
    "region": "足関節・足趾",
    "muscle": "前脛骨筋",
    "nerve": "深腓骨神経",
    "root": "L4〜L5",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "🔍 背臥位での部分背屈可動域 / 足関節前内側腱浮き上がり触診",
    "kami": "背臥位で力を抜いた状態から……",
    "naka": "グレード2、抵抗には耐えられないがつま先を顔に向けて反らし太い腱を触知して……",
    "shimo": "前脛骨筋腱を触診するのはどれ？",
    "image": "assets/mmt/ankle_df_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 149,
    "imgId": "foot_inv_g543",
    "slide": 251,
    "title": "足部内反 (G5/4/3)",
    "region": "足関節・足趾",
    "muscle": "後脛骨筋",
    "nerve": "脛骨神経",
    "root": "L4〜L5",
    "grade": "G5/4/3",
    "pos": "側臥位",
    "vector": "↓ 端座位または側臥位・足趾脱力・第1中足骨頭外返し加圧",
    "kami": "足の指の力を完全に抜いて……",
    "naka": "グレード4〜5、前足部を内側に向け親指の付け根への外返し加圧に力強く耐えて……",
    "shimo": "後脛骨筋を単独テストするのはどれ？",
    "image": "assets/mmt/foot_inv_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 150,
    "imgId": "foot_inv_g2",
    "slide": 251,
    "title": "足部内反 (G2/1)",
    "region": "足関節・足趾",
    "muscle": "後脛骨筋",
    "nerve": "脛骨神経",
    "root": "L4〜L5",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "🔍 背臥位での内反可動域 / 内果後下方腱触診",
    "kami": "背臥位で足指を緩め……",
    "naka": "グレード2、足先を内側に向ける運動を行い内くるぶしのすぐ後ろで腱を触知して……",
    "shimo": "後脛骨筋腱を触診するのはどれ？",
    "image": "assets/mmt/foot_inv_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 151,
    "imgId": "foot_ev_g543",
    "slide": 254,
    "title": "足部外反ならびに底屈 (G5/4/3)",
    "region": "足関節・足趾",
    "muscle": "長腓骨筋・短腓骨筋・第三腓骨筋",
    "nerve": "浅腓骨神経・深腓骨神経",
    "root": "L5〜S1",
    "grade": "G5/4/3",
    "pos": "側臥位",
    "vector": "↓ 側臥位または背臥位・前足部外反・第5中足骨頭内返し加圧",
    "kami": "側臥位（または背臥位）で……",
    "naka": "グレード4〜5、足の裏を外側へ向けて小指の付け根への内返し加圧に抗して……",
    "shimo": "長・短腓骨筋をテストするのはどれ？",
    "image": "assets/mmt/foot_ev_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 152,
    "imgId": "foot_ev_g2",
    "slide": 254,
    "title": "足部外反ならびに底屈 (G2/1)",
    "region": "足関節・足趾",
    "muscle": "長腓骨筋・短腓骨筋",
    "nerve": "浅腓骨神経",
    "root": "L5〜S1",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "🔍 背臥位での外反可動域 / 外果後方腱触診",
    "kami": "背臥位でつま先を脱力し……",
    "naka": "グレード2、足先を外側にひねり外くるぶしの後ろを走る腓骨筋腱を触知して……",
    "shimo": "腓骨筋群を触診するのはどれ？",
    "image": "assets/mmt/foot_ev_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 153,
    "imgId": "toe_mp_flex_g543",
    "slide": 252,
    "title": "母趾MP関節屈曲 (G5/4/3)",
    "region": "足関節・足趾",
    "muscle": "短母趾屈筋",
    "nerve": "内側足底神経",
    "root": "L5〜S1",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 背臥位・第1中足骨固定・基節骨底面伸展方向加圧",
    "kami": "背臥位で足首を直角に保ち……",
    "naka": "グレード4〜5、足の親指の付け根（MP）を下へ曲げ基節骨への伸展抵抗に耐えて……",
    "shimo": "短母趾屈筋をテストするのはどれ？",
    "image": "assets/mmt/toe_mp_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 154,
    "imgId": "toe_mp_flex_g2",
    "slide": 253,
    "title": "母趾MP関節屈曲 (G2/1)",
    "region": "足関節・足趾",
    "muscle": "短母趾屈筋",
    "nerve": "内側足底神経",
    "root": "L5〜S1",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "🔍 母趾MP屈曲可動域 / 第1中足骨頭底面触診",
    "kami": "足の力を抜いた状態から……",
    "naka": "グレード2、親指の付け根を自力で曲げる動作を完遂して足底の腱を触知して……",
    "shimo": "短母趾屈筋の収縮を確認するのはどれ？",
    "image": "assets/mmt/toe_mp_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 155,
    "imgId": "toes_mp_flex_g543",
    "slide": 254,
    "title": "第2〜5趾MP関節屈曲 (G5/4/3)",
    "region": "足関節・足趾",
    "muscle": "虫様筋（足底）・短趾屈筋",
    "nerve": "内側足底神経・外側足底神経",
    "root": "L5〜S1",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 中足骨固定・第2〜5基節骨底面伸展加圧",
    "kami": "背臥位で足の指先を伸ばし……",
    "naka": "グレード4〜5、足の指の付け根だけを下へ折り曲げ押し上げ抵抗に耐えて……",
    "shimo": "足趾MP屈曲（虫様筋）を行うのはどれ？",
    "image": "assets/mmt/toes_mp_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 156,
    "imgId": "toes_mp_flex_g2",
    "slide": 255,
    "title": "第2〜5趾MP関節屈曲 (G2/1)",
    "region": "足関節・足趾",
    "muscle": "虫様筋・短趾屈筋",
    "nerve": "内側・外側足底神経",
    "root": "L5〜S1",
    "grade": "G2",
    "pos": "背臥位",
    "vector": "🔍 足趾MP関節屈曲可動域 / 足底中足部触診",
    "kami": "足指の力を抜いた肢位から……",
    "naka": "グレード2、足指の第1関節を伸ばしたまま付け根を自力で曲げて……",
    "shimo": "足趾虫様筋の機能を判定するのはどれ？",
    "image": "assets/mmt/toes_mp_flex_g2.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 157,
    "imgId": "toe_ip_flex_hallux_g543",
    "slide": 256,
    "title": "母趾IP関節屈曲 (G5/4/3)",
    "region": "足関節・足趾",
    "muscle": "長母趾屈筋",
    "nerve": "脛骨神経",
    "root": "L5〜S2",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 母趾基節骨固定・末節骨底面伸展方向加圧（親指指先屈曲抵抗）",
    "kami": "足の親指の付け根を押さえられ……",
    "naka": "グレード4〜5、親指の先端（IP）だけを力強く下へ曲げ爪の腹への加圧に抗して……",
    "shimo": "長母趾屈筋をテストするのはどれ？",
    "image": "assets/mmt/toe_ip_flex_hallux_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 158,
    "imgId": "toes_ip_flex_g543",
    "slide": 257,
    "title": "足趾DIP/PIP関節屈曲 (G5/4/3)",
    "region": "足関節・足趾",
    "muscle": "長趾屈筋・短趾屈筋",
    "nerve": "脛骨神経・内側足底神経",
    "root": "L5〜S2",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 基節骨固定・第2〜5趾IP関節屈曲抵抗（足指丸め抵抗）",
    "kami": "足の指をキュッと握るように……",
    "naka": "グレード4〜5、すべての足指の関節を下へ丸め指先を押し上げる抵抗に耐えて……",
    "shimo": "長・短趾屈筋をテストするのはどれ？",
    "image": "assets/mmt/toes_ip_flex_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 159,
    "imgId": "toe_ext_hallux_g543",
    "slide": 258,
    "title": "母趾IP・MP関節伸展 (G5/4/3)",
    "region": "足関節・足趾",
    "muscle": "長母趾伸筋・短母趾伸筋",
    "nerve": "深腓骨神経",
    "root": "L5〜S1",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 足関節中間固定・母指末節骨背側下向き加圧（親指反らし抵抗）",
    "kami": "背臥位で足の親指を上に反らせ……",
    "naka": "グレード4〜5、親指を顔に向けてグッと引き上げ爪への下向き加圧に耐えて……",
    "shimo": "長・短母趾伸筋をテストするのはどれ？",
    "image": "assets/mmt/toe_ext_hallux_g543.png?v=20261029_pure_pose_v6"
  },
  {
    "id": 160,
    "imgId": "toes_ext_g543",
    "slide": 258,
    "title": "第2〜5趾MP・IP関節伸展 (G5/4/3)",
    "region": "足関節・足趾",
    "muscle": "長趾伸筋・短趾伸筋",
    "nerve": "深腓骨神経",
    "root": "L5〜S1",
    "grade": "G5/4/3",
    "pos": "背臥位",
    "vector": "↓ 前足部固定・第2〜5趾背側下向き加圧（足指一括反らし抵抗）",
    "kami": "足の指全体を上に向かって反らし……",
    "naka": "グレード4〜5、指先を反らせた状態で4本の指の背への強い押し下げに耐えて……",
    "shimo": "長・短趾伸筋をテストするのはどれ？",
    "image": "assets/mmt/toes_ext_g543.png?v=20261029_pure_pose_v6"
  }
];


// ============================================================================
// 🎨 画像解決エンジン (全60枚 ダニエルズ解剖線画 直接ロード)
// ============================================================================

// カードの図解画像パスを解決（assets/mmt/{imgId}.png ➔ card.image ➔ fallback）
function getCardResolvedImage(card) {
  if (!card) return '';
  let path = '';
  if (card.imgId) {
    path = `assets/mmt/${card.imgId}.png`;
  } else {
    path = card.image || '';
  }
  if (!path) return '';
  return path.includes('?') ? path : `${path}?v=20261029_pure_pose_v6`;
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
    "id": "shoulder_flex",
    "name": "肩関節屈曲",
    "muscle": "三角筋前部・烏口腕筋",
    "nerve": "腋窩神経・筋皮神経",
    "root": "C5〜C6",
    "agPos": "端座位（前方90°まで腕を挙上 第10版標準）",
    "gePos": "側臥位（検査側を上・検者が腕を支持して水平屈曲）",
    "palpation": "三角筋前部（肩関節前下面）"
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
    const res = await fetch('data/cards.json?v=20261029_pure_pose_v6');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cardDatabase = data.map(c => {
          const defaultRef = DEFAULT_CARDS.find(d => d.id === c.id) || {};
          const rawImg = c.image || defaultRef.image || '';
          const cleanImg = rawImg.split('?')[0];
          const versionedImg = cleanImg ? `${cleanImg}?v=20261029_pure_pose_v6` : '';
          return {
            ...defaultRef,
            ...c,
            image: versionedImg,
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

function updateFilterCounts() {
  const weakEl = document.getElementById('weak-count');
  if (weakEl) weakEl.textContent = mistakeCardIds.size;

  const countMap = {
    'all': cardDatabase.length,
    '頸部・体幹': cardDatabase.filter(c => c.region === '頸部・体幹').length,
    '肩甲帯・肩': cardDatabase.filter(c => c.region === '肩甲帯・肩').length,
    '肘・前腕・手関節': cardDatabase.filter(c => c.region === '肘・前腕・手関節').length,
    '手指・母指': cardDatabase.filter(c => c.region === '手指・母指').length,
    '股・膝': cardDatabase.filter(c => c.region === '股・膝').length,
    '足関節・足趾': cardDatabase.filter(c => c.region === '足関節・足趾').length,
    'weak': mistakeCardIds.size
  };

  document.querySelectorAll('.enc-filter-btn').forEach(btn => {
    const f = btn.getAttribute('data-filter');
    const badge = btn.querySelector('.filter-chip-count');
    if (badge && countMap[f] !== undefined) {
      badge.textContent = countMap[f];
    }
  });
}

function filterEncyclopedia(filterType) {
  currentEncFilter = filterType;
  playSound('card');

  document.querySelectorAll('.enc-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === filterType);
  });

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

  updateFilterCounts();
  let displayCards = cardDatabase;
  if (currentEncFilter === 'weak') {
    displayCards = cardDatabase.filter(c => mistakeCardIds.has(c.id));
  } else if (currentEncFilter !== 'all') {
    displayCards = cardDatabase.filter(c => c.region === currentEncFilter);
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
            
            <div class="kc-art-window" style="height:78px; position:relative;">
              ${renderCardImageTag(c, '', c.title)}
              <button class="kc-zoom-btn" onclick="openImageModal(${c.id}, event)" title="画像を拡大表示">🔍 拡大</button>
            </div>

            <div class="kc-meta">
              <div class="kc-title" title="${c.title}">${c.title}</div>
              <div class="kc-muscle" title="${c.muscle}">${c.muscle}</div>
            </div>
            <div class="kc-footer">
              <span class="kc-vec-text" title="${c.vector || '標準'}">${c.vector || '標準'}</span>
              <span class="kc-pos-pill">${c.pos}</span>
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

  // 【完全重複排除】同一画像（image）および同一動作名（title）の二重出題を徹底防止
  const getImgKey = (c) => (c.image || '').split('?')[0].trim();
  const getTitleBase = (c) => (c.title || '').replace(/\s*\(G.*\)/i, '').trim();

  const selectedImages = new Set([getImgKey(karutaTargetCard)]);
  const selectedTitles = new Set([getTitleBase(karutaTargetCard)]);
  let choices = [karutaTargetCard];

  // 1. 同一体位のダミー候補（画像も動作名も異なるもの）
  const samePosCandidates = pool.filter(c => 
    c.pos === karutaTargetCard.pos &&
    !selectedImages.has(getImgKey(c)) &&
    !selectedTitles.has(getTitleBase(c))
  ).sort(() => Math.random() - 0.5);

  if (samePosCandidates.length > 0) {
    const pick = samePosCandidates[0];
    choices.push(pick);
    selectedImages.add(getImgKey(pick));
    selectedTitles.add(getTitleBase(pick));
  }

  // 2. 残りの選択肢（画像・動作名が重複しないものを全プールから補給）
  const candidatePool = pool.filter(c => 
    !selectedImages.has(getImgKey(c)) &&
    !selectedTitles.has(getTitleBase(c))
  ).sort(() => Math.random() - 0.5);

  for (const c of candidatePool) {
    if (choices.length >= 4) break;
    const imgKey = getImgKey(c);
    const titleKey = getTitleBase(c);
    if (!selectedImages.has(imgKey) && !selectedTitles.has(titleKey)) {
      choices.push(c);
      selectedImages.add(imgKey);
      selectedTitles.add(titleKey);
    }
  }

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

// ============================================================================
// 🔍 画像拡大モーダル制御ロジック
// ============================================================================
function openImageModal(cardId, event) {
  if (event) {
    event.stopPropagation(); // カードの裏表反転を防止
  }
  const card = cardDatabase.find(c => c.id === cardId);
  if (!card) return;

  const overlay = document.getElementById('image-modal-overlay');
  const imgEl = document.getElementById('modal-img');
  const titleEl = document.getElementById('modal-card-title');
  const regionEl = document.getElementById('modal-card-region');
  const gradeEl = document.getElementById('modal-card-grade');
  const posEl = document.getElementById('modal-card-pos');
  const muscleEl = document.getElementById('modal-card-muscle');
  const vectorEl = document.getElementById('modal-card-vector');
  const nerveEl = document.getElementById('modal-card-nerve');

  if (!overlay || !imgEl) return;

  const imgSrc = getCardResolvedImage(card);
  imgEl.src = imgSrc;
  imgEl.alt = card.title;

  if (titleEl) titleEl.textContent = card.title;
  if (regionEl) regionEl.textContent = card.region || 'MMT';
  if (gradeEl) gradeEl.textContent = card.grade || 'G5';
  if (posEl) posEl.textContent = card.pos || '標準肢位';
  if (muscleEl) muscleEl.textContent = card.muscle || '—';
  if (vectorEl) vectorEl.textContent = card.vector || '標準抵抗';
  if (nerveEl) {
    const nerveText = `${card.nerve || '—'}（${card.root || '—'}）`;
    nerveEl.textContent = nerveText;
  }

  overlay.removeAttribute('hidden');
  overlay.classList.add('active');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // 背景スクロール固定
  playSound('card');
}

function closeImageModal() {
  const overlay = document.getElementById('image-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }
  document.body.style.overflow = '';
}

function handleModalOverlayClick(event) {
  if (event.target.id === 'image-modal-overlay') {
    closeImageModal();
  }
}

// ESCキーで閉じる
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeImageModal();
  }
});

window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.handleModalOverlayClick = handleModalOverlayClick;

