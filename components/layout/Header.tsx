'use client';

import { Logo } from './Logo';
import { UserProfile } from './UserProfile';
import { TelegramButton } from './TelegramButton';

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-6">
            <TelegramButton />
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
}