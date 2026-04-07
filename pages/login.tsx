import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (hasValidToken()) {
      router.replace("/");
    }
  }, [router]);

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
      router.replace("/");
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
        <title>Login | Fleetify Invoice</title>
      </Head>

      <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-10">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-3xl border border-slate-800/50 bg-slate-950/70 p-7 shadow-2xl backdrop-blur"
        >
          <p className="text-xs uppercase tracking-[0.26em] text-amber-300/80">Fleetify Access</p>
          <h1 className="mt-2 font-display text-4xl text-slate-50">Login Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">Gunakan akun Admin atau Kerani untuk memulai wizard invoice.</p>

          <div className="mt-6 space-y-4">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
                placeholder="admin"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-200">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
                placeholder="admin123"
              />
            </label>
          </div>

          {formError ? <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{formError}</p> : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-6 w-full rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginMutation.isPending ? "Memproses..." : "Masuk"}
          </button>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-400">
            <p>Demo account:</p>
            <p>Admin / admin123</p>
            <p>Kerani / kerani123</p>
          </div>
        </form>
      </div>
    </>
  );
}
