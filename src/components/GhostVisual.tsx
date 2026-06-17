import React from "react";
import { motion } from "motion/react";

interface GhostVisualProps {
  ghostId: string;
  isDamaged: boolean;
  isPurified: boolean;
  hpPercent: number;
}

export function GhostVisual({ ghostId, isDamaged, isPurified, hpPercent }: GhostVisualProps) {
  // Common container motion styles
  const ghostAnimation = {
    hover: { 
      y: [0, -12, 0],
      scale: 1,
      opacity: 1,
      transition: {
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        },
        scale: { duration: 0.3 },
        opacity: { duration: 0.3 }
      }
    },
    damage: {
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      scale: 1,
      opacity: 1,
      transition: { 
        x: { duration: 0.4 }
      }
    },
    purified: {
      y: [0, -50],
      scale: [1, 0.4, 0],
      opacity: [1, 0.8, 0],
      transition: { duration: 1.5, ease: "easeIn" }
    }
  };

  const currentAnimate = isPurified 
    ? "purified" 
    : (isDamaged ? "damage" : "hover");

  return (
    <div className="relative w-full h-24 sm:h-28 md:h-36 lg:h-44 xl:h-48 flex items-center justify-center select-none overflow-visible">
      {/* Ghost Aura Background Pulsating */}
      <motion.div 
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 rounded-full blur-3xl w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-44 xl:h-44 m-auto pointer-events-none transition-all duration-700 ${
          isPurified ? 'bg-white/0' : 
          ghostId === "samurai" ? "bg-emerald-500/20" :
          ghostId === "okiku" ? "bg-pink-500/20" :
          ghostId === "hanako" ? "bg-red-500/20" :
          ghostId === "kuchisake" ? "bg-purple-500/20" :
          ghostId === "kyubi" ? "bg-amber-500/20" :
          "bg-cyan-500/20"
        }`}
      />

      {/* Main Ghost SVG Wrapper */}
      <motion.div
        variants={ghostAnimation}
        initial="hover"
        animate={currentAnimate}
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-44 xl:h-44 flex-shrink-0 relative z-10 flex items-center justify-center"
      >
        {/* Render different vector SVG illustrations depending on host ID */}
        {ghostId === "samurai" && (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_15px_rgba(16,185,129,0.3)]">
            {/* Samurai Helmet */}
            <path d="M50,110 Q100,50 150,110 Z" fill="#1e293b" stroke="#10b981" strokeWidth="4" />
            <path d="M40,110 L160,110" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
            
            {/* Crescent Gold Crest */}
            <path d="M100,60 Q130,25 150,35 Q105,45 100,60" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            <path d="M100,60 Q70,25 50,35 Q95,45 100,60" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />

            {/* Ghostly Skeletal Mask */}
            <path d="M65,110 Q100,165 135,110 Z" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
            <rect x="75" y="115" width="16" height="6" fill="#10b981" rx="2" />
            <rect x="109" y="115" width="16" height="6" fill="#10b981" rx="2" />
            
            {/* Sinister single eye */}
            <circle cx="100" cy="122" r="8" fill="#ef4444" className="animate-ping" />
            <circle cx="100" cy="122" r="5" fill="#ef4444" />
            
            {/* Teeth gritting */}
            <path d="M80,140 Q100,148 120,140" stroke="#10b981" strokeWidth="2" fill="none" />
            <path d="M85,138 L85,142 M95,139 L95,143 M105,140 L105,144 M115,139 L115,143" stroke="#10b981" strokeWidth="2" />
            
            {/* Floating green flames (hitodama) */}
            <g className="opacity-75">
              <path d="M25,140 Q15,120 25,110 Q35,120 25,140" fill="#34d399" />
              <circle cx="25" cy="125" r="3" fill="#ffffff" />
            </g>
            <g className="opacity-75">
              <path d="M175,90 Q165,70 175,60 Q185,70 175,90" fill="#34d399" />
              <circle cx="175" cy="75" r="3" fill="#ffffff" />
            </g>
          </svg>
        )}

        {ghostId === "okiku" && (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_15px_rgba(236,72,153,0.3)]">
            {/* Okiku Doll hair */}
            <path d="M60,150 L60,80 Q100,30 140,80 L140,150" fill="#090d16" stroke="#db2777" strokeWidth="2" />
            
            {/* Pale Mask Face */}
            <circle cx="100" cy="95" r="42" fill="#f8fafc" stroke="#db2777" strokeWidth="3" />
            
            {/* Hollow Eyes */}
            <ellipse cx="85" cy="90" rx="8" ry="12" fill="#1e1b4b" />
            <ellipse cx="115" cy="90" rx="8" ry="12" fill="#1e1b4b" />
            {/* Tiny pink pinpoint pupils */}
            <circle cx="85" cy="90" r="3" fill="#f472b6" />
            <circle cx="115" cy="90" r="3" fill="#f472b6" />

            {/* Uneasy mouth */}
            <path d="M92,112 Q100,122 108,112" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Kimono Collar */}
            <path d="M70,137 L100,165 L130,137" fill="#be185d" />
            <path d="M80,137 L100,155 L120,137" fill="#f472b6" />
            
            {/* Cracked porcelain details */}
            <path d="M125,75 L133,65 L128,60" stroke="#db2777" strokeWidth="1.5" fill="none" />
            <path d="M70,110 L60,115 L63,122" stroke="#db2777" strokeWidth="1.5" fill="none" />

            {/* Sinister cherry blossom sparkles */}
            <g className="opacity-70 animate-pulse">
              <circle cx="50" cy="50" r="4" fill="#f472b6" />
              <path d="M155,130 L160,135 M160,130 L155,135" stroke="#f472b6" strokeWidth="2" />
            </g>
          </svg>
        )}

        {ghostId === "hanako" && (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_15px_rgba(239,68,68,0.3)]">
            {/* Background spooky bathroom stall wireframe */}
            <rect x="45" y="40" width="110" height="130" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="100" y1="40" x2="100" y2="170" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2" />

            {/* Schoolgirl hair bob */}
            <path d="M60,130 L60,82 Q100,45 140,82 L140,130" fill="#111827" stroke="#ef4444" strokeWidth="2" />
            
            {/* Shadow overlay face */}
            <circle cx="100" cy="95" r="38" fill="#1f2937" stroke="#ef4444" strokeWidth="2.5" />
            
            {/* Glowing red gaze inside hair shadows */}
            <line x1="82" y1="92" x2="94" y2="92" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            <line x1="106" y1="92" x2="118" y2="92" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            
            {/* Crying tears (glowing neon water) */}
            <path d="M88,96 Q88,112 85,115" stroke="#3b82f6" strokeWidth="2" fill="none" />
            <path d="M112,96 Q112,112 115,115" stroke="#3b82f6" strokeWidth="2" fill="none" />

            {/* Red school bib/collar and shirt */}
            <path d="M75,130 L100,150 L125,130" fill="#f87171" stroke="#ef4444" strokeWidth="2" />
            <circle cx="100" cy="142" r="3" fill="#ffffff" />
            
            {/* Hanging school sign / ghost fire */}
            <path d="M145,50 H165 V80 H145 Z" fill="#111827" stroke="#ef4444" strokeWidth="1.5" />
            <text x="155" y="68" fill="#ef4444" fontSize="12" textAnchor="middle" fontFamily="monospace">三</text>
          </svg>
        )}

        {ghostId === "kuchisake" && (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_15px_rgba(168,85,247,0.3)]">
            {/* Eerie beautiful hair flowing wild */}
            <path d="M50,170 Q40,100 65,70 Q100,30 135,70 Q160,100 150,170" fill="none" stroke="#a855f7" strokeWidth="3" />
            <path d="M60,170 Q50,90 70,75 Q100,35 130,75 Q150,90 140,170" fill="#0f172a" />

            {/* Pale high-contrast face */}
            <circle cx="100" cy="95" r="35" fill="#f8fafc" stroke="#a855f7" strokeWidth="3" />

            {/* Sharp long eyes with purple mascara */}
            <path d="M78,85 Q88,80 93,88" stroke="#a855f7" strokeWidth="2.5" fill="none" />
            <path d="M122,85 Q112,80 107,88" stroke="#a855f7" strokeWidth="2.5" fill="none" />
            <circle cx="85" cy="85" r="3.5" fill="#581c87" />
            <circle cx="115" cy="85" r="3.5" fill="#581c87" />

            {/* Giant medical mask cover */}
            <rect x="74" y="96" width="52" height="25" fill="#ffffff" stroke="#a855f7" strokeWidth="2" rx="4" />
            <line x1="74" y1="102" x2="126" y2="102" stroke="#e9d5ff" strokeWidth="1" />
            <line x1="74" y1="110" x2="126" y2="110" stroke="#e9d5ff" strokeWidth="1" />
            
            {/* Creepy stitches overflowing mask */}
            <path d="M70,105 L76,108 M130,105 L124,108 M68,113 L75,112 M132,113 L125,112" stroke="#a855f7" strokeWidth="2" />
            
            {/* Levitating Scissor Blades */}
            <g className="animate-bounce">
              {/* Left blade */}
              <path d="M35,60 L25,130 L40,130 Z" fill="#3b0764" stroke="#a855f7" strokeWidth="1.5" />
              <circle cx="32" cy="138" r="8" fill="none" stroke="#a855f7" strokeWidth="2" />
            </g>
            <g className="animate-bounce" style={{ animationDelay: "0.2s" }}>
              {/* Right blade */}
              <path d="M165,60 L175,130 L160,130 Z" fill="#3b0764" stroke="#a855f7" strokeWidth="1.5" />
              <circle cx="168" cy="138" r="8" fill="none" stroke="#a855f7" strokeWidth="2" />
            </g>
          </svg>
        )}

        {ghostId === "kyubi" && (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_15px_rgba(245,158,11,0.3)]">
            {/* Nine glowing tails rotating behind */}
            <g className="opacity-90">
              {[...Array(9)].map((_, i) => {
                const angle = (i * 40 * Math.PI) / 180;
                const r = 52;
                const tx = 100 + r * Math.cos(angle);
                const ty = 100 + r * Math.sin(angle);
                return (
                  <motion.path
                    key={i}
                    d={`M100,100 Q${tx},${ty - 40} ${tx},${ty}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="6"
                    strokeLinecap="round"
                    animate={{
                      strokeWidth: [6, 12, 6],
                      opacity: [0.6, 0.9, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.15
                    }}
                  />
                );
              })}
            </g>

            {/* Sacred white fox mask face */}
            <path d="M60,80 L100,30 L140,80 L100,150 Z" fill="#f8fafc" stroke="#f59e0b" strokeWidth="3" />
            
            {/* Golden shrine markings */}
            <path d="M100,45 L100,75" stroke="#d97706" strokeWidth="2" />
            <path d="M85,100 Q100,105 115,100" stroke="#d97706" strokeWidth="1.5" fill="none" />
            <path d="M72,75 Q100,68 128,75" stroke="#d97706" strokeWidth="1.5" fill="none" />

            {/* Slanted fiery gold fox eyes */}
            <path d="M75,85 Q88,72 90,83" stroke="#f59e0b" strokeWidth="3.5" fill="none" />
            <path d="M125,85 Q112,72 110,83" stroke="#f59e0b" strokeWidth="3.5" fill="none" />
            <circle cx="84" cy="81" r="3.5" fill="#ef4444" />
            <circle cx="116" cy="81" r="3.5" fill="#ef4444" />

            {/* Sharp ears interiors */}
            <polygon points="60,80 75,70 70,85" fill="#fca5a5" />
            <polygon points="140,80 125,70 130,85" fill="#fca5a5" />
          </svg>
        )}

        {ghostId === "masakado" && (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_15px_20px_rgba(6,182,212,0.4)]">
            {/* Dark Storm cloud behind */}
            <path d="M30,70 C10,70 10,40 30,40 C20,20 50,10 70,30 C90,10 120,10 130,30 C150,10 180,20 170,40 C190,40 190,70 170,70 Z" fill="#0f172a" stroke="#0891b2" strokeWidth="1.5" />

            {/* Red Lightning Arcs */}
            <g className="stroke-cyan-400 fill-none" strokeWidth="2" strokeLinecap="round">
              <path d="M100,10 L95,25 L105,35 L90,55" />
              <path d="M45,20 L40,35 L48,42 L38,60" />
              <path d="M155,20 L160,35 L152,42 L162,60" />
            </g>

            {/* Massive Dark Overlord Kabuto Helmet */}
            <path d="M40,110 L160,110 L140,50 L60,50 Z" fill="#111827" stroke="#0891b2" strokeWidth="4" />
            
            {/* High spired demon horns */}
            <path d="M70,50 L45,15 L78,42 Z" fill="#030712" stroke="#0891b2" strokeWidth="2" />
            <path d="M130,50 L155,15 L122,42 Z" fill="#030712" stroke="#0891b2" strokeWidth="2" />

            {/* Shadowy face void with two intense glowing red eyes */}
            <polygon points="50,110 65,155 135,155 150,110" fill="#020617" stroke="#0891b2" strokeWidth="3" />
            
            {/* Slanted evil glaring lights */}
            <polygon points="68,122 88,126 80,132" fill="#22d3ee" className="animate-pulse" />
            <polygon points="132,122 112,126 120,132" fill="#22d3ee" className="animate-pulse" />

            {/* Glowing electrical particles */}
            <circle cx="100" cy="138" r="2" fill="#22d3ee" className="animate-ping" />
            <circle cx="60" cy="145" r="1.5" fill="#22d3ee" />
            <circle cx="140" cy="145" r="1.5" fill="#22d3ee" />
          </svg>
        )}
      </motion.div>

      {/* Spooky health percent display under the ghost */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-black/60 border border-slate-800 text-slate-400">
          霊格共鳴率: {(hpPercent * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
