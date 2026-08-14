// ---------- 词库（8 类，随便加） ----------
const WORDS: string[] = [
  // 水果
  "apple", "banana", "strawberry", "orange", "grape", "mango", "pear",
  "peach", "pineapple", "coconut", "lemon", "cherry", "blueberry",
  "watermelon", "kiwi", "papaya",
  // 动物
  "tiger", "panda", "dolphin", "eagle", "shark", "fox", "wolf", "rabbit",
  "koala", "penguin", "zebra", "monkey", "owl", "bear", "cat", "dog",
  // 颜色
  "red", "blue", "green", "purple", "orange", "pink", "cyan", "violet",
  "gold", "silver", "crimson", "teal",
  // 自然
  "river", "mountain", "ocean", "forest", "thunder", "lightning", "storm",
  "cloud", "snow", "rain", "sun", "moon", "star", "comet", "galaxy",
  // 食物
  "pizza", "burger", "taco", "sushi", "noodle", "cookie", "cake", "donut",
  "coffee", "tea", "bread", "cheese",
  // 太空
  "rocket", "planet", "nebula", "meteor", "eclipse", "orbit", "cosmos",
  // 形容词
  "clever", "brave", "calm", "wild", "bright", "silent", "swift",
  "frosty", "cosmic", "magic", "lucky", "neon", "crystal",
];

// ---------- 工具函数 ----------
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------- 生成用户名 ----------
export function generateUsername(): string {
  // 抽 3 个不重复的词
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 3);

  const num = randomNumber(1, 999);
  return `${picked[0]}-${picked[1]}-${picked[2]}-${num}`;
}