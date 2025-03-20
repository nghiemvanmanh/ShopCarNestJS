import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  role: string;
}
