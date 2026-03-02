import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';

interface ApprovalRespondedEmailProps {
    clientName: string;
    projectTitle: string;
    approvalTitle: string;
    status: 'approved' | 'changes_requested';
    comment?: string;
    dashboardUrl: string;
}

export const ApprovalRespondedEmail = ({
    clientName,
    projectTitle,
    approvalTitle,
    status,
    comment,
    dashboardUrl,
}: ApprovalRespondedEmailProps) => {
    const statusText = status === 'approved' ? 'APPROVED' : 'CHANGES REQUESTED';
    const statusColor = status === 'approved' ? '#22c55e' : '#f59e0b';

    return (
        <Html>
            <Head />
            <Preview>Client responded: {statusText} for {approvalTitle}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Approval Response</Heading>
                    <Text style={text}>
                        Hello,
                    </Text>
                    <Text style={text}>
                        <strong>{clientName}</strong> has responded to your approval request for <strong>{approvalTitle}</strong> in the project <strong>{projectTitle}</strong>.
                    </Text>
                    <Section style={statusBox}>
                        <Text style={{ ...statusStyle, color: statusColor }}>
                            Status: {statusText}
                        </Text>
                    </Section>
                    {comment && (
                        <Section style={commentBox}>
                            <Text style={commentLabel}>Client Comment:</Text>
                            <Text style={commentText}>"{comment}"</Text>
                        </Section>
                    )}
                    <Section style={btnContainer}>
                        <Button style={button} href={dashboardUrl}>
                            View in Dashboard
                        </Button>
                    </Section>
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

const statusBox = {
    margin: '20px 40px',
    padding: '12px',
    textAlign: 'center' as const,
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
};

const statusStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    letterSpacing: '1px',
};

const commentBox = {
    margin: '20px 40px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    borderLeft: '4px solid #e5e7eb',
};

const commentLabel = {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
};

const commentText = {
    fontSize: '14px',
    fontStyle: 'italic',
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
