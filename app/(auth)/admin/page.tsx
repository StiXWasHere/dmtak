'use client';
import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function AdminPage() {
    const { user } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");

    if (!user) return <p>Loading</p> // Replace with loading component;

    const role = user.publicMetadata.role;

    if (role !== "admin") {
        return <p>Denna sida är endast tillgänglig för administratörer</p>; // Maybe replace with a proper access denied component
    }

    async function createUser(e: React.FormEvent) {
        e.preventDefault();
        setStatus("Creating...");

        const res = await fetch("/api/admin/create-user", {
            method: "POST",
            body: JSON.stringify({ email, password }) 
        });

        if (res.ok) {
            setStatus("User created successfully!");
            setEmail("");
            setPassword("");
        }else  {
            const data = await res.json();
            setStatus(`Error: ${data.error}`);
        }
    }

    return (
        <div className="admin">
            <h1 className="page-title-1">Admin Panel</h1>

            <form className="create-user-form" onSubmit={createUser}>
                <input 
                type="email" 
                placeholder="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                name="email" 
                required
                />
                <input 
                type="password" 
                placeholder="lösenord" 
                name="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
                />
                <button id="SubmitFormBtn" type="submit">
                    Skapa användare
                </button>                
            </form>

            <p className="status-text">{status}</p>
        </div>
    )
}