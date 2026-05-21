import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty({ enum: ['pro', 'enterprise'], example: 'pro' })
  @IsString()
  @IsIn(['pro', 'enterprise'])
  plan: 'pro' | 'enterprise';
}