import { writable } from 'svelte/store';

interface ModalState {
    id: string;
    open: boolean;
    data?: any;
}

function createModalStore() {
    const { subscribe, update } = writable<Record<string, ModalState>>({});

    return {
        subscribe,
        open: (id: string, data?: any) => {
            update(modals => ({
                ...modals,
                [id]: { id, open: true, data }
            }));
        },
        close: (id: string) => {
            update(modals => ({
                ...modals,
                [id]: { ...modals[id], open: false }
            }));
        },
        isOpen: (id: string, modals: Record<string, ModalState>) => {
            return modals[id]?.open ?? false;
        },
        getData: (id: string, modals: Record<string, ModalState>) => {
            return modals[id]?.data;
        }
    };
}

export const modalStore = createModalStore();