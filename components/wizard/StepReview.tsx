import { useMemo, useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { clearToken, getRoleFromToken } from "@/lib/auth";
import api from "@/lib/http";
import { useWizardStore } from "@/store/wizard-store";

type SubmitResponse = {
  invoice_number: string;
  total_amount: number;
};

const currency = new Intl.NumberFormat("id-ID");

export default function StepReview() {
  const clientData = useWizardStore((state) => state.clientData);
  const items = useWizardStore((state) => state.items);
  const prevStep = useWizardStore((state) => state.prevStep);
  const resetWizard = useWizardStore((state) => state.resetWizard);
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
    <Card className="border border-border bg-card backdrop-blur print:shadow-none">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Step 3 - Review & Cetak</CardTitle>
        <CardDescription className="print:text-muted-foreground">Pastikan data benar sebelum submit invoice.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <section className="invoice-print-area">
          <div className="flex flex-col gap-5 print:hidden">
            <div className="grid gap-3 rounded-lg border p-4 text-sm md:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Pengirim:</span> {clientData.senderName}
              </p>
              <p>
                <span className="text-muted-foreground">Penerima:</span> {clientData.receiverName}
              </p>
              <p className="md:col-span-2">
                <span className="text-muted-foreground">Alamat Pengirim:</span> {clientData.senderAddress}
              </p>
              <p className="md:col-span-2">
                <span className="text-muted-foreground">Alamat Penerima:</span> {clientData.receiverAddress || "-"}
              </p>
            </div>

            <Table className="rounded-lg border border-foreground/60 bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.itemCode}</TableCell>
                    <TableCell>{row.itemName}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>Rp {currency.format(row.price)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Rp {currency.format(row.subtotal)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="text-right text-sm">
              <span className="text-muted-foreground">Grand Total:</span>{" "}
              <Badge variant="secondary" className="text-sm">
                Rp {currency.format(grandTotal)}
              </Badge>
            </div>
          </div>

          <div className="invoice-print-only hidden">
            <header className="mb-4 border-b pb-3">
              <h1 className="text-2xl font-semibold">Fleetify Logistics</h1>
              <p className="text-sm text-muted-foreground">Jl. Armada Raya No. 10, Jakarta</p>
              <p className="text-sm text-muted-foreground">Invoice Number: {submitted?.invoice_number || "DRAFT"}</p>
            </header>

            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Pengirim</p>
                <p>{clientData.senderName}</p>
                <p>{clientData.senderAddress}</p>
              </div>
              <div>
                <p className="font-semibold">Penerima</p>
                <p>{clientData.receiverName}</p>
                <p>{clientData.receiverAddress || "-"}</p>
              </div>
            </div>

            <Table className="mb-4 w-full rounded-none border border-foreground/60 bg-white text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={`print-${row.id}`}>
                    <TableCell>{row.itemCode}</TableCell>
                    <TableCell>{row.itemName}</TableCell>
                    <TableCell className="text-right">{row.quantity}</TableCell>
                    <TableCell className="text-right">Rp {currency.format(row.price)}</TableCell>
                    <TableCell className="text-right">Rp {currency.format(row.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <div className="w-72 border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span className="font-semibold">Rp {currency.format(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {submitted ? (
          <Alert>
            <AlertTitle>Invoice berhasil dibuat</AlertTitle>
            <AlertDescription>{submitted.invoice_number}</AlertDescription>
          </Alert>
        ) : null}

        {submitError ? (
          <Alert>
            <AlertTitle>Submit gagal</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap justify-between gap-3 print:hidden">
          <Button type="button" variant="outline" onClick={prevStep}>
            Kembali
          </Button>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              Cetak Invoice
            </Button>

            <Button type="button" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || submitted !== null}>
              {submitMutation.isPending ? "Mengirim..." : "Submit Invoice"}
            </Button>

            {submitted ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  resetWizard();
                  setSubmitted(null);
                }}
              >
                Buat Invoice Baru
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
