import React, { useState } from "react";
import { motion } from "motion/react";
import { Ghost, GHOSTS } from "../data";
import { GhostVisual } from "./GhostVisual";

interface EncyclopediaProps {
  onClose: () => void;
  unlockedGhosts: string[]; // List of ghost ids met/exorcised
}

export function Encyclopedia({ onClose, unlockedGhosts }: EncyclopediaProps) {
  const [selectedGhost, setSelectedGhost] = useState<Ghost>(GHOSTS[0]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-1.5 md:py-3 select-none h-full min-h-0 flex flex-col justify-start overflow-hidden">
      {/* Header with Title & Back Button */}
      <div id="encyclopedia-header" className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-900 pb-2 mb-3 flex-shrink-0">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-widest">
            怨霊絵巻 <span className="text-slate-500 font-sans text-xs sm:text-sm">/ Ghost Encyclopedia</span>
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5">
            これまでに相見え、成仏させた不浄の魂たちの記録。
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="mt-2 sm:mt-0 px-4 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold tracking-wider transition-all cursor-pointer font-serif flex items-center"
        >
          ← 門前へ戻る
        </motion.button>
      </div>

      {/* Main Grid: Left is ghost index, Right is details panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-start min-h-0 h-full overflow-hidden">
        {/* Left Side: Scrollable List of Ghosts of standard index */}
        <div className="md:col-span-5 space-y-1.5 max-h-[38vh] md:max-h-[72vh] overflow-y-auto pr-1.5 custom-scrollbar h-full">
          {GHOSTS.map((g) => {
            const isUnlocked = unlockedGhosts.includes(g.id) || g.level === 1; // Level 1 is always unlocked for view
            const isSelected = selectedGhost.id === g.id;

            return (
              <div
                key={g.id}
                onClick={() => setSelectedGhost(g)}
                className={`p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  isSelected 
                    ? "border-emerald-500 bg-emerald-950/20" 
                    : "border-slate-900 bg-slate-950 hover:border-slate-800"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar Circle */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-serif text-xs font-bold border ${
                    isUnlocked 
                      ? "bg-slate-900 text-emerald-400 border-slate-700" 
                      : "bg-slate-950 text-slate-600 border-slate-900"
                  }`}>
                    {isUnlocked ? `伍_${g.level}` : "？"}
                  </div>

                  <div>
                    <h3 className={`font-serif font-bold text-xs sm:text-sm ${isUnlocked ? "text-slate-100" : "text-slate-500"}`}>
                      {isUnlocked ? g.name : "未確認の怨霊"}
                    </h3>
                    <p className="text-[9px] text-slate-500 font-mono">
                      {isUnlocked ? g.subName : "Unknown Spirit"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-serif px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    危険度: {g.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Showcase View of selected Ghost */}
        <div id="showcase-view" className="md:col-span-7 bg-slate-900/40 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center h-full max-h-[45vh] md:max-h-[72vh] overflow-y-auto custom-scrollbar">
          {(() => {
            const isUnlocked = unlockedGhosts.includes(selectedGhost.id) || selectedGhost.level === 1;
            
            if (!isUnlocked) {
              return (
                <div className="w-full text-center py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <h3 className="text-xl font-bold font-serif text-slate-400">怨念のベールに包まれている</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    実戦でこの怨霊を討伐、または遭遇することで魂の記録が開放されます。
                  </p>
                  <p className="text-xs font-mono text-emerald-500/80 uppercase tracking-widest pt-2">
                    必要な危険レベル: 第 {selectedGhost.level} 層
                  </p>
                </div>
              );
            }

            return (
              <div className="w-full flex flex-col items-center">
                {/* Visualizer */}
                <div className="w-full border-b border-slate-800/60 pb-1.5 mb-2">
                  <GhostVisual 
                    ghostId={selectedGhost.id} 
                    isDamaged={false} 
                    isPurified={false} 
                    hpPercent={1.0} 
                  />
                </div>

                {/* Lore / Descriptions */}
                <div className="w-full text-left space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-emerald-400">
                      {selectedGhost.name}
                    </h3>
                    <span className="font-mono text-slate-500 text-[10px] sm:text-xs">
                      {selectedGhost.subName}
                    </span>
                  </div>

                  {/* Core Stats */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/60 text-center p-2 rounded-xl border border-slate-800 font-mono text-xs text-slate-400">
                    <div>
                      <span className="block text-[9px] text-slate-500 font-sans">危険階級</span>
                      <strong className="text-red-400 text-xs sm:text-sm font-semibold">{selectedGhost.level}</strong>
                    </div>
                    <div className="border-x border-slate-800">
                      <span className="block text-[9px] text-slate-500 font-sans">基礎怨念量 (HP)</span>
                      <strong className="text-slate-100 text-xs sm:text-sm font-semibold">{selectedGhost.maxHp}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 font-sans">魂の状態</span>
                      <strong className="text-emerald-400 text-xs sm:text-sm font-semibold">既知 / 浄可能</strong>
                    </div>
                  </div>

                  {/* Lore story */}
                  <div className="space-y-1">
                    <h4 className="text-[10px] sm:text-xs font-bold font-serif text-slate-300">伝承・噂</h4>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans p-2.5 bg-slate-950/30 rounded-xl border border-slate-900/60">
                      {selectedGhost.description}
                    </p>
                  </div>

                  {/* Quotes */}
                  <div className="space-y-1">
                    <h4 className="text-[10px] sm:text-xs font-bold font-serif text-slate-300">魂の声</h4>
                    <p className="text-[11px] font-serif text-pink-400 italic font-medium p-2 bg-red-950/10 rounded-lg border border-red-500/10">
                      「 {selectedGhost.scaryQuote} 」
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
