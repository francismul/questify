import { IsString, IsInt, Min, Max, IsEnum, IsDateString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProofType } from '../task.entity';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  objective: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  expectedEffortMinutes: number;

  @ApiProperty()
  @IsDateString()
  deadline: string;

  @ApiProperty({ enum: ProofType })
  @IsEnum(ProofType)
  proofType: ProofType;

  @ApiProperty()
  @IsString()
  assignedTo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class TaskQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  difficulty?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsInt()
  limit?: number;
}
