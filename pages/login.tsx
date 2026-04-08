import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Asterisk, Eye, EyeOff } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { hasValidToken } from "@/lib/auth";
import api from "@/lib/http";

type LoginResponse = {
  token: string;
  user: {
    id: number;
    username: string;
    role: "admin" | "kerani";
  };
};

export default function LoginPage() {
  const router = useRouter();
  const { isReady, replace } = router;
  const hasRedirectedRef = useRef(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (hasValidToken() && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      void replace("/");
    }
  }, [isReady, replace]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<LoginResponse>("/api/login", {
        username,
        password,
      });

      return response.data;
    },
    onSuccess: (data) => {
      Cookies.set("token", data.token, {
        expires: 1,
        sameSite: "strict",
      });
      setFormError("");
      void replace("/");
    },
    onError: () => {
      setFormError("Username atau password tidak valid.");
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!username || !password) {
      setFormError("Username dan password wajib diisi.");
      return;
    }

    loginMutation.mutate();
  };

  return (
    <>
      <Head>
        <title>Sign In | Fleetify Wizard</title>
      </Head>

      <div className="auth-surface min-h-screen">
        <div className="grid min-h-screen md:grid-cols-[1.06fr_1fr]">
          <section className="auth-left-panel relative hidden min-h-screen overflow-hidden px-10 py-10 text-primary-foreground md:flex md:flex-col md:justify-between">
            <Asterisk className="size-10 opacity-95" />

            <div className="max-w-sm">
              <p className="text-xl font-semibold text-primary-foreground/90">Fleetify Wizard</p>
              <h2 className="mt-4 text-6xl leading-[1.02] font-medium tracking-tight text-primary-foreground">
                Build your account to start Resi and Invoice workflows.
              </h2>
            </div>
          </section>

          <section className="flex min-h-screen items-center justify-center bg-card px-6 py-10 md:px-12">
            <div className="w-full max-w-[460px]">
              <div className="flex flex-col gap-2">
                <Asterisk className="size-6 text-primary" />
                <h1 className="font-display text-5xl leading-tight text-foreground">Login</h1>
                <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                  Masuk ke akun operator untuk mengakses Multi-Step Resi dan Invoice Generator Fleetify.
                </p>
              </div>

              <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
                <label className="flex flex-col gap-2 text-foreground">
                  <span className="text-2xl font-medium">Email or Username</span>
                  <Input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="admin atau kerani"
                    className="h-12 rounded-md border-border bg-background/80 text-base"
                  />
                </label>

                <label className="flex flex-col gap-2 text-foreground">
                  <span className="text-2xl font-medium">Password</span>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••••"
                      className="h-12 rounded-md border-border bg-background/80 pr-12 text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md text-muted-foreground"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
                    </Button>
                  </div>
                </label>

                {formError ? (
                  <Alert className="rounded-none">
                    <AlertTitle>Sign In failed</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}

                <Button type="submit" disabled={loginMutation.isPending} className="h-12 rounded-md text-base font-semibold">
                  {loginMutation.isPending ? "Memproses..." : "Sign In"}
                </Button>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Separator className="flex-1" />
                  <span>test credentials</span>
                  <Separator className="flex-1" />
                </div>

                <p className="text-sm text-muted-foreground">admin / admin123</p>
                <p className="text-sm text-muted-foreground">kerani / kerani123</p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
