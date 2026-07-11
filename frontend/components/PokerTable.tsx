"use client";

import { useEffect, useRef, useState } from "react";
import { Player, EmojiEvent } from "@/lib/types";
import { FIBONACCI } from "@/lib/constants";

const EMOJIS = [
  // Yüzler
  "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","🫠","😉","😊","😇",
  "🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑",
  "🤗","🤭","🫢","🫣","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏",
  "😒","🙄","😬","🤥","🫨","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢",
  "🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐",
  "😕","🫤","😟","🙁","☹️","😮","😯","😲","😳","🥺","🫹","😦","😧","😨",
  "😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡",
  "😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖",
  "😺","😸","😹","😻","😼","😽","🙀","😿","😾",
  // El & Beden
  "👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","🫷","🫸","👌","🤌","🤏",
  "✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍",
  "👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","💅","🤳",
  "💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀",
  "👁️","👅","👄","🫦","💋",
  // Hayvanlar
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷",
  "🐸","🐵","🙈","🙉","🙊","🐒","🦆","🐧","🐦","🦅","🦉","🦇","🐺","🐗",
  "🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦗","🕷️","🦂","🐢","🦎","🐍",
  "🐲","🦕","🦖","🦕","🐳","🐋","🐬","🦭","🐟","🐠","🐡","🦈","🐙","🦑",
  "🦞","🦀","🐡","🐊","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒",
  "🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩",
  "🦮","🐈","🐈‍⬛","🪶","🐓","🦃","🦤","🦚","🦜","🦢","🕊️","🐇","🦝","🦨",
  "🦡","🦫","🦦","🦥","🐁","🐀","🐿️","🦔",
  // Yiyecek
  "🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍",
  "🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🧄","🧅","🥔","🍠",
  "🫘","🌰","🥜","🍞","🥐","🥖","🫓","🥨","🧀","🥚","🍳","🧈","🥞","🧇",
  "🥓","🥩","🍗","🍖","🦴","🌭","🍔","🍟","🍕","🫔","🌮","🌯","🥙","🧆",
  "🥚","🍱","🍘","🍙","🍚","🍛","🍜","🍝","🍠","🍢","🍣","🍤","🍥","🥮",
  "🍡","🥟","🦪","🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬",
  "🍭","🍮","🍯","🍼","🥛","☕","🫖","🍵","🧃","🥤","🧋","🍶","🍺","🍻",
  "🥂","🍷","🫗","🥃","🍸","🍹","🧉","🍾","🧊","🥄","🍴","🫙",
  // Aktivite & Spor
  "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸","🏒","🥅",
  "⛳","🎣","🤿","🎽","🎿","🛷","🥌","🎯","🪃","🏹","🎣","🥊","🥋","🎮",
  "🎲","♟️","🎭","🎨","🖼️","🎪","🎤","🎧","🎼","🎵","🎶","🎷","🎸","🎹",
  "🎺","🎻","🪕","🥁","🪘","🎬","🎥","📽️","🎞️","📺",
  // Doğa & Hava
  "🌸","💐","🌹","🌺","🌻","🌼","🌷","🪷","🌱","🌿","☘️","🍀","🎋","🎍",
  "🍃","🍂","🍁","🪺","🪹","🍄","🌾","💫","⭐","🌟","✨","💥","🔥","🌈",
  "☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌬️",
  "💨","🌪️","🌫️","🌊","🌁","🌀","🌈","🌂","☂️","⚡","🌙","🌛","🌜","🌝",
  // Nesneler
  "🚀","🛸","🚁","✈️","🚂","🚗","🚕","🚙","🚌","🏎️","🚓","🚑","🚒","🛺",
  "🚲","🛴","🛵","🏍️","🚨","🚔","🚍","🚘","🚖","🛻","🚚","🚛","🚜","🏗️",
  "⛵","🚤","🛥️","🛳️","⛴️","🚢","🛩️","💺","🚀","🛸","🪂","⛽","🚧","⚓",
  "💡","🔦","🕯️","🪔","💰","💳","💎","🔑","🗝️","🔐","🔒","🔓","🔨","🪓",
  "⚒️","🛠️","🔧","🔩","⚙️","🗜️","⚖️","🦯","🔗","⛓️","🪝","🧲","🪜","🧰",
  "🪤","🧲","💣","🔫","🪃","🏹","🛡️","🪚","🔪","🗡️","⚔️","🛡️","🚬","⚰️",
  "🧨","🎁","🎀","🎗️","🎟️","🎫","🏆","🥇","🥈","🥉","🏅","🎖️","🎪",
  "📱","💻","🖥️","🖨️","⌨️","🖱️","💾","💿","📀","📷","📸","📹","📼","📞",
  "☎️","📟","📠","📺","📻","🧭","⏱️","⌛","⏰","📡","🔋","🔌","💡","🔦",
  "🕯️","🗑️","🛢️","💸","💵","💴","💶","💷","🏦","📈","📉","📊","📋","📌",
  "📍","📎","🖇️","📏","📐","✂️","🗃️","🗂️","🗄️","📁","📂","📓","📔","📒",
  "📕","📗","📘","📙","📚","📖","🔖","🏷️","💰","📫","📪","📬","📭","📮",
  "📯","📜","📃","📄","📑","📊","📈","📉","🗒️","🗓️","📆","📅","🗑️","📇",
  "🗃️","🗳️","🗄️","📋","📁","📂","🗂️","🗞️","📰","📓","📔","📒","📕","📗",
  "📘","📙","📚","📖",
  // Semboller
  "💯","✅","❎","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","❤️","🧡",
  "💛","💚","💙","💜","🖤","🤍","🤎","❤️‍🔥","❤️‍🩹","💔","💕","💞","💓","💗",
  "💖","💘","💝","💟","☮️","✝️","☪️","🕉️","✡️","🔯","☯️","☦️","🛐","⛎",
  "♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑",
  "☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️",
  "㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","❌","⭕","🛑",
  "⛔","📛","🚫","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","🔕","🔇","📳",
  "🔈","🔉","🔊","📢","📣","🔔","🔕","🎵","🎶","💹","🛗","🏧","💱","💲",
  "➕","➖","➗","✖️","♾️","💲","💱","🔱","📛","🔰","⭕","✅","☑️","✔️",
  "❎","🔲","🔳","⬛","⬜","◼️","◻️","◾","◽","▪️","▫️","🟥","🟧","🟨",
  "🟩","🟦","🟪","🟫","⚫","⚪","🔶","🔷","🔸","🔹","🔺","🔻","💠","🔘",
  "🔵","🟤","🔴","🟠","🟡","🟢","🟣","🔁","🔂","▶️","⏩","⏭️","⏯️","◀️",
  "⏪","⏮️","🔼","⏫","🔽","⏬","⏸️","⏹️","⏺️","🎦","🔅","🔆","📶","📳",
  "🔃","🔄","🔙","🔚","🔛","🔜","🔝","🆗","🆙","🆒","🆕","🆓","0️⃣","1️⃣",
  "2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔠","🔡","🔢","🔣","🔤",
  "🅰️","🅱️","🆎","🆑","🅾️","🆘","❓","❔","❕","❗","‼️","⁉️","🔅","🔆",
  // ÖZEL YAZILI
  "NANKATSU",
  "HADİ UYAN",
  "KENDİNE GEL",
  "FOCUS",
  "ACELECİ",
  "YAV YAV",
  "NE O?",
  "DÜŞÜN",
  "EMİN MİSİN?",
  "GEÇ KALDIN",
  "BRAVO",
  "OLMADI",
  "TAM İSABET",
  "SANA NE",
  "EFSANE",
  "KARGOM GELDİ",
];
const CONFETTI_EMOJIS = ["🎉", "🎊", "🥳", "⭐", "✨", "🎈", "🙌", "💥"];

function cardColor(value: string) {
  const n = parseInt(value);
  if (isNaN(n)) return { text: "#6b7280", border: "#d1d5db" };
  if (n <= 3)   return { text: "#16a34a", border: "#86efac" };
  if (n <= 8)   return { text: "#4f46e5", border: "#a5b4fc" };
  return        { text: "#d97706", border: "#fcd34d" };
}

function PlayingCard({ value, size = "md" }: { value: string; size?: "sm" | "md" }) {
  const { text, border } = cardColor(value);
  const isLong = value.length > 2;
  const w = size === "sm" ? 32 : 38;
  const h = size === "sm" ? 46 : 54;
  const centerSize = size === "sm" ? (isLong ? "0.85rem" : "1rem") : (isLong ? "1rem" : "1.25rem");
  return (
    <div
      style={{
        width: w, height: h,
        background: "#fff",
        border: `2px solid ${border}`,
        borderRadius: 6,
        boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
        position: "relative",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: centerSize, fontWeight: 900, color: text, fontFamily: "serif", lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}

function Confetti() {
  const [items] = useState(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      emoji: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
      left: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 0.6}s`,
      size: `${Math.random() * 1.2 + 1.2}rem`,
    }))
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute bottom-0"
          style={{
            left: item.left,
            animationDelay: item.delay,
            fontSize: item.size,
            animation: "confetti-up 2.4s ease-out forwards",
          }}
        >
          {item.emoji}
        </span>
      ))}
      <style>{`
        @keyframes confetti-up {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function TableRevealResults({
  votes,
}: {
  votes: Record<string, string>;
  players: Record<string, Player>;
}) {
  const entries = Object.entries(votes);
  const numeric = entries.map(([, v]) => parseFloat(v)).filter((n) => !isNaN(n));
  const average =
    numeric.length > 0
      ? (numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(1)
      : null;
  const allSame = numeric.length > 1 && numeric.every((n) => n === numeric[0]);

  // Group by value, preserve Fibonacci order
  const counts: Record<string, number> = {};
  for (const [, v] of entries) counts[v] = (counts[v] ?? 0) + 1;
  const grouped = Object.entries(counts).sort((a, b) => {
    const na = parseFloat(a[0]);
    const nb = parseFloat(b[0]);
    if (isNaN(na) && isNaN(nb)) return 0;
    if (isNaN(na)) return 1;
    if (isNaN(nb)) return -1;
    return na - nb;
  });

  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (allSame) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2600);
      return () => clearTimeout(t);
    }
  }, [allSame]);

  return (
    <>
      {showConfetti && <Confetti />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {/* Grouped cards with count below each */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 420 }}>
          {grouped.map(([value, count]) => (
            <div key={value} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <PlayingCard value={value} size="sm" />
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.65rem", fontWeight: 600 }}>
                {count} kişi
              </span>
            </div>
          ))}
        </div>

        {/* Average */}
        {average && (
          <div style={{ textAlign: "center", lineHeight: 1, marginTop: 2 }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem", margin: "0 0 3px 0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Ortalama
            </p>
            <p style={{ color: "#fff", fontSize: "2.2rem", fontWeight: 900, margin: 0, fontFamily: "serif", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
              {average}
            </p>
          </div>
        )}

        {allSame && (
          <p style={{ color: "#86efac", fontSize: "0.72rem", fontWeight: 700, margin: 0, letterSpacing: "0.04em" }}>
            Konsensüs!
          </p>
        )}
      </div>
    </>
  );
}

function TableCardDeck({
  selectedValue,
  hasVoted,
  onVote,
}: {
  selectedValue: string | null;
  hasVoted: boolean;
  onVote: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", maxWidth: 420 }}>
        {FIBONACCI.map((value) => {
          const isSelected = selectedValue === value;
          return (
            <button
              key={value}
              onClick={() => onVote(value)}
              style={{
                width: 42, height: 60,
                borderRadius: 7,
                border: isSelected ? "2.5px solid #818cf8" : "2px solid rgba(255,255,255,0.45)",
                background: isSelected ? "#e0e7ff" : "rgba(255,255,255,0.88)",
                color: isSelected ? "#3730a3" : "#374151",
                fontWeight: 800,
                fontSize: "1.05rem",
                cursor: "pointer",
                transform: isSelected ? "translateY(-10px) scale(1.08)" : "translateY(0) scale(1)",
                boxShadow: isSelected ? "0 10px 24px rgba(0,0,0,0.35)" : "0 3px 8px rgba(0,0,0,0.22)",
                transition: "all 0.15s ease",
                fontFamily: "serif",
                outline: "none",
                opacity: 1,
              }}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface PokerTableProps {
  players: Record<string, Player>;
  votes: Record<string, string> | null;
  revealed: boolean;
  myPlayerId: string;
  emojiEvents: EmojiEvent[];
  onSendEmoji: (targetId: string, emoji: string) => void;
  selectedValue: string | null;
  hasVoted: boolean;
  onVote: (value: string) => void;
}

interface LocalParticle {
  uid: number;
  emoji: string;
  targetX: number;
  targetY: number;
  dx: number;
  dy: number;
}

function EmojiParticle({ particle: p }: { particle: LocalParticle }) {
  // step 0 → başlangıç pozisyonu (uzakta), step 1 → hedefe uç, step 2 → yukarı kaybol
  const [step, setStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    // İki RAF: step 0 render olduktan sonra transition başlasın
    let r2: number;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setStep(1));
    });
    const t = setTimeout(() => setStep(2), 950);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); clearTimeout(t); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const transforms = [
    `translate(calc(-50% + ${p.dx}px), calc(-50% + ${p.dy}px)) scale(0.5)`,
    `translate(-50%, -50%) scale(1.3)`,
    `translate(-50%, calc(-50% - 80px)) scale(1.6)`,
  ];

  const transitions = [
    "none",
    "transform 0.75s ease-out, opacity 0.1s",
    "transform 0.55s ease-out, opacity 0.45s ease-in",
  ];

  return (
    <span
      style={{
        position: "absolute",
        left: `${p.targetX}%`,
        top: `${p.targetY}%`,
        fontSize: "2rem",
        pointerEvents: "none",
        zIndex: 100,
        transform: transforms[step],
        opacity: step === 2 ? 0 : 0.95,
        transition: transitions[step],
        willChange: "transform, opacity",
      }}
    >
      {p.emoji}
    </span>
  );
}

let particleUid = 0;

export function PokerTable({
  players,
  votes,
  revealed,
  myPlayerId,
  emojiEvents,
  onSendEmoji,
  selectedValue,
  hasVoted,
  onVote,
}: PokerTableProps) {
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const [localParticles, setLocalParticles] = useState<LocalParticle[]>([]);
  const seenIds = useRef(new Set<number>());
  // Local echo ile gönderilen emojiler: server echo'su geldiğinde çift göstermemek için
  const localEchoes = useRef<{ targetId: string; emoji: string; at: number }[]>([]);
  const playerList = Object.values(players);

  // Convert incoming emoji events to positioned particles
  useEffect(() => {
    const newEvents = emojiEvents.filter((e) => !seenIds.current.has(e.id));
    if (newEvents.length === 0) return;

    const now = Date.now();
    const added: LocalParticle[] = [];
    for (const event of newEvents) {
      seenIds.current.add(event.id);
      // Local echo varsa server echo'yu atla (çift gösterme)
      const echoIdx = localEchoes.current.findIndex(
        (e) => e.targetId === event.targetPlayerId && e.emoji === event.emoji && now - e.at < 2000
      );
      if (echoIdx !== -1) { localEchoes.current.splice(echoIdx, 1); continue; }
      const idx = playerList.findIndex((p) => p.id === event.targetPlayerId);
      if (idx === -1) continue;
      const total = playerList.length;
      const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
      const targetX = 50 + 46 * Math.cos(angle);
      const targetY = 50 + 43 * Math.sin(angle);
      const throwAngle = Math.random() * 2 * Math.PI;
      const dist = 180 + Math.random() * 130;
      added.push({
        uid: ++particleUid,
        emoji: event.emoji,
        targetX,
        targetY,
        dx: Math.cos(throwAngle) * dist,
        dy: Math.sin(throwAngle) * dist,
      });
    }

    if (added.length === 0) return;
    setLocalParticles((prev) => [...prev, ...added]);
    const uids = added.map((p) => p.uid);
    setTimeout(() => {
      setLocalParticles((prev) => prev.filter((p) => !uids.includes(p.uid)));
    }, 2400);
  }, [emojiEvents, players]); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePicker(playerId: string) {
    if (playerId === myPlayerId) return;
    setActivePickerId((prev) => (prev === playerId ? null : playerId));
  }

  function spawnParticle(targetId: string, emoji: string) {
    const idx = playerList.findIndex((p) => p.id === targetId);
    if (idx === -1) return;
    const total = playerList.length;
    const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
    const targetX = 50 + 46 * Math.cos(angle);
    const targetY = 50 + 43 * Math.sin(angle);
    const throwAngle = Math.random() * 2 * Math.PI;
    const dist = 180 + Math.random() * 130;
    const p: LocalParticle = {
      uid: ++particleUid,
      emoji,
      targetX,
      targetY,
      dx: Math.cos(throwAngle) * dist,
      dy: Math.sin(throwAngle) * dist,
    };
    setLocalParticles((prev) => [...prev, p]);
    setTimeout(() => setLocalParticles((prev) => prev.filter((x) => x.uid !== p.uid)), 2400);
  }

  function handleEmojiClick(targetId: string, emoji: string) {
    onSendEmoji(targetId, emoji);
    // Local echo kaydı — server echo geldiğinde çift göstermemek için
    localEchoes.current.push({ targetId, emoji, at: Date.now() });
    spawnParticle(targetId, emoji);
  }

  const showResults = revealed && votes && Object.keys(votes).length > 0;

  return (
    <div
      className="relative w-full mx-auto select-none"
      style={{ maxWidth: 900, aspectRatio: "3/2", overflow: "visible" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setActivePickerId(null);
      }}
    >
      {/* Felt table surface */}
      <div
        className="absolute shadow-2xl"
        style={{
          left: "10%", top: "10%", width: "80%", height: "80%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 40% 35%, #1a6b3a 0%, #155230 60%, #0f3d24 100%)",
          border: "16px solid #6b3a1a",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px)" }}
        />
        <div className="absolute rounded-full" style={{ inset: 6, border: "2px solid rgba(255,255,255,0.06)" }} />
      </div>

      {/* Emoji particles — Web Animations API (CSP-safe, no inline style injection) */}
      {localParticles.map((p) => (
        <EmojiParticle key={p.uid} particle={p} />
      ))}

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          left: "50%", top: "52%",
          transform: "translate(-50%, -50%)",
          zIndex: 5,
          pointerEvents: "auto",
        }}
      >
        {showResults ? (
          <TableRevealResults votes={votes!} players={players} />
        ) : (
          <TableCardDeck selectedValue={selectedValue} hasVoted={hasVoted} onVote={onVote} />
        )}
      </div>

      {/* Players around the table */}
      {playerList.map((player, i) => {
        const total = playerList.length;
        const angle = (2 * Math.PI * i) / total - Math.PI / 2;
        const rx = 46;
        const ry = 43;
        const x = 50 + rx * Math.cos(angle);
        const y = 50 + ry * Math.sin(angle);

        const isMe = player.id === myPlayerId;
        const showPicker = activePickerId === player.id;

        return (
          <div
            key={player.id}
            style={{
              position: "absolute",
              left: `${x}%`, top: `${y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: showPicker ? 30 : 10,
            }}
          >
            {/* Emoji picker */}
            {showPicker && (
              <div
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex flex-wrap gap-1 rounded-2xl shadow-xl px-3 py-2 z-40 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                style={{ width: 280, maxHeight: 200, overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
              >
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    className={`hover:scale-125 transition-transform leading-none ${/^[A-ZÇĞİÖŞÜa-zçğışöü\s?!]+$/.test(emoji) ? "text-xs font-bold text-red-500 px-1 py-0.5 bg-red-50 dark:bg-red-950 rounded" : "text-xl"}`}
                    onClick={(e) => { e.stopPropagation(); handleEmojiClick(player.id, emoji); }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Player card */}
            <div
              className={`
                relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl shadow-md cursor-pointer
                transition-all duration-150 hover:scale-105 active:scale-95
                ${isMe
                  ? "bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-400 dark:border-indigo-500"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500"
                }
              `}
              style={{ minWidth: 72 }}
              onClick={() => togglePicker(player.id)}
              title={isMe ? player.name : `${player.name} — emoji fırlat`}
            >
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 text-center max-w-[68px] truncate leading-tight">
                {player.name}
              </span>
              {revealed && votes?.[player.id] ? (
                <PlayingCard value={votes[player.id]} />
              ) : (
                <>
                  <div className="w-8 h-7 rounded flex items-center justify-center text-xs font-bold">
                    {player.hasVoted ? (
                      <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 w-full h-full rounded flex items-center justify-center">✓</span>
                    ) : (
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-400 w-full h-full rounded flex items-center justify-center">—</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      {playerList.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-green-200/40 text-sm font-medium">
          Katılımcı bekleniyor...
        </div>
      )}
    </div>
  );
}
