const WORDS = [
  "apple","banana","strawberry","orange","grape","mango","tiger","panda",
  "dolphin","eagle","fox","wolf","rabbit","red","blue","green","purple",
  "ocean","forest","thunder","cloud","snow","pizza","burger","rocket",
  "planet","comet","clever","brave","swift","magic"
];

export function generateUsername(): string {
  const pool = [...WORDS];
  const picked: string[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  const num = Math.floor(Math.random() * 999) + 1;
  return `${picked[0]}-${picked[1]}-${picked[2]}-${num}`;
}