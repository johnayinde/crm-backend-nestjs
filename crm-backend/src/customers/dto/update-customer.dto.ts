import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @Length(5, 100, { message: 'Email must be between 5 and 100 characters' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, {
    message: 'Invalid phone number format',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(active|inactive|pending)$/, {
    message: 'Status must be one of: active, inactive, pending',
  })
  status?: string;
}
