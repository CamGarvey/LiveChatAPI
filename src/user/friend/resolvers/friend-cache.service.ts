import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class FriendCacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async addFriendship(userId: number, otherUserId: number) {
    return Promise.all([
      this.addFriend(userId, otherUserId),
      this.addFriend(otherUserId, userId),
    ]);
  }

  async removeFriendship(userId: number, otherUserId: number) {
    return Promise.all([
      this.removeFriend(userId, otherUserId),
      this.removeFriend(otherUserId, userId),
    ]);
  }

  async getFriends(userId: number): Promise<Set<number> | undefined> {
    const key = this.getUserFriendsKey(userId);
    return this.cache.get(key);
  }

  async setFriends(userId: number, friendIds: Set<number>) {
    const key = this.getUserFriendsKey(userId);
    await this.cache.set(key, friendIds);
  }

  private async addFriend(userId: number, friendId: number) {
    const friendIds = await this.getFriends(userId);
    friendIds.add(friendId);
    await this.setFriends(userId, friendIds);
  }

  private async removeFriend(userId: number, friendId: number) {
    const friendIds = await this.getFriends(userId);
    friendIds.delete(friendId);
    await this.setFriends(userId, friendIds);
  }

  private getUserFriendsKey(user: number): string {
    return `${user}.friends`;
  }
}
