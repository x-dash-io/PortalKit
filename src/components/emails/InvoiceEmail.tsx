import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';
import { format } from 'date-fns';

interface InvoiceEmailProps {
    invoiceNumber: string;
    freelancerName: string;
    amount: number;
    currency: string;
    dueDate: Date;
    portalUrl: string;
}

export const InvoiceEmail = ({
    invoiceNumber,
    freelancerName,
    amount,
    currency,
    dueDate,
    portalUrl,
}: InvoiceEmailProps) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);

    return (
        <Html>
            <Head />
            <Preview>Invoice {invoiceNumber} from {freelancerName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Invoice Summary</Heading>
                    <Text style={text}>
                        Hello,
                    </Text>
                    <Text style={text}>
                        {freelancerName} has sent you a new invoice <strong>{invoiceNumber}</strong>.
                    </Text>
                    <Section style={detailsContainer}>
                        <Text style={detailsHeader}>Invoice Details</Text>
                        <Text style={detailsText}>
                            <strong>Amount:</strong> {formattedAmount}
                        </Text>
                        <Text style={detailsText}>
                            <strong>Due Date:</strong> {format(new Date(dueDate), 'PPP')}
                        </Text>
                    </Section>
                    <Section style={btnContainer}>
                        <Button style={button} href={portalUrl}>
                            View Invoice
                        </Button>
                    </Section>
                    <Text style={text}>
                        If you have any questions, please reply to this email.
                    </Text>
                    <Text style={footer}>
                        Powered by PortalKit
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    padding: '0 40px',
};

const detailsContainer = {
    padding: '20px 40px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    margin: '20px 40px',
};

const detailsHeader = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
};

const detailsText = {
    fontSize: '14px',
    marginBottom: '5px',
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#6366f1',
    borderRadius: '3px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    marginTop: '48px',
};
