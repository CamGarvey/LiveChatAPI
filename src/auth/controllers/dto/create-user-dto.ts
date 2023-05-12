import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  name?: string;

  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  secret: string;
}
