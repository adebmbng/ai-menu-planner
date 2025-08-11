import { create } from 'zustand'

interface DragState {
    activeId: string | null
    draggedItem: {
        recipeId?: string
        title: string
        source: 'library' | 'meal'
        sourceDate?: string
        sourceIndex?: number
        sourceKey?: string
    } | null
    setActiveId: (id: string | null) => void
    setDraggedItem: (item: DragState['draggedItem']) => void
    clearDrag: () => void
}

export const useDragStore = create<DragState>((set) => ({
    activeId: null,
    draggedItem: null,
    setActiveId: (id) => set({ activeId: id }),
    setDraggedItem: (item) => set({ draggedItem: item }),
    clearDrag: () => set({ activeId: null, draggedItem: null }),
}))
