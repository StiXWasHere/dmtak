'use client';
import { useState } from 'react';
import {
  ClerkProvider,
  SignIn,
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import './header.css'
import { useFormHeader } from '@/app/context/FormHeaderContext';

function Header() {
  const { showSave, onSave, showGenerate, onGeneratePdf } = useFormHeader();

  const { user } = useUser();

  const [open, setOpen] = useState(false);

  function toggleMenu() {
    setOpen((prev) => !prev);
  }

  return (
    <header className="header">
        <img src="/dmtaklogo.png" alt="DM TAK" id='Logo' />

        <div className={`menu-icon ${open ? "open" : ""}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
        </div>            
        <ul className={`header-list ${open ? "open" : ""}`}>
            <li><a href="/">Start</a></li>

            {showSave && (<li><a onClick={onSave}>Spara</a></li>)}
            {showGenerate && (<li><a onClick={onGeneratePdf}>Generera PDF</a></li>)}

            <li><a href="/admin">Admin</a></li>
            <li>
              <SignedOut>
                <a href="/sign-in">Logga in</a>
              </SignedOut>
              <SignedIn>
                <SignOutButton>
                  <a>Logga ut</a>
                </SignOutButton>
              </SignedIn>              
            </li>
        </ul>
    </header>
  )
}

export default Header