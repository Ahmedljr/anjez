import { AuthCard } from "@/features/auth/components/AuthCard";
import { EmailLoginForm } from "@/features/auth/components/EmailLoginForm";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

export default function LoginPage() {
  return (
    <AuthCard>
      <div className="flex flex-col gap-6">
        <GoogleSignInButton />

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          أو عبر البريد الإلكتروني
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <EmailLoginForm />
      </div>
    </AuthCard>
  );
}
