import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import StepClient from "@/components/wizard/StepClient";
import StepItems from "@/components/wizard/StepItems";
import StepReview from "@/components/wizard/StepReview";
import { hasValidToken } from "@/lib/auth";
import { useWizardStore } from "@/store/wizard-store";

export default function Home() {
  const router = useRouter();
  const { isReady, replace } = router;
  const step = useWizardStore((state) => state.step);
  const [hydrated, setHydrated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !isReady) {
      return;
    }

    if (!hasValidToken()) {
      void replace("/login");
      return;
    }

    setCheckingAuth(false);
  }, [hydrated, isReady, replace]);

  const stepTitle = useMemo(() => {
    if (step === 1) {
      return "Data Klien";
    }
    if (step === 2) {
      return "Data Barang";
    }
    return "Review & Cetak";
  }, [step]);

  if (!hydrated || checkingAuth) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center px-6">
        <p className="rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-4 text-sm text-slate-200">
          Menyiapkan wizard invoice...
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Fleetify Invoice Wizard</title>
      </Head>

      <div className="mesh-bg min-h-screen px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Fleet Operations Desk</p>
              <h1 className="font-display text-4xl text-slate-50 md:text-5xl">Multi-Step Invoice Generator</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Progress tersimpan otomatis. Refresh browser tetap aman tanpa kehilangan data wizard.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current Step</p>
              <p className="font-display text-2xl text-amber-200">
                {step}/3 - {stepTitle}
              </p>
            </div>
          </header>

          <nav className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-2 text-xs uppercase tracking-wider text-slate-400">
            {["Data Klien", "Data Barang", "Review"].map((label, index) => {
              const itemStep = index + 1;
              return (
                <div
                  key={label}
                  className={`rounded-xl px-3 py-2 text-center transition ${
                    step === itemStep
                      ? "bg-amber-300 text-slate-950"
                      : step > itemStep
                        ? "bg-emerald-300/20 text-emerald-200"
                        : "bg-slate-900 text-slate-400"
                  }`}
                >
                  {label}
                </div>
              );
            })}
          </nav>

          {step === 1 ? <StepClient /> : null}
          {step === 2 ? <StepItems /> : null}
          {step === 3 ? <StepReview /> : null}
        </div>
      </div>
    </>
  );
}
