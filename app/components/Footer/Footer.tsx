"use client"
import React from 'react'
import './footer.css'
import { useRouter, usePathname } from 'next/navigation'

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const showBack = pathname !== '/' 

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
        </div>
    </footer>
    )    
}