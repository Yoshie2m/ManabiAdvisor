import type { Buddy } from "@/contexts/house-assignment/domain/models/Buddy";

export const BUDDY_PROFILE: Record<Buddy, { name: string; reading: string; description: string; image: string }> = {
  Amou: {
    name: "天羽",
    reading: "アモウ",
    description: "サッカー部部長。元気いっぱいの体育会系。",
    image: "/images/characters/amou.svg",
  },
  Kageshima: {
    name: "影島",
    reading: "カゲシマ",
    description: "ギターを練習中の文化系。口数は少ない。",
    image: "/images/characters/kageshima.svg",
  },
};

// デザインシステムの胸像（40×44ドット）。整数倍で表示し、真っ黒の地に直接置かずカードの上で使う。
export function BuddyPortrait({ buddy, scale = 2 }: { buddy: Buddy; scale?: number }) {
  const profile = BUDDY_PROFILE[buddy];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profile.image}
      alt={`${profile.name}（${profile.reading}）`}
      width={40 * scale}
      height={44 * scale}
      className="shrink-0 [image-rendering:pixelated]"
    />
  );
}
