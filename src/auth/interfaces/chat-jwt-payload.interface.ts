import { JwtPayload } from 'jsonwebtoken';

export interface IChatJwtPayload extends JwtPayload {
  'http://localhost:4000/user_id': string;
  scope: string;
}
