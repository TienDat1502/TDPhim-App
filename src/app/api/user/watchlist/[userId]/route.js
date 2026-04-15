import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { userId } = await params;
    const user = await User.findById(userId).select('watchlist');
    return NextResponse.json(user ? user.watchlist : []);
  } catch (error) {
    return NextResponse.json([]);
  }
}