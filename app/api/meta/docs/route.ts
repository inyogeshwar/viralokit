import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "docs", "meta-api-reference");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const docPath = searchParams.get("path");

    // If specific document content is requested
    if (docPath) {
      // Prevent directory traversal
      const safeRelPath = docPath.replace(/\.\./g, "").replace(/^\/+/, "");
      const fullPath = path.join(DOCS_DIR, safeRelPath);

      if (!fs.existsSync(fullPath)) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      const content = fs.readFileSync(fullPath, "utf8");
      return NextResponse.json({ path: safeRelPath, content });
    }

    // Otherwise return indexed manifest of all 70 docs
    const manifestPath = path.join(DOCS_DIR, "MANIFEST.json");
    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json({ error: "Docs manifest not found" }, { status: 404 });
    }

    const rawManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const items = rawManifest.map((item: any) => {
      const fullPath = path.join(DOCS_DIR, item.file);
      let title = path.basename(item.file, ".md");
      try {
        if (fs.existsSync(fullPath)) {
          const sample = fs.readFileSync(fullPath, "utf8").slice(0, 500);
          const match = sample.match(/^#\s+(.+)$/m);
          if (match) title = match[1].trim();
        }
      } catch (e) {}

      // Category derivation
      let category = "General Reference";
      const f = item.file.toLowerCase();
      if (f.includes("webhook")) category = "Webhooks & Real-Time";
      else if (f.includes("publishing") || f.includes("sharing") || f.includes("upload") || f.includes("audio") || f.includes("caption") || f.includes("ig-container") || f.includes("children")) category = "Publishing & Media";
      else if (f.includes("comment") || f.includes("private-replies") || f.includes("moderation")) category = "Comments & Moderation";
      else if (f.includes("discovery") || f.includes("hashtag") || f.includes("mentions") || f.includes("product-tagging") || f.includes("collaboration")) category = "Discovery & Hashtags";
      else if (f.includes("insights") || f.includes("limit")) category = "Analytics & Limits";
      else if (f.includes("threads")) category = "Threads Platform";
      else if (f.includes("login") || f.includes("token") || f.includes("oauth")) category = "Authentication & Login";
      else if (f.includes("error-codes")) category = "Error Codes";

      return {
        title,
        file: item.file.replace(/\\/g, "/"),
        url: item.url,
        size: item.size,
        category
      };
    });

    return NextResponse.json({ total: items.length, docs: items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
