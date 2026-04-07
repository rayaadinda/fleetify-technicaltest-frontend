import { useState } from "react";

import { useWizardStore } from "@/store/wizard-store";

import ItemRow from "./ItemRow";

const currency = new Intl.NumberFormat("id-ID");

export default function StepItems() {
  const { items, addItemRow, removeItemRow, prevStep, nextStep } = useWizardStore((state) => ({
    items: state.items,
    addItemRow: state.addItemRow,
    removeItemRow: state.removeItemRow,
    prevStep: state.prevStep,
    nextStep: state.nextStep,
  }));
  const [error, setError] = useState("");

  const handleNext = () => {
    const invalid = items.some((row) => !row.itemCode.trim() || !row.itemName.trim() || row.quantity <= 0);
    if (invalid) {
      setError("Lengkapi semua baris item dengan kode valid dan quantity lebih dari 0.");
      return;
    }

    setError("");
    nextStep();
  };

  const total = items.reduce((sum, row) => sum + row.subtotal, 0);

  return (
    <section className="rounded-3xl border border-slate-800/40 bg-slate-950/70 p-6 shadow-2xl backdrop-blur">
      <h2 className="font-display text-2xl text-amber-200">Step 2 - Data Barang</h2>
      <p className="mt-2 text-sm text-slate-300">
        Ketik kode barang, sistem akan lookup otomatis setelah 500ms. Input cepat aman dari race condition.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-3 py-3">Kode Barang</th>
              <th className="px-3 py-3">Nama Barang</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Harga</th>
              <th className="px-3 py-3">Subtotal</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <ItemRow key={row.id} row={row} onRemove={removeItemRow} canRemove={items.length > 1} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addItemRow}
          className="rounded-xl border border-amber-300/60 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
        >
          + Tambah Baris
        </button>
        <p className="text-sm text-slate-300">
          Estimasi Total: <span className="font-semibold text-amber-200">Rp {currency.format(total)}</span>
        </p>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p> : null}

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
        >
          Lanjut Review
        </button>
      </div>
    </section>
  );
}
