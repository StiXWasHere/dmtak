import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Be_Vietnam_Pro } from 'next/font/google';
import './styles/globals.css';
import Header from './components/Header/Header';
import { Client } from '@clerk/nextjs/server';
import { FormHeaderProvider } from './context/FormHeaderContext';
import { svSE } from "@clerk/localizations";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600'], // choose the weights you need
  subsets: ['latin'],
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  title: 'DM TAK',
  description: 'Powered by DM TAK',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={svSE}>
      <html lang="sv">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#dc042b"/>
          <meta name="mobile-web-app-capable" content="yes"/>
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="DM TAK" />
          <link rel="apple-touch-icon" href="/dmtakicon.png" />
        </head>
        <body className={beVietnamPro.variable}>
          <FormHeaderProvider>
            <Header />
            {children}
          </FormHeaderProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}