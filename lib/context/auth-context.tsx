'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, TelegramUser } from '@/lib/types/auth';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface AuthContextType {
	user: User | null;
	login: (telegramUser: TelegramUser) => Promise<void>;
	logout: () => void;
	isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const { toast } = useToast();

	const handleLogin = async (telegramUser: TelegramUser) => {
		const response = await fetch('https://stage-api.tdx.biz/game/api/v1/users/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(telegramUser),
		});

		const data = await response.json();

		if (data.error) {
			throw new Error(data.message);
		}

		setUser(data.data);
		localStorage.setItem('user', JSON.stringify(data.data));
		toast({
			title: 'Login Successful',
			description: 'Welcome back!',
		});
	};

	const { execute: debouncedLogin, isExecuting: isLoggingIn } = useDebounce(handleLogin, 1000);

	const login = async (telegramUser: TelegramUser) => {
		try {
			await debouncedLogin(telegramUser);
		} catch (error: any) {
			toast({
				title: 'Login Failed',
				description: error.message,
				variant: 'destructive',
			});
			throw error;
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem('user');
		toast({
			title: 'Logged Out',
			description: 'You have been successfully logged out.',
		});
	};

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoggingIn }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}