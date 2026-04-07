import axios from "axios";
import { useEffect } from "react";

import api from "@/lib/http";
import { ItemRow as ItemRowType, useWizardStore } from "@/store/wizard-store";

type Props = {
  row: ItemRowType;
  canRemove: boolean;
  onRemove: (id: string) => void;
};

type ItemLookupResponse = {
  data: Array<{
    id: number;
    code: string;
    name: string;
    price: number;
  }>;
};

const currency = new Intl.NumberFormat("id-ID");

export default function ItemRow({ row, canRemove, onRemove }: Props) {
  const updateItemRow = useWizardStore((state) => state.updateItemRow);

  useEffect(() => {
    const code = row.itemCode.trim();

    if (!code) {
      updateItemRow(row.id, {
        itemName: "",
        price: 0,
        isLoading: false,
        error: "",
      });
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      updateItemRow(row.id, { isLoading: true, error: "" });

      try {
        const response = await api.get<ItemLookupResponse>("/api/items", {
          params: { code },
          signal: controller.signal,
        });

        const candidates = response.data.data;
        const picked =
          candidates.find((item) => item.code.toLowerCase() === code.toLowerCase()) ?? candidates[0];

        if (!picked) {
          updateItemRow(row.id, {
            itemName: "",
            price: 0,
            isLoading: false,
            error: "Kode barang tidak ditemukan",
          });
          return;
        }

        updateItemRow(row.id, {
          itemCode: picked.code,
          itemName: picked.name,
          price: Number(picked.price),
          isLoading: false,
          error: "",
        });
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        updateItemRow(row.id, {
          itemName: "",
          price: 0,
          isLoading: false,
          error: "Gagal mengambil data item",
        });
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [row.id, row.itemCode, updateItemRow]);

  return (
    <tr className="border-b border-slate-800/80 align-top">
      <td className="px-3 py-3">
        <input
          value={row.itemCode}
          onChange={(event) =>
            updateItemRow(row.id, {
              itemCode: event.target.value,
              error: "",
            })
          }
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-amber-400"
          placeholder="BRG-001"
        />
        {row.error ? <p className="mt-1 text-xs text-red-300">{row.error}</p> : null}
      </td>
      <td className="px-3 py-3 text-sm text-slate-200">
        {row.isLoading ? <span className="text-slate-400">Mencari...</span> : row.itemName || "-"}
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          min={1}
          value={row.quantity}
          onChange={(event) =>
            updateItemRow(row.id, {
              quantity: Math.max(1, Number(event.target.value) || 1),
            })
          }
          className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-amber-400"
        />
      </td>
      <td className="px-3 py-3 text-sm text-slate-300">Rp {currency.format(row.price)}</td>
      <td className="px-3 py-3 text-sm font-semibold text-amber-200">Rp {currency.format(row.subtotal)}</td>
      <td className="px-3 py-3 text-right">
        <button
          type="button"
          onClick={() => onRemove(row.id)}
          disabled={!canRemove}
          className="rounded-lg border border-red-400/60 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Hapus
        </button>
      </td>
    </tr>
  );
}
