import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
}

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() otp?: string;
}

export class RefreshDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() refreshToken?: string;
}
