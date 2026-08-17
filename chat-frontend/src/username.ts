// 随机用户名生成器：三个词 + 数字，如 apple-banana-strawberry-42

const WORDS: string[] = [
  "apple", "banana", "strawberry", "orange", "grape", "mango", "pear",
  "peach", "pineapple", "coconut", "lemon", "cherry", "blueberry",
  "watermelon", "kiwi", "papaya",
  "tiger", "panda", "dolphin", "eagle", "shark", "fox", "wolf", "rabbit",
  "koala", "penguin", "zebra", "monkey", "owl", "bear", "cat", "dog",
  "red", "blue", "green", "purple", "orange", "pink", "cyan", "violet",
  "gold", "silver", "crimson", "teal",
  "river", "mountain", "ocean", "forest", "thunder", "lightning", "storm",
  "cloud", "snow", "rain", "sun", "moon", "star", "comet", "galaxy",
  "pizza", "burger", "taco", "sushi", "noodle", "cookie", "cake", "donut",
  "coffee", "tea", "bread", "cheese",
  "rocket", "planet", "nebula", "meteor", "eclipse", "orbit", "cosmos",
  "clever", "brave", "calm", "wild", "bright", "silent", "swift",
  "frosty", "magic", "lucky", "neon", "crystal",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateUsername(): string {
  // Fisher-Yates 洗牌，抽 3 个不重复的词
  const pool = [...WORDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, 3);
  const num = randomInt(1, 999);
  return `${picked[0]}-${picked[1]}-${picked[2]}-${num}`;
}
