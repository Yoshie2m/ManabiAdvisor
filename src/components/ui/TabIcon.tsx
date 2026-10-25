export type TabIconName =
  | "great-hall"
  | "grimoire-library"
  | "phantom-tower"
  | "treasure-bookmark"
  | "ui-back"
  | "ui-scroll"
  | "ui-gift"
  | "ui-zoom"
  | "ui-backdrop"
  | "ui-voice"
  | "kotodama"
  | "suhi"
  | "ikaigo"
  | "renkin"
  | "chishi-rekishi";

type TabIconProps = {
  name: TabIconName;
  size?: number;
  title?: string;
  className?: string;
};

// 24x24グリッドの線画ピクトグラム（線幅1.5、角は直角/miter）。
// "O cx cy r" は塗りつぶしの円として描画し、それ以外はSVGパス`d`として描画する。
const TAB_ICON_SHAPES: Record<TabIconName, string[]> = {
  "great-hall": [
    "M2.5 21H21.5",
    "M4 21V10.5H8V21",
    "M3.5 10.5L6 5.5L8.5 10.5Z",
    "M16 21V10.5H20V21",
    "M15.5 10.5L18 5.5L20.5 10.5Z",
    "M8 12.5L12 8.5L16 12.5",
    "M10.5 21V18A1.5 1.5 0 0 1 13.5 18V21",
    "M12 6.5V8.5",
    "M12 3.5L13.2 4.5L12 5.5L10.8 4.5Z",
  ],
  "grimoire-library": [
    "M12 6.5C10 5 6.5 4.5 3 5V19C6.5 18.5 10 19 12 20.5C14 19 17.5 18.5 21 19V5C17.5 4.5 14 5 12 6.5Z",
    "M12 6.5V20.5",
    "M5.5 9.5C7 9.3 8.5 9.5 9.5 10",
    "M5.5 12.5C7 12.3 8.5 12.5 9.5 13",
    "M5.5 15.5C7 15.3 8.5 15.5 9.5 16",
    "M16.5 9L18.5 12L16.5 15L14.5 12Z",
  ],
  "treasure-bookmark": [
    "M7 3H17V21L12 16.5L7 21Z",
    "M12 6L14.6 9.4L12 12.8L9.4 9.4Z",
    "M9.4 9.4H14.6",
    "M20 3V6.5",
    "M18.25 4.75H21.75",
  ],
  "ui-back": ["M15 5L8 12L15 19"],
  "ui-scroll": [
    "M6 4H17V18C17 19.1 17.9 20 19 20H8C6.9 20 6 19.1 6 18Z",
    "M17 4C18.1 4 19 4.9 19 6V8H17",
    "M9 8H14",
    "M9 11H14",
    "M9 14H12",
  ],
  "ui-gift": [
    "M4 9H20V13H4Z",
    "M5 13V20H19V13",
    "M12 9V20",
    "M12 9C10.5 5.5 7 5 7 7.5C7 9 9.5 9 12 9C14.5 9 17 9 17 7.5C17 5 13.5 5.5 12 9",
  ],
  "ui-zoom": ["M10.5 4A6.5 6.5 0 1 1 10.49 4Z", "M15.5 15.5L20 20", "M10.5 7.5V13.5", "M7.5 10.5H13.5"],
  "ui-backdrop": ["M4 5H20V19H4Z", "M4 16L9 11L13 15L16 12L20 16", "O15.5 8.5 1.3"],
  "ui-voice": [
    "M4 9H8L13 5V19L8 15H4Z",
    "M16 9C17.5 10.5 17.5 13.5 16 15",
    "M18.5 6.5C21.5 9.5 21.5 14.5 18.5 17.5",
  ],
  "phantom-tower": [
    "M2.5 21H21.5",
    "M6.5 21V10H12.5V21",
    "M5.5 10L9.5 2.5L13.5 10Z",
    "M8.5 14V12.8A1 1 0 0 1 10.5 12.8V14Z",
    "M8.5 21V18.5A1 1 0 0 1 10.5 18.5V21",
    "M15.5 18V14.5C15.5 11.6 20.5 11.6 20.5 14.5V18L19.25 17L18 18L16.75 17Z",
    "O17 15 0.75",
    "O19 15 0.75",
  ],
  kotodama: [
    "M20.5 3.5L14 10",
    "M14 10C12.4 8.9 10 9.6 9.4 12C8.8 14.4 7.4 15.6 5.5 16.2C8.6 17.4 12.3 16.4 13.3 13.9C13.8 12.6 14.4 11.2 14 10Z",
    "M3.5 20.5C6 19 9 19.5 11 20.5C13 21.5 16 21 18.5 19.5",
    "M19 14L19.9 15.5L19 17L18.1 15.5Z",
  ],
  suhi: ["M12 3.5A8.5 8.5 0 1 1 11.99 3.5Z", "M12 3.5L19.36 16.25H4.64Z", "O12 12.3 1.1"],
  ikaigo: [
    "M2.5 21H21.5",
    "M5 21V10A7 7 0 0 1 19 10V21",
    "M9.5 18L12 11.5L14.5 18",
    "M10.4 15.8H13.6",
  ],
  renkin: [
    "M9.5 3.5H14.5",
    "M10.5 3.5V9.2C7.5 10.3 5.5 12.9 5.5 15.5A6.5 6.5 0 0 0 18.5 15.5C18.5 12.9 16.5 10.3 13.5 9.2V3.5",
    "M6 14.5H18",
    "O10.3 17.6 0.9",
    "O14 16.9 0.75",
  ],
  "chishi-rekishi": [
    "M12 3.5A6.5 6.5 0 1 1 11.99 3.5Z",
    "M12 3.5C9.6 5.4 9.6 14.6 12 16.5C14.4 14.6 14.4 5.4 12 3.5",
    "M5.5 10H18.5",
    "M19 4.5A9 9 0 0 1 6.5 17.5",
    "M12 16.5V20.5",
    "M8.5 20.5H15.5",
  ],
};

export function TabIcon({ name, size = 24, title, className }: TabIconProps) {
  const shapes = TAB_ICON_SHAPES[name];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
      className={className}
    >
      {shapes.map((shape, index) => {
        if (shape.charAt(0) === "O") {
          const [cx, cy, r] = shape.slice(1).trim().split(/\s+/);
          return <circle key={index} cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;
        }
        return <path key={index} d={shape} />;
      })}
    </svg>
  );
}
