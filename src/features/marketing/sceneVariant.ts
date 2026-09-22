
export function sceneVariant(pathname: string) {
  if (pathname === '/features') return 'features'
  if (pathname === '/modules') return 'modules'
  if (pathname === '/how-it-works') return 'workflow'
  if (pathname === '/pricing') return 'pricing'
  if (['/terms-of-service', '/privacy-policy', '/refund-policy'].includes(pathname)) return 'security'
  return 'support'
}
