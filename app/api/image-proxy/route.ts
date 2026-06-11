import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to fetch image', status: response.status }, { status: 502 });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const headers = new Headers(response.headers);
    headers.set('Content-Type', contentType);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Image proxy fetch failed' }, { status: 502 });
  }
}
