'use client';

import { useAuth } from '@/lib/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.profilePicture} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium mt-1">{user.name}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="text-muted-foreground hover:text-destructive transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}