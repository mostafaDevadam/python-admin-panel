// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest, event?: any) {
    console.log("proxy");
  // Inspect request (e.g., check auth)
  const user_id = request.cookies.has('user_id');

  


  return NextResponse;
}