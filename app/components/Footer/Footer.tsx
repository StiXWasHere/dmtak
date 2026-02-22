"use client"
import React from 'react'
import './footer.css'
import { useRouter, usePathname } from 'next/navigation'
import { useFormHeader } from '@/app/context/FormHeaderContext';
import Spinner from '../LoadingSpinner/LoadingSpinner';

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const showBack = pathname !== '/' 
  const { showSave, onSave, saving } = useFormHeader(); 

  if (!showBack) return null;

    return (
    <footer className='footer'>
        <div className='footer-container'>
            <button
                id='FooterIcon'
                className='footer-back'
                aria-label='Go back'
                onClick={() => router.back()}
            >
                ❮
            </button>
            {showSave && (
                <button
                    className='footer-save'
                    onClick={onSave}
                    aria-label='Save'
                >
                    {saving ? <Spinner size={20} /> : 'Spara'}
                </button>
            )}
        </div>
    </footer>
    )    
}