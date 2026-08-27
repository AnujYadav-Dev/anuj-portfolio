'use client';

import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  NavItemType,
  NavLocation,
  type NavItemDto,
  type CreateNavItemRequest,
  type UpdateNavItemRequest,
} from '@portfolio/shared';

import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavIcon } from '@/components/layout/NavIcon';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  MousePointerClick,
  FolderTree,
  LayoutGrid,
  Columns,
  Menu,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

const POPULAR_ICONS = [
  'sparkles',
  'folder-git-2',
  'git-branch',
  'cpu',
  'book-open',
  'file-text',
  'activity',
  'terminal',
  'mail',
  'file-user',
  'github',
  'calendar',
  'code',
  'briefcase',
  'award',
  'layers',
  'zap',
  'globe',
];

const COMMON_ROUTES = [
  { label: 'Works', url: '/works' },
  { label: 'Blogs', url: '/blogs' },
  { label: 'Research', url: '/research' },
  { label: 'About', url: '/about' },
  { label: 'Skills', url: '/skills' },
  { label: 'Timeline', url: '/my-timeline' },
  { label: 'Resume', url: '/resume' },
  { label: 'Contact', url: '/contact' },
  { label: 'Open Source', url: '/opensource' },
  { label: 'Guestbook', url: '/guestbook' },
  { label: 'Now', url: '/now' },
  { label: 'Uses', url: '/uses' },
  { label: 'RSS Feed', url: '/feed.xml' },
  { label: 'Sitemap', url: '/sitemap.xml' },
];

export default function AdminNavigationPage() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<NavItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState<'all' | 'header' | 'footer'>('all');

  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItemDto | null>(null);

  // Form Fields
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('/');
  const [itemType, setItemType] = useState<NavItemType>(NavItemType.Link);
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [location, setLocation] = useState<NavLocation>(NavLocation.Header);
  const [parentId, setParentId] = useState<string>('');
  const [isExternal, setIsExternal] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  // Config Fields
  const [dropdownLayout, setDropdownLayout] = useState<'columns' | 'stack'>('columns');
  const [buttonVariant, setButtonVariant] = useState<'primary' | 'secondary' | 'outline'>(
    'primary',
  );
  const [isFeaturedCard, setIsFeaturedCard] = useState(false);
  const [isFooterBar, setIsFooterBar] = useState(false);
  const [hotkey, setHotkey] = useState('');
  const [commandPaletteScope, setCommandPaletteScope] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NavItemDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNav = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: NavItemDto[] }>('/nav-items/admin/all');
      setItems(res.data || []);
      queryClient.invalidateQueries({ queryKey: ['nav-items'] });
    } catch {
      toast.error('Failed to load navigation tree');
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    fetchNav();
  }, [fetchNav]);

  // Collect all eligible parents (items that can hold children)
  const eligibleParents = React.useMemo(() => {
    const list: Array<{ id: string; label: string; depth: number; location: NavLocation }> = [];
    const traverse = (itemList: NavItemDto[], depth = 0) => {
      for (const it of itemList) {
        if (
          it.itemType === NavItemType.Dropdown ||
          it.itemType === NavItemType.Button ||
          it.itemType === NavItemType.Group
        ) {
          list.push({ id: it.id, label: it.label, depth, location: it.location });
        }
        if (it.children && it.children.length > 0) {
          traverse(it.children, depth + 1);
        }
      }
    };
    traverse(items);
    return list;
  }, [items]);

  const filteredItems = React.useMemo(() => {
    if (locationFilter === 'header') {
      return items.filter((i) => i.location === 'header' || i.location === 'both');
    }
    if (locationFilter === 'footer') {
      return items.filter((i) => i.location === 'footer' || i.location === 'both');
    }
    return items;
  }, [items, locationFilter]);

  const headerItemsCount = items.filter(
    (i) => i.location === 'header' || i.location === 'both',
  ).length;
  const footerItemsCount = items.filter(
    (i) => i.location === 'footer' || i.location === 'both',
  ).length;

  const openCreateModal = (
    parent?: NavItemDto,
    initialType: NavItemType = NavItemType.Link,
    preferredLocation?: NavLocation,
  ) => {
    setEditingItem(null);
    setLabel('');
    setUrl(
      initialType === NavItemType.Group ||
        initialType === NavItemType.Divider ||
        initialType === NavItemType.Dropdown
        ? ''
        : '/',
    );

    setItemType(initialType);
    setDescription('');
    setIcon('');
    setBadgeText('');
    setLocation(
      preferredLocation ||
        (parent
          ? parent.location
          : locationFilter === 'footer'
            ? NavLocation.Footer
            : NavLocation.Header),
    );
    setParentId(parent ? parent.id : '');
    setIsExternal(false);
    setIsEnabled(true);
    setDropdownLayout('columns');
    setButtonVariant('primary');
    setIsFeaturedCard(false);
    setIsFooterBar(false);
    setHotkey('');
    setCommandPaletteScope('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: NavItemDto) => {
    setEditingItem(item);
    setLabel(item.label);
    setUrl(item.url || '');
    setItemType(item.itemType);
    setDescription(item.description || '');
    setIcon(item.icon || '');
    setBadgeText(item.badge || '');
    setLocation(item.location);
    setParentId(item.parentId || '');
    setIsExternal(item.isExternal);
    setIsEnabled(item.isEnabled);
    setDropdownLayout(item.config?.layout === 'stack' ? 'stack' : 'columns');
    setButtonVariant(
      item.config?.buttonVariant === 'secondary' || item.config?.buttonVariant === 'outline'
        ? item.config.buttonVariant
        : 'primary',
    );
    setIsFeaturedCard(Boolean(item.config?.isFeaturedCard));
    setIsFooterBar(Boolean(item.config?.isFooterBar));
    setHotkey(item.config?.hotkey ? String(item.config.hotkey) : '');
    setCommandPaletteScope(
      item.config?.commandPaletteScope ? String(item.config.commandPaletteScope) : '',
    );
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label && itemType !== 'divider') {
      toast.error('Label is required');
      return;
    }

    setIsSaving(true);
    try {
      const config: Record<string, unknown> = {
        ...(editingItem?.config || {}),
      };
      if (itemType === 'dropdown') {
        config.layout = dropdownLayout;
        config.columns = dropdownLayout === 'columns' ? 2 : 1;
        if (commandPaletteScope.trim()) {
          config.commandPaletteScope = commandPaletteScope.trim();
        } else {
          delete config.commandPaletteScope;
        }
      } else {
        delete config.layout;
        delete config.columns;
        delete config.commandPaletteScope;
      }
      if (itemType === 'button') {
        config.buttonVariant = buttonVariant;
      } else {
        delete config.buttonVariant;
      }
      if (isFeaturedCard) {
        config.isFeaturedCard = true;
      } else {
        delete config.isFeaturedCard;
      }
      if (isFooterBar) {
        config.isFooterBar = true;
      } else {
        delete config.isFooterBar;
      }
      if (hotkey.trim()) {
        config.hotkey = hotkey.trim().toUpperCase().slice(0, 1);
      } else {
        delete config.hotkey;
      }

      const payload: CreateNavItemRequest | UpdateNavItemRequest = {
        label: label || 'Divider',
        url:
          itemType === 'dropdown' || itemType === 'group' || itemType === 'divider'
            ? ''
            : url.trim(),

        location,
        itemType,
        description: description.trim() || null,
        icon: icon.trim() || null,
        badge: badgeText.trim() || null,
        config,
        isExternal,
        isEnabled,
        parentId: parentId ? parentId : undefined,
      };

      if (editingItem) {
        await apiClient.put(`/nav-items/${editingItem.id}`, payload);
        toast.success(`Navigation item '${label}' updated`);
      } else {
        await apiClient.post('/nav-items', {
          ...payload,
          sortOrder: 99,
        });
        toast.success(`Navigation item '${label}' added`);
      }
      setIsModalOpen(false);
      fetchNav();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save navigation item';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveSibling = async (
    siblingList: NavItemDto[],
    index: number,
    direction: 'up' | 'down',
  ) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblingList.length) return;

    const reordered = [...siblingList];
    const temp = reordered[index]!;
    reordered[index] = reordered[targetIndex]!;
    reordered[targetIndex] = temp;

    const payload = reordered.map((item, idx) => ({
      id: item.id,
      sortOrder: idx + 1,
    }));

    try {
      await apiClient.put('/nav-items/reorder', { items: payload });
      toast.success('Order updated');
      fetchNav();
    } catch {
      toast.error('Failed to reorder items');
      fetchNav();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/nav-items/${deleteTarget.id}`);
      toast.success(`'${deleteTarget.label}' deleted.`);
      setDeleteTarget(null);
      fetchNav();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const createMultiColumnPreset = async () => {
    try {
      setIsLoading(true);
      const dropdown = await apiClient.post<{ data: NavItemDto }>('/nav-items', {
        label: 'Resources',
        url: '/resources',
        location: 'header',
        itemType: 'dropdown',
        sortOrder: items.length + 1,
        config: { layout: 'columns', columns: 2 },
      });

      if (dropdown?.data?.id) {
        const g1 = await apiClient.post<{ data: NavItemDto }>('/nav-items', {
          label: 'Documentation',
          url: '',
          location: 'header',
          itemType: 'group',
          parentId: dropdown.data.id,
          sortOrder: 0,
        });

        if (g1?.data?.id) {
          await apiClient.post('/nav-items', {
            label: 'Engineering Guides',
            description: 'In-depth architecture breakdown and best practices.',
            url: '/blogs',
            location: 'header',
            itemType: 'link',
            icon: 'book-open',
            parentId: g1.data.id,
            sortOrder: 0,
          });
        }

        const g2 = await apiClient.post<{ data: NavItemDto }>('/nav-items', {
          label: 'Case Studies',
          url: '',
          location: 'header',
          itemType: 'group',
          parentId: dropdown.data.id,
          sortOrder: 1,
        });

        if (g2?.data?.id) {
          await apiClient.post('/nav-items', {
            label: 'Dynamic Platform Case Study',
            description: 'Next.js 16 and PostgreSQL scalable portfolio platform.',
            url: '/works',
            location: 'header',
            itemType: 'link',
            icon: 'sparkles',
            badge: 'Featured',
            parentId: g2.data.id,
            config: { isFeaturedCard: true },
            sortOrder: 0,
          });
        }
      }

      toast.success('Multi-column dropdown menu preset created!');
      fetchNav();
    } catch {
      toast.error('Failed to create preset');
      fetchNav();
    }
  };

  const createSplitButtonPreset = async () => {
    try {
      setIsLoading(true);
      const btn = await apiClient.post<{ data: NavItemDto }>('/nav-items', {
        label: 'Get in Touch',
        url: '/contact',
        location: 'header',
        itemType: 'button',
        sortOrder: items.length + 1,
        config: { buttonVariant: 'primary', hotkey: 'C' },
      });

      if (btn?.data?.id) {
        await apiClient.post('/nav-items', {
          label: 'Book a 15-min Call',
          description: 'Direct calendar booking for discussions.',
          url: 'https://cal.com',
          location: 'header',
          itemType: 'link',
          icon: 'calendar',
          isExternal: true,
          parentId: btn.data.id,
          sortOrder: 0,
        });
        await apiClient.post('/nav-items', {
          label: 'Send Email Message',
          description: 'Inquire directly through the website portal.',
          url: '/contact',
          location: 'header',
          itemType: 'link',
          icon: 'mail',
          parentId: btn.data.id,
          sortOrder: 1,
        });
      }

      toast.success('Split CTA Button preset created!');
      fetchNav();
    } catch {
      toast.error('Failed to create preset');
      fetchNav();
    }
  };

  const createFooterCategoryPreset = async () => {
    try {
      setIsLoading(true);
      const col = await apiClient.post<{ data: NavItemDto }>('/nav-items', {
        label: 'Solutions',
        url: '',
        location: 'footer',
        itemType: 'group',
        sortOrder: items.length + 1,
      });

      if (col?.data?.id) {
        await apiClient.post('/nav-items', {
          label: 'Full-Stack Engineering',
          url: '/works',
          location: 'footer',
          itemType: 'link',
          parentId: col.data.id,
          sortOrder: 0,
        });
        await apiClient.post('/nav-items', {
          label: 'System Architecture',
          url: '/skills',
          location: 'footer',
          itemType: 'link',
          parentId: col.data.id,
          sortOrder: 1,
        });
        await apiClient.post('/nav-items', {
          label: 'Open Source Consulting',
          url: '/contact',
          location: 'footer',
          itemType: 'link',
          badge: 'New',
          parentId: col.data.id,
          sortOrder: 2,
        });
      }

      toast.success('Footer category column created!');
      fetchNav();
    } catch {
      toast.error('Failed to create footer category');
      fetchNav();
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Header & Footer Navigation"
        description="Build dynamic mega-menus, multi-column footer sections, categorized link trees, hotkeys, and external links."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openCreateModal(undefined, NavItemType.Group, NavLocation.Footer)}
            >
              <Columns className="w-3.5 h-3.5 mr-1.5 text-accent" />
              <span>Add Footer Section</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => openCreateModal()}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Add Navigation Item</span>
            </Button>
          </div>
        }
      />

      {/* Navigation Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLocationFilter('all')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer',
              locationFilter === 'all'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted hover:text-foreground hover:bg-surface-muted',
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Items ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setLocationFilter('header')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer',
              locationFilter === 'header'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted hover:text-foreground hover:bg-surface-muted',
            )}
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Header Navigation ({headerItemsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setLocationFilter('footer')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer',
              locationFilter === 'footer'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted hover:text-foreground hover:bg-surface-muted',
            )}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Footer Multi-Column ({footerItemsCount})</span>
          </button>
        </div>
      </div>

      {/* 1-Click Structure Presets Toolbar */}
      <div className="p-4 rounded-lg bg-surface border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-foreground">1-Click Menu & Footer Presets</span>
          </div>
          <p className="text-[11px] text-muted">
            Quickly scaffold multi-column mega-menus, split CTA buttons, or footer category columns.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={createMultiColumnPreset}
            className="text-xs h-7"
          >
            <LayoutGrid className="w-3 h-3 mr-1.5 text-accent" />
            <span>Header Mega-Menu</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={createSplitButtonPreset}
            className="text-xs h-7"
          >
            <MousePointerClick className="w-3 h-3 mr-1.5 text-accent" />
            <span>Split CTA Button</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={createFooterCategoryPreset}
            className="text-xs h-7"
          >
            <Columns className="w-3 h-3 mr-1.5 text-accent" />
            <span>Footer Section Column</span>
          </Button>
        </div>
      </div>

      {/* Live Header Preview Bar */}
      {(locationFilter === 'header' || locationFilter === 'all') && (
        <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-muted font-mono pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-semibold text-foreground">Live Desktop Header Preview</span>
            </div>
            <span className="text-[11px]">Database Driven</span>
          </div>

          {/* Mock Header Display */}
          <div className="h-14 bg-background border border-border/80 rounded-md px-4 flex items-center justify-between">
            <span className="font-mono font-extrabold text-xs text-foreground tracking-tight">
              ANUJ<span className="text-accent">.V</span>
            </span>

            <div className="flex items-center gap-3 text-xs font-medium">
              {items
                .filter((i) => i.isEnabled && i.location !== 'footer')
                .map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded-xs transition-colors',
                      item.itemType === 'button'
                        ? 'bg-accent text-accent-foreground font-semibold px-2.5 py-0.5 rounded-sm'
                        : 'text-muted hover:text-foreground',
                    )}
                  >
                    {item.icon && <NavIcon name={item.icon} className="w-3 h-3 text-accent" />}
                    <span>{item.label}</span>
                    {item.itemType === 'dropdown' && (
                      <span className="text-[10px] text-muted">▾</span>
                    )}
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1 py-0.1 bg-surface-muted text-accent border border-border rounded-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-surface border border-border rounded text-[10px] text-muted font-mono flex items-center gap-1">
                <span>⌘ K</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Multi-Column Footer Preview Bar */}
      {(locationFilter === 'footer' || locationFilter === 'all') && (
        <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-muted font-mono pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-semibold text-foreground">
                Live Multi-Column Footer Preview
              </span>
            </div>
            <span className="text-[11px]">Database Driven</span>
          </div>

          {/* Mock Footer Display */}
          <div className="p-5 bg-background border border-border/80 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 space-y-2">
                <span className="font-mono font-extrabold text-sm text-foreground">
                  ANUJ<span className="text-accent">.V</span>
                </span>
                <p className="text-[11px] text-muted font-mono">
                  © 2026 Anuj Yadav. All rights reserved.
                </p>
              </div>

              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {items
                  .filter((i) => i.isEnabled && (i.location === 'footer' || i.location === 'both'))
                  .map((col) => (
                    <div key={col.id} className="space-y-1.5">
                      <span className="text-[11px] font-mono font-semibold capitalize text-foreground block">
                        {col.label}
                      </span>
                      <ul className="space-y-1 text-[11px] text-muted list-none p-0 m-0">
                        {(col.children && col.children.length > 0 ? col.children : [col]).map(
                          (child) => (
                            <li key={child.id} className="flex items-center gap-1">
                              <span>{child.label}</span>
                              {child.isExternal && (
                                <span className="text-[9px] text-accent">↗</span>
                              )}
                              {child.badge && (
                                <span className="text-[9px] font-mono px-1 py-0.1 bg-surface-muted text-accent border border-border rounded-xs">
                                  {child.badge}
                                </span>
                              )}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hierarchical Navigation Tree Builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-foreground flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-accent" />
            <span>
              {locationFilter === 'header'
                ? `Header Navigation (${filteredItems.length} top-level nodes)`
                : locationFilter === 'footer'
                  ? `Footer Sections & Columns (${filteredItems.length} columns)`
                  : `Navigation Hierarchy (${filteredItems.length} top-level nodes)`}
            </span>
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted font-mono bg-surface border border-border rounded-lg">
            Loading navigation tree...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted bg-surface border border-border rounded-lg">
            No navigation items found for this location. Click &quot;Add Navigation Item&quot; or
            use a preset to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, idx) => (
              <NavTreeNode
                key={item.id}
                item={item}
                index={idx}
                siblingList={filteredItems}
                onMove={(direction) => handleMoveSibling(filteredItems, idx, direction)}
                onEditItem={openEditModal}
                onDeleteItem={setDeleteTarget}
                onAddChildToItem={openCreateModal}
                depth={0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Comprehensive Item Editor / Creator Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogContent className="max-w-xl bg-surface border-border p-6 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-5">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <span>{editingItem ? `Edit: ${editingItem.label}` : 'New Navigation Item'}</span>
              </DialogTitle>
            </DialogHeader>

            {/* Target Menu Location Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Menu Location Target</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-background border border-border rounded-md">
                {(
                  [
                    { value: NavLocation.Header, label: 'Header Menu' },
                    { value: NavLocation.Footer, label: 'Footer Column' },
                    { value: NavLocation.Both, label: 'Header & Footer' },
                  ] as const
                ).map((loc) => (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => setLocation(loc.value)}
                    className={cn(
                      'py-1.5 text-xs font-medium rounded-xs transition-colors',
                      location === loc.value
                        ? 'bg-accent text-accent-foreground font-semibold shadow-xs'
                        : 'text-muted hover:text-foreground hover:bg-surface-muted',
                    )}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Item Type Selector Tabs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Element Role / Type</label>
                {location === NavLocation.Footer && (
                  <span className="text-[10px] text-muted font-mono">
                    (Group = Section Heading Column)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-background border border-border rounded-md">
                {(
                  [
                    NavItemType.Link,
                    NavItemType.Dropdown,
                    NavItemType.Button,
                    NavItemType.Group,
                    NavItemType.Divider,
                  ] as const
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setItemType(type)}
                    className={cn(
                      'py-1.5 text-xs font-medium rounded-xs capitalize transition-colors',
                      itemType === type
                        ? 'bg-accent text-accent-foreground font-semibold shadow-xs'
                        : 'text-muted hover:text-foreground hover:bg-surface-muted',
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Label & Route Fields */}
            {itemType !== 'divider' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    {itemType === 'group' ? 'Section Heading / Title' : 'Label'}
                  </label>
                  <Input
                    type="text"
                    placeholder={
                      itemType === 'group'
                        ? 'e.g. Works, Writing, Company'
                        : 'e.g. Case Studies, About'
                    }
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    required
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Destination Route / URL
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. /works, /blogs, https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Quick Route Suggester Buttons */}
            {itemType !== 'divider' && itemType !== 'group' && (
              <div className="space-y-1">
                <span className="text-[11px] text-muted">Quick route selector:</span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_ROUTES.map((r) => (
                    <button
                      key={r.url}
                      type="button"
                      onClick={() => {
                        setUrl(r.url);
                        if (!label) setLabel(r.label);
                      }}
                      className="px-2 py-0.5 text-[10px] font-mono bg-background border border-border hover:border-accent hover:text-accent rounded-xs text-muted transition-colors cursor-pointer"
                    >
                      {r.url}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description & Subtitle */}
            {itemType !== 'divider' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Description / Subtitle (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. In-depth engineering breakdowns and case studies."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-md p-2 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>
            )}

            {/* Icon, Badge, Hotkey */}
            {itemType !== 'divider' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Icon Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Icon Identifier</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. sparkles, cpu, mail"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="bg-background text-xs font-mono"
                    />
                    {icon && (
                      <div className="w-8 h-8 rounded-sm bg-surface-muted border border-border flex items-center justify-center text-accent shrink-0">
                        <NavIcon name={icon} className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge Tag */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Badge Tag</label>
                  <Input
                    type="text"
                    placeholder="e.g. Featured, New, Live"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>

                {/* Hotkey */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Hotkey (1-key)</label>
                  <Input
                    type="text"
                    maxLength={1}
                    placeholder="e.g. W, B, A, C"
                    value={hotkey}
                    onChange={(e) => setHotkey(e.target.value.toUpperCase())}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Popular Icon Quick-Select Strip */}
            {itemType !== 'divider' && (
              <div className="space-y-1">
                <span className="text-[11px] text-muted">Popular icons:</span>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={cn(
                        'p-1.5 rounded-xs border transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer',
                        icon === ic
                          ? 'bg-accent/15 border-accent text-accent'
                          : 'bg-background border-border text-muted hover:text-foreground',
                      )}
                      title={ic}
                    >
                      <NavIcon name={ic} className="w-3 h-3" />
                      <span>{ic}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Parent Item Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Parent Container</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">[ Top-Level Section / Menu Item ]</option>
                {eligibleParents
                  .filter((p) => !editingItem || p.id !== editingItem.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {'-'.repeat(p.depth * 2)} ↳ [{p.location}] {p.label}
                    </option>
                  ))}
              </select>
            </div>

            {/* Advanced Type-Specific Configurations */}
            {itemType === 'dropdown' && (
              <div className="p-3 rounded-md bg-background border border-border space-y-3">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground">Dropdown Layout Mode</span>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dropdownLayout"
                        checked={dropdownLayout === 'columns'}
                        onChange={() => setDropdownLayout('columns')}
                        className="accent-accent"
                      />
                      <span>Multi-Column (Parallel Grid)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dropdownLayout"
                        checked={dropdownLayout === 'stack'}
                        onChange={() => setDropdownLayout('stack')}
                        className="accent-accent"
                      />
                      <span>Single-Column (Vertical Stack)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-border/50">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Command Palette Search Scope (Optional)</span>
                    <span className="text-[10px] text-muted font-mono">e.g. projects, blogs</span>
                  </label>
                  <input
                    type="text"
                    value={commandPaletteScope}
                    onChange={(e) => setCommandPaletteScope(e.target.value)}
                    placeholder="e.g. projects"
                    className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                </div>
              </div>
            )}

            {itemType === 'button' && (
              <div className="p-3 rounded-md bg-background border border-border space-y-2">
                <span className="text-xs font-bold text-foreground">Button Style Variant</span>
                <div className="flex items-center gap-4 text-xs">
                  {(['primary', 'secondary', 'outline'] as const).map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer capitalize">
                      <input
                        type="radio"
                        name="buttonVariant"
                        checked={buttonVariant === v}
                        onChange={() => setButtonVariant(v)}
                        className="accent-accent"
                      />
                      <span>{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Special Highlight Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded bg-background border border-border select-none">
                <input
                  type="checkbox"
                  checked={isFeaturedCard}
                  onChange={(e) => setIsFeaturedCard(e.target.checked)}
                  className="rounded border-border accent-accent w-4 h-4 cursor-pointer"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-foreground block">
                    Featured Bento Card
                  </span>
                  <span className="text-[10px] text-muted block">
                    Render as highlighted card in dropdowns
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded bg-background border border-border select-none">
                <input
                  type="checkbox"
                  checked={isFooterBar}
                  onChange={(e) => setIsFooterBar(e.target.checked)}
                  className="rounded border-border accent-accent w-4 h-4 cursor-pointer"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-foreground block">
                    Full-Width Footer Strip
                  </span>
                  <span className="text-[10px] text-muted block">
                    Span full width at bottom of dropdown
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded bg-background border border-border select-none">
                <input
                  type="checkbox"
                  checked={isExternal}
                  onChange={(e) => setIsExternal(e.target.checked)}
                  className="rounded border-border accent-accent w-4 h-4 cursor-pointer"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-foreground block">
                    Open in New Tab (External ↗)
                  </span>
                  <span className="text-[10px] text-muted block">
                    Renders external indicator symbol
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded bg-background border border-border select-none">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="rounded border-border accent-accent w-4 h-4 cursor-pointer"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-foreground block">
                    Visible on Public Site
                  </span>
                </div>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                {editingItem ? 'Update Item' : 'Create Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md bg-surface border-border p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground">
              Delete &quot;{deleteTarget?.label}&quot;?
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted leading-relaxed">
            Are you sure you want to delete this navigation item? If it has nested child items, all
            sub-items will also be removed.
          </p>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Delete Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Recursive Node in Navigation Tree */
function NavTreeNode({
  item,
  index,
  siblingList,
  onMove,
  onEditItem,
  onDeleteItem,
  onAddChildToItem,
  depth = 0,
}: {
  item: NavItemDto;
  index: number;
  siblingList: NavItemDto[];
  onMove: (direction: 'up' | 'down') => void;
  onEditItem: (item: NavItemDto) => void;
  onDeleteItem: (item: NavItemDto) => void;
  onAddChildToItem: (parent: NavItemDto, type: NavItemType) => void;
  depth: number;
}) {
  const isFirst = index === 0;
  const isLast = index === siblingList.length - 1;
  const hasChildren = item.children && item.children.length > 0;
  const canHaveChildren =
    item.itemType === 'dropdown' || item.itemType === 'button' || item.itemType === 'group';

  const typeBadgeStyles: Record<string, string> = {
    dropdown:
      'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800/60 dark:bg-purple-950/40',
    button:
      'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60 dark:bg-amber-950/40',
    group:
      'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60 dark:bg-emerald-950/40',
    divider: 'bg-surface-muted text-muted border-border',
    link: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800/60 dark:bg-blue-950/40',
  };

  const locationBadgeStyles: Record<string, string> = {
    header: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    footer: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    both: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  };

  return (
    <div className={cn('space-y-1', depth > 0 && 'ml-6 border-l-2 border-border/80 pl-3')}>
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-surface border border-border hover:border-muted/60 transition-colors">
        {/* Left: Reorder controls & Details */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Reorder Up/Down */}
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onMove('up')}
              disabled={isFirst}
              className={cn(
                'p-0.5 rounded text-muted hover:text-accent hover:bg-surface-muted transition-colors cursor-pointer',
                isFirst && 'opacity-20 pointer-events-none',
              )}
              title="Move Up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onMove('down')}
              disabled={isLast}
              className={cn(
                'p-0.5 rounded text-muted hover:text-accent hover:bg-surface-muted transition-colors cursor-pointer',
                isLast && 'opacity-20 pointer-events-none',
              )}
              title="Move Down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>

          {/* Node Icon / Type Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                'text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border font-semibold',
                typeBadgeStyles[item.itemType] || typeBadgeStyles.link,
              )}
            >
              {depth > 0 && item.itemType === 'dropdown'
                ? 'Flyout'
                : item.itemType === 'group' && item.location === 'footer'
                  ? 'Category'
                  : item.itemType}
            </span>

            <span
              className={cn(
                'text-[9px] font-mono uppercase px-1 py-0.2 rounded border font-semibold',
                locationBadgeStyles[item.location] || locationBadgeStyles.header,
              )}
            >
              {item.location}
            </span>

            {item.icon && (
              <div className="w-6 h-6 rounded bg-surface-muted border border-border flex items-center justify-center text-accent">
                <NavIcon name={item.icon} className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Label, Description & Flags */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs text-foreground">{item.label}</span>

              {item.badge && (
                <span className="text-[10px] font-mono bg-accent/15 text-accent border border-accent/30 px-1 py-0.1 rounded-xs">
                  {item.badge}
                </span>
              )}

              {item.config?.hotkey && (
                <span className="text-[9px] font-mono bg-surface-muted px-1 rounded border border-border text-muted">
                  Hotkey: {String(item.config.hotkey)}
                </span>
              )}

              {item.config?.isFeaturedCard && (
                <span className="text-[9px] font-mono bg-accent/20 text-accent px-1.5 rounded border border-accent/40">
                  Featured Bento
                </span>
              )}

              {item.config?.isFooterBar && (
                <span className="text-[9px] font-mono bg-surface-muted text-muted px-1.5 rounded border border-border">
                  Footer Strip
                </span>
              )}

              {item.config?.commandPaletteScope && (
                <span className="text-[9px] font-mono bg-accent/10 text-accent px-1.5 rounded border border-accent/30">
                  Scope: {String(item.config.commandPaletteScope)}
                </span>
              )}

              {item.itemType === 'dropdown' && (
                <span className="text-[9px] font-mono bg-surface-muted text-muted px-1 rounded border border-border">
                  {item.config?.layout === 'stack' ? '1-Col Stack' : '2-Cols Grid'}
                </span>
              )}

              {item.isExternal && (
                <span className="text-[10px] text-muted font-mono bg-surface-muted px-1.5 py-0.2 rounded border border-border flex items-center gap-0.5">
                  <ExternalLink className="w-2.5 h-2.5 text-accent" /> External ↗
                </span>
              )}

              {!item.isEnabled && (
                <span className="text-[10px] text-destructive font-mono flex items-center gap-0.5">
                  <EyeOff className="w-3 h-3" /> Hidden
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{item.description}</p>
            )}

            {item.url && (
              <p className="text-[10px] text-muted/70 font-mono truncate mt-0.5">{item.url}</p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {canHaveChildren && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] text-accent hover:bg-accent/10"
              onClick={() =>
                onAddChildToItem(
                  item,
                  item.itemType === NavItemType.Dropdown ? NavItemType.Group : NavItemType.Link,
                )
              }
              title="Add Child Sub-Item"
            >
              <Plus className="w-3 h-3 mr-1" />
              <span>Add Child</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted hover:text-foreground"
            onClick={() => onEditItem(item)}
            title="Edit Item"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => onDeleteItem(item)}
            title="Delete Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Recursive Children Rendering */}
      {hasChildren && (
        <div className="space-y-1 pt-1">
          {item.children.map((child, cIdx) => (
            <NavTreeNode
              key={child.id}
              item={child}
              index={cIdx}
              siblingList={item.children}
              onMove={(dir) => {
                const targetIdx = dir === 'up' ? cIdx - 1 : cIdx + 1;
                if (targetIdx >= 0 && targetIdx < item.children.length) {
                  const updated = [...item.children];
                  const temp = updated[cIdx]!;
                  updated[cIdx] = updated[targetIdx]!;
                  updated[targetIdx] = temp;
                  const payload = updated.map((it, i) => ({ id: it.id, sortOrder: i + 1 }));
                  apiClient.put('/nav-items/reorder', { items: payload }).then(() => {
                    toast.success('Child order updated');
                    window.location.reload();
                  });
                }
              }}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              onAddChildToItem={onAddChildToItem}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
