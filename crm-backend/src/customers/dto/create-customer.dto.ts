import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateCustomerDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Length(5, 100, { message: 'Email must be between 5 and 100 characters' })
  email: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, {
    message: 'Invalid phone number format',
  })
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be one of: active, inactive' })
  status?: UserStatus;
}
