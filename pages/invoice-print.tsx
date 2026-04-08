import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";

import { useWizardStore } from "@/store/wizard-store";

const currency = new Intl.NumberFormat("id-ID");

export default function InvoicePrintPage() {
  const router = useRouter();
  const clientData = useWizardStore((state) => state.clientData);
  const items = useWizardStore((state) => state.items);

  const invoiceNumber = useMemo(() => {
    const raw = router.query.invoice;
    if (typeof raw === "string" && raw.trim()) {
      return raw;
    }
    return "DRAFT";
  }, [router.query.invoice]);

  const printedAt = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    []
  );

  const grandTotal = useMemo(() => items.reduce((acc, row) => acc + row.subtotal, 0), [items]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [router.isReady]);

  return (
    <>
      <Head>
        <title>Print Invoice {invoiceNumber}</title>
      </Head>

      <main className="invoice-page">
        <article className="invoice-sheet">
          <header className="invoice-header">
            <div>
              <h1>Fleetify Logistics</h1>
              <p>Jl. Armada Raya No. 10, Jakarta</p>
              <p>Telp: (021) 555-0199 | Email: billing@fleetify.id</p>
            </div>
            <div className="invoice-header-right">
              <h2>INVOICE</h2>
              <p>No: {invoiceNumber}</p>
              <p>Dicetak: {printedAt}</p>
            </div>
          </header>

          <section className="invoice-party-grid">
            <div>
              <h3>Pengirim</h3>
              <p>{clientData.senderName || "-"}</p>
              <p>{clientData.senderAddress || "-"}</p>
            </div>
            <div>
              <h3>Penerima</h3>
              <p>{clientData.receiverName || "-"}</p>
              <p>{clientData.receiverAddress || "-"}</p>
            </div>
          </section>

          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: "18%" }}>Kode</th>
                <th>Nama Barang</th>
                <th style={{ width: "12%", textAlign: "right" }}>Qty</th>
                <th style={{ width: "20%", textAlign: "right" }}>Harga</th>
                <th style={{ width: "22%", textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((row) => (
                  <tr key={row.id}>
                    <td>{row.itemCode || "-"}</td>
                    <td>{row.itemName || "-"}</td>
                    <td style={{ textAlign: "right" }}>{row.quantity}</td>
                    <td style={{ textAlign: "right" }}>Rp {currency.format(row.price)}</td>
                    <td style={{ textAlign: "right" }}>Rp {currency.format(row.subtotal)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Tidak ada item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="invoice-total-box">
            <span>Grand Total</span>
            <strong>Rp {currency.format(grandTotal)}</strong>
          </div>
        </article>
      </main>

      <style jsx>{`
        .invoice-page {
          min-height: 100vh;
          background: #efefef;
          padding: 16px;
        }

        .invoice-sheet {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #fff;
          color: #111;
          padding: 14mm;
          box-sizing: border-box;
          font-family: var(--font-jakarta), sans-serif;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 1px solid #111;
          padding-bottom: 10px;
        }

        .invoice-header h1 {
          margin: 0;
          font-size: 28px;
          line-height: 1.1;
        }

        .invoice-header p {
          margin: 2px 0;
          font-size: 12px;
        }

        .invoice-header-right {
          text-align: right;
        }

        .invoice-header-right h2 {
          margin: 0;
          letter-spacing: 0.08em;
          font-size: 22px;
        }

        .invoice-party-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          font-size: 13px;
        }

        .invoice-party-grid h3 {
          margin: 0 0 6px;
          font-size: 14px;
        }

        .invoice-party-grid p {
          margin: 2px 0;
          white-space: pre-line;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 14px;
          font-size: 12px;
        }

        .invoice-table th,
        .invoice-table td {
          border: 1px solid #222;
          padding: 8px;
          vertical-align: top;
        }

        .invoice-table th {
          background: #f4f4f4;
          text-align: left;
        }

        .invoice-total-box {
          margin-top: 12px;
          margin-left: auto;
          width: 76mm;
          border: 1px solid #222;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          .invoice-page {
            padding: 0;
            background: #fff;
          }

          .invoice-sheet {
            margin: 0;
            width: 210mm;
            min-height: 297mm;
            box-shadow: none;
          }
        }
      `}</style>
    </>
  );
}