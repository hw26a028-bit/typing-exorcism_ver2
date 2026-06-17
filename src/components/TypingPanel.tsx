import React, { useState, useEffect, useRef } from "react";
import { Chant } from "../data";
import { playTypeSound, playErrorSound } from "../utils/audio";
import { isPrefixOfRomaji, isExactMatchOfRomaji, suggestRomaji } from "../utils/romaji";

interface TypingPanelProps {
  currentChant: Chant;
  onComplete: (stats: {
    totalKeys: number;
    correctKeys: number;
    timeMs: number;
  }) => void;
  isActive: boolean;
  onTypedProgress: (index: number) => void;
}

function cleanAndConvertInput(input: string): string {
  // 1. 全角英数字・記号を半角に変換する
  let clean = input.replace(/[！-～]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  }).replace(/　/g, " ");

  // 2. ひらがなを簡易的にローマ字にマッピングする
  const replaceMap: { [key: string]: string } = {
    "きゃ": "kya", "きゅ": "kyu", "きょ": "kyo",
    "しゃ": "sha", "しゅ": "shu", "しょ": "sho",
    "ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho",
    "にゃ": "nya", "にゅ": "nyu", "にょ": "nyo",
    "ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
    "みゃ": "mya", "みゅ": "myu", "みょ": "myo",
    "りゃ": "rya", "りゅ": "ryu", "りょ": "ryo",
    "ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo",
    "じゃ": "ja", "じゅ": "ju", "じょ": "jo",
    "びゃ": "bya", "びゅ": "byu", "びょ": "byo",
    "ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo",
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
    "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
    "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
    "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
    "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
    "わ": "wa", "を": "wo", "ん": "nn",
    "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
    "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
    "だ": "da", "ぢ": "di", "づ": "du", "で": "de", "ど": "do",
    "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
    "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
    "っ": "t",
    "ー": "-", "、": ",", "。": ".", "！": "!", "？": "?", "　": " "
  };

  for (const [key, val] of Object.entries(replaceMap)) {
    clean = clean.replaceAll(key, val);
  }

  return clean;
}

export function TypingPanel({ currentChant, onComplete, isActive, onTypedProgress }: TypingPanelProps) {
  const [typedBuffer, setTypedBuffer] = useState("");
  const [mistakeCount, setMistakeCount] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastInputMistake, setLastInputMistake] = useState(false);
  const [lastInputChar, setLastInputChar] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset progress when chant changes
  useEffect(() => {
    setTypedBuffer("");
    setMistakeCount(0);
    setTotalKeys(0);
    setStartTime(null);
    setLastInputMistake(false);
    setLastInputChar("");
    setInputValue("");
    onTypedProgress(0);
    
    // Auto focus typing field
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentChant, isActive]);

  // Keep input focused
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Global monitoring to maintain input focus and avoid typing stalls
  useEffect(() => {
    if (!isActive) return;

    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab") {
        return;
      }
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("keydown", handleGlobalKeyDown);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isActive, currentChant]);

  const processInputText = (text: string) => {
    if (!isActive) return;

    // Support Japanese IME layout conversion
    const converted = cleanAndConvertInput(text);
    if (!converted) return;

    let currentBuffer = typedBuffer;
    let currentTotal = totalKeys;
    let currentStartTime = startTime;

    if (currentStartTime === null) {
      currentStartTime = Date.now();
      setStartTime(currentStartTime);
    }

    for (let i = 0; i < converted.length; i++) {
      const char = converted[i].toLowerCase();
      currentTotal++;

      const nextBuffer = currentBuffer + char;

      if (isPrefixOfRomaji(currentChant.kana, nextBuffer)) {
        currentBuffer = nextBuffer;
        setTypedBuffer(nextBuffer);
        onTypedProgress(nextBuffer.length);
        setLastInputMistake(false);
        
        playTypeSound(char === " ");

        if (isExactMatchOfRomaji(currentChant.kana, nextBuffer)) {
          const endTime = Date.now();
          const timeTaken = currentStartTime ? (endTime - currentStartTime) : 3000;
          
          onComplete({
            totalKeys: currentTotal,
            correctKeys: nextBuffer.length,
            timeMs: Math.max(100, timeTaken)
          });
          break;
        }
      } else {
        setMistakeCount(prev => prev + 1);
        setLastInputMistake(true);
        setLastInputChar(char);
        playErrorSound();

        setTimeout(() => {
          setLastInputMistake(false);
        }, 350);
      }
    }

    setTotalKeys(currentTotal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isActive) return;

    const key = e.key;

    // タブキーや修飾キーなどのコントロールコマンドやショートカットを邪魔しないようにスルー
    if (key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 0) {
      processInputText(value);
      setInputValue("");
    }
  };

  // Get dynamic suggested romaji representation based on actual typescript progress
  const suggestedFullRomaji = suggestRomaji(currentChant.kana, typedBuffer);
  
  // Divide characters
  const typedText = suggestedFullRomaji.substring(0, typedBuffer.length);
  const nextChar = suggestedFullRomaji[typedBuffer.length] || "";
  const remainingText = suggestedFullRomaji.substring(typedBuffer.length + 1);

  return (
    <div 
      id="typing-arena-panel"
      onClick={handleContainerClick}
      className={`w-full max-w-xl mx-auto p-3 sm:p-4.5 rounded-2xl border-2 transition-all duration-300 bg-slate-900/80 backdrop-blur-md cursor-text text-center select-none ${
        lastInputMistake 
          ? "border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] bg-red-950/20" 
          : "border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:border-slate-700"
      }`}
    >
      {/* Hidden inputs to capture mobile touch event trigger and standard typing */}
      <input
        ref={inputRef}
        type="text"
        className="absolute w-1 h-1 opacity-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        value={inputValue}
        onChange={handleChange}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        inputMode="url"
      />

      {/* Focus reminder overlay if not focused */}
      <p className="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-widest animate-pulse">
        {isActive ? "▼ キーボードを半角英数にして入力してください。" : "詠唱開始をお待ちください"}
      </p>

      {/* Atmospheric Spiritual Spell Scroll */}
      <div className="space-y-2">
        {/* Japanese Reading (Furigana) */}
        <p className="text-xs font-sans text-emerald-400 font-medium tracking-wide min-h-[1.2rem]">
          {currentChant.kana}
        </p>

        {/* Sacred Kanji Display */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-white font-bold tracking-wider leading-tight py-0.5 filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
          {currentChant.kanji}
        </h2>

        {/* Romaji typing guides */}
        <div className="relative mt-2 py-1.5 px-3 bg-slate-950/50 rounded-xl border border-slate-800/60 overflow-hidden font-mono text-sm sm:text-base tracking-wider select-none">
          {/* Accent decoration bracket */}
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-6 border-l border-y border-slate-700/60" />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-6 border-r border-y border-slate-700/60" />

          {/* Spell writing */}
          <div className="px-3 flex flex-wrap justify-center items-center break-all font-semibold">
            {/* Already typed characters */}
            <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
              {typedText}
            </span>

            {/* Current expected character */}
            {nextChar && (
              <span className={`relative px-0.5 inline-block text-white transition-all duration-75 ${
                lastInputMistake ? "text-red-500 font-bold scale-110" : ""
              }`}>
                {nextChar}
                {/* Floating neon Cursor */}
                <span className="absolute left-0 right-0 bottom-0 h-1 bg-cyan-400 rounded animate-bounce shadow-[0_0_10px_rgba(34,211,238,1)]" />
              </span>
            )}

            {/* Un-typed characters remaining */}
            <span className="text-slate-500">
              {remainingText}
            </span>
          </div>
        </div>

        {/* Syllable layout helper (visual reading guide) */}
        {currentChant.romajiSpace && (
          <p className="text-[10px] text-slate-500 font-mono tracking-wider opacity-60">
            原案スペル表記: {currentChant.romaji}
          </p>
        )}

        {/* Meaning/Translation of the Mantra */}
        <div className="mt-2 border-t border-slate-800/40 text-center pt-2">
          <p className="text-[10px] sm:text-xs font-sans text-slate-400 italic">
            「 {currentChant.meaning} 」
          </p>
        </div>
      </div>

      {/* Mistake overlay effect */}
      {lastInputMistake && (
        <div className="absolute inset-0 bg-red-600/5 rounded-2xl pointer-events-none transition-opacity duration-200 flex items-center justify-center">
          <span className="font-mono text-9xl text-red-600/10 font-bold">MISS</span>
        </div>
      )}
    </div>
  );
}
