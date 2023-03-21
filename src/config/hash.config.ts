import { registerAs } from '@nestjs/config';

export default registerAs('hash', () => ({
  salt: process.env.HASH_SALT ?? 3000,
  minLenth: process.env.HASH_MIN_LENGTH ?? 11,
}));
