import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks (filtered by role)' })
  async findAll(@Request() req, @Query() query: TaskQueryDto) {
    return this.tasksService.findAll(req.user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user);
  }

  @Post()
  @Roles(UserRole.GUARDIAN, UserRole.SUPERUSER)
  @ApiOperation({ summary: 'Create a new task (Guardian only)' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.GUARDIAN, UserRole.SUPERUSER)
  @ApiOperation({ summary: 'Update task (Guardian only)' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.GUARDIAN, UserRole.SUPERUSER)
  @ApiOperation({ summary: 'Delete task (Guardian only)' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user);
  }
}
