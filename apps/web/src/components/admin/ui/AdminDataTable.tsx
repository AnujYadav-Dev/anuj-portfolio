'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index?: number) => string;
  isLoading?: boolean;

  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  filterSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
  };
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
}

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  searchPlaceholder = 'Search records...',
  searchTerm,
  onSearchChange,
  filterSlot,
  actionSlot,
  pagination,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  onRowClick,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: AdminDataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const activeSearch = searchTerm !== undefined ? searchTerm : internalSearch;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Client-side filtering & sorting if not controlled externally
  let displayData = [...data];
  if (!onSearchChange && activeSearch) {
    const term = activeSearch.toLowerCase();
    displayData = displayData.filter((item: T) =>
      Object.values(item as Record<string, unknown>).some(
        (val) => val != null && String(val).toLowerCase().includes(term),
      ),
    );
  }

  if (sortKey) {
    displayData.sort((a: T, b: T) => {
      const valA = (a as Record<string, unknown>)[sortKey];
      const valB = (b as Record<string, unknown>)[sortKey];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      const res = String(valA) < String(valB) ? -1 : 1;
      return sortDir === 'asc' ? res : -res;
    });
  }

  const isAllSelected =
    selectedIds &&
    displayData.length > 0 &&
    displayData.every((item, idx) => selectedIds.includes(keyExtractor(item, idx)));

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      {(onSearchChange || filterSlot || actionSlot) && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            {onSearchChange !== undefined && (
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-placeholder pointer-events-none" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={activeSearch}
                  onChange={handleSearch}
                  className="pl-9 bg-surface text-xs h-9"
                />
              </div>
            )}
            {filterSlot}
          </div>

          {actionSlot && <div className="flex items-center gap-2">{actionSlot}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="border border-border rounded-lg bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50 text-muted font-mono uppercase tracking-wider text-[11px]">
                {onToggleSelect && (
                  <th className="w-10 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={onSelectAll}
                      className="rounded border-border bg-background text-accent focus:ring-accent accent-accent cursor-pointer"
                      aria-label="Select all"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col.key} className={cn('px-4 py-3 font-semibold', col.className)}>
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors group"
                      >
                        <span>{col.header}</span>
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-accent" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-accent" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-placeholder opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + (onToggleSelect ? 1 : 0)}
                    className="py-16 text-center text-muted"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Spinner className="w-6 h-6 text-accent" />
                      <span className="font-mono text-xs">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : displayData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onToggleSelect ? 1 : 0)}
                    className="py-16 text-center text-muted"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-placeholder mb-1">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-foreground text-sm">{emptyTitle}</p>
                      <p className="text-xs text-muted max-w-sm">{emptyDescription}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((item, index) => {
                  const id = keyExtractor(item, index);
                  const isSelected = selectedIds?.includes(id);

                  return (
                    <tr
                      key={`${id}-${index}`}
                      onClick={() => onRowClick?.(item)}

                      className={cn(
                        'hover:bg-surface-muted/60 transition-colors',
                        onRowClick && 'cursor-pointer',
                        isSelected && 'bg-accent/5',
                      )}
                    >
                      {onToggleSelect && (
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(id)}
                            className="rounded border-border bg-background text-accent focus:ring-accent accent-accent cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn('px-4 py-3 text-foreground', col.className)}
                        >
                          {col.render
                            ? col.render(item, index)
                            : (item as Record<string, unknown>)[col.key] != null
                              ? String((item as Record<string, unknown>)[col.key])
                              : '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted font-mono bg-surface-muted/30">
            <div>
              Showing Page <span className="font-semibold text-foreground">{pagination.page}</span>{' '}
              of <span className="font-semibold text-foreground">{pagination.totalPages}</span> (
              {pagination.totalItems} total)
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
