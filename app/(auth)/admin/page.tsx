"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/server";
import "./adminPage.scss";
import Spinner from "@/app/components/LoadingSpinner/LoadingSpinner";

export default function AdminPage() {
  const { user } = useUser();

  const [users, setUsers] = useState<Array<User>>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("admin");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [ firstName, setFirstName] = useState("");
  const [ lastName, setLastName] = useState("");

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (Array.isArray(data)) {
      setUsers(data as Array<User>);
      setLoading(false);
    } else {
      setStatus("Failed to load users");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // after all hooks
  if (!user) {
    return (
      <div className="loading-page">
        <Spinner size={48} />
      </div>
    );
  }

  const role = user.publicMetadata.role;

  if (role !== "admin") {
    return <p>Denna sida är endast tillgänglig för administratörer</p>;
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating...");

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, userRole, firstName, lastName }),
    });

    if (res.ok) {
      setStatus("User created successfully!");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setUserRole("admin");
      loadUsers();
    } else {
      const data = await res.json();
      setStatus(`Error: ${data.error}`);
    }
  }

  async function updateRole(userId: string, role: string) {
    const res = await fetch("/api/admin/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok ) {
      setStatus("User role updated successfully");
    } else {
      setStatus("Failed to update user role");
    }
    loadUsers();
  }
  async function deleteUser(id: string) {
    const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        body: JSON.stringify({ userId: id }),
    });

    if (!res.ok) {
        console.log("Failed to delete user");
        return;
    } else {
      setStatus("User deleted successfully");
    }

    // refresh your user list after deletion
    loadUsers();
    }


  return (
    <div className="admin">
      <h1 className="page-title-1">Admin Panel</h1>

      <form className="create-user-form" onSubmit={createUser}>
        <h2 className="page-title-2">Skapa ny användare</h2>
        <input type="text"
          placeholder="Förnamn"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          name="firstName"
          required
        />
        <input
          type="text"
          placeholder="Efternamn"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          name="lastName"
          required
        />
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          required
        />

        <input
          type="password"
          placeholder="lösenord"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="RoleSelect">Välj roll: </label>
        <select className="user-role-select" id="RoleSelect" value={userRole} onChange={(e) => setUserRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="project">Arbetsledare</option>
        </select>

        <button id="SubmitFormBtn" type="submit">Skapa användare</button>
      </form>

      <p className="status-text">{status}</p>
      <h3 className="page-title-3">Användare</h3>
      <div className="users-list">
          {users.length === 0 ? (
          <p>No users found.</p>
          ) : (
            
            users.map((u) => (
                <div key={u.id} className="users-list-item">
                  <p>
                      <strong>{u.emailAddresses[0]?.emailAddress}</strong>
                  </p>
                  <p>{u.firstName} {u.lastName}</p>
                  <div className="users-list-item-role">
                    <label htmlFor={`role-${u.id}`}>Välj roll: </label>
                      <select
                        className="user-role-select"
                        id={`role-${u.id}`}
                        value={u.publicMetadata.role as string || "none"}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="project">Arbetsledare</option>
                      </select>
                  </div>

                  <button id="SubmitFormBtn" onClick={() => deleteUser(u.id)}>Radera användare</button>
                </div>
            ))
          )}        
      </div>
          <div className="admin-forms-redirect">
            <button id="SubmitFormBtn">
              <a href="/admin/form">Skapa ny formulärmall</a>
            </button>            
          </div>


    </div>
  );
}
