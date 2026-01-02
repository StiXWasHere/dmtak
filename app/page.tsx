import Image from "next/image";
import './landingPage.css';
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="landing">
      <main className="landing-page">
        <button id="NavBtn">
          {user ? <a id="NavLink" href="/projects">Projekt</a> : <a id="NavLink" href="/sign-in">Logga in</a>}    
        </button>
      </main>
    </div>
  );
}
