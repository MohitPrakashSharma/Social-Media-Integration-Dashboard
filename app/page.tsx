import { SocialDashboard } from '@/components/social/SocialDashboard';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Social Media Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Connect and manage your social media accounts
        </p>
      </div>
      <SocialDashboard />
    </main>
  );
}