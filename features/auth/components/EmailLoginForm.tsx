"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInWithEmail, signUpWithEmail } from "@/services/auth.service";
import { Button, Input } from "@/components/ui";

type Mode = "sign-in" | "sign-up";

export function EmailLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();
      if (mode === "sign-in") {
        await signInWithEmail(supabase, email, password);
        router.replace("/dashboard");
        router.refresh();
      } else {
        await signUpWithEmail(supabase, email, password);
        setInfo("تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد التسجيل.");
      }
    } catch {
      setError(
        mode === "sign-in"
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : "تعذّر إنشاء الحساب، حاول مرة أخرى"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          البريد الإلكتروني
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="ltr"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          كلمة المرور
        </label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          required
          minLength={6}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="ltr"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {info && <p className="text-sm text-emerald-600">{info}</p>}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {mode === "sign-in" ? "تسجيل الدخول" : "إنشاء حساب"}
      </Button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          setError(null);
          setInfo(null);
        }}
        className="text-sm text-primary-600 hover:underline"
      >
        {mode === "sign-in"
          ? "ليس لديك حساب؟ أنشئ واحدًا"
          : "لديك حساب بالفعل؟ سجّل الدخول"}
      </button>
    </form>
  );
}
