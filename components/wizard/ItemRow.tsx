import axios from "axios";
import { ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TableCell, TableRow } from "@/components/ui/table";
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

type ItemOption = {
  id: number;
  code: string;
  name: string;
  price: number;
};

const currency = new Intl.NumberFormat("id-ID");

export default function ItemRow({ row, canRemove, onRemove }: Props) {
  const updateItemRow = useWizardStore((state) => state.updateItemRow);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(row.itemCode);
  const [options, setOptions] = useState<ItemOption[]>([]);

  const selectedLabel = useMemo(() => {
    if (!row.itemCode) {
      return "Pilih Kode Barang";
    }

    if (row.itemName) {
      return `${row.itemCode} - ${row.itemName}`;
    }

    return row.itemCode;
  }, [row.itemCode, row.itemName]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const code = search.trim();

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      updateItemRow(row.id, { isLoading: true, error: "" });

      try {
        const response = await api.get<ItemLookupResponse>("/api/items", {
          params: { code },
          signal: controller.signal,
        });

        setOptions(response.data.data);
        updateItemRow(row.id, { isLoading: false });
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        setOptions([]);
        updateItemRow(row.id, {
          isLoading: false,
          error: "Gagal mengambil data item",
        });
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, row.id, search, updateItemRow]);

  useEffect(() => {
    const code = row.itemCode.trim();

    if (!code) {
      updateItemRow(row.id, {
        itemName: "",
        price: 0,
        error: "",
      });
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      updateItemRow(row.id, { error: "" });

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
          error: "",
        });
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        updateItemRow(row.id, {
          itemName: "",
          price: 0,
          error: "Gagal mengambil data item",
        });
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [row.id, row.itemCode, updateItemRow]);

  return (
    <TableRow>
      <TableCell className="align-top">
        <div className="flex flex-col gap-1.5">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
              <Button type="button" variant="outline" className="w-full justify-between font-normal">
                <span className="truncate">{selectedLabel}</span>
                <ChevronsUpDown data-icon="inline-end" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[420px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Cari kode barang..." value={search} onValueChange={setSearch} />
                <CommandList>
                  <CommandEmpty>Tidak ada item ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {options.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.code} ${item.name}`}
                        onSelect={() => {
                          updateItemRow(row.id, {
                            itemCode: item.code,
                            itemName: item.name,
                            price: Number(item.price),
                            error: "",
                          });
                          setSearch(item.code);
                          setOpen(false);
                        }}
                      >
                        <div className="flex flex-1 items-center justify-between gap-2">
                          <span>{item.code}</span>
                          <span className="truncate text-muted-foreground">{item.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {row.error ? <p className="text-xs text-muted-foreground">{row.error}</p> : null}
        </div>
      </TableCell>
      <TableCell>
        {row.isLoading ? <span className="text-muted-foreground">Mencari...</span> : row.itemName || "-"}
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={1}
          value={row.quantity}
          onChange={(event) =>
            updateItemRow(row.id, {
              quantity: Math.max(1, Number(event.target.value) || 1),
            })
          }
          className="w-20"
        />
      </TableCell>
      <TableCell>Rp {currency.format(row.price)}</TableCell>
      <TableCell>
        <Badge variant="outline">Rp {currency.format(row.subtotal)}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button type="button" variant="outline" onClick={() => onRemove(row.id)} disabled={!canRemove}>
          Hapus
        </Button>
      </TableCell>
    </TableRow>
  );
}
