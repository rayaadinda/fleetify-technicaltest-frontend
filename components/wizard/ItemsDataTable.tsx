import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/http";
import { cn } from "@/lib/utils";
import { ItemRow as ItemRowType, useWizardStore } from "@/store/wizard-store";

type Props = {
  items: ItemRowType[];
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

function ItemCodeCell({ row }: { row: ItemRowType }) {
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
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between font-normal")}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown data-icon="inline-end" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-white p-0 shadow-lg"
        >
          <Command>
            <CommandInput placeholder="Cari kode barang..." value={search} onValueChange={setSearch} />
            <CommandList className="max-h-64">
              <CommandEmpty className="py-8 text-muted-foreground">Tidak ada item ditemukan.</CommandEmpty>
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
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="font-medium text-foreground">{item.code}</span>
                      <span className="truncate text-right text-muted-foreground">{item.name}</span>
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
  );
}

export default function ItemsDataTable({ items, canRemove, onRemove }: Props) {
  const updateItemRow = useWizardStore((state) => state.updateItemRow);

  const columns = useMemo<ColumnDef<ItemRowType>[]>(
    () => [
      {
        accessorKey: "itemCode",
        header: "Kode Barang",
        cell: ({ row }) => <ItemCodeCell row={row.original} />,
      },
      {
        accessorKey: "itemName",
        header: "Nama Barang",
        cell: ({ row }) =>
          row.original.isLoading ? (
            <span className="text-muted-foreground">Mencari...</span>
          ) : (
            row.original.itemName || "-"
          ),
      },
      {
        accessorKey: "quantity",
        header: "Qty",
        cell: ({ row }) => (
          <Input
            type="number"
            min={1}
            value={row.original.quantity}
            onChange={(event) =>
              updateItemRow(row.original.id, {
                quantity: Math.max(1, Number(event.target.value) || 1),
              })
            }
            className="w-20"
          />
        ),
      },
      {
        accessorKey: "price",
        header: "Harga",
        cell: ({ row }) => `Rp ${currency.format(row.original.price)}`,
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums">Rp {currency.format(row.original.subtotal)}</span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              type="button"
              variant="outline"
              onClick={() => onRemove(row.original.id)}
              disabled={!canRemove}
            >
              Hapus
            </Button>
          </div>
        ),
      },
    ],
    [canRemove, onRemove, updateItemRow]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-20 text-center text-muted-foreground">
                Belum ada data barang.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}