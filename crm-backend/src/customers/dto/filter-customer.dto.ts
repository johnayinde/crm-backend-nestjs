import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  Matches,
  IsEmail,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterCustomerDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @Matches(/^(active|inactive|pending)$/, {
    message: 'Status must be one of: active, inactive, pending',
  })
  status?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.toLowerCase())
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
