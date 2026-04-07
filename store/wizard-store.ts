import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ItemRow = {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  price: number;
  subtotal: number;
  isLoading: boolean;
  error: string;
};

type ClientData = {
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
};

type WizardState = {
  step: 1 | 2 | 3;
  clientData: ClientData;
  items: ItemRow[];
  setStep: (step: 1 | 2 | 3) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateClientData: (payload: Partial<ClientData>) => void;
  addItemRow: () => void;
  removeItemRow: (id: string) => void;
  updateItemRow: (id: string, payload: Partial<ItemRow>) => void;
  resetWizard: () => void;
};

const createItemRow = (): ItemRow => ({
  id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  itemCode: "",
  itemName: "",
  quantity: 1,
  price: 0,
  subtotal: 0,
  isLoading: false,
  error: "",
});

const initialClientData: ClientData = {
  senderName: "",
  senderAddress: "",
  receiverName: "",
  receiverAddress: "",
};

const initialItems = [createItemRow()];

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      step: 1,
      clientData: initialClientData,
      items: initialItems,
      setStep: (step) => set({ step }),
      nextStep: () => {
        const current = get().step;
        if (current < 3) {
          set({ step: (current + 1) as 1 | 2 | 3 });
        }
      },
      prevStep: () => {
        const current = get().step;
        if (current > 1) {
          set({ step: (current - 1) as 1 | 2 | 3 });
        }
      },
      updateClientData: (payload) =>
        set((state) => ({
          clientData: {
            ...state.clientData,
            ...payload,
          },
        })),
      addItemRow: () =>
        set((state) => ({
          items: [...state.items, createItemRow()],
        })),
      removeItemRow: (id) =>
        set((state) => {
          const nextItems = state.items.filter((row) => row.id !== id);
          return {
            items: nextItems.length > 0 ? nextItems : [createItemRow()],
          };
        }),
      updateItemRow: (id, payload) =>
        set((state) => ({
          items: state.items.map((row) => {
            if (row.id !== id) {
              return row;
            }
            const next = {
              ...row,
              ...payload,
            };
            return {
              ...next,
              subtotal: next.price * next.quantity,
            };
          }),
        })),
      resetWizard: () =>
        set({
          step: 1,
          clientData: initialClientData,
          items: [createItemRow()],
        }),
    }),
    {
      name: "fleetify-wizard",
      skipHydration: true,
      partialize: (state) => ({
        step: state.step,
        clientData: state.clientData,
        items: state.items.map((row) => ({
          id: row.id,
          itemCode: row.itemCode,
          itemName: row.itemName,
          quantity: row.quantity,
          price: row.price,
          subtotal: row.subtotal,
          isLoading: false,
          error: "",
        })),
      }),
    }
  )
);
