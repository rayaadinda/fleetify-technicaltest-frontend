import Head from "next/head";
import { useRouter } from "next/router";
import { Check } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StepClient from "@/components/wizard/StepClient";
import StepItems from "@/components/wizard/StepItems";
import StepReview from "@/components/wizard/StepReview";
import { clearToken, hasValidToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/store/wizard-store";

const clientSubscribe = () => () => {};

export default function Home() {
  const router = useRouter();
  const { isReady, replace } = router;
  const step = useWizardStore((state) => state.step);
  const setStep = useWizardStore((state) => state.setStep);
  const resetWizard = useWizardStore((state) => state.resetWizard);
  const clientData = useWizardStore((state) => state.clientData);
  const items = useWizardStore((state) => state.items);
  const hasRedirectedRef = useRef(false);
  const isClient = useSyncExternalStore(clientSubscribe, () => true, () => false);
  const [stepError, setStepError] = useState("");

  useEffect(() => {
    if (!isClient || !isReady) {
      return;
    }

    if (!hasValidToken()) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        void replace("/login");
      }
    }
  }, [isClient, isReady, replace]);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    document.documentElement.classList.add("wizard-theme-root");
    document.body.classList.add("wizard-theme-root");

    return () => {
      document.documentElement.classList.remove("wizard-theme-root");
      document.body.classList.remove("wizard-theme-root");
    };
  }, [isClient]);

  const steps = [
    { value: "1", label: "Data Klien" },
    { value: "2", label: "Data Barang" },
    { value: "3", label: "Review & Cetak" },
  ] as const;

  const isStep1Valid =
    Boolean(clientData.senderName.trim()) &&
    Boolean(clientData.senderAddress.trim()) &&
    Boolean(clientData.receiverName.trim());

  const isStep2Valid = items.length > 0 && items.every((row) => Boolean(row.itemCode.trim()) && Boolean(row.itemName.trim()) && row.quantity > 0);

  if (!isClient || !isReady || !hasValidToken()) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center px-6">
        <p className="rounded-lg border bg-card px-5 py-4 text-sm text-foreground">
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

      <div className="wizard-surface mesh-bg min-h-screen px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Fleet Operations Desk</p>
              <h1 className="font-display text-4xl text-foreground md:text-5xl">Multi-Step Invoice Generator</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                Progress tersimpan otomatis. Refresh browser tetap aman tanpa kehilangan data wizard.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearToken();
                resetWizard();
                toast.success("Logout berhasil.");
                void replace("/login");
              }}
            >
              Logout
            </Button>
          </header>

          <Tabs
            value={String(step)}
            onValueChange={(value) => {
              const parsed = Number(value);
              if (parsed < 1 || parsed > 3) {
                return;
              }

              if (parsed === 2 && !isStep1Valid) {
                const message = "Lengkapi Step 1 terlebih dahulu sebelum masuk Step 2.";
                setStepError(message);
                toast.warning(message);
                return;
              }

              if (parsed === 3 && (!isStep1Valid || !isStep2Valid)) {
                const message = "Lengkapi Step 1 dan Step 2 terlebih dahulu sebelum masuk Step 3.";
                setStepError(message);
                toast.warning(message);
                return;
              }

              if (parsed >= 1 && parsed <= 3) {
                setStepError("");
                setStep(parsed as 1 | 2 | 3);
              }
            }}
            className="mb-6"
          >
            <TabsList className="grid h-auto w-full grid-cols-3 gap-3 bg-transparent p-0" variant="default">
              {steps.map((item, index) => {
                const numericStep = index + 1;
                const isActive = step === numericStep;
                const isDone = step > numericStep;

                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className={cn(
                      "rounded-xl border bg-white px-4 py-3 text-left transition-colors",
                      isActive && "border-foreground text-foreground shadow-sm",
                      isDone && "border-border text-muted-foreground",
                      !isActive && !isDone && "bg-white text-foreground"
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[0.7rem] uppercase tracking-[0.15em]">Step {numericStep}</span>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {isDone ? <Check aria-hidden className="size-4 opacity-50" /> : null}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {stepError ? <p className="mb-4 text-sm text-foreground">{stepError}</p> : null}

          {step === 1 ? <StepClient /> : null}
          {step === 2 ? <StepItems /> : null}
          {step === 3 ? <StepReview /> : null}
        </div>
      </div>
    </>
  );
}
