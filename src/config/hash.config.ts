import { registerAs } from '@nestjs/config';

export default registerAs('hash', () => ({
  salt: process.env.HASH_SALT,
  minLenth: parseInt(process.env.HASH_MIN_LENGTH) ?? 11,
}));
