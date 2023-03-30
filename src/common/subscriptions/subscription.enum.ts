export enum SubscriptionTriggers {
  ChatCreated = 'chat.created',

  // In chat events
  EventCreated = 'event.created',
  EventUpdated = 'event.updated',
  EventDeleted = 'event.deleted',

  // Requests Notifications
  RequestSent = 'notification.request.sent',
  RequestCancelled = 'notification.request.cancelled',

  // Alert Notifications
  RequestAcceptedAlert = 'notification.alert.request.accepted',
  RequestDeclinedAlert = 'notification.alert.request.declined',
  FriendDeletedAlert = 'notification.alert.friend.deleted',
  ChatDeletedAlert = 'notification.alert.chat.deleted',
  ChatUpdatedAlert = 'notification.alert.chat.updated',
  ChatMemberAccessRevokedAlert = 'notification.alert.chat.access.member.revoked',
  ChatMemberAccessGrantedAlert = 'notification.alert.chat.access.member.granted',
  ChatAdminAccessRevokedAlert = 'notification.alert.chat.access.admin.revoked',
  ChatAdminAccessGrantedAlert = 'notification.alert.chat.access.admin.granted',
}
