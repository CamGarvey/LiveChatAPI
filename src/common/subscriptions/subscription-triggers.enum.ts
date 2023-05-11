export enum SubscriptionTriggers {
  ChatCreated = 'chat.created',
  ChatAccessGranted = 'chat.access.granted',
  ChatAccessRevoked = 'chat.access.revoked',
  ChatDeleted = 'chat.deleted',
  ChatUpdated = 'chat.updated',
  // In chat events
  EventCreated = 'event.created',
  EventUpdated = 'event.updated',
  EventDeleted = 'event.deleted',

  // Requests Notifications
  RequestSent = 'request.sent',
  RequestCancelled = 'request.cancelled',
  RequestAccepted = 'request.accepted',
  RequestDeclined = 'request.declined',

  // Alert Notifications
  FriendDeletedAlert = 'alert.friend.deleted',
  ChatDeletedAlert = 'alert.chat.deleted',
  ChatUpdatedAlert = 'alert.chat.updated',
  ChatMemberAccessRevokedAlert = 'alert.chat.access.member.revoked',
  ChatMemberAccessGrantedAlert = 'alert.chat.access.member.granted',
  ChatAdminAccessRevokedAlert = 'alert.chat.access.admin.revoked',
  ChatAdminAccessGrantedAlert = 'alert.chat.access.admin.granted',
}
