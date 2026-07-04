/** Slug URL dari string — mis. "Kopi Robusta 250gr" → "kopi-robusta-250gr". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug unik — bila base sudah ada di daftar existing, tambahkan akhiran -2, -3, dst. */
export function uniqueSlug(existing: string[], base: string): string {
  const slug = slugify(base) || "produk";
  if (!existing.includes(slug)) return slug;
  let n = 2;
  while (existing.includes(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}