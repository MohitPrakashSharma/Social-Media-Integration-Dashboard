export interface User {
  token: string;
  name: string;
  referralCode: string;
  points: number;
  moves: number;
  taps: number;
  pendingMoves: number;
  level: number;
  totalLevel: number;
  resource_points: number;
  resource_updated_at: string;
  resource_points_per_sec: number;
  mintedPoints: number;
  isTutorialCompleted: boolean;
  totalEnergyRewardMoves: number;
  profilePicture: string;
  userId: string;
}

export interface LoginResponse {
  status: number;
  error: boolean;
  message: string;
  data: User;
  token:string
}

export interface TelegramUser {
  telegramId: string;
  userName: string;
  name: string;
  profilePicture: string;
  token:string
}