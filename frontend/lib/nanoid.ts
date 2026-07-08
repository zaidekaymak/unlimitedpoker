const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function nanoid(n: number): string {
  return Array.from({ length: n }, () =>
    charset[Math.floor(Math.random() * charset.length)]
  ).join("");
}
