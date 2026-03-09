import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import type { InvoiceRecord } from '@/lib/contracts';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#1f2937',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    companyInfo: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6366f1',
    },
    invoiceInfo: {
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#374151',
        textTransform: 'uppercase',
    },
    billTo: {
        marginBottom: 30,
    },
    table: {
        width: '100%',
        marginBottom: 30,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 8,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f3f4f6',
    },
    colDesc: { width: '60%' },
    colQty: { width: '10%', textAlign: 'center' },
    colRate: { width: '15%', textAlign: 'right' },
    colAmount: { width: '15%', textAlign: 'right' },
    totals: {
        marginLeft: 'auto',
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        marginTop: 8,
        fontWeight: 'bold',
        fontSize: 14,
    },
    notes: {
        marginTop: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 8,
    }
});

interface InvoicePDFProps {
    invoice: InvoiceRecord;
    freelancer: {
        name?: string | null;
        email?: string | null;
    } | null;
}

export const InvoicePDF = ({ invoice, freelancer }: InvoicePDFProps) => {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: invoice.currency,
        }).format(val);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        <Text style={styles.title}>INVOICE</Text>
                        <Text style={{ marginTop: 4 }}>{freelancer?.name ?? 'PortalKit Freelancer'}</Text>
                        <Text>{freelancer?.email ?? ''}</Text>
                    </View>
                    <View style={styles.invoiceInfo}>
                        <Text style={{ fontWeight: 'bold' }}>#{invoice.invoiceNumber}</Text>
                        <Text>Date: {new Date(invoice.issueDate).toLocaleDateString()}</Text>
                        <Text>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
                    </View>
                </View>

                <View style={styles.billTo}>
                    <Text style={styles.sectionTitle}>Bill To:</Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{invoice.clientName}</Text>
                    <Text>{invoice.clientEmail}</Text>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colDesc}>Description</Text>
                        <Text style={styles.colQty}>Qty</Text>
                        <Text style={styles.colRate}>Rate</Text>
                        <Text style={styles.colAmount}>Amount</Text>
                    </View>
                    {invoice.lineItems.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.colDesc}>{item.description}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colRate}>{formatCurrency(item.rate)}</Text>
                            <Text style={styles.colAmount}>{formatCurrency(item.quantity * item.rate)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text>Subtotal:</Text>
                        <Text>{formatCurrency(invoice.subtotal)}</Text>
                    </View>
                    {invoice.taxRate > 0 && (
                        <View style={styles.totalRow}>
                            <Text>Tax ({invoice.taxRate}%):</Text>
                            <Text>{formatCurrency(invoice.subtotal * (invoice.taxRate / 100))}</Text>
                        </View>
                    )}
                    {invoice.discount > 0 && (
                        <View style={styles.totalRow}>
                            <Text>Discount:</Text>
                            <Text>-{formatCurrency(invoice.discount)}</Text>
                        </View>
                    )}
                    <View style={styles.grandTotalRow}>
                        <Text>Total:</Text>
                        <Text>{formatCurrency(invoice.total)}</Text>
                    </View>
                </View>

                {invoice.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.sectionTitle}>Notes:</Text>
                        <Text style={{ color: '#4b5563', lineHeight: 1.5 }}>{invoice.notes}</Text>
                    </View>
                )}

                <Text style={styles.footer}>
                    Generated by PortalKit — Freelancer Client Portal
                </Text>
            </Page>
        </Document>
    );
};
