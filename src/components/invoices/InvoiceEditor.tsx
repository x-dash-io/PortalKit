'use client';

import React, { useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Plus,
    Trash2,
    Save,
    Calculator,
    Calendar as CalendarIcon,
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
import type { InvoiceRecord, ProjectDetail } from '@/lib/contracts';

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
    project: ProjectDetail;
    initialData?: InvoiceRecord;
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
        } catch {
            toast.error('Error saving invoice');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: Form */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="glass-card p-5 sm:p-6 space-y-5 rounded-2xl" style={{ borderColor: 'var(--border-medium)' }}>
                        <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Calculator style={{ color: 'var(--accent)' }} size={18} />
                            General Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                        "w-full justify-start text-left font-normal h-10 rounded-xl",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    style={{
                                                        background: 'var(--input)',
                                                        borderColor: 'var(--border-medium)',
                                                        color: field.value ? 'var(--text-primary)' : 'var(--text-muted)',
                                                    }}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
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
                                                        "w-full justify-start text-left font-normal h-10 rounded-xl",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    style={{
                                                        background: 'var(--input)',
                                                        borderColor: 'var(--border-medium)',
                                                        color: field.value ? 'var(--text-primary)' : 'var(--text-muted)',
                                                    }}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
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
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
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
                                <div className="h-10 px-3 flex flex-col justify-center rounded-xl border text-sm"
                                    style={{ background: 'var(--surface-muted)', borderColor: 'var(--border-medium)' }}>
                                    <p className="font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{project.clientName}</p>
                                    <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{project.clientEmail}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-5 sm:p-6 space-y-5 rounded-2xl" style={{ borderColor: 'var(--border-medium)' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Line Items</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ description: '', quantity: 1, rate: 0 })}
                                className="gap-1.5 rounded-xl text-xs font-semibold"
                                style={{ borderColor: 'var(--border-accent)', color: 'var(--accent)', background: 'var(--accent-light)' }}
                            >
                                <Plus size={14} /> Add Item
                            </Button>
                        </div>

                        {/* Column headers */}
                        <div className="hidden sm:grid grid-cols-12 gap-3 px-1">
                            <span className="col-span-6 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Description</span>
                            <span className="col-span-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Qty</span>
                            <span className="col-span-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Rate</span>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-2 sm:gap-3 items-start" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="col-span-12 sm:col-span-6 space-y-1">
                                        <label className="sm:hidden text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Description</label>
                                        <Input
                                            placeholder="Item description"
                                            {...register(`lineItems.${index}.description` as const)}
                                        />
                                        {errors.lineItems?.[index]?.description && (
                                            <p className="text-[10px]" style={{ color: 'var(--destructive)' }}>{errors.lineItems[index]?.description?.message}</p>
                                        )}
                                    </div>
                                    <div className="col-span-4 sm:col-span-2 space-y-1">
                                        <label className="sm:hidden text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Qty</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="1"
                                            {...register(`lineItems.${index}.quantity` as const, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-3 space-y-1">
                                        <label className="sm:hidden text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Rate</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...register(`lineItems.${index}.rate` as const, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 flex items-end pb-0.5 h-full justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="h-10 w-10 rounded-xl"
                                            style={{ color: 'var(--destructive)' }}
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 size={15} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-5 sm:p-6 space-y-3 rounded-2xl" style={{ borderColor: 'var(--border-medium)' }}>
                        <Label>Notes & Terms</Label>
                        <Textarea
                            placeholder="Bank details, payment terms, or a thank you note..."
                            {...register("notes")}
                            className="min-h-[100px] rounded-xl"
                        />
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="xl:col-span-1">
                    <div className="glass-card p-5 sm:p-6 space-y-5 rounded-2xl xl:sticky xl:top-20" style={{ borderColor: 'var(--border-medium)', background: 'var(--surface)' }}>
                        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Summary</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm py-1">
                                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{totals.subtotal.toFixed(2)}</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                    Tax Rate (%)
                                </label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    {...register("taxRate", { valueAsNumber: true })}
                                    className="input-base h-10 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                    Discount ({watch('currency') || 'USD'})
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    {...register("discount", { valueAsNumber: true })}
                                    className="input-base h-10 text-sm"
                                />
                            </div>

                            <div
                                className="pt-3 space-y-1"
                                style={{ borderTop: '1px solid var(--border-medium)' }}
                            >
                                {totals.taxAmount > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span style={{ color: 'var(--text-muted)' }}>Tax ({watchedTaxRate}%)</span>
                                        <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>+{totals.taxAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {watchedDiscount > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span style={{ color: 'var(--text-muted)' }}>Discount</span>
                                        <span className="tabular-nums" style={{ color: 'var(--success)' }}>−{watchedDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                                    <span className="text-2xl font-black tabular-nums" style={{ color: 'var(--accent)' }}>
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: watch('currency') || 'USD'
                                        }).format(totals.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                type="submit"
                                className="h-11 rounded-xl font-bold gap-2"
                                style={{ background: 'var(--accent-gradient)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : <><Save size={16} /> Save Draft</>}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="h-11 rounded-xl font-semibold"
                                style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)', background: 'var(--surface)' }}
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
