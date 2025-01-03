'use client';

import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link 
      href="/"
      className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity"
      aria-label="Go to homepage"
    >
      <Gamepad2 className="w-8 h-8" />
      <span className="font-bold text-xl hidden sm:block">TDX Game</span>
    </Link>
  );
}