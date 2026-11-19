"use client";

import {useEffect, useRef, useState,type CSSProperties} from "react";


const labels = {
  ru: ["Включить музыку", "Остановить музыку", "Музыку не удалось загрузить"],
  tj: ["Мусиқиро фаъол кунед", "Мусиқиро қатъ кунед", "Мусиқӣ бор нашуд"],
  uz: ["Musiqani yoqish", "Musiqani to‘xtatish", "Musiqa yuklanmadi"],
};

export function InvitationMusic({locale,style,src="/rose-romantic-waltz.mp3",volume=0.45}: {locale: string;style?:CSSProperties;src?:string;volume?:number}) {
  const audio = useRef<HTMLAudioElement>(null);
  const triedByGesture = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [play, pause, error] = labels[locale as keyof typeof labels] ?? labels.ru;

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    player.volume = volume;

    function startAfterGesture(event: Event) {
      if (triedByGesture.current || !player?.paused ||
          (event.target instanceof Element && event.target.closest(".invitation-music"))) return;
      void player.play().then(() => { triedByGesture.current = true; }).catch(() => {});
    }

    void player.play().catch(() => {});
    document.addEventListener("pointerup", startAfterGesture);
    document.addEventListener("click", startAfterGesture);
    document.addEventListener("keydown", startAfterGesture);
    return () => {
      document.removeEventListener("pointerup", startAfterGesture);
      document.removeEventListener("click", startAfterGesture);
      document.removeEventListener("keydown", startAfterGesture);
    };
  }, [volume]);

  async function toggle() {
    const player = audio.current;
    if (!player) return;
    triedByGesture.current = true;
    if (!player.paused) {
      player.pause();
      return;
    }
    setFailed(false);
    try {
      await player.play();
    } catch {
      setFailed(true);
    }
  }

  return <div className="invitation-music" style={style}>
    <audio ref={audio} src={src} preload="auto" loop playsInline
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setPlaying(false); setFailed(true); }}/>
    <button type="button" onClick={toggle} aria-pressed={playing} aria-label={playing?pause:play} title={playing?pause:play}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {playing?<><path d="M9 5v14M15 5v14"/></>:<><path d="M9 17V5l11-2v12M9 9l11-2"/><ellipse cx="6" cy="17.5" rx="3" ry="2.5"/><ellipse cx="17" cy="15.5" rx="3" ry="2.5"/></>}
      </svg>
    </button>
    {failed && <small role="status">{error}</small>}
  </div>;
}
