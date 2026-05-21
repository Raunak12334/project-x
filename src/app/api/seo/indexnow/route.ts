import { NextResponse } from "next/server";

export const runtime = "edge";

interface IndexNowRequest {
  urls: string[];
}

interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "8f3b2a1c4e6d7b8a9f0e1c2b3a4f5e6d";
const CANONICAL_HOST = "otogent.com";
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

export async function POST(request: Request) {
  try {
    let body: IndexNowRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'urls' parameter. Must be a non-empty array of strings." },
        { status: 400 }
      );
    }

    // Map and format all items to absolute URLs prepending the secure canonical domain
    const formattedUrls = urls.map((urlPath) => {
      // Clean up duplicate leading slashes if any, and ensure it has a single leading slash
      const cleanedPath = urlPath.replace(/^\/+/, "");
      return new URL(`/${cleanedPath}`, CANONICAL_ORIGIN).toString();
    });

    const payload: IndexNowPayload = {
      host: CANONICAL_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${CANONICAL_ORIGIN}/${INDEXNOW_KEY}.txt`,
      urlList: formattedUrls,
    };

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `IndexNow engine returned status ${response.status}`,
          details: errorText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "URLs successfully submitted to IndexNow.",
        submittedUrls: formattedUrls,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Runtime error during IndexNow submission", details: errorMessage },
      { status: 500 }
    );
  }
}
