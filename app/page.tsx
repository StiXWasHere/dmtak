import Image from "next/image";
import './landingPage.css';

export default function Home() {
  return (
    <div className="landing">
      <main className="landing-page">
        <button id="NavBtn">
          <a id="NavLink" href="/projects">Projekt</a>
        </button>
      </main>
    </div>
  );
}
