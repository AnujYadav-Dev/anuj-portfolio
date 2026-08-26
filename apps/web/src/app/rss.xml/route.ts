import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = '/feed.xml';
  return NextResponse.redirect(url, 308);
}
