'use client';

import { usePathname } from 'next/navigation';
import AuthWrapper from './AuthWrapper';

interface ConditionalAuthWrapperProps {
  children: React.ReactNode;
}

export default function ConditionalAuthWrapper({ children }: ConditionalAuthWrapperProps) {
  const pathname = usePathname();
  
  // Define routes that should be public (no authentication required)
  const publicRoutes = ['/', '/terms', '/privacy'];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // If it's a public route, render children directly
  if (isPublicRoute) {
    return <>{children}</>;
  }
  
  // Otherwise, wrap with AuthWrapper
  return <AuthWrapper>{children}</AuthWrapper>;
} 