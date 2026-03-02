import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';
import * as React from 'react';

interface OverdueReminderEmailProps {
    invoiceNumber: string;
    amount: string;
    daysOverdue: number;
    portalUrl: string;
}

export const OverdueReminderEmail = ({
    invoiceNumber,
    amount,
    daysOverdue,
    portalUrl,
}: OverdueReminderEmailProps) => (
    <Html>
        <Head />
        <Preview>Reminder: Invoice {invoiceNumber} is {daysOverdue.toString()} days overdue</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={logo}>PORTAL<span style={logoAccent}>KIT</span></Text>
                </Section>
                <Heading style={h1}>Payment Reminder</Heading>
                <Text style={text}>
                    This is a friendly reminder that payment for <strong>Invoice {invoiceNumber}</strong> is currently {daysOverdue} days overdue.
                </Text>
                <Section style={box}>
                    <Text style={label}>Invoice</Text>
                    <Text style={value}>{invoiceNumber}</Text>
                    <Text style={label}>Balance Due</Text>
                    <Text style={valueOverdue}>{amount}</Text>
                </Section>
                <Section style={btnContainer}>
                    <Button style={button} href={portalUrl}>
                        View Invoice & Pay Now
                    </Button>
                </Section>
                <Hr style={hr} />
                <Text style={footer}>
                    Securely managed via PortalKit.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default OverdueReminderEmail;

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
};

const header = {
    padding: '32px 0',
};

const logo = {
    fontSize: '24px',
    fontWeight: '900',
    color: '#000000',
    letterSpacing: '-0.5px',
};

const logoAccent = {
    color: '#6366f1',
};

const h1 = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
    color: '#111827',
};

const text = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#4b5563',
};

const box = {
    backgroundColor: '#fef2f2',
    borderRadius: '12px',
    padding: '24px',
    margin: '32px 0',
    border: '1px solid #fee2e2',
};

const label = {
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    fontWeight: '900',
    color: '#9ca3af',
    margin: '0 0 4px',
    letterSpacing: '0.05em',
};

const value = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 16px',
};

const valueOverdue = {
    ...value,
    color: '#ef4444',
};

const btnContainer = {
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#ef4444',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '40px 0',
};

const footer = {
    color: '#9ca3af',
    fontSize: '12px',
    fontWeight: 'bold',
};
