export interface IAuthUser {
  id: number;
  getFriends: () => Promise<Set<number>>;
  getChats: () => Promise<Set<number>>;
}
