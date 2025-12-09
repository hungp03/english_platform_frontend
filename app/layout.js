import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import GoogleOAuthProviderWrapper from '@/components/providers/google-oauth-provider';
import FCMProvider from '@/components/providers/fcm-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/logo.ico" />
      </head>
      <body className="min-h-screen bg-gray-50" suppressHydrationWarning>
        <GoogleOAuthProviderWrapper>
          <TooltipProvider>
            <FCMProvider>
              <Toaster />
              {children}
            </FCMProvider>
          </TooltipProvider>
        </GoogleOAuthProviderWrapper>
      </body>
    </html>
  );
}
