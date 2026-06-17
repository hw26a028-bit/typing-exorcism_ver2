export interface Ghost {
  id: string;
  name: string;
  subName: string;
  description: string;
  hp: number;
  maxHp: number;
  level: number;
  auraColor: string; // Tailwind class border/shadow accent
  bgGradient: string; // Tailwind gradient for active field
  elementColor: string; // Primary colored sparks
  purifiedMessage: string;
  scaryQuote: string;
}

export interface Chant {
  kanji: string;      // What we show first (Kanji/Kana)
  kana: string;       // Hiragana guide
  romaji: string;     // The clean romaji equivalent for typing
  romajiSpace?: string; // Romaji with syllables separated for clear reading
  power: number;      // base damage multiplier
  meaning: string;    // Japanese simple meaning/translation
}

export const GHOSTS: Ghost[] = [
  {
    id: "samurai",
    name: "落ち武者の怨霊",
    subName: "Spiteful Samurai Wraith",
    description: "関ヶ原の戦いで果て、無念のあまりこの地にとどまり続ける鎧武者の霊。義と未練を呟いている。",
    hp: 120,
    maxHp: 120,
    level: 1,
    auraColor: "shadow-[0_0_25px_rgba(34,197,94,0.6)] border-emerald-500",
    bgGradient: "from-slate-950 via-emerald-950/20 to-slate-950",
    elementColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    purifiedMessage: "無念は晴れた…これで、安らかに眠れる…",
    scaryQuote: "我が魂、いまだ戦場にあり…貴殿、勝負せよ…！"
  },
  {
    id: "okiku",
    name: "呪いのお菊人形",
    subName: "Cursed Okiku Doll",
    description: "持ち主が手放した後も、髪が伸び続ける呪いの人形。夜な夜な小さな女の子の声で笑うという。",
    hp: 200,
    maxHp: 200,
    level: 2,
    auraColor: "shadow-[0_0_25px_rgba(219,39,119,0.6)] border-pink-500",
    bgGradient: "from-slate-950 via-pink-950/20 to-slate-950",
    elementColor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    purifiedMessage: "ありがとう…これで可愛い人形に戻れるね…バイバイ…",
    scaryQuote: "ふふ…私よりも、そっちの髪のほうが綺麗かも…"
  },
  {
    id: "hanako",
    name: "トイレの花子さん",
    subName: "Toilet Hanako-san",
    description: "旧校舎の3番目の個室に潜む、おかっぱ頭に赤い吊りスカートの少女。遊んでくれる友達を探している。",
    hp: 300,
    maxHp: 300,
    level: 3,
    auraColor: "shadow-[0_0_25px_rgba(239,68,68,0.6)] border-red-500",
    bgGradient: "from-slate-950 via-red-950/20 to-slate-950",
    elementColor: "text-red-400 bg-red-500/10 border-red-500/30",
    purifiedMessage: "楽しかった！また放課後、一緒に遊んでね…！",
    scaryQuote: "だぁれ、ノックしたのは…？一緒に鬼ごっこしよぅ…？"
  },
  {
    id: "kuchisake",
    name: "裂口の女",
    subName: "Slit-Mouthed Specter",
    description: "マスクを着用し、大きなハサミを携えた異形の美女の霊。その口は耳元まで大きく裂けている。",
    hp: 450,
    maxHp: 450,
    level: 4,
    auraColor: "shadow-[0_0_25px_rgba(168,85,247,0.6)] border-purple-500",
    bgGradient: "from-slate-950 via-purple-950/20 to-slate-950",
    elementColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    purifiedMessage: "私の顔、今はちょっとだけ、綺麗に見えるかしら…うふふ…",
    scaryQuote: "わ・た・し、きれい…？それとも、これでも…？"
  },
  {
    id: "kyubi",
    name: "九尾の妖狐・玉藻前",
    subName: "Ancient Nine-Tailed Deity",
    description: "絶大なる妖力を持ち、かつて国を傾けた伝説の大妖。九本の尾から黄金の炎を放ち、俗界を蔑視する。",
    hp: 650,
    maxHp: 650,
    level: 5,
    auraColor: "shadow-[0_0_30px_rgba(245,158,11,0.7)] border-amber-500",
    bgGradient: "from-slate-950 via-amber-950/20 to-slate-950",
    elementColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    purifiedMessage: "ふ、見事なり人間よ。その言霊の光、我が魂を癒やしたぞ…",
    scaryQuote: "愚かしき人間どもめ、言霊の真の力を示してみせよ！"
  },
  {
    id: "masakado",
    name: "平将門の超怨霊",
    subName: "Divine Wrath of Masakado",
    description: "帝都の守護神にして最強の怨霊。千年の怒りを込めた神鳴を轟かせ、天変地異を引き起こす究極の霊体。",
    hp: 1000,
    maxHp: 1000,
    level: 6,
    auraColor: "shadow-[0_0_35px_rgba(59,130,246,0.8)] border-cyan-500 border-2",
    bgGradient: "from-slate-950 via-cyan-950/35 to-slate-950",
    elementColor: "text-cyan-400 bg-cyan-400/10 border-cyan-500/40",
    purifiedMessage: "我が怒りの雷、ついに静まりぬ。この国の未来、そなたに託そう…",
    scaryQuote: "天をも穿つ我が逆鱗、タイピングの熱量をもって鎮めてみせよ！"
  }
];

export const CHANTS: Chant[] = [
  // Tier 1 - Simple / Protective (power <= 1.3)
  {
    kanji: "悪霊退散！",
    kana: "あくりょうたいさん！",
    romaji: "akuryoutaisan!",
    romajiSpace: "a ku ryo u ta i sa n !",
    power: 1.0,
    meaning: "不浄な霊を追い払う、最も基礎的な除霊呪文。"
  },
  {
    kanji: "清めの塩を受けよ！",
    kana: "きよめのしおをうけよ！",
    romaji: "kiyomenoshiowoukeyo!",
    romajiSpace: "ki yo me no shi o wo u ke yo !",
    power: 1.1,
    meaning: "清浄な塩の結晶で悪しきオーラを溶かすスペル。"
  },
  {
    kanji: "急急如律令！",
    kana: "きゅうきゅうにょりつりょう！",
    romaji: "kyuukyuunyoritsuryou!",
    romajiSpace: "kyu u kyu u nyo ri tsu ryo u !",
    power: 1.25,
    meaning: "陰陽道において、神速での命令実行を促す呪符の締め括り。"
  },
  {
    kanji: "不浄の穢れを祓わん！",
    kana: "ふじょうのけがれをはらわん！",
    romaji: "fujounokegarewoharawan!",
    romajiSpace: "fu jo u no ke ga re wo ha ra wa n !",
    power: 1.15,
    meaning: "場に沈殿した邪念と澱みを取り除く、陰陽師の基本呪詛。"
  },
  {
    kanji: "神水散布の儀",
    kana: "しんすいさんぷのぎ",
    romaji: "shinsuisanpunogi",
    romajiSpace: "shi n su i sa n pu no gi",
    power: 1.2,
    meaning: "神聖な冷水を撒くことで霊体の活動エネルギーを冷却・減衰させる。"
  },
  {
    kanji: "邪気を打ち砕く一撃！",
    kana: "じゃきをうちくだくいちげき！",
    romaji: "jakiwouchikudakuichigeki!",
    romajiSpace: "ja ki wo u chi ku da ku i chi ge ki !",
    power: 1.3,
    meaning: "正面から言霊の拳で霊障壁にひびを入れる直接的な打撃法。"
  },
  
  // Tier 2 - Buddhist / Spiritual (power > 1.0 && power <= 1.8)
  {
    kanji: "五穀豊穣の祝福",
    kana: "ごこくほうじょうのしゅくふく",
    romaji: "gokokuhoujounoshukufuku",
    romajiSpace: "go ko ku ho u jo u no shu ku fu ku",
    power: 1.3,
    meaning: "豊穣の霊気を呼び起こし、飢えた餓鬼の魂を満足させる。"
  },
  {
    kanji: "南無阿弥陀仏",
    kana: "なむあみだぶつ",
    romaji: "namuamidabutsu",
    romajiSpace: "na mu a mi da bu tsu",
    power: 1.4,
    meaning: "阿弥陀如来に帰依し、極楽浄土への成仏を熱狂的に願う念仏。"
  },
  {
    kanji: "般若心経の功徳",
    kana: "はんにゃしんぎょうのくどく",
    romaji: "hannyashingyounokudoku",
    romajiSpace: "ha n n ya shi n gyo u no ku do ku",
    power: 1.5,
    meaning: "空（くう）の真理を解き明かし、怨念の執着を根源から解きほぐす。"
  },
  {
    kanji: "光明真言オン・アボキャ",
    kana: "こうみょうしんごんおんあぼきゃ",
    romaji: "koumyoushingononabokya",
    romajiSpace: "ko u myo u shi n go n o n a bo ky a",
    power: 1.6,
    meaning: "大日如来の光明を呼び起こし、あらゆる罪障を消滅せしめる真言。"
  },
  {
    kanji: "不動明王の猛火！",
    kana: "ふどうみょうおうのもうか！",
    romaji: "fudoumyouounomouka!",
    romajiSpace: "fu dou myo u o u no mo u ka !",
    power: 1.7,
    meaning: "一切の煩悩と悪霊を焼き尽くす不動尊の劫火をまとう。"
  },
  {
    kanji: "神羅万象の加護ここに！",
    kana: "しんらばんしょうのかごここに！",
    romaji: "shinrabanshounokagokokoni!",
    romajiSpace: "shi n ra ba n sho u no ka go ko ko ni !",
    power: 1.65,
    meaning: "この世の万物から精霊の息吹を少しずつ借り受け、障壁を破る。"
  },

  // Tier 3 - Elemental / Spellbinding (power > 1.0 && power <= 1.8)
  {
    kanji: "天雷招来！悪を浄化せよ！",
    kana: "てんらいしょうらい！あくをじょうかせよ！",
    romaji: "tenraishourai!akuwojoukaseyo!",
    romajiSpace: "te n ra i sho u ra i ! a ku wo jo u ka se yo !",
    power: 1.65,
    meaning: "天空から神聖な雷霆を呼び寄せ、漆黒の呪障を粉砕する呪詛返し。"
  },
  {
    kanji: "六根清浄！汚れを祓う！",
    kana: "ろっこんしょうじょう！けがれをはらう！",
    romaji: "rokkonshoujou!kegarewoharau!",
    romajiSpace: "ro k ko n sho u jo u ! ke ga re wo ha ra u !",
    power: 1.8,
    meaning: "眼・耳・鼻・舌・身・意のすべてを浄め、無双の霊界障壁を展開する。"
  },
  {
    kanji: "迷える魂よ、光に還れ",
    kana: "まよえるたましいよ、ひかりにかえれ",
    romaji: "mayoeretamashiiyo,hikarinikaere",
    romajiSpace: "ma yo e re ta ma shi i yo , hi ka ri ni ka e re",
    power: 1.9,
    meaning: "迷妄なる暗闇から魂を解き放ち、輪廻の川へといざなう慈愛の詩。"
  },
  {
    kanji: "火徳九天大将軍の召喚！",
    kana: "かとくきゅうてんだいしょうぐんのしょうかん！",
    romaji: "katokukyuutendaishougunnoshoukan!",
    romajiSpace: "ka to ku kyu u te n da i sho u gu n no sho u ka n !",
    power: 1.75,
    meaning: "火を司る伝説 of 守護軍才を召喚し、冷徹な霊体を焼き滅ぼす豪快な術。"
  },
  {
    kanji: "白刃一閃、怨念両断！",
    kana: "はくじんいっせん、おんねんりょうだん！",
    romaji: "hakujinissen,onnenryoudan!",
    romajiSpace: "ha ku ji n i s se n , o n ne n ryo u da n !",
    power: 1.85,
    meaning: "心魂を鉄鋼に凝縮し、恨みをため込んだ未練の糸を物理的に断ち切る。"
  },

  // Tier 4 - Secret Ancient Rites (power >= 1.4)
  {
    kanji: "臨兵闘者皆陣烈在前！",
    kana: "りんぴょうとうしゃかいじんれつざいぜん！",
    romaji: "rinbyoutoushaakaijinretsuzaizen!",
    romajiSpace: "ri n byo u to u sha ka i ji n re tsu za i ze n !",
    power: 2.2,
    meaning: "九字護身法。戦いに臨む兵の闘志を借りて一切の邪悪を破却する絶対印。"
  },
  {
    kanji: "大宇宙に響く妙法の調べ",
    kana: "だいうちゅうにひびくみょうほうのしらべ",
    romaji: "daiuchuunihibikubyouhounoshirabe",
    romajiSpace: "da i u chu u ni hi bi ku myo u ho u no shi ra be",
    power: 2.5,
    meaning: "宇宙の絶対法則たる調和のメロディ。如何なる怨霊もこの前には平伏し、光へと還る。"
  },
  {
    kanji: "諸行無常の流転に沈め",
    kana: "しょぎょうむじょうのるてんにしずめ",
    romaji: "shogyoumujonorutennishizume",
    romajiSpace: "sho gyo u mu jo u no ru te n ni shi zu me",
    power: 2.1,
    meaning: "すべては移ろいゆくという無常観を精神波として放ち、居座り続ける執念を希釈する。"
  },
  {
    kanji: "八百万の神々の風を巻き起こせ！",
    kana: "やおよろずのかみがみのかぜをまきおこせ！",
    romaji: "yaoyorozunokamigaminokazewomakiokose!",
    romajiSpace: "ya o yo ro zu no ka mi ga mi no ka ze wo ma ki o ko se !",
    power: 2.3,
    meaning: "神無月すら覆す瑞祥たる神風を放ち、蓄積された邪毒を一網打尽にする広範奥義。"
  }
];
