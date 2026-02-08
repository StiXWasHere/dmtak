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
import Spinner from '../LoadingSpinner/LoadingSpinner';

function Header() {
  const { showSave, onSave, showGenerate, onGeneratePdf, saving, generating } = useFormHeader();

  const { user } = useUser();

  const [open, setOpen] = useState(false);

  function toggleMenu() {
    setOpen((prev) => !prev);
  }

  if (!user) {
    return (
    <header className="header">
      <div className="header-content">
        <img src="/dmtaklogo.png" alt="DM TAK" id='Logo' />

        <div className={`menu-icon ${open ? "open" : ""}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
        </div>            
        <ul className={`header-content-list ${open ? "open" : ""}`}>
            <li><a href="/">Start</a></li>

            {showSave && (
              <li>
                <a className='header-content-list-tag' onClick={onSave}>
                  {saving ? <Spinner size={20} /> : 'Spara'}
                </a>
              </li>
            )}
            {showGenerate && (
              <li>
                <a className='header-content-list-tag' onClick={onGeneratePdf}>
                  {generating ? <Spinner size={20} /> : 'Generera PDF'}
                </a>
              </li>
            )}

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
        </div>
    </header>
    )
  }

  const role = user.publicMetadata.role;

  return (
    <header className="header">
      <div className="header-content">
        <img src="/dmtaklogo.png" alt="DM TAK" id='Logo' />

        <div className={`menu-icon ${open ? "open" : ""}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
        </div>            
        <ul className={`header-content-list ${open ? "open" : ""}`}>
            <li><a href="/">Start</a></li>

            {showSave && (
              <li>
                <a className='header-content-list-tag' onClick={onSave}>
                  {saving ? <Spinner size={20} /> : 'Spara'}
                </a>
              </li>
            )}
            {showGenerate && (
              <li>
                <a className='header-content-list-tag' onClick={onGeneratePdf}>
                  {generating ? <Spinner size={20} /> : 'Generera PDF'}
                </a>
              </li>
            )}

            {role === 'admin' && <li><a href="/admin">Admin</a></li>}
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
        </div>
    </header>
  )
}

export default Header