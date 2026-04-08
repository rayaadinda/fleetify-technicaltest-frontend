import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWizardStore } from "@/store/wizard-store";

export default function StepClient() {
  const clientData = useWizardStore((state) => state.clientData);
  const updateClientData = useWizardStore((state) => state.updateClientData);
  const nextStep = useWizardStore((state) => state.nextStep);
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
    <Card className="border border-border bg-card backdrop-blur">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Step 1 - Data Klien</CardTitle>
        <CardDescription>Lengkapi data pengirim dan penerima sebelum masuk ke daftar barang.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Nama Pengirim
            <Input
              value={clientData.senderName}
              onChange={(event) => updateClientData({ senderName: event.target.value })}
              placeholder="PT Logistik Maju"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Nama Penerima
            <Input
              value={clientData.receiverName}
              onChange={(event) => updateClientData({ receiverName: event.target.value })}
              placeholder="Budi Santoso"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            Alamat Pengirim
            <Textarea
              value={clientData.senderAddress}
              onChange={(event) => updateClientData({ senderAddress: event.target.value })}
              placeholder="Jl. Raya Industri No.10, Jakarta"
              className="min-h-24"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            Alamat Penerima (opsional)
            <Textarea
              value={clientData.receiverAddress}
              onChange={(event) => updateClientData({ receiverAddress: event.target.value })}
              placeholder="Jl. Melati No.12, Surabaya"
              className="min-h-24"
            />
          </label>
        </div>

        {error ? (
          <Alert>
            <AlertTitle>Data belum lengkap</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex justify-end">
          <Button onClick={handleNext} type="button">
            Lanjut ke Data Barang
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
