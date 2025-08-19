const MAX_LENGTH = 5;

// Generates a random string to be used as a unique identifier
export function generate() {
  let ans = "";

  const subset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < MAX_LENGTH; i++) {
    ans += subset[Math.floor(Math.random() * subset.length)];
  }

  return ans;
}