import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWizardStore } from "@/store/wizard-store";

import ItemsDataTable from "./ItemsDataTable";

const currency = new Intl.NumberFormat("id-ID");

export default function StepItems() {
  const items = useWizardStore((state) => state.items);
  const addItemRow = useWizardStore((state) => state.addItemRow);
  const removeItemRow = useWizardStore((state) => state.removeItemRow);
  const prevStep = useWizardStore((state) => state.prevStep);
  const nextStep = useWizardStore((state) => state.nextStep);
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
    <Card className="border border-border bg-card backdrop-blur">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Step 2 - Data Barang</CardTitle>
        <CardDescription>
          Ketik kode barang, sistem akan lookup otomatis setelah 500ms. Input cepat aman dari race condition.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <ItemsDataTable items={items} onRemove={removeItemRow} canRemove={items.length > 1} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={addItemRow}>
            + Tambah Baris
          </Button>
          <div className="rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground">
            Estimasi Total: Rp {currency.format(total)}
          </div>
        </div>

        {error ? (
          <Alert>
            <AlertTitle>Data barang belum valid</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap justify-between gap-3">
          <Button type="button" variant="outline" onClick={prevStep}>
            Kembali
          </Button>
          <Button type="button" onClick={handleNext}>
            Lanjut ke Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
