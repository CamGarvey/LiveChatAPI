export type SubscriptionPayload<T> = {
  recipients: number[];
  content: T;
};
