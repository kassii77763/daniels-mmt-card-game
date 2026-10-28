/**
 * 🎯 slide_mapping.js
 * ダニエルズ第10版スライド番号およびイラスト位置（Left / Right / Center / Custom）の完全精密マスター定義
 */

module.exports = {
  // --- 頸部 (Neck) ---
  neck_flex_g543: { slide: 45, region: 'figure_2_26', desc: 'Combined Cervical Flexion G5/4/3 (背臥位・前額部抵抗)' },
  neck_flex_g2: { slide: 45, region: 'figure_2_27', desc: 'Combined Cervical Flexion G2/1 (背臥位・自重頭部挙上)' },
  neck_ext_g543: { slide: 36, region: 'figure_2_12', desc: 'Combined Neck Extension G5/4/3 (腹臥位・頭部ベッド外下垂・後頭部加圧)' },
  neck_ext_g2: { slide: 37, region: 'figure_2_14', desc: 'Combined Neck Extension G2/1 (ベッド上腹臥位・胸背部固定・頭部挙上)' },

  // --- 体幹 (Trunk) ---
  trunk_flex_g5: { slide: 60, region: 'figure_3_16', desc: 'Trunk Flexion G5 (後頭部手組み・肩甲骨離床)' },
  trunk_flex_g4: { slide: 61, region: 'figure_3_18', desc: 'Trunk Flexion G4 (胸の前腕交叉・肩甲骨離床)' },
  trunk_flex_g3: { slide: 61, region: 'figure_3_19', desc: 'Trunk Flexion G3 (上肢前方伸展・肩甲骨離床)' },
  trunk_flex_g2: { slide: 62, region: 'figure_3_20', desc: 'Trunk Flexion G2/1 (腹直筋触診)' },
  trunk_ext_g54: { slide: 54, region: 'left', desc: 'Trunk Extension G5/4 (腹臥位・後頭部手組み・胸部離床)' },
  trunk_ext_g3: { slide: 54, region: 'right', desc: 'Trunk Extension G3 (腹臥位・上肢体側・胸部離床)' },
  trunk_ext_g2: { slide: 55, region: 'figure_3_8', desc: 'Trunk Extension G2/1 (腹臥位・腰背筋/胸背筋触診)' },
  trunk_rot_g5: { slide: 65, region: 'center', desc: 'Trunk Rotation G5 (後頭部手組み・体幹回旋)' },
  trunk_rot_g4: { slide: 66, region: 'left', desc: 'Trunk Rotation G4 (胸の前腕交叉・体幹回旋)' },
  trunk_rot_g2: { slide: 67, region: 'center', desc: 'Trunk Rotation G2/1 (上肢前方伸展/腹斜筋触診)' },

  // --- 肩甲骨 (Scapula) ---
  scap_abd_g543: { slide: 81, region: 'figure_4_6', desc: 'Scapular Abduction G5/4/3 (端座位・上肢前突・肘上加圧)' },
  scap_abd_g2: { slide: 82, region: 'center', desc: 'Scapular Abduction G2/1 (端座位・前鋸筋触診)' },
  scap_elev_g543: { slide: 85, region: 'left', desc: 'Scapular Elevation G5/4/3 (端座位・肩挙上・僧帽筋上部抵抗)' },
  scap_add_g543: { slide: 89, region: 'left', desc: 'Scapular Adduction G5/4/3 (腹臥位・僧帽筋中部)' },
  scap_dep_g543: { slide: 92, region: 'figure_4_27', desc: 'Scapular Depression & Adduction G5/4/3 (腹臥位・僧帽筋下部抵抗位)' },

  scap_rhomb_g543: { slide: 96, region: 'center', desc: 'Scapular Adduction & Downward Rotation G5/4/3 (菱形筋)' },
  scap_rhomb_g2: { slide: 97, region: 'left', desc: 'Scapular Adduction & Downward Rotation G2/1' },

  // --- 肩関節 (Shoulder) ---
  sh_flex_g543: { slide: 102, region: 'left', desc: 'Shoulder Flexion G5/4/3 (端座位・上腕遠位加圧)' },
  sh_flex_g2: { slide: 102, region: 'right', desc: 'Shoulder Flexion G2/1 (側臥位・重力除去位/三角筋前部触診)' },
  sh_ext_g543: { slide: 106, region: 'center', desc: 'Shoulder Extension G5/4/3 (腹臥位・上肢伸展加圧)' },
  sh_ext_g2: { slide: 107, region: 'left', desc: 'Shoulder Extension G2/1 (腹臥位/広背筋・大円筋触診)' },
  sh_abd_g543: { slide: 110, region: 'center', desc: 'Shoulder Abduction G5/4/3 (端座位・外転加圧)' },
  sh_abd_g2: { slide: 111, region: 'left', desc: 'Shoulder Abduction G2/1 (背臥位・重力除去面)' },
  sh_habd_g543: { slide: 114, region: 'center', desc: 'Shoulder Horizontal Abduction G5/4/3 (腹臥位・水平外転)' },
  sh_hadd_g543: { slide: 119, region: 'left', desc: 'Shoulder Horizontal Adduction G5/4/3 (背臥位・水平内転)' },
  sh_er_g543: { slide: 122, region: 'center', desc: 'Shoulder External Rotation G5/4/3 (腹臥位・外旋抵抗)' },
  sh_er_g2: { slide: 123, region: 'left', desc: 'Shoulder External Rotation G2/1 (端座位・重力除去位)' },
  sh_ir_g543: { slide: 126, region: 'center', desc: 'Shoulder Internal Rotation G5/4/3 (腹臥位・内旋抵抗)' },
  sh_ir_g2: { slide: 127, region: 'left', desc: 'Shoulder Internal Rotation G2/1 (端座位・重力除去位)' },

  // --- 肘関節・前腕・手関節 (Elbow, Forearm, Wrist) ---
  elbow_flex_g543: { slide: 130, region: 'center', desc: 'Elbow Flexion G5/4/3 (端座位・前腕前腕抵抗)' },
  elbow_flex_g2: { slide: 131, region: 'left', desc: 'Elbow Flexion G2/1 (端座位・上肢外転台支持)' },
  elbow_ext_g543: { slide: 134, region: 'center', desc: 'Elbow Extension G5/4/3 (腹臥位・前腕伸展抵抗)' },
  elbow_ext_g2: { slide: 135, region: 'left', desc: 'Elbow Extension G2/1 (端座位・外転支持重力除去)' },
  forearm_pron_sup_g5432: { slide: 139, region: 'center', desc: 'Forearm Supination & Pronation (端座位)' },
  wrist_flex_g543: { slide: 148, region: 'center', desc: 'Wrist Flexion G5/4/3 (端座位・前腕回外位抵抗)' },
  wrist_ext_g543: { slide: 152, region: 'figure_4_152', desc: 'Wrist Extension G5/4/3 (端座位・前腕回内位抵抗)' },
  wrist_ext_g2: { slide: 153, region: 'figure_4_153', desc: 'Wrist Extension G2/1 (端座位・前腕中間位重力除去)' },

  // --- 股関節 (Hip) ---
  hip_flex_g543: { slide: 195, region: 'left', desc: 'Hip Flexion G5/4/3 (端座位・大腿遠位抵抗)' },
  hip_flex_g2: { slide: 196, region: 'left', desc: 'Hip Flexion G2/1 (側臥位・下肢支持重力除去)' },
  hip_ext_g543: { slide: 203, region: 'figure_5_21', desc: 'Hip Extension G5/4/3 (腹臥位・大腿遠位下垂加圧)' },
  hip_ext_g2: { slide: 204, region: 'left', desc: 'Hip Extension G2/1 (側臥位・下肢支持重力除去)' },
  hip_abd_g543: { slide: 212, region: 'center', desc: 'Hip Abduction G5/4/3 (側臥位・足関節近位加圧)' },
  hip_abd_g2: { slide: 213, region: 'left', desc: 'Hip Abduction G2/1 (背臥位・重力除去面)' },
  hip_add_g543: { slide: 220, region: 'left', desc: 'Hip Adduction G5/4/3 (側臥位・上側下肢挙上支持下)' },
  hip_add_g2: { slide: 220, region: 'right', desc: 'Hip Adduction G2/1 (背臥位・重力除去面)' },
  hip_er_g543: { slide: 224, region: 'left', desc: 'Hip External Rotation G5/4/3 (端座位・下腿内側加圧)' },
  hip_ir_g543: { slide: 227, region: 'center', desc: 'Hip Internal Rotation G5/4/3 (端座位・下腿外側加圧)' },

  // --- 膝関節 (Knee) ---
  knee_flex_g543: { slide: 231, region: 'center', desc: 'Knee Flexion G5/4/3 (腹臥位・下腿遠位加圧)' },
  knee_flex_g2: { slide: 233, region: 'left', desc: 'Knee Flexion G2/1 (側臥位・下肢支持重力除去)' },
  knee_ext_g543: { slide: 237, region: 'center', desc: 'Knee Extension G5/4/3 (端座位・下腿遠位加圧)' },
  knee_ext_g2: { slide: 238, region: 'left', desc: 'Knee Extension G2/1 (側臥位・下肢支持重力除去)' },

  // --- 足関節・足部 (Ankle & Foot) ---
  ankle_pf_g543: { slide: 241, region: 'center', desc: 'Ankle Plantar Flexion G5/4/3 (立位片脚踵上げ)' },
  ankle_pf_g2: { slide: 245, region: 'left', desc: 'Ankle Plantar Flexion G2/1 (腹臥位・足部下垂位)' },
  ankle_df_g5432: { slide: 249, region: 'center', desc: 'Foot Dorsiflexion & Inversion (端座位・足背加圧)' },
  foot_inv_g543: { slide: 251, region: 'center', desc: 'Foot Inversion G5/4/3 (端座位・足底内側加圧)' },
  foot_ev_g543: { slide: 254, region: 'figure_5_115', desc: 'Foot Eversion G5/4/3 (端座位・足部外側加圧)' }
};
