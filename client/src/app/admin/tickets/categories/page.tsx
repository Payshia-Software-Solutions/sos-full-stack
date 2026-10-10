"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    getAllTicketCategories, 
    createTicketCategory, 
    updateTicketCategory, 
    deleteTicketCategory, 
    TicketCategoryItem, 
    CreateTicketCategoryPayload 
} from "@/lib/actions/ticketCategories";
import { 
    AVAILABLE_ICONS, 
    COLOR_PRESETS, 
    getCategoryIcon 
} from "@/lib/ticket-category-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { 
    Plus, Edit, Trash2, ArrowLeft, Loader2, Sparkles, Check, 
    Layers, Tag, Palette, Eye, EyeOff, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function TicketCategoriesPage() {
    const queryClient = useQueryClient();

    // Query for all categories
    const { data: categories = [], isLoading, isError, error } = useQuery<TicketCategoryItem[]>({
        queryKey: ["admin-ticket-categories"],
        queryFn: getAllTicketCategories
    });

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TicketCategoryItem | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateTicketCategoryPayload>({
        name: "",
        category_key: "",
        icon: "HelpCircle",
        color: "text-blue-400",
        bg_color: "bg-blue-500/10",
        border_color: "border-blue-500/30",
        description: "",
        display_order: 0,
        is_active: 1
    });

    // Create / Update mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            if (editingItem) {
                return updateTicketCategory(editingItem.id, formData);
            } else {
                return createTicketCategory(formData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-ticket-categories"] });
            queryClient.invalidateQueries({ queryKey: ["active-ticket-categories"] });
            toast({
                title: editingItem ? "Category Updated" : "Category Created",
                description: `Successfully saved "${formData.name}".`
            });
            setIsModalOpen(false);
        },
        onError: (err: any) => {
            toast({
                variant: "destructive",
                title: "Error saving category",
                description: err.message || "An unexpected error occurred"
            });
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteTicketCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-ticket-categories"] });
            queryClient.invalidateQueries({ queryKey: ["active-ticket-categories"] });
            toast({
                title: "Category Deleted",
                description: "Ticket category removed successfully."
            });
        },
        onError: (err: any) => {
            toast({
                variant: "destructive",
                title: "Error deleting category",
                description: err.message || "Could not delete category"
            });
        }
    });

    // Toggle active status
    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, is_active }: { id: number; is_active: number }) => 
            updateTicketCategory(id, { is_active: is_active === 1 ? 0 : 1 }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-ticket-categories"] });
            queryClient.invalidateQueries({ queryKey: ["active-ticket-categories"] });
            toast({ title: "Status Updated", description: "Category visibility toggled." });
        }
    });

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            name: "",
            category_key: "",
            icon: "BookOpen",
            color: "text-blue-400",
            bg_color: "bg-blue-500/10",
            border_color: "border-blue-500/30",
            description: "",
            display_order: categories.length + 1,
            is_active: 1
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: TicketCategoryItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category_key: item.category_key,
            icon: item.icon || "HelpCircle",
            color: item.color || "text-blue-400",
            bg_color: item.bg_color || "bg-blue-500/10",
            border_color: item.border_color || "border-blue-500/30",
            description: item.description || "",
            display_order: item.display_order,
            is_active: item.is_active
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast({ variant: "destructive", title: "Validation Error", description: "Category name is required" });
            return;
        }
        saveMutation.mutate();
    };

    const PreviewIcon = getCategoryIcon(formData.icon);

    return (
        <div className="p-4 md:p-8 space-y-6 w-full min-h-screen pb-24 text-foreground bg-background">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/tickets" passHref>
                        <Button variant="ghost" className="hover:bg-slate-900 border border-border/40 h-9 px-3">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl md:text-2xl font-headline font-bold text-white tracking-tight">
                                Ticket Categories & Routing Desk
                            </h1>
                            <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30 bg-primary/10">
                                {categories.length} Categories Configured
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            Dynamically manage departments, visual themes, and routing presets for the official support desk.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link href="/admin/tickets/create" passHref className="flex-1 sm:flex-initial">
                        <Button variant="outline" className="w-full sm:w-auto h-9 text-xs border-border/60 hover:bg-slate-900">
                            Open Ticket Form
                        </Button>
                    </Link>
                    <Button 
                        onClick={openCreateModal}
                        className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 shadow-md flex items-center gap-1.5 flex-1 sm:flex-initial"
                    >
                        <Plus className="h-4 w-4" /> Add New Category
                    </Button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Categories</p>
                        <h4 className="text-xl font-bold text-white mt-0.5">{categories.length}</h4>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Layers className="h-4 w-4" />
                    </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active & Visible</p>
                        <h4 className="text-xl font-bold text-emerald-400 mt-0.5">
                            {categories.filter(c => c.is_active === 1).length}
                        </h4>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Eye className="h-4 w-4" />
                    </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Inactive (Hidden)</p>
                        <h4 className="text-xl font-bold text-slate-400 mt-0.5">
                            {categories.filter(c => c.is_active === 0).length}
                        </h4>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400">
                        <EyeOff className="h-4 w-4" />
                    </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Storage Target</p>
                        <h4 className="text-xs font-mono font-bold text-primary mt-1 truncate">MySQL Cloud DB</h4>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* Content List / Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-16 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Loading ticket categories from database...</p>
                </div>
            ) : isError ? (
                <div className="p-6 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs">
                    Failed to load categories: {(error as any)?.message || "Unknown error"}
                </div>
            ) : categories.length === 0 ? (
                <div className="p-16 text-center rounded-xl border border-dashed border-border/60 space-y-3">
                    <Layers className="h-10 w-10 mx-auto text-muted-foreground/60" />
                    <h3 className="text-base font-bold text-white">No Categories Found</h3>
                    <p className="text-xs text-muted-foreground">Create your first ticket category to get started.</p>
                    <Button onClick={openCreateModal} size="sm" className="mt-2">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Category
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
                    {categories.map((cat) => {
                        const CatIcon = getCategoryIcon(cat.icon);
                        const isInactive = cat.is_active === 0;

                        return (
                            <Card 
                                key={cat.id} 
                                className={cn(
                                    "border transition-all duration-200 bg-card hover:border-border",
                                    isInactive ? "opacity-60 border-dashed" : "border-border/60 shadow-sm"
                                )}
                            >
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2.5 rounded-xl border shrink-0", cat.bg_color, cat.color, cat.border_color)}>
                                                <CatIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-white leading-tight">
                                                        {cat.name}
                                                    </h3>
                                                    {isInactive && (
                                                        <Badge variant="outline" className="text-[9px] py-0 px-1 border-slate-700 text-slate-400">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                                    Key: <span className="text-slate-300 font-semibold">{cat.category_key}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <Badge variant="outline" className="text-[10px] font-mono text-slate-400">
                                            Order: {cat.display_order}
                                        </Badge>
                                    </div>

                                    {cat.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {cat.description}
                                        </p>
                                    )}

                                    {/* Action Bar */}
                                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleStatusMutation.mutate({ id: cat.id, is_active: cat.is_active })}
                                            className="h-7 text-xs text-muted-foreground hover:text-white px-2"
                                            disabled={toggleStatusMutation.isPending}
                                        >
                                            {cat.is_active === 1 ? (
                                                <>
                                                    <Eye className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Active
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="h-3.5 w-3.5 mr-1 text-slate-500" /> Inactive
                                                </>
                                            )}
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(cat)}
                                                className="h-7 text-xs text-slate-300 hover:text-white hover:bg-slate-800 px-2"
                                            >
                                                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                                        deleteMutation.mutate(cat.id);
                                                    }
                                                }}
                                                className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2"
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Category Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[540px] bg-slate-950 border-border text-foreground p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-5 border-b border-border/60 bg-slate-900/40">
                        <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            {editingItem ? "Edit Ticket Category" : "Add New Ticket Category"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Configure category label, department key, icon and visual theme.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
                        {/* Live Preview Pill */}
                        <div className="p-3 rounded-xl border border-dashed border-border/80 bg-slate-900/30 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-semibold">Live Preview:</span>
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm",
                                formData.bg_color, formData.border_color
                            )}>
                                <PreviewIcon className={cn("h-4 w-4", formData.color)} />
                                <span className="text-xs font-bold text-white">
                                    {formData.name || "Category Label"}
                                </span>
                            </div>
                        </div>

                        {/* Name & Key */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-300">Category Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => {
                                        const newName = e.target.value;
                                        setFormData((prev) => ({
                                            ...prev,
                                            name: newName,
                                            // Auto-generate key if creating new
                                            category_key: editingItem ? prev.category_key : newName.replace(/[^a-zA-Z0-9]/g, '')
                                        }));
                                    }}
                                    placeholder="e.g. Accounts & Fees"
                                    className="h-9 bg-slate-900 text-xs border-border/80"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-300">Category Key / Tag *</Label>
                                <Input
                                    value={formData.category_key}
                                    onChange={(e) => setFormData({ ...formData, category_key: e.target.value })}
                                    placeholder="e.g. Accounts"
                                    className="h-9 bg-slate-900 text-xs border-border/80 font-mono"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-300">Description / Scope (Optional)</Label>
                            <Input
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. Student fee payments, payment slips and invoices"
                                className="h-9 bg-slate-900 text-xs border-border/80"
                            />
                        </div>

                        {/* Icon Selection */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-300">Select Icon</Label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2 rounded-xl bg-slate-900/60 border border-border/60 max-h-36 overflow-y-auto">
                                {AVAILABLE_ICONS.map((iconItem) => {
                                    const IconComp = getCategoryIcon(iconItem.name);
                                    const isSelected = formData.icon === iconItem.name;
                                    return (
                                        <button
                                            key={iconItem.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: iconItem.name })}
                                            title={iconItem.label}
                                            className={cn(
                                                "p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all border text-xs",
                                                isSelected
                                                    ? "bg-primary text-white border-primary shadow-sm"
                                                    : "bg-slate-950/40 text-muted-foreground border-border/40 hover:text-white hover:bg-slate-900"
                                            )}
                                        >
                                            <IconComp className="h-4 w-4" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Color Preset Selection */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-300">Color Theme</Label>
                            <div className="flex flex-wrap gap-2">
                                {COLOR_PRESETS.map((preset) => {
                                    const isSelected = formData.color === preset.color;
                                    return (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                color: preset.color,
                                                bg_color: preset.bg_color,
                                                border_color: preset.border_color
                                            })}
                                            className={cn(
                                                "px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all",
                                                preset.bg_color, preset.color, preset.border_color,
                                                isSelected ? "ring-2 ring-white scale-105" : "hover:brightness-110"
                                            )}
                                        >
                                            {isSelected && <Check className="h-3 w-3" />}
                                            <span>{preset.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order & Status */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-300">Display Order</Label>
                                <Input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                    className="h-9 bg-slate-900 text-xs border-border/80 font-mono"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-300">Status</Label>
                                <div className="flex items-center gap-2 h-9">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: formData.is_active === 1 ? 0 : 1 })}
                                        className={cn(
                                            "w-full h-full rounded-md border text-xs font-bold transition-colors flex items-center justify-center gap-1.5",
                                            formData.is_active === 1
                                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                                : "bg-slate-900 border-border/60 text-muted-foreground"
                                        )}
                                    >
                                        {formData.is_active === 1 ? (
                                            <>
                                                <Eye className="h-3.5 w-3.5" /> Active (Visible)
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="h-3.5 w-3.5" /> Inactive (Hidden)
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border/60 gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="h-9 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saveMutation.isPending}
                                className="h-9 text-xs bg-primary hover:bg-primary/90 font-bold"
                            >
                                {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                                {editingItem ? "Save Changes" : "Create Category"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
