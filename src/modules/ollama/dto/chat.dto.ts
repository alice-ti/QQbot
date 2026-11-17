import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  model: string;

  @IsString()
  prompt: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  top_p?: number;

  @IsOptional()
  @IsNumber()
  top_k?: number;
}
