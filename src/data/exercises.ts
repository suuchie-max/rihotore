// 種目マスターデータ(要件定義書・種目データ.md を元にしたもの)
// 開始秒などは保護者画面から上書きできるようにする予定。まずは固定値。

export type Category = 'stretch' | 'training' | 'hit';

export interface Video {
  id: string;        // YouTube video ID
  title: string;
  seconds: number;   // 長さ
}

export const VIDEOS: Record<string, Video> = {
  stretch: { id: 'X_eWpbNhxMo', title: '自宅ストレッチ', seconds: 219 },
  training: { id: 'z1KCtDIQzJA', title: '自宅トレーニング', seconds: 225 },
  hit: { id: 'UJ9FVlySyL8', title: 'HIT トレーニング', seconds: 123 },
  rolling: { id: 'YzZtpnFZ2U8', title: 'ローリングヒップロック', seconds: 12 },
  ladder: { id: 'ZSaB61cqzmE', title: 'ラダートレーニング', seconds: 80 },
};

export interface Exercise {
  id: string;
  name: string;
  kana?: string;           // ふりがな(読み上げ・表示用)
  video: keyof typeof VIDEOS;
  start: number;           // 再生開始秒
  reps: number;            // 1セットの回数(または秒数)
  unit: '回' | '秒' | '往復';
  sides?: boolean;         // 右左それぞれ
  sets?: number;           // 時間系の複数セット(ドローイング 5秒×5)
  estimateSec: number;     // 目安時間(1セット分・秒)
  points: string[];        // ポイント3行
  items?: string[];        // 準備物
  timed?: boolean;         // カウントダウンで行う種目
}

export const TRAINING: Exercise[] = [
  { id: 'open-squat', name: 'オープンスクワット', video: 'training', start: 3, reps: 8, unit: '回', estimateSec: 30,
    points: ['足は肩幅の2倍に広げて、つま先は外向き45°', '手で膝を内側に押しながら、膝は負けずに外へ', 'お尻を後ろに引くイメージでしゃがむ'] },
  { id: 'hip-lift', name: 'ヒップリフト', video: 'training', start: 34, reps: 10, unit: '回', estimateSec: 35,
    points: ['あお向けで膝を立てる。足はハの字、膝の間はグー1個分', 'お尻をキュッと締めながら持ち上げる', '肩から膝まで一直線になったら1秒キープ'] },
  { id: 'calf-raise', name: 'カーフレイズ', video: 'training', start: 51, reps: 10, unit: '回', estimateSec: 25, items: ['壁'],
    points: ['壁に手をついて立つ', 'かかとをできるだけ高く、まっすぐ上げる', 'ゆっくり下ろす(ストンと落とさない)'] },
  { id: 'pushup', name: 'ワキ閉め腕立て伏せ', video: 'training', start: 80, reps: 7, unit: '回', estimateSec: 30,
    points: ['ワキを閉めて、ひじは体の横', '頭を前に出すように下りる', '体はまっすぐ(お尻が上がったり下がったりしない)'] },
  { id: 'drawing', name: 'ドローイング', video: 'training', start: 101, reps: 5, unit: '秒', sets: 5, timed: true, estimateSec: 50, items: ['タオル'],
    points: ['タオルを腰骨の少し上に巻いて、あお向けになる', 'お腹をへこませながらタオルを引く。5秒キープ', '腰骨が動かないように手で押さえる'] },
  { id: 'clamshell', name: 'クラムシェル', video: 'training', start: 128, reps: 15, unit: '回', sides: true, estimateSec: 60,
    points: ['横向きに寝て、膝を軽く曲げる', 'かかとをくっつけたまま、上の膝を開く(貝が開くみたいに)', '体が後ろに倒れないように。左右どちらも'] },
  { id: 'plank', name: 'プランク', video: 'training', start: 147, reps: 20, unit: '秒', timed: true, estimateSec: 25,
    points: ['ひじとつま先で体を支える', '頭からかかとまで一直線', '背中が丸まったり反ったりしない。20秒キープ'] },
  { id: 'chest-open', name: '胸開き', kana: 'むねひらき', video: 'training', start: 161, reps: 15, unit: '回', sides: true, estimateSec: 60,
    points: ['四つんばいになって、片手を頭の後ろに', 'ひじを天井に向けて胸を開く。目線はひじ', '腰は動かさない。左右どちらも'] },
  { id: 'hip-lock', name: 'ヒップロック', video: 'training', start: 189, reps: 7, unit: '回', sides: true, estimateSec: 40, items: ['ボール'],
    points: ['ボールを両手で持って片足立ち', '浮いた足の膝を、もう片方の膝より高く上げる', '自分の中の全速力で!ぐらつかないように。左右どちらも'] },
  { id: 'hip-rotation', name: 'ヒップローテーション', video: 'training', start: 203, reps: 5, unit: '往復', sides: true, estimateSec: 50, items: ['タオル'],
    points: ['あお向けで片足を上げ、足の裏にタオルをのせる', 'タオルを落とさないように、うつ伏せ→あお向けに転がる', '1往復で1回。左右どちらも'] },
  { id: 'rolling-hip-lock', name: 'ローリングヒップロック', video: 'rolling', start: 0, reps: 5, unit: '回', sides: true, estimateSec: 50,
    points: ['あお向けから転がって、片足立ちで立ち上がる', '立ったとき、浮いた足の膝を高く上げる(ヒップロックの形)', '同じ足で5回続けて。左右どちらも'] },
];

export const HIT_MOVES = [
  { name: 'スクワット', start: 1 },
  { name: 'バックランジ', start: 18 },
  { name: 'サイドランジ', start: 32 },
  { name: 'デッドリフト', start: 47 },
  { name: 'プッシュアップ(膝つき)', start: 63 },
  { name: 'バービー', start: 77 },
  { name: 'サイクリング', start: 92 },
  { name: 'ツイストクランチ', start: 106 },
];

export const STRETCH_PARTS = [
  { name: 'もも裏(ハムストリングス)', start: 0 },
  { name: '太もも(大腿四頭筋)', start: 43 },
  { name: 'お尻・股関節', start: 70 },
  { name: '股関節(腸腰筋)', start: 97 },
  { name: '肩・背中', start: 120 },
  { name: '胸(大胸筋)', start: 162 },
];

export const REST_SEC = 30;          // 種目間の休憩
export const MAX_ROUNDS = 3;
export const STRETCH_ESTIMATE_SEC = 300;
export const HIT_ESTIMATE_SEC = 130;

// 曜日スケジュール(0=日 … 6=土)
export const SCHEDULE: Record<number, { stretch: boolean; training: boolean; hit: boolean; practice: boolean }> = {
  0: { stretch: true, training: true, hit: true, practice: true },   // 日
  1: { stretch: true, training: true, hit: false, practice: false }, // 月
  2: { stretch: true, training: false, hit: false, practice: true }, // 火
  3: { stretch: true, training: false, hit: false, practice: true }, // 水
  4: { stretch: true, training: true, hit: true, practice: false },  // 木
  5: { stretch: true, training: true, hit: false, practice: false }, // 金
  6: { stretch: true, training: false, hit: false, practice: true }, // 土
};

export const WAKE_DEADLINE = { hour: 6, minute: 30 };
export const POINTS_PER_YEN = { points: 5, yen: 100 };

export function roundEstimateSec(): number {
  const ex = TRAINING.reduce((s, e) => s + e.estimateSec, 0);
  return ex + REST_SEC * (TRAINING.length - 1);
}
