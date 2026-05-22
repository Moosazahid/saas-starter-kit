import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteMemberDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' })
  @IsEnum(['ADMIN', 'MEMBER'])
  role: 'ADMIN' | 'MEMBER';
}