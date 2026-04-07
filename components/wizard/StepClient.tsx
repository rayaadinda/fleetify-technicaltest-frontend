import { useState } from "react";

import { useWizardStore } from "@/store/wizard-store";

export default function StepClient() {
  const { clientData, updateClientData, nextStep } = useWizardStore((state) => ({
    clientData: state.clientData,
    updateClientData: state.updateClientData,
    nextStep: state.nextStep,
  }));
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!clientData.senderName || !clientData.senderAddress || !clientData.receiverName) {
      setError("Nama pengirim, alamat pengirim, dan nama penerima wajib diisi.");
      return;
    }

    setError("");
    nextStep();
  };

  return (
    <section className="rounded-3xl border border-slate-800/40 bg-slate-950/70 p-6 shadow-2xl backdrop-blur">
      <h2 className="font-display text-2xl text-amber-200">Step 1 - Data Klien</h2>
      <p className="mt-2 text-sm text-slate-300">Lengkapi data pengirim dan penerima sebelum masuk ke daftar barang.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Nama Pengirim
          <input
            value={clientData.senderName}
            onChange={(event) => updateClientData({ senderName: event.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
            placeholder="PT Logistik Maju"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Nama Penerima
          <input
            value={clientData.receiverName}
            onChange={(event) => updateClientData({ receiverName: event.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
            placeholder="Budi Santoso"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200 md:col-span-2">
          Alamat Pengirim
          <textarea
            value={clientData.senderAddress}
            onChange={(event) => updateClientData({ senderAddress: event.target.value })}
            className="min-h-24 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
            placeholder="Jl. Raya Industri No.10, Jakarta"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200 md:col-span-2">
          Alamat Penerima (opsional)
          <textarea
            value={clientData.receiverAddress}
            onChange={(event) => updateClientData({ receiverAddress: event.target.value })}
            className="min-h-24 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
            placeholder="Jl. Melati No.12, Surabaya"
          />
        </label>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleNext}
          className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          type="button"
        >
          Lanjut ke Data Barang
        </button>
      </div>
    </section>
  );
}
