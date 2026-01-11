import Image from "next/image";
import './landingPage.css';
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="landing">
      <main className="landing-page">
          {user ? (
            <Link href="/projects" id="NavNextLink">
              Projekt
            </Link>
          ) : (
              <Link href="/sign-in" id="NavNextLink">
                Logga in
              </Link>
            )         
          }
      </main>
    </div>
  );
}
