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
      <html lang="en">
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