'use client';

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ReorderableItem {
  id: string;
  sortOrder: number;
}



interface ReorderableListProps<T extends ReorderableItem> {
  items: T[];
  onReorder: (newItems: T[]) => void | Promise<void>;
  renderItem: (item: T, index: number) => React.ReactNode;
  isLoading?: boolean;
}

export function ReorderableList<T extends ReorderableItem>({
  items,
  onReorder,
  renderItem,
  isLoading = false,
}: ReorderableListProps<T>) {
  const sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return;

    const newItems = [...sortedItems];
    const temp = newItems[index]!;
    newItems[index] = newItems[targetIndex]!;
    newItems[targetIndex] = temp;

    // Recalculate sequential sort orders
    const updated = newItems.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    onReorder(updated);
  };

  return (
    <div className="divide-y divide-border border border-border rounded-lg bg-surface overflow-hidden">
      {sortedItems.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === sortedItems.length - 1;

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 hover:bg-surface-muted/40 transition-colors"
          >
            {/* Reorder Up / Down Controls */}
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => moveItem(index, 'up')}
                disabled={isFirst || isLoading}
                className={cn(
                  'p-1 rounded text-muted hover:text-accent hover:bg-surface-muted transition-colors',
                  (isFirst || isLoading) && 'opacity-30 pointer-events-none',
                )}
                title="Move Up"
                aria-label="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 'down')}
                disabled={isLast || isLoading}
                className={cn(
                  'p-1 rounded text-muted hover:text-accent hover:bg-surface-muted transition-colors',
                  (isLast || isLoading) && 'opacity-30 pointer-events-none',
                )}
                title="Move Down"
                aria-label="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Slot */}
            <div className="flex-1 min-w-0">{renderItem(item, index)}</div>
          </div>
        );
      })}
    </div>
  );
}
