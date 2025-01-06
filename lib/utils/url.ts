export function getBaseUrl(): string {
    return process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://social.tdx.biz';
  }
  
  export function createRedirectUrl(params: { error?: string; success?: boolean; platform?: string }): string {
    const url = new URL(getBaseUrl());
    
    if (params.error) {
      url.searchParams.set('error', params.error);
    }
    if (params.success) {
      url.searchParams.set('success', 'true');
    }
    if (params.platform) {
      url.searchParams.set('platform', params.platform);
    }
    
    return url.toString();
  }