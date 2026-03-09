import type { NotificationType } from '@/lib/contracts';
import { NOTIFICATION_TYPES } from '@/lib/contracts';

export function isNotificationType(value: string): value is NotificationType {
  return NOTIFICATION_TYPES.includes(value as NotificationType);
}

export function getNotificationMessage(type: NotificationType, projectTitle: string): string {
  switch (type) {
    case 'PORTAL_VISITED':
      return `Client visited ${projectTitle} portal`;
    case 'INVOICE_SENT':
      return `Invoice sent for ${projectTitle}`;
    case 'INVOICE_VIEWED':
      return `Invoice viewed for ${projectTitle}`;
    case 'INVOICE_PAID':
      return `Invoice paid for ${projectTitle}`;
    case 'APPROVAL_REQUESTED':
      return `New approval request in ${projectTitle}`;
    case 'APPROVAL_RESPONDED':
      return `Client responded to approval in ${projectTitle}`;
    case 'INVOICE_OVERDUE':
      return `Invoice for ${projectTitle} is overdue`;
    default:
      return `New notification in ${projectTitle}`;
  }
}
