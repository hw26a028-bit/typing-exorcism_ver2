import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  Award, 
  Flame, 
  Zap,
  RotateCcw,
  Skull,
  Play,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

import { Ghost, GHOSTS, Chant, CHANTS } from "./data";
import { GhostVisual } from "./components/GhostVisual";
import { TypingPanel } from "./components/TypingPanel";
import { IntroScreen } from "./components/IntroScreen";
import { Encyclopedia } from "./components/Encyclopedia";
import { 
  playCompleteSound, 
  playSpellAttackSound, 
  playGhostDamageSound, 
  playAscensionSound, 
  toggleSpookyBgm 
} from "./utils/audio";

interface DamageNumber {
  id: string;
  value: number;
  isCrit: boolean;
  x: number;
  y: number;
}

interface SpellParticle {
  id: string;
  startX: number;
  startY: number;
}

interface PlayerHpChange {
  id: string;
  value: number;
  isGuard: boolean;
  isPerfect: boolean;
}

export default function App() {
  // Screens: 'title' | 'enc' | 'battle' | 'ending'
  const [screen, setScreen] = useState<'title' | 'enc' | 'battle' | 'ending'>('title');
  
  // Game loop states
  const [activeGhostIndex, setActiveGhostIndex] = useState(0);
  const [currentGhostHp, setCurrentGhostHp] = useState(100);
  const [currentChant, setCurrentChant] = useState<Chant>(CHANTS[0]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [typedProgressIndex, setTypedProgressIndex] = useState(0);
  
  // Player Health
  const [playerHp, setPlayerHp] = useState(100);
  const [isPlayerDamaged, setIsPlayerDamaged] = useState(false);
  const [playerHpChanges, setPlayerHpChanges] = useState<PlayerHpChange[]>([]);
  
  // Game progress persistent state
  const [unlockedGhosts, setUnlockedGhosts] = useState<string[]>(["samurai"]);
  const [highScore, setHighScore] = useState(0);
  const [battleCount, setBattleCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  
  // Scoring / Combat Phase states
  // 'typing' | 'calculating' | 'attack' | 'ghostAttack' | 'exorcised' | 'defeated'
  const [battlePhase, setBattlePhase] = useState<'typing' | 'calculating' | 'attack' | 'ghostAttack' | 'exorcised' | 'defeated'>('typing');
  
  // Anim / visual metrics states
  const [isGhostDamaged, setIsGhostDamaged] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [spellParticles, setSpellParticles] = useState<SpellParticle[]>([]);
  const [lastStats, setLastStats] = useState<{
    length: number;
    accuracy: number;
    speedCpm: number;
    rawScore: number;
    damage: number;
    isCrit: boolean;
    comboBonusPercent: number;
    speedBonusMultiplier: number;
    accBonusMultiplier: number;
  } | null>(null);

  // Load persistence
  useEffect(() => {
    const savedHighScore = localStorage.getItem("ghostExorcist_highScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    const savedUnlocked = localStorage.getItem("ghostExorcist_unlocked");
    if (savedUnlocked) {
      try {
        setUnlockedGhosts(JSON.parse(savedUnlocked));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync BGM
  useEffect(() => {
    if (screen === 'battle' && !isMuted) {
      toggleSpookyBgm(true);
    } else {
      toggleSpookyBgm(false);
    }
    return () => toggleSpookyBgm(false);
  }, [screen, isMuted]);

  // Handle Mute Button toggle
  const handleToggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    if (newMute) {
      toggleSpookyBgm(false);
    } else if (screen === 'battle') {
      toggleSpookyBgm(true);
    }
  };

  // Setup/cloning for a new Ghost battle
  const startBattleForGhostIndex = useCallback((index: number) => {
    const ghost = GHOSTS[index];
    setActiveGhostIndex(index);
    setCurrentGhostHp(ghost.hp);
    setPlayerHp(100);
    setIsPlayerDamaged(false);
    setPlayerHpChanges([]);
    setCombo(0);
    setMaxCombo(0);
    setSpellParticles([]);
    setDamageNumbers([]);
    setBattlePhase('typing');
    setLastStats(null);
    setScreen('battle');
    
    // Choose suitable chant (tier-appropriate based on ghost level)
    selectNewChantForGhostLevel(ghost.level);
  }, []);

  // Core level-suitable sentence selection logic
  const selectNewChantForGhostLevel = (level: number) => {
    // Sift chants by power multipliers/tiers
    let available = CHANTS;
    if (level === 1) {
      available = CHANTS.filter(c => c.power <= 1.3);
    } else if (level === 2 || level === 3) {
      available = CHANTS.filter(c => c.power > 1.0 && c.power <= 1.8);
    } else {
      available = CHANTS.filter(c => c.power >= 1.4);
    }
    
    // Pick standard random chant from selections
    const randomIndex = Math.floor(Math.random() * available.length);
    setCurrentChant(available[randomIndex]);
  };

  // Called when typing the active phrase is completed!
  const handleChantCompleted = (stats: {
    totalKeys: number;
    correctKeys: number;
    timeMs: number;
  }) => {
    // 1. Calculate accuracy accuracy ratio
    const accuracyDecimal = stats.totalKeys > 0 ? (stats.correctKeys / stats.totalKeys) : 0;
    const accuracyPercent = parseFloat((accuracyDecimal * 100).toFixed(1));

    // 2. Characters Per Minute (CPM)
    // Formula: (Characters typed / Time in ms) * 60,000 ms
    const timeInMinutes = stats.timeMs / 60000;
    const speedCpm = Math.floor(currentChant.romaji.length / timeInMinutes);

    // 3. Score Multiplier Formulas
    // Base damage score
    const baseDamageScore = Math.floor(currentChant.power * 35);
    
    // Accuracy multiplier
    let accMult = 1.0;
    if (accuracyPercent === 100) accMult = 2.0; // Perfect bonus!
    else if (accuracyPercent >= 95) accMult = 1.4;
    else if (accuracyPercent >= 88) accMult = 1.0;
    else if (accuracyPercent >= 75) accMult = 0.6;
    else accMult = 0.3; // heavily degraded spells

    // Speed multiplier CPM/100
    // Standard fast typing is around 200-300 CPM.
    // Give bonus scaling nicely above 150 CPM.
    const speedMult = Math.max(0.5, parseFloat((speedCpm / 150).toFixed(2)));

    // Combo bonus (adds flat percentage based on active consecutive series)
    const comboBonusPercent = Math.min(50, combo * 3); // Up to 50% max additional damage
    const comboMult = 1 + (comboBonusPercent / 100);

    // Calculate Final damage strike
    const finalDamage = Math.floor(baseDamageScore * accMult * speedMult * comboMult);
    const isCrit = accuracyPercent >= 98;

    // Build metric package
    const statsPackage = {
      length: currentChant.romaji.length,
      accuracy: accuracyPercent,
      speedCpm: isNaN(speedCpm) || speedCpm > 2000 ? 120 : speedCpm,
      rawScore: baseDamageScore,
      damage: Math.max(5, finalDamage),
      isCrit,
      comboBonusPercent,
      speedBonusMultiplier: speedMult,
      accBonusMultiplier: accMult
    };

    setLastStats(statsPackage);
    setBattlePhase('calculating');
    
    // Play complete notification wave
    if (!isMuted) {
      playCompleteSound();
    }

    // Trigger auto-attack sequence after 1.8 seconds of review
    setTimeout(() => {
      triggerAttackExorcism(Math.max(5, finalDamage), isCrit, statsPackage.accuracy);
    }, 2000);
  };

  // Perform the particle burst and actual damage subtraction
  const triggerAttackExorcism = (damage: number, isCrit: boolean, accuracy: number) => {
    setBattlePhase('attack');
    
    // Play casting/strike audio
    if (!isMuted) {
      playSpellAttackSound();
    }

    // Spawn flying spells / ofuda particles targeting the center
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: `part-${Date.now()}-${i}`,
      startX: (Math.random() * 200 - 100),
      startY: (Math.random() * 100 + 200) // coming from player typing panel below up to ghost
    }));
    setSpellParticles(newParticles);

    // After projectile flying delay (600ms), strike ghost
    setTimeout(() => {
      setIsGhostDamaged(true);
      if (!isMuted) {
        playGhostDamageSound();
      }

      // Spend floating number state
      const numId = `damage-${Date.now()}`;
      const randomX = Math.random() * 60 - 30; // spread
      const randomY = Math.random() * 40 - 70;
      setDamageNumbers(prev => [...prev, {
        id: numId,
        value: damage,
        isCrit,
        x: randomX,
        y: randomY
      }]);

      // Auto clean up floating damage numbers after animation finishes
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(num => num.id !== numId));
      }, 1500);

      // Calculate new ghost HP
      const ghost = GHOSTS[activeGhostIndex];
      const nextHp = Math.max(0, currentGhostHp - damage);
      setCurrentGhostHp(nextHp);

      // Add to score
      updateHighScoreWithPoints(damage * 10);

      // Reset hit vibration screen shake
      setTimeout(() => {
        setIsGhostDamaged(false);
      }, 400);

      // If accuracy was high, maintain combo!
      if (accuracy >= 90) {
        setCombo(prev => {
          const nextCombo = prev + 1;
          if (nextCombo > maxCombo) setMaxCombo(nextCombo);
          return nextCombo;
        });
      } else {
        setCombo(0); // broken combo!
      }

      // Check for Exorcism victory!
      setTimeout(() => {
        if (nextHp <= 0) {
          handleExorcisedGhost(ghost);
        } else {
          // Ghost survived. They will attempt to retaliate!
          setSpellParticles([]);
          triggerGhostAttack(ghost, accuracy);
        }
      }, 1000);

    }, 700);
  };

  // Implement ghost attack counter phase
  const triggerGhostAttack = (ghost: Ghost, lastAccuracy: number) => {
    setBattlePhase('ghostAttack');

    // Calculate base damage of ghost based on level
    const baseAttack = ghost.level * 10 + 5;
    
    // Accuracy-derived protection check
    let finalDmg = baseAttack;
    let isGuard = false;
    let isPerfectGuard = false;

    if (lastAccuracy === 100) {
      finalDmg = 0;
      isPerfectGuard = true;
      isGuard = true;
    } else if (lastAccuracy >= 95) {
      finalDmg = Math.floor(baseAttack * 0.25); // Large decrease
      isGuard = true;
    } else if (lastAccuracy >= 88) {
      finalDmg = Math.floor(baseAttack * 0.6); // Semi decrease
      isGuard = true;
    }

    // Ghost wind-up before strike
    setTimeout(() => {
      setIsPlayerDamaged(true);
      
      const changeId = `hpchange-${Date.now()}`;
      setPlayerHpChanges(prev => [...prev, {
        id: changeId,
        value: finalDmg,
        isGuard: isGuard && !isPerfectGuard,
        isPerfect: isPerfectGuard
      }]);

      // Auto clean up player HP change overlays
      setTimeout(() => {
        setPlayerHpChanges(prev => prev.filter(c => c.id !== changeId));
      }, 1600);

      // Low sub rumble procedural audio representing ghost's evil energy strike
      if (!isMuted) {
        try {
          const synth = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = synth.createOscillator();
          const gain = synth.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(110, synth.currentTime);
          osc.frequency.exponentialRampToValueAtTime(45, synth.currentTime + 0.4);
          gain.gain.setValueAtTime(0.18, synth.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, synth.currentTime + 0.45);
          osc.connect(gain);
          gain.connect(synth.destination);
          osc.start();
          osc.stop(synth.currentTime + 0.5);
        } catch (e) {
          console.error("Audio Context Error: ", e);
        }
      }

      // Subtract player HP
      const nextPlayerHp = Math.max(0, playerHp - finalDmg);
      setPlayerHp(nextPlayerHp);

      // Shake animation end
      setTimeout(() => {
        setIsPlayerDamaged(false);
      }, 450);

      // Transition check after hit finishes
      setTimeout(() => {
        if (nextPlayerHp <= 0) {
          setBattlePhase('defeated');
        } else {
          // Go back to typing phase
          selectNewChantForGhostLevel(ghost.level);
          setBattlePhase('typing');
        }
      }, 1200);

    }, 850);
  };

  // Handled when ghost HP reaches 0
  const handleExorcisedGhost = (ghost: Ghost) => {
    setBattlePhase('exorcised');
    if (!isMuted) {
      playAscensionSound();
    }

    // Persist unlocked list in localStorage
    const nextLayerUnlockedId = GHOSTS[activeGhostIndex + 1]?.id;
    let updatedList = [...unlockedGhosts];
    
    if (!updatedList.includes(ghost.id)) {
      updatedList.push(ghost.id);
    }
    // Also proactively unlock next layer for user progression preview
    if (nextLayerUnlockedId && !updatedList.includes(nextLayerUnlockedId)) {
      updatedList.push(nextLayerUnlockedId);
    }

    setUnlockedGhosts(updatedList);
    localStorage.setItem("ghostExorcist_unlocked", JSON.stringify(updatedList));

    // Award bonus highscore points for purifying the level
    updateHighScoreWithPoints(ghost.maxHp * 15);
  };

  // Persistent scorer updates
  const updateHighScoreWithPoints = (points: number) => {
    setHighScore(prev => {
      const nextScore = prev + points;
      if (nextScore > prev && nextScore > highScore) {
        localStorage.setItem("ghostExorcist_highScore", nextScore.toString());
      }
      return nextScore;
    });
  };

  // Proceed to next level or show ending
  const handleProceedNextStage = () => {
    const nextIndex = activeGhostIndex + 1;
    if (nextIndex < GHOSTS.length) {
      startBattleForGhostIndex(nextIndex);
    } else {
      // Completed last boss Taira no Masakado! Show grand spiritual victory credits.
      setScreen('ending');
    }
  };

  // Clean play resets
  const handleResetGameFully = () => {
    localStorage.removeItem("ghostExorcist_unlocked");
    localStorage.removeItem("ghostExorcist_highScore");
    setUnlockedGhosts(["samurai"]);
    setHighScore(0);
    setScreen('title');
  };

  const activeGhost = GHOSTS[activeGhostIndex];
  const activeGhostHpPercent = activeGhost ? (currentGhostHp / activeGhost.hp) : 0;

  return (
    <div className={`h-screen max-h-screen overflow-hidden bg-[#030712] text-slate-100 flex flex-col relative font-sans selection:bg-emerald-500/30 selection:text-emerald-300 transition-all duration-100 ${
      isPlayerDamaged ? "shake-player" : ""
    }`}>
      
      {/* Mystical Stars/Sparks in the background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950 to-black pointer-events-none z-0" />

      {/* Floating high-intensity spirit particle canvas (using radial gradients for robust cross-browser and iframe rendering instead of CSS filters) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-25 overflow-hidden">
        <div 
          className="absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full animate-pulse" 
          style={{ 
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0) 70%)',
            transform: 'translate(-50%, -50%)'
          }} 
        />
        <div 
          className="absolute top-[40%] right-[15%] w-[500px] h-[500px] rounded-full animate-pulse" 
          style={{ 
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0) 70%)',
            transform: 'translate(50%, -50%)',
            animationDelay: '1s' 
          }} 
        />
        <div 
          className="absolute bottom-[10%] left-[40%] w-[550px] h-[550px] rounded-full animate-pulse" 
          style={{ 
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0) 70%)',
            transform: 'translate(-50%, 50%)',
            animationDelay: '2s' 
          }} 
        />
      </div>

      {/* App Header Bar for Settings, Mutes, and Info */}
      <header className="relative z-20 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between flex-shrink-0">
        <div 
          onClick={() => setScreen('title')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-serif font-black tracking-wider text-white text-base block group-hover:text-emerald-400 transition-colors">
              幽霊タイピング除霊
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">
              GHOST EXORCIST TYPIST v1.0
            </span>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center space-x-4">
          {/* Typing Guide Overlay Helper Toggle */}
          {screen === 'battle' && (
            <button
              onClick={() => setShowHelper(!showHelper)}
              className={`p-2 rounded-lg border text-xs font-medium font-serif flex items-center space-x-1.5 transition-all cursor-pointer ${
                showHelper 
                  ? "bg-slate-800 border-slate-700 text-cyan-400" 
                  : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-300"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">ローマ字凡例</span>
            </button>
          )}

          {/* Procedural Audio Mute Button */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isMuted 
                ? "bg-red-950/20 border-red-900 text-red-400 hover:bg-red-950/40" 
                : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
            }`}
            title={isMuted ? "ミュート解除" : "ミュート"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          {/* Quit Battle Button if inside arena */}
          {screen !== 'title' && (
            <button
              onClick={() => {
                setScreen('title');
                toggleSpookyBgm(false);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-serif border border-slate-900 hover:border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-300 transition-all cursor-pointer"
            >
              帰還する
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col justify-center min-h-0 overflow-hidden">
        
        {/* Helper guide modal/drawer, clean absolute popup */}
        <AnimatePresence>
          {showHelper && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-6 right-6 top-4 mx-auto max-w-lg p-5 rounded-xl border border-slate-800 bg-slate-950/95 shadow-2xl z-50 text-xs text-slate-400 select-none"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-slate-200 font-bold font-serif flex items-center">
                  <span className="w-1.5 h-3 bg-cyan-400 rounded-full mr-2" />
                  入力方法・ローマ字表記のアドバイス
                </span>
                <button 
                  onClick={() => setShowHelper(false)}
                  className="hover:text-slate-200 cursor-pointer"
                >
                  閉じる [x]
                </button>
              </div>
              <ul className="space-y-1.5 leading-relaxed list-disc list-inside">
                <li>本ゲームでは、表示される<strong className="text-white">青色に光るターゲット文字</strong>を入力する形になります。</li>
                <li>「し」＝ <span className="text-slate-200">si</span> ではなく、すべて画面の提示通りに固定表記で打っていただきます。</li>
                <li>「ん」＝ 促音や後方 consonant に関係なく一貫して <strong className="text-emerald-400">“nn”</strong> またはターゲットされている場合はその通りに打ってください。</li>
                <li>記号（！や，）の入力は全て<span className="text-slate-200">半角（! や ,）</span>に対応しています。キーボードの変換設定が半角になっているかご確認ください。</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          
          {/* SCREEN: Title Screen representing Torii Gate */}
          {screen === 'title' && (
            <motion.div
              key="title"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <IntroScreen
                onStartGame={() => startBattleForGhostIndex(0)}
                onOpenEncyclopedia={() => setScreen('enc')}
                highScore={highScore}
                unlockedGhosts={unlockedGhosts}
              />
            </motion.div>
          )}

          {/* SCREEN: Encyclopedia Book scroll */}
          {screen === 'enc' && (
            <motion.div
              key="encyclopedia"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Encyclopedia
                onClose={() => setScreen('title')}
                unlockedGhosts={unlockedGhosts}
              />
            </motion.div>
          )}

          {/* SCREEN: Active Combat Arena */}
          {screen === 'battle' && activeGhost && (
            <motion.div
              key="battle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl mx-auto px-4 py-1 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-5 lg:gap-6 items-center h-full min-h-0 overflow-y-auto md:overflow-hidden scrollbar-none"
            >
              {/* Left Column: ACTIVE GHOST SHOWCASE & HP STATUS */}
              <div className="md:col-span-5 flex flex-col items-center justify-center space-y-2 sm:space-y-2.5 w-full min-h-0 md:flex-shrink">
                
                {/* Active Ghost Header Tag */}
                <div className="w-full text-center md:flex-shrink">
                  <span className="font-mono text-[10px] text-red-500 font-bold uppercase tracking-widest block mb-0.5 animate-pulse">
                    危険度階級: {activeGhost.level}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-100 flex items-center justify-center gap-2">
                    {activeGhost.name}
                  </h3>
                  <p className="text-[9px] text-slate-500 font-mono">
                    {activeGhost.subName}
                  </p>
                </div>

                {/* Vector Ghost Visual Container */}
                <div 
                  className={`w-full relative rounded-2xl border-2 bg-gradient-to-b ${activeGhost.bgGradient} transition-all duration-300 md:flex-shrink ${
                    isGhostDamaged 
                      ? "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-95" 
                      : (battlePhase === 'exorcised' ? "border-white border-dashed bg-transparent" : "border-slate-800")
                  }`}
                >
                  <GhostVisual
                    ghostId={activeGhost.id}
                    isDamaged={isGhostDamaged}
                    isPurified={battlePhase === 'exorcised'}
                    hpPercent={activeGhostHpPercent}
                  />

                  {/* Inside Floating Particles / Magic Ofuda projectile strike */}
                  <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none z-30">
                    <AnimatePresence>
                      {spellParticles.map((pt) => (
                        <motion.div
                          key={pt.id}
                          initial={{ x: pt.startX, y: pt.startY, scale: 0.1, opacity: 0 }}
                          animate={{ x: 0, y: -60, scale: 1.5, opacity: 1 }}
                          exit={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="absolute w-5 h-8 bg-amber-400 border border-red-500 rounded flex items-center justify-center text-[8px] font-bold text-red-900 font-serif leading-none shadow-[0_0_10px_rgba(245,158,11,1)]"
                        >
                          念
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Floating Damage Numbers Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <AnimatePresence>
                      {damageNumbers.map((num) => (
                        <motion.div
                          key={num.id}
                          initial={{ scale: 0.4, opacity: 0, y: 10 }}
                          animate={{ scale: 1.2, opacity: 1, y: num.y, x: num.x }}
                          exit={{ opacity: 0, scale: 0.6, y: num.y - 20 }}
                          transition={{ duration: 0.8 }}
                          className={`absolute font-black font-serif tracking-widest text-shadow ${
                            num.isCrit 
                              ? "text-3xl text-yellow-400 drop-shadow-[0_4px_10px_rgba(234,179,8,0.8)]" 
                              : "text-2xl text-red-500 drop-shadow-[0_2px_8px_rgba(220,38,38,0.6)]"
                          }`}
                        >
                          {num.isCrit ? "極・" : ""}-{num.value}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* コア対決HPゲージ (Ghost VS Player HP Duel Panels) */}
                <div className="w-full bg-slate-950/85 rounded-xl p-2 sm:p-2.5 border border-slate-900 space-y-1.5 md:space-y-2">
                  
                  {/* GHOST HP BAR */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-baseline select-none">
                      <span className="text-[10px] font-serif font-bold text-red-400 flex items-center gap-1">
                        <Skull className="w-3 h-3 text-red-500 animate-pulse" />
                        怨霊魔障 (Ghost HP)
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-200">
                        {Math.ceil(currentGhostHp)} <span className="text-[9px] text-slate-600">/ {activeGhost.maxHp}</span>
                      </span>
                    </div>
                    {/* Outer Bar */}
                    <div className="w-full h-2 bg-slate-900/80 border border-slate-800 rounded-full overflow-hidden relative">
                      <div 
                        className="absolute inset-y-0 left-0 bg-red-950/80 transition-all duration-1000 ease-out"
                        style={{ width: `${activeGhostHpPercent * 100}%` }}
                      />
                      <motion.div 
                        className="h-full bg-gradient-to-r from-red-600 to-pink-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                        style={{ width: `${activeGhostHpPercent * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* PLAYER HP BAR */}
                  <div className="space-y-0.5 pt-1.5 border-t border-slate-900 relative">
                    <div className="flex justify-between items-baseline select-none">
                      <span className="text-[10px] font-serif font-bold text-emerald-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-emerald-400 fill-emerald-500/20" />
                        聖真生命力 (Player HP)
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-200">
                        {Math.ceil(playerHp)} <span className="text-[9px] text-slate-600">/ 100</span>
                      </span>
                    </div>
                    {/* Outer Bar */}
                    <div className="w-full h-2 bg-slate-900/80 border border-slate-800 rounded-full overflow-hidden relative">
                      <div 
                        className="absolute inset-y-0 left-0 bg-emerald-950/80 transition-all duration-1000 ease-out"
                        style={{ width: `${(playerHp / 100) * 100}%` }}
                      />
                      <motion.div 
                        className={`h-full bg-gradient-to-r transition-all duration-300 ${
                          playerHp > 35 
                            ? "from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                            : "from-amber-500 to-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                        }`}
                        style={{ width: `${(playerHp / 100) * 100}%` }}
                      />
                    </div>

                    {/* Floating HP Changes Indicators (Guard / Damage) */}
                    <div className="absolute -top-1 right-0 pointer-events-none z-50">
                      <AnimatePresence>
                        {playerHpChanges.map((change) => (
                          <motion.div
                            key={change.id}
                            initial={{ scale: 0.6, opacity: 0, y: 0 }}
                            animate={{ scale: 1.1, opacity: 1, y: -25 }}
                            exit={{ opacity: 0, scale: 0.8, y: -38 }}
                            transition={{ duration: 1.0 }}
                            className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1 ${
                              change.isPerfect 
                                ? "bg-cyan-500/20 border border-cyan-400 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] font-serif"
                                : change.isGuard 
                                  ? "bg-amber-500/20 border border-amber-400 text-amber-400"
                                  : "bg-red-500/20 border border-red-500 text-red-500"
                            }`}
                          >
                            {change.isPerfect ? "無効 (PERFECT GUARD!)" : change.isGuard ? `護符軽減 (-${change.value})` : `ダメージ (-${change.value})`}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                  </div>

                </div>

                {/* active Ghost dialogue / scary quotes box */}
                <div className="w-full p-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-center select-none md:flex-shrink">
                  <p className="text-[11px] text-pink-400 font-serif leading-normal italic">
                    「 {battlePhase === 'exorcised' ? activeGhost.purifiedMessage : activeGhost.scaryQuote} 」
                  </p>
                </div>

              </div>

              {/* Right Column: MAIN TYPE INTERACTION PANEL & SCORE CALCULATIONS */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-2.5 sm:space-y-3 w-full min-h-0 md:flex-shrink">
                
                {/* Realtime Stats header */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-2 sm:p-2.5 rounded-xl border border-slate-900/60 font-mono text-[11px] text-slate-400 select-none">
                  <div className="text-center">
                    <span className="block text-[9px] text-slate-500 mb-0.5 font-sans">除霊スコア</span>
                    <strong className="text-yellow-400 text-xs sm:text-sm font-semibold">
                      {highScore.toLocaleString()} <span className="text-[9px]">pts</span>
                    </strong>
                  </div>
                  <div className="text-center border-x border-slate-800 px-0.5">
                    <span className="block text-[9px] text-slate-500 mb-0.5 font-sans">無傷コンボ数</span>
                    <strong className="text-cyan-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-0.5">
                      <Flame className={`w-3 h-3 ${combo > 0 ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-700'}`} />
                      {combo} <span className="text-[9px]">C</span>
                    </strong>
                  </div>
                  <div className="text-center">
                    <span className="block text-[9px] text-slate-500 mb-0.5 font-sans">最高コンボ</span>
                    <strong className="text-slate-300 text-xs sm:text-sm font-semibold">
                      {maxCombo} <span className="text-[9px]">C</span>
                    </strong>
                  </div>
                </div>

                {/* Sub-phase layout triggers */}
                <div className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[280px] flex items-center justify-center">
                  
                  {/* Battle phase 1: Active typing segment */}
                  {battlePhase === 'typing' && (
                    <motion.div
                      key="typing-container"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="w-full"
                    >
                      <TypingPanel
                        currentChant={currentChant}
                        onComplete={handleChantCompleted}
                        isActive={battlePhase === 'typing'}
                        onTypedProgress={(idx) => setTypedProgressIndex(idx)}
                      />
                    </motion.div>
                  )}

                  {/* Battle phase 2 & 3: Calculating spell damage & attack hit animation previews */}
                  {(battlePhase === 'calculating' || battlePhase === 'attack') && lastStats && (
                    <motion.div
                      key="calc-and-strike"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full p-6 md:p-8 rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl space-y-6 text-center select-none relative overflow-hidden"
                    >
                      {/* background magical rotating spell circles */}
                      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
                        <svg className="w-72 h-72 animate-[spin_50s_linear_infinite]" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="3,3" />
                          <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" fill="none" />
                          <polygon points="50,15 80,75 20,75" stroke="currentColor" strokeWidth="1" fill="none" />
                          <polygon points="50,85 80,25 20,25" stroke="currentColor" strokeWidth="1" fill="none" />
                        </svg>
                      </div>

                      {/* Header status */}
                      <div className="relative z-10">
                        <span className="px-3.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                          {battlePhase === 'calculating' ? "言霊解読中..." : "霊力呪符 投射中！"}
                        </span>
                        <h4 className="text-lg font-serif font-bold text-slate-100 mt-3">
                          詠唱「 {currentChant.kanji} 」
                        </h4>
                      </div>

                      {/* Score metrics list */}
                      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto relative z-10 text-xs font-mono text-slate-400 text-left bg-slate-900/40 p-4 rounded-xl border border-slate-900">
                        
                        {/* Accuracy */}
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-slate-500 font-sans">精度 (Accuracy)</span>
                          <span className={`text-base font-bold ${lastStats.accuracy === 100 ? 'text-yellow-400' : 'text-slate-100'}`}>
                            {lastStats.accuracy} %
                          </span>
                        </div>

                        {/* CPM Speed */}
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-slate-500 font-sans">詠唱速度 (Speed)</span>
                          <span className="text-base font-bold text-slate-100">
                            {lastStats.speedCpm} <span className="text-[10px] text-slate-500">字/分</span>
                          </span>
                        </div>

                        {/* Combo */}
                        <div className="flex flex-col space-y-0.5 border-t border-slate-800/80 pt-2 col-span-2 sm:col-span-1">
                          <span className="text-slate-500 font-sans">魔障除加算 (Combo)</span>
                          <span className="text-sm font-semibold text-cyan-400">
                            +{lastStats.comboBonusPercent} % 威光
                          </span>
                        </div>

                        {/* Crit notice */}
                        <div className="flex flex-col space-y-0.5 border-t border-slate-800/80 pt-2 col-span-2 sm:col-span-1">
                          <span className="text-slate-500 font-sans">言霊澄度 (Purity)</span>
                          <span className={`text-sm font-bold ${lastStats.isCrit ? "text-yellow-400" : "text-emerald-400"}`}>
                            {lastStats.isCrit ? "純真 (Critical!)" : "澄明 (Standard)"}
                          </span>
                        </div>

                      </div>

                      {/* Huge Final Damage strike announcement */}
                      <div className="relative z-10 space-y-1">
                        <span className="text-xs text-slate-500 block font-serif">怨霊へ与えるダメージ</span>
                        <motion.div 
                          animate={{ scale: [0.95, 1.05, 1] }}
                          transition={{ duration: 0.3 }}
                          className={`text-4xl md:text-5xl font-black font-serif tracking-widest ${
                            lastStats.isCrit ? 'text-yellow-400' : 'text-red-500'
                          }`}
                        >
                          {lastStats.damage} <span className="text-lg font-sans text-slate-400 font-bold">霊威</span>
                        </motion.div>
                      </div>

                      {/* Action progress dot timers */}
                      <div className="flex justify-center items-center space-x-2 relative z-10 pt-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span className="text-[11px] font-sans text-slate-500">祓魔咒呪が炸裂中、次の言霊へ移行します...</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Battle phase: Ghost Counter Attack */}
                  {battlePhase === 'ghostAttack' && (
                    <motion.div
                      key="ghost-attack-phase"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full p-6 md:p-8 rounded-2xl border border-red-900 bg-red-950/10 shadow-2xl space-y-6 text-center select-none relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent opacity-40 pointer-events-none" />
                      
                      <div className="relative z-10 space-y-2">
                        <span className="px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-mono text-red-500 uppercase tracking-widest font-bold animate-pulse">
                          怨念障壁突破 ── 怨霊反撃中！
                        </span>
                        <h4 className="text-2xl font-serif font-bold text-red-400 mt-4 leading-relaxed">
                          {activeGhost.name} が呪縛を解き放とうとしている！
                        </h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto italic mt-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                          「 {activeGhost.scaryQuote} 」
                        </p>
                      </div>

                      <div className="flex justify-center items-center space-x-2 relative z-10 py-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        <span className="text-xs font-sans text-slate-400">暗黒の霊力があなたを襲います...</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Battle phase: Player Defeated Game Over */}
                  {battlePhase === 'defeated' && (
                    <motion.div
                      key="defeated-phase"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full p-6 md:p-8 rounded-2xl border-2 border-red-500 bg-red-950/20 shadow-[0_0_40px_rgba(239,68,68,0.3)] text-center select-none space-y-6"
                    >
                      <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500 flex items-center justify-center mx-auto text-red-500 animate-pulse">
                        <ShieldAlert className="w-8 h-8" />
                      </div>

                      <div className="space-y-1">
                        <span className="font-serif text-sm text-red-400 font-bold uppercase tracking-[0.2em]">
                          除霊失敗 (Defeated)
                        </span>
                        <h4 className="text-2xl md:text-3xl font-serif font-black text-white">
                          怨魂の邪毒に蝕まれました…
                        </h4>
                      </div>

                      <p className="text-sm text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
                        怨霊と対峙するには精神の澄度、あるいは詠唱の速度が足りなかったようです。<br />
                        霊的な障壁が崩壊し、あなたの生命力は尽き果てました。
                      </p>

                      {/* Defeated Actions */}
                      <div className="pt-2 flex flex-col sm:flex-row gap-4 max-w-xs mx-auto justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            // Retry current fight
                            setCurrentGhostHp(activeGhost.hp);
                            setPlayerHp(100);
                            setPlayerHpChanges([]);
                            setCombo(0);
                            setSpellParticles([]);
                            setDamageNumbers([]);
                            setLastStats(null);
                            selectNewChantForGhostLevel(activeGhost.level);
                            setBattlePhase('typing');
                          }}
                          className="flex-1 py-3 px-5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold tracking-widest font-serif transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-lg"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>再挑戦する</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setScreen('title');
                            toggleSpookyBgm(false);
                          }}
                          className="flex-1 py-3 px-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold tracking-wider font-serif transition-colors cursor-pointer"
                        >
                          無念の退却
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Battle phase 4: Ghost exorcised/purified victory segment with stage proceeding controls */}
                  {battlePhase === 'exorcised' && (
                    <motion.div
                      key="exorcised-summary"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full p-6 md:p-8 rounded-2xl border-2 border-emerald-500 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.2)] text-center select-none space-y-6"
                    >
                        {/* Exorcism rewards details */}
                      <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-2.5 max-w-xs mx-auto grid grid-cols-2 gap-2 text-center font-mono text-xs">
                        <div className="border-r border-slate-900 pr-1">
                          <span className="block text-[10px] text-slate-500 mb-0.5 font-sans">獲得徳積(HP Bonus)</span>
                          <strong className="text-emerald-400 text-xs sm:text-sm">+{activeGhost.maxHp * 15} pts</strong>
                        </div>
                        <div className="pl-1">
                          <span className="block text-[10px] text-slate-500 mb-0.5 font-sans">危険階級</span>
                          <strong className="text-red-400 text-xs sm:text-sm">第 {activeGhost.level} 層 踏破</strong>
                        </div>
                      </div>

                      {/* Next screen actions */}
                      <div id="exorcism-victory-panel" className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleProceedNextStage}
                          className="py-2 px-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold tracking-widest font-serif transition-colors cursor-pointer flex items-center justify-center mx-auto space-x-1.5 shadow-lg text-xs sm:text-sm"
                        >
                          <span>{activeGhostIndex === GHOSTS.length - 1 ? "大成就（エンディング）" : "次の霊場へ進む"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>

                    </motion.div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

          {/* SCREEN: Grand Ending screen after purifying final boss Masakado */}
          {screen === 'ending' && (
            <motion.div
              key="ending"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl mx-auto px-4 py-3 text-center select-none space-y-3 sm:space-y-4"
            >
              <div className="relative w-full max-w-xs mx-auto h-20 sm:h-24 flex items-center justify-center bg-transparent">
                {/* Floating pure gold bubbles */}
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-yellow-400"
                    style={{
                      width: Math.random() * 6 + 3,
                      height: Math.random() * 6 + 3,
                      left: `${Math.random() * 80 + 10}%`,
                      top: `${Math.random() * 80 + 10}%`,
                    }}
                    animate={{
                      y: [30, -60],
                      opacity: [0, 0.9, 0],
                      scale: [0.6, 1.3, 0.4]
                    }}
                    transition={{
                      duration: Math.random() * 2.5 + 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut"
                    }}
                  />
                ))}
                
                {/* Sacred Shrine Mirror SVG */}
                <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[0_0_15px_rgba(234,179,8,0.45)]">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#eab308" strokeWidth="3" />
                  <circle cx="50" cy="50" r="32" fill="#1e1b4b" stroke="#eab308" strokeWidth="1" />
                  <polygon points="50,25 58,40 75,40 62,50 68,67 50,56 32,67 38,50 25,40 42,40" fill="#eab308" />
                </svg>
              </div>

              <div id="game-completed-ending" className="space-y-2">
                <span className="font-serif text-xs text-yellow-400 font-bold uppercase tracking-[0.3em] bg-yellow-500/10 px-3 py-0.5 rounded-full border border-yellow-500/20">
                  大満願御礼
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-widest leading-tight">
                  帝都大悲除霊成就！
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  伝説の怨霊・平将門公をふくめ、この國に跋扈した数多の怨霊・妖怪すべての呪障を完全に祓い清め、大極楽往生へと導きました！
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 sm:p-4 grid grid-cols-2 gap-3 max-w-sm mx-auto font-mono text-left select-none text-xs">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-slate-500 font-sans text-[10px]">究極除霊徳積(High Score)</span>
                  <span className="text-lg font-bold text-yellow-400">
                    {highScore.toLocaleString()} <span className="text-[10px] text-slate-500">pts</span>
                  </span>
                </div>
                <div className="flex flex-col space-y-0.5 border-l border-slate-800 pl-3">
                  <span className="text-slate-500 font-sans text-[10px]">獲得神爵称号</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400 font-serif leading-none mt-1">
                    帝都最高 Onmyoji
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed font-sans block pt-1.5 max-w-xs mx-auto">
                言葉を大切にするあなたの心に、神の加護があらんことを。
              </p>

              {/* Home button resets */}
              <div id="ending-screen-controls" className="pt-2 flex gap-3 max-w-sm mx-auto justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setScreen('title')}
                  className="flex-1 py-2 px-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-serif font-bold tracking-wider transition-all cursor-pointer text-xs sm:text-sm"
                >
                  門前に戻る
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResetGameFully}
                  className="flex-1 py-2 px-4 rounded-lg bg-red-950/30 border border-red-900 hover:bg-red-950/50 text-red-100 font-serif font-medium tracking-wide transition-all cursor-pointer text-[10px] sm:text-xs"
                >
                  霊盤を初期化
                </motion.button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>��


      </main>

      {/* Floating gamefooter information credit details */}
      <footer className="relative z-10 border-t border-slate-950 bg-slate-950/40 py-1.5 sm:py-2 px-6 text-center select-none text-[10px] text-slate-600 font-mono flex flex-col sm:flex-row justify-between items-center gap-1 flex-shrink-0">
        <span>© 2026 和風霊技研究所. All merits purified.</span>
        <span>言葉に霊力を。正確な詠唱こそが、最大の聖なる障壁となる。</span>
      </footer>

    </div>
  );
}
