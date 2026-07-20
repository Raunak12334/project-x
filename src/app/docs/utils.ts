import fs from "fs";
import path from "path";

export interface DocMeta {
  slug: string;
  title: string;
  description: string;
}

export function getDocs(): DocMeta[] {
  const docsDir = path.join(process.cwd(), "docs");
  try {
    const files = fs.readdirSync(docsDir).filter((file) => file.endsWith(".md"));
    return files
      .map((file) => {
        const slug = file.replace(/\.md$/, "");
        const content = fs.readFileSync(path.join(docsDir, file), "utf-8");
        
        // Extract title from H1
        const titleMatch = content.match(/^#\s+(.+)/m);
        const title = titleMatch ? titleMatch[1] : slug;
        
        // Extract a description (first text block after ## Summary)
        const descMatch = content.match(/^##\s+Summary\s*\n\n([^#]+)/m);
        let description = descMatch ? descMatch[1].trim() : "";
        if (description.length > 150) {
          description = description.substring(0, 150) + "...";
        }
        
        return { slug, title, description };
      })
      .sort((a, b) => a.slug.localeCompare(b.slug));
  } catch (error) {
    console.error("Error reading docs directory", error);
    return [];
  }
}
