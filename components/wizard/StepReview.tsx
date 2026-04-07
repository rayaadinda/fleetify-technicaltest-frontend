import { useMemo, useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { clearToken, getRoleFromToken } from "@/lib/auth";
import api from "@/lib/http";
import { useWizardStore } from "@/store/wizard-store";

type SubmitResponse = {
  invoice_number: string;
  total_amount: number;
};

const currency = new Intl.NumberFormat("id-ID");

export default function StepReview() {
  const { clientData, items, prevStep, resetWizard } = useWizardStore((state) => ({
    clientData: state.clientData,
    items: state.items,
    prevStep: state.prevStep,
    resetWizard: state.resetWizard,
  }));
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState<SubmitResponse | null>(null);

  const grandTotal = useMemo(() => items.reduce((acc, row) => acc + row.subtotal, 0), [items]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const role = getRoleFromToken();
      if (!role) {
        clearToken();
        throw new Error("Sesi login tidak valid, silakan login ulang.");
      }

      const payloadItems = items.map((row) => {
        const base = {
          item_code: row.itemCode,
          quantity: row.quantity,
        };

        if (role === "admin") {
          return {
            ...base,
            price: row.price,
            total: row.subtotal,
          };
        }

        return base;
      });

      const response = await api.post<SubmitResponse>("/api/invoices", {
        sender_name: clientData.senderName,
        sender_address: clientData.senderAddress,
        receiver_name: clientData.receiverName,
        receiver_address: clientData.receiverAddress,
        items: payloadItems,
      });

      return response.data;
    },
    onSuccess: (data) => {
      setSubmitError("");
      setSubmitted(data);
    },
    onError: (error) => {
      if (error instanceof Error) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Gagal submit invoice");
    },
  });

  return (
    <section className="rounded-3xl border border-slate-800/40 bg-slate-950/70 p-6 shadow-2xl backdrop-blur print:shadow-none">
      <h2 className="font-display text-2xl text-amber-200">Step 3 - Review & Cetak</h2>
      <p className="mt-2 text-sm text-slate-300 print:text-slate-700">Pastikan data benar sebelum submit invoice.</p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200 print:border-slate-300 print:bg-white print:text-slate-800 md:grid-cols-2">
        <p>
          <span className="text-slate-400 print:text-slate-600">Pengirim:</span> {clientData.senderName}
        </p>
        <p>
          <span className="text-slate-400 print:text-slate-600">Penerima:</span> {clientData.receiverName}
        </p>
        <p className="md:col-span-2">
          <span className="text-slate-400 print:text-slate-600">Alamat Pengirim:</span> {clientData.senderAddress}
        </p>
        <p className="md:col-span-2">
          <span className="text-slate-400 print:text-slate-600">Alamat Penerima:</span> {clientData.receiverAddress || "-"}
        </p>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wider text-slate-400 print:bg-slate-100 print:text-slate-700">
            <tr>
              <th className="px-3 py-3">Kode</th>
              <th className="px-3 py-3">Nama</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Harga</th>
              <th className="px-3 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-slate-800/70 print:border-slate-200">
                <td className="px-3 py-2">{row.itemCode}</td>
                <td className="px-3 py-2">{row.itemName}</td>
                <td className="px-3 py-2">{row.quantity}</td>
                <td className="px-3 py-2">Rp {currency.format(row.price)}</td>
                <td className="px-3 py-2 font-semibold text-amber-200 print:text-slate-900">
                  Rp {currency.format(row.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right text-sm">
        <span className="text-slate-400 print:text-slate-600">Grand Total:</span>{" "}
        <span className="text-xl font-semibold text-amber-200 print:text-slate-900">Rp {currency.format(grandTotal)}</span>
      </div>

      {submitted ? (
        <p className="mt-4 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200 print:hidden">
          Invoice berhasil dibuat: <strong>{submitted.invoice_number}</strong>
        </p>
      ) : null}

      {submitError ? <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200 print:hidden">{submitError}</p> : null}

      <div className="mt-6 flex flex-wrap justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          Kembali
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-amber-300/70 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
          >
            Cetak Invoice
          </button>

          <button
            type="button"
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || submitted !== null}
            className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitMutation.isPending ? "Mengirim..." : "Submit Invoice"}
          </button>

          {submitted ? (
            <button
              type="button"
              onClick={() => {
                resetWizard();
                setSubmitted(null);
              }}
              className="rounded-xl border border-emerald-300/70 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300/10"
            >
              Buat Invoice Baru
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
