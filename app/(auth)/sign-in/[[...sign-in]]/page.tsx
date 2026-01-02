import { SignIn } from "@clerk/nextjs";
import './auth.css';

export default function SignInPage() {
  return (
    <div className="auth-page">
      <SignIn
        appearance={{
          elements: {
            rootBox: "clerk-root",
            card: "clerk-card",
            headerTitle: "clerk-title",
            headerSubtitle: "clerk-subtitle",
            formButtonPrimary: "clerk-primary-btn",
            footerActionLink: "clerk-link",
            formFieldInput: "clerk-input",
            formFieldLabel: "clerk-label",
          },
        }}
      />
    </div>
  );
}
