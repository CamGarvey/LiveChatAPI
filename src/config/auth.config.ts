import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  audience: process.env.AUTH0_AUDIENCE,
  jwksUri: process.env.AUTH0_JWKS_URI,
  signingAlg: process.env.AUTH0_SIGNING_ALG,
  issuer: process.env.AUTH0_ISSUER_BASE_URL,
  hookSecret: process.env.AUTH0_HOOK_SECRET,
}));
