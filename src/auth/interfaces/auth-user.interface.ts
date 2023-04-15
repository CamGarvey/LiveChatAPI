export interface IAuthUser {
  id: number;
  friendIds: Set<number>;
  chatIds: Set<number>;
}
