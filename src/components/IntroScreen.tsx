import React from "react";
import { motion } from "motion/react";
import { Ghost, GHOSTS } from "../data";

interface IntroScreenProps {
  onStartGame: () => void;
  onOpenEncyclopedia: () => void;
  highScore: number;
  unlockedGhosts: string[];
}

export function IntroScreen({ onStartGame, onOpenEncyclopedia, highScore, unlockedGhosts }: IntroScreenProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-1 flex flex-col items-center justify-center text-center select-none h-full min-h-0 overflow-hidden">
      {/* Title Group with floating spirit sparks on the background */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md flex flex-col items-center justify-center flex-shrink-0 mt-3 sm:mt-4 space-y-2"
      >
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-emerald-400/30 pointer-events-none z-0"
            style={{
              width: Math.random() * 6 + 4,
              height: Math.random() * 6 + 4,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 60 + 20}%`,
            }}
            animate={{
              y: [0, -60],
              opacity: [0, 0.7, 0],
              scale: [1, 1.5, 0.5]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut"
            }}
          />
        ))}

        <span className="relative z-10 font-mono text-[10px] sm:text-xs text-emerald-400 font-bold uppercase tracking-[0.25em] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          霊能調和アクション
        </span>

        {/* Title Logo (centered where Torii Gate used to be, with beautiful mystical shadow and animation) */}
        <motion.div 
          className="relative z-10 w-full flex justify-center py-2"
          animate={{
            y: [-3, 3, -3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img 
            src="/title.png" 
            alt="幽霊タイピング除霊" 
            className="max-h-24 sm:max-h-32 md:max-h-36 w-auto h-auto object-contain select-none pointer-events-none drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <p className="relative z-10 text-xs font-sans text-slate-400 max-w-md mx-auto px-2">
          キーに宿る言霊の力を引き出し、はびこる怨霊たちをその正確なタッチで成仏させる和風タイピングゲーム。
        </p>
      </motion.div>

      {/* Quick Game Info */}
      <div className="grid grid-cols-3 gap-2 max-w-md w-full mt-3 p-2 sm:p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-300 flex-shrink-0 text-xs text-center">
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-500 font-medium">最高スコア</span>
          <span className="font-mono text-sm sm:text-base text-yellow-400 font-semibold mt-0.5">
            {highScore.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center border-x border-slate-800 px-1">
          <span className="text-[10px] text-slate-500 font-medium">成仏怨霊</span>
          <span className="font-mono text-sm sm:text-base text-emerald-400 font-semibold mt-0.5">
            {unlockedGhosts.length} / {GHOSTS.length} 体
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-500 font-medium">現世暦</span>
          <span className="font-mono text-[10px] sm:text-xs text-cyan-400 mt-1">
            2026-06-11
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div id="intro-actions" className="flex gap-3 mt-4 w-full max-w-sm justify-center flex-shrink-0">
        {/* Start Game Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartGame}
          className="flex-1 py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-serif tracking-widest shadow-lg shadow-emerald-500/10 transition-colors cursor-pointer text-sm sm:text-base"
        >
          除霊に赴く
        </motion.button>

        {/* Encyclopedia Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenEncyclopedia}
          className="flex-1 py-2 px-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium font-serif tracking-wider transition-all cursor-pointer text-xs sm:text-sm"
        >
          怨霊絵巻 (図鑑)
        </motion.button>
      </div>

      {/* Instruction Box */}
      <div className="max-w-md bg-slate-950/30 border border-slate-900 rounded-xl p-2.5 sm:p-3 mt-3 text-left flex-shrink-0 text-[11px] sm:text-xs">
        <h3 className="text-xs font-bold font-serif text-slate-300 mb-1 flex items-center">
          <span className="w-1.5 h-2.5 bg-emerald-500 mr-1.5 rounded-full inline-block" />
          霊媒術（言霊の発動手順）
        </h3>
        <ol className="text-slate-400 space-y-1 list-decimal list-inside leading-snug">
          <li>
            表示される<strong className="text-slate-200">「除霊の言霊（読み）」</strong>を半角英数でタイピング。
          </li>
          <li>
            打ち終えると、<strong className="text-emerald-400">正確さと速度</strong>から算出した神威ダメージを投射。
          </li>
          <li>
            怨霊の魂を<strong className="text-pink-400 font-medium">成仏</strong>させれば勝利。精度が低いと強力な反撃を受けます。
          </li>
        </ol>
      </div>
    </div>
  );
}
