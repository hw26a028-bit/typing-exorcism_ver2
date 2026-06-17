export const ROMAJI_TABLE: { [key: string]: string[] } = {
  "きゃ": ["kya"], "きゅ": ["kyu"], "きょ": ["kyo"],
  "しゃ": ["sha", "sya"], "しゅ": ["shu", "syu"], "しょ": ["sho", "syo"],
  "ちゃ": ["cha", "tya"], "ちゅ": ["chu", "tyu"], "ちょ": ["cho", "tyo"],
  "にゃ": ["nya"], "にゅ": ["nyu"], "にょ": ["nyo"],
  "ひゃ": ["hya"], "ひゅ": ["hyu"], "ひょ": ["hyo"],
  "みゃ": ["mya"], "みゅ": ["myu"], "みょ": ["myo"],
  "りゃ": ["rya"], "りゅ": ["ryu"], "りょ": ["ryo"],
  
  "ぎゃ": ["gya"], "ぎゅ": ["gyu"], "ぎょ": ["gyo"],
  "じゃ": ["ja", "zya", "jya"], "じゅ": ["ju", "zyu", "jyu"], "じょ": ["jo", "zyo", "jyo"],
  "びゃ": ["bya"], "びゅ": ["byu"], "びょ": ["byo"],
  "ぴゃ": ["pya"], "ぴゅ": ["pyu"], "ぴょ": ["pyo"],
  
  "ふぁ": ["fa"], "ふぃ": ["fi"], "ふぇ": ["fe"], "ふぉ": ["fo"],
  "てぃ": ["ti", "thi"], "でぃ": ["di", "dhi"],
  "でぅ": ["du"], "とぅ": ["tu"], "どぅ": ["du"],
  "しぇ": ["she", "sye"], "じぇ": ["je", "zye", "jye"],
  "ちぇ": ["che", "tye"],
  
  // 1文字のひらがな
  "あ": ["a"], "い": ["i"], "う": ["u"], "え": ["e"], "お": ["o"],
  "か": ["ka"], "き": ["ki"], "く": ["ku"], "け": ["ke"], "こ": ["ko"],
  "さ": ["sa"], "し": ["shi", "si"], "す": ["su"], "せ": ["se"], "そ": ["so"],
  "た": ["ta"], "ち": ["chi", "ti"], "つ": ["tsu", "tu"], "て": ["te"], "と": ["to"],
  "な": ["na"], "に": ["ni"], "ぬ": ["nu"], "ね": ["ne"], "の": ["no"],
  "は": ["ha"], "ひ": ["hi"], "ふ": ["fu", "hu"], "へ": ["he"], "ほ": ["ho"],
  "ま": ["ma"], "み": ["mi"], "む": ["mu"], "め": ["me"], "も": ["mo"],
  "や": ["ya"], "ゆ": ["yu"], "よ": ["yo"],
  "ら": ["ra"], "り": ["ri"], "る": ["ru"], "れ": ["re"], "ろ": ["ro"],
  "わ": ["wa"], "を": ["wo", "o"], "ん": ["nn", "n", "xn"],
  
  "が": ["ga"], "ぎ": ["gi"], "ぐ": ["gu"], "げ": ["ge"], "ご": ["go"],
  "ざ": ["za"], "じ": ["ji", "zi"], "ず": ["zu"], "ぜ": ["ze"], "ぞ": ["zo"],
  "だ": ["da"], "ぢ": ["di", "ji"], "づ": ["du", "zu"], "で": ["de"], "ど": ["do"],
  "ば": ["ba"], "び": ["bi"], "ぶ": ["bu"], "べ": ["be"], "ぼ": ["bo"],
  "ぱ": ["pa"], "ぴ": ["pi"], "ぷ": ["pu"], "ぺ": ["pe"], "ぽ": ["po"],
  
  "ぁ": ["la", "xa"], "ぃ": ["li", "xi"], "ぅ": ["lu", "xu"], "ぇ": ["le", "xe"], "ぉ": ["lo", "xo"],
  "ゃ": ["lya", "xya"], "ゅ": ["lyu", "xyu"], "ょ": ["lyo", "xyo"],
  "っ": ["ltu", "xtu"], // 単体
  "ー": ["-"],
  
  // 記号など
  "！": ["!"], "，": [","], "、": [","], "。": ["."], " ": [" "],
  "!": ["!"], ",": [","], ".": ["."], "?": ["?"], "？": ["?"]
};

function isVowel(char: string): boolean {
  return ["a", "i", "u", "e", "o"].includes(char.toLowerCase());
}

function getFirstConsonants(kana: string): string[] {
  if (kana === "") return [];
  for (const [k, options] of Object.entries(ROMAJI_TABLE)) {
    if (kana.startsWith(k)) {
      const consonants = options.map(opt => opt[0]).filter(c => c && !isVowel(c));
      return Array.from(new Set(consonants));
    }
  }
  const first = kana[0];
  if (first && !isVowel(first)) return [first.toLowerCase()];
  return [];
}

function startsWithVowelOrYorN(kana: string): boolean {
  if (kana === "") return false;
  for (const [k, options] of Object.entries(ROMAJI_TABLE)) {
    if (kana.startsWith(k)) {
      const firstChars = options.map(opt => opt[0]);
      return firstChars.some(c => ["a", "i", "u", "e", "o", "y", "n"].includes(c.toLowerCase()));
    }
  }
  const first = kana[0].toLowerCase();
  return ["a", "i", "u", "e", "o", "y", "n"].includes(first);
}

export function isPrefixOfRomaji(kana: string, typed: string): boolean {
  if (typed === "") return true;
  if (kana === "") return false;

  for (const [k, options] of Object.entries(ROMAJI_TABLE)) {
    if (kana.startsWith(k)) {
      if (k === "っ") {
        const remainingKana = kana.slice(k.length);
        if (remainingKana.length > 0) {
          const nextConsonants = getFirstConsonants(remainingKana);
          for (const c of nextConsonants) {
            if (typed.startsWith(c)) {
              if (isPrefixOfRomaji(remainingKana, typed.slice(c.length))) {
                return true;
              }
            }
          }
        }
        for (const opt of ["ltu", "xtu"]) {
          if (typed.startsWith(opt)) {
            if (isPrefixOfRomaji(remainingKana, typed.slice(opt.length))) {
              return true;
            }
          }
          if (opt.startsWith(typed)) {
            return true;
          }
        }
        return false;
      }

      if (k === "ん") {
        const remainingKana = kana.slice(k.length);
        const nextStartsWithN = getFirstConsonants(remainingKana).includes("n");
        if (nextStartsWithN) {
          if (typed.startsWith("n")) {
            if (isPrefixOfRomaji(remainingKana, typed.slice(1))) {
              return true;
            }
          }
          for (const opt of ["nn", "xn"]) {
            if (typed.startsWith(opt)) {
              if (isPrefixOfRomaji(remainingKana, typed.slice(opt.length))) {
                return true;
              }
            }
            if (opt.startsWith(typed)) {
              return true;
            }
          }
        } else {
          for (const opt of ["nn", "xn"]) {
            if (typed.startsWith(opt)) {
              if (isPrefixOfRomaji(remainingKana, typed.slice(opt.length))) {
                return true;
              }
            }
            if (opt.startsWith(typed)) {
              return true;
            }
          }
          if (typed.startsWith("n")) {
            if (isPrefixOfRomaji(remainingKana, typed.slice(1))) {
              return true;
            }
          }
        }
        if ("n".startsWith(typed)) {
          return true;
        }
        return false;
      }

      for (const opt of options) {
        if (typed.startsWith(opt)) {
          if (isPrefixOfRomaji(kana.slice(k.length), typed.slice(opt.length))) {
            return true;
          }
        }
        if (opt.startsWith(typed)) {
          return true;
        }
      }
    }
  }

  const firstChar = kana[0];
  if (typed.toLowerCase().startsWith(firstChar.toLowerCase())) {
    return isPrefixOfRomaji(kana.slice(1), typed.slice(1));
  }
  if (firstChar.toLowerCase().startsWith(typed.toLowerCase())) {
    return true;
  }

  return false;
}

export function isExactMatchOfRomaji(kana: string, typed: string): boolean {
  if (kana === "" && typed === "") return true;
  if (kana === "" || typed === "") return false;

  for (const [k, options] of Object.entries(ROMAJI_TABLE)) {
    if (kana.startsWith(k)) {
      if (k === "っ") {
        const remainingKana = kana.slice(k.length);
        if (remainingKana.length > 0) {
          const nextConsonants = getFirstConsonants(remainingKana);
          for (const c of nextConsonants) {
            if (typed.startsWith(c)) {
              if (isExactMatchOfRomaji(remainingKana, typed.slice(c.length))) {
                return true;
              }
            }
          }
        }
        for (const opt of ["ltu", "xtu"]) {
          if (typed.startsWith(opt) && isExactMatchOfRomaji(remainingKana, typed.slice(opt.length))) {
            return true;
          }
        }
        return false;
      }

      if (k === "ん") {
        const remainingKana = kana.slice(k.length);
        const nextStartsWithN = getFirstConsonants(remainingKana).includes("n");
        if (nextStartsWithN) {
          if (typed.startsWith("n") && isExactMatchOfRomaji(remainingKana, typed.slice(1))) {
            return true;
          }
          for (const opt of ["nn", "xn"]) {
            if (typed.startsWith(opt) && isExactMatchOfRomaji(remainingKana, typed.slice(opt.length))) {
              return true;
            }
          }
        } else {
          for (const opt of ["nn", "xn"]) {
            if (typed.startsWith(opt) && isExactMatchOfRomaji(remainingKana, typed.slice(opt.length))) {
              return true;
            }
          }
          if (typed.startsWith("n") && isExactMatchOfRomaji(remainingKana, typed.slice(1))) {
            return true;
          }
        }
        return false;
      }

      for (const opt of options) {
        if (typed.startsWith(opt)) {
          if (isExactMatchOfRomaji(kana.slice(k.length), typed.slice(opt.length))) {
            return true;
          }
        }
      }
    }
  }

  const firstChar = kana[0];
  if (typed.toLowerCase().startsWith(firstChar.toLowerCase())) {
    return isExactMatchOfRomaji(kana.slice(1), typed.slice(1));
  }

  return false;
}

function startsWithConsonantForN(kana: string): boolean {
  if (kana === "") return false;
  const consonants = [
    "か", "き", "く", "け", "こ",
    "さ", "し", "す", "せ", "そ",
    "た", "ち", "つ", "て", "と",
    "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も",
    "ら", "り", "る", "れ", "ろ",
    "が", "ぎ", "ぐ", "げ", "ご",
    "ざ", "じ", "ず", "ぜ", "ぞ",
    "だ", "ぢ", "づ", "で", "ど",
    "ば", "び", "ぶ", "べ", "ぼ",
    "ぱ", "ぴ", "ぷ", "ぺ", "ぽ",
    "きゃ", "きゅ", "きょ", "しゃ", "しゅ", "しょ", "ちゃ", "ちゅ", "ちょ",
    "ひゃ", "ひゅ", "ひょ", "みゃ", "みゅ", "みょ", "りゃ", "りゅ", "りょ",
    "ぎゃ", "ぎゅ", "ぎょ", "じゃ", "じゅ", "じょ", "びゃ", "びゅ", "びょ", "ぴゃ", "ぴゅ", "ぴょ"
  ];
  return consonants.some(prefix => kana.startsWith(prefix));
}

function findMatchedRomajiPath(kana: string, typed: string): string | null {
  if (kana === "") {
    if (typed === "") return "";
    return null;
  }

  for (const [k, options] of Object.entries(ROMAJI_TABLE)) {
    if (kana.startsWith(k)) {
      if (k === "っ") {
        const remainingKana = kana.slice(k.length);
        if (remainingKana.length > 0) {
          const nextConsonants = getFirstConsonants(remainingKana);
          for (const c of nextConsonants) {
            if (typed.startsWith(c)) {
              const subPath = findMatchedRomajiPath(remainingKana, typed.slice(c.length));
              if (subPath !== null) {
                return c + subPath;
              }
            }
          }
        }
        for (const opt of ["ltu", "xtu"]) {
          if (typed.startsWith(opt)) {
            const subPath = findMatchedRomajiPath(remainingKana, typed.slice(opt.length));
            if (subPath !== null) {
              return opt + subPath;
            }
          }
        }
        if (typed === "" || "ltu".startsWith(typed) || "xtu".startsWith(typed) || (remainingKana.length > 0 && getFirstConsonants(remainingKana).some(c => c.startsWith(typed)))) {
          const nextC = remainingKana.length > 0 ? getFirstConsonants(remainingKana)[0] : "t";
          const defaultOpt = nextC ? nextC : "ltu";
          const subPath = findMatchedRomajiPath(remainingKana, "");
          return defaultOpt + (subPath || "");
        }
        return null;
      }

      if (k === "ん") {
        const remainingKana = kana.slice(k.length);
        const nextStartsWithN = getFirstConsonants(remainingKana).includes("n");

        if (nextStartsWithN) {
          // 1. If they typed a single "n" and it matches (highly preferred on "n"-consonants)
          if (typed.startsWith("n")) {
            const subPath = findMatchedRomajiPath(remainingKana, typed.slice(1));
            if (subPath !== null) {
              return "n" + subPath;
            }
          }
          // 2. Fallback to "nn" or "xn" if single "n" didn't succeed
          for (const opt of ["nn", "xn"]) {
            if (typed.startsWith(opt)) {
              const subPath = findMatchedRomajiPath(remainingKana, typed.slice(opt.length));
              if (subPath !== null) {
                return opt + subPath;
              }
            }
          }
        } else {
          // Standard ordering
          // 1. If they typed "nn" or "xn", use that
          for (const opt of ["nn", "xn"]) {
            if (typed.startsWith(opt)) {
              const subPath = findMatchedRomajiPath(remainingKana, typed.slice(opt.length));
              if (subPath !== null) {
                return opt + subPath;
              }
            }
          }
          // 2. If they typed a single "n" and it matches
          if (typed.startsWith("n")) {
            const subPath = findMatchedRomajiPath(remainingKana, typed.slice(1));
            if (subPath !== null) {
              return "n" + subPath;
            }
          }
        }
        
        // 3. Dynamic suggestion if typed is empty or prefixing
        const nextIsVowelOrYorN = startsWithVowelOrYorN(remainingKana);
        if ((nextIsVowelOrYorN && !nextStartsWithN) || remainingKana === "") {
          const subPath = findMatchedRomajiPath(remainingKana, "");
          return "nn" + (subPath || "");
        } else {
          const subPath = findMatchedRomajiPath(remainingKana, "");
          return "n" + (subPath || "");
        }
      }

      for (const opt of options) {
        if (typed.startsWith(opt)) {
          const subPath = findMatchedRomajiPath(kana.slice(k.length), typed.slice(opt.length));
          if (subPath !== null) {
            return opt + subPath;
          }
        }
      }
      for (const opt of options) {
        if (opt.startsWith(typed)) {
          const subPath = findMatchedRomajiPath(kana.slice(k.length), "");
          if (subPath !== null) {
            return opt + subPath;
          }
        }
      }
      return null;
    }
  }

  const firstChar = kana[0];
  if (typed.toLowerCase().startsWith(firstChar.toLowerCase())) {
    const subPath = findMatchedRomajiPath(kana.slice(1), typed.slice(1));
    if (subPath !== null) {
      return firstChar + subPath;
    }
  } else if (typed === "" || firstChar.toLowerCase().startsWith(typed.toLowerCase())) {
    const subPath = findMatchedRomajiPath(kana.slice(1), "");
    if (subPath !== null) {
      return firstChar + subPath;
    }
  }

  return null;
}

export function suggestRomaji(kana: string, typed: string): string {
  const result = findMatchedRomajiPath(kana, typed);
  if (result !== null) {
    return result;
  }
  for (let i = typed.length - 1; i >= 0; i--) {
    const sub = typed.slice(0, i);
    const res = findMatchedRomajiPath(kana, sub);
    if (res !== null) return res;
  }
  return findMatchedRomajiPath(kana, "") || "";
}
