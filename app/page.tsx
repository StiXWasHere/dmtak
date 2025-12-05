import Image from "next/image";
import './landingPage.css';

export default function Home() {
  return (
    <div className="landing">
      <main className="landing-page">
        <h1 className="page-title-1">Välkommen till DM TAKs projektportal</h1>
        <button id="NavBtn">
          <a id="NavLink" href="/projects">Projekt</a>
        </button>
      </main>
    </div>
  );
}
