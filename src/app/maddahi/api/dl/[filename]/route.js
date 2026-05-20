import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { filename } = await params;
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return new Response("Failed to fetch audio file", { status: response.status });
    }

    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    headers.set("Content-Type", "audio/mpeg");

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response("Error streaming file", { status: 500 });
  }
}