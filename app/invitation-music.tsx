"use client";

import {useEffect, useRef, useState} from "react";

const labels = {
  ru: ["Включить музыку", "Остановить музыку", "Музыку не удалось загрузить"],
  tj: ["Мусиқиро фаъол кунед", "Мусиқиро қатъ кунед", "Мусиқӣ бор нашуд"],
  uz: ["Musiqani yoqish", "Musiqani to‘xtatish", "Musiqa yuklanmadi"],
};

export function InvitationMusic({locale}: {locale: string}) {
  const audio = useRef<HTMLAudioElement>(null);
  const triedByGesture = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [play, pause, error] = labels[locale as keyof typeof labels] ?? labels.ru;

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    player.volume = 0.45;

    function startAfterGesture(event: Event) {
      if (triedByGesture.current || !player?.paused ||
          (event.target instanceof Element && event.target.closest(".invitation-music"))) return;
      triedByGesture.current = true;
      void player.play().catch(() => {});
    }

    void player.play().catch(() => {});
    document.addEventListener("click", startAfterGesture);
    document.addEventListener("keydown", startAfterGesture);
    return () => {
      document.removeEventListener("click", startAfterGesture);
      document.removeEventListener("keydown", startAfterGesture);
    };
  }, []);

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

  return <div className="invitation-music">
    <audio ref={audio} src="/rose-romantic-waltz.mp3" preload="auto" loop
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setPlaying(false); setFailed(true); }}/>
    <button type="button" onClick={toggle} aria-pressed={playing}>
      <span aria-hidden="true">{playing ? "Ⅱ" : "♪"}</span> {playing ? pause : play}
    </button>
    {failed && <small role="status">{error}</small>}
  </div>;
}
