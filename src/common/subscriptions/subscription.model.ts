import { Alert, Chat, Request } from '@prisma/client';

export type EventPayload = {
  recipients: number[];
  content: Event;
};

export type NotificationPayload = {
  recipients: number[];
  content: Alert | Request;
};

export type ChatPayload = {
  recipients: number[];
  content: Chat;
};
