export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function generateTemplateSlug(name: string): string {
  const base = slugify(name);
  // If the slug is too short or generic, append a natural keyword
  if (base.split("-").length < 3) {
    return `${base}-multi-agent-automation-template`;
  }
  return `${base}-multi-agent-template`;
}
