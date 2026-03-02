'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Plus,
    Trash2,
    Save,
    Send,
    Calculator,
    Calendar as CalendarIcon,
    ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import currency from 'currency.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const itemSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(0.01, 'Min 0.01'),
    rate: z.number().min(0, 'Min 0'),
});

const invoiceSchema = z.object({
    issueDate: z.date(),
    dueDate: z.date(),
    currency: z.string(),
    lineItems: z.array(itemSchema).min(1, 'At least one item is required'),
    taxRate: z.number().min(0).max(100),
    discount: z.number().min(0),
    notes: z.string(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceEditorProps {
    projectId: string;
    project: any;
    initialData?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export function InvoiceEditor({ projectId, project, initialData, onSuccess, onCancel }: InvoiceEditorProps) {
    const defaultValues = useMemo(() => {
        if (initialData) {
            return {
                ...initialData,
                issueDate: new Date(initialData.issueDate),
                dueDate: new Date(initialData.dueDate),
                notes: initialData.notes || '',
                currency: initialData.currency || 'USD',
                taxRate: initialData.taxRate || 0,
                discount: initialData.discount || 0,
            };
        }
        return {
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            currency: 'USD',
            taxRate: 0,
            discount: 0,
            lineItems: [{ description: '', quantity: 1, rate: 0 }],
            notes: '',
        };
    }, [initialData]);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lineItems",
    });

    const watchedItems = watch("lineItems");
    const watchedTaxRate = watch("taxRate");
    const watchedDiscount = watch("discount");

    const totals = useMemo(() => {
        const subtotal = watchedItems.reduce((acc, item) =>
            currency(acc).add(currency(item.quantity || 0).multiply(item.rate || 0)).value, 0);
        const taxAmount = currency(subtotal).multiply(watchedTaxRate / 100).value;
        const total = currency(subtotal).add(taxAmount).subtract(watchedDiscount).value;
        return { subtotal, taxAmount, total };
    }, [watchedItems, watchedTaxRate, watchedDiscount]);

    const onSubmit = async (values: InvoiceFormValues) => {
        try {
            const url = initialData
                ? `/api/projects/${projectId}/invoices/${initialData._id}`
                : `/api/projects/${projectId}/invoices`;

            const method = initialData ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    issueDate: values.issueDate.toISOString(),
                    dueDate: values.dueDate.toISOString(),
                }),
            });

            if (!res.ok) throw new Error('Failed to save invoice');

            toast.success(initialData ? 'Invoice updated' : 'Invoice created');
            onSuccess();
        } catch (error) {
            toast.error('Error saving invoice');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-6 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Calculator className="text-indigo-400" size={20} />
                            General Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Issue Date</Label>
                                <Controller
                                    control={control}
                                    name="issueDate"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal glass-card border-white/5",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-white/10" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Controller
                                    control={control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal glass-card border-white/5",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-white/10" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Controller
                                    control={control}
                                    name="currency"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="glass-card border-white/5">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent className="glass-card border-white/10">
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="CAD">CAD ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Bill To</Label>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-sm">
                                    <p className="font-bold">{project.clientName}</p>
                                    <p className="text-[var(--text-muted)]">{project.clientEmail}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Line Items</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ description: '', quantity: 1, rate: 0 })}
                                className="gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                            >
                                <Plus size={16} /> Add Item
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-3 items-start animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="col-span-6 space-y-2">
                                        <Input
                                            placeholder="Item description"
                                            {...register(`lineItems.${index}.description` as const)}
                                            className="glass-input"
                                        />
                                        {errors.lineItems?.[index]?.description && (
                                            <p className="text-[10px] text-red-400">{errors.lineItems[index]?.description?.message}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Qty"
                                            {...register(`lineItems.${index}.quantity` as const, { valueAsNumber: true })}
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Rate"
                                            {...register(`lineItems.${index}.rate` as const, { valueAsNumber: true })}
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="col-span-1 pt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="text-red-400 hover:bg-red-500/10 h-8 w-8"
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-4">
                        <Label>Notes & Terms</Label>
                        <Textarea
                            placeholder="Bank details, payment terms, or a thank you note..."
                            {...register("notes")}
                            className="glass-textarea min-h-[100px]"
                        />
                    </div>
                </div>

                {/* Right Column: Totals & Summary */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card p-6 space-y-6 sticky top-8 bg-indigo-500/5">
                        <h3 className="text-lg font-bold">Summary</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Subtotal</span>
                                <span className="font-medium">{totals.subtotal.toFixed(2)}</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--text-secondary)]">Tax Rate (%)</span>
                                    <Input
                                        type="number"
                                        {...register("taxRate", { valueAsNumber: true })}
                                        className="w-20 glass-input h-8 text-right"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--text-secondary)]">Discount</span>
                                    <Input
                                        type="number"
                                        {...register("discount", { valueAsNumber: true })}
                                        className="w-20 glass-input h-8 text-right"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-black text-indigo-400">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: watch('currency') || 'USD'
                                        }).format(totals.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-6">
                            <Button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold shadow-lg shadow-indigo-500/20 gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : <><Save size={18} /> Save Draft</>}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="glass-card border-white/5 h-12 rounded-xl"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
