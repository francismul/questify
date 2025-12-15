import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto';
import { EventsService } from '../events/events.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private eventsService: EventsService,
  ) {}

  async findAll(user: any, query: TaskQueryDto) {
    const queryBuilder = this.tasksRepository.createQueryBuilder('task');

    // Role-based filtering
    if (user.role === UserRole.LEARNER) {
      queryBuilder.where('task.assignedTo = :userId', { userId: user.sub });
    } else if (user.role === UserRole.GUARDIAN) {
      queryBuilder.where('task.familyId = :familyId', {
        familyId: user.familyId,
      });
    }

    // Status filter
    if (query.status) {
      queryBuilder.andWhere('task.status = :status', { status: query.status });
    }

    // Difficulty filter
    if (query.difficulty) {
      queryBuilder.andWhere('task.difficulty = :difficulty', {
        difficulty: query.difficulty,
      });
    }

    // Assigned to filter (guardian only)
    if (query.assignedTo && user.role !== UserRole.LEARNER) {
      queryBuilder.andWhere('task.assignedTo = :assignedTo', {
        assignedTo: query.assignedTo,
      });
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Relations
    queryBuilder
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('task.assignee', 'assignee');

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: any): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['creator', 'assignee', 'submissions'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Authorization check
    if (user.role === UserRole.LEARNER && task.assignedTo !== user.sub) {
      throw new ForbiddenException('You can only view your own tasks');
    }

    if (user.role === UserRole.GUARDIAN && task.familyId !== user.familyId) {
      throw new ForbiddenException('You can only view tasks in your family');
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, user: any): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      createdBy: user.sub,
      familyId: user.familyId,
      status: TaskStatus.PENDING,
    });

    const savedTask = await this.tasksRepository.save(task);

    // Emit event
    await this.eventsService.publishEvent('task-events', {
      eventType: 'task.created',
      userId: user.sub,
      familyId: user.familyId,
      payload: {
        taskId: savedTask.id,
        title: savedTask.title,
        assignedTo: savedTask.assignedTo,
        deadline: savedTask.deadline,
      },
    });

    // If task is assigned, emit assignment event
    if (savedTask.assignedTo) {
      await this.eventsService.publishEvent('task-events', {
        eventType: 'task.assigned',
        userId: user.sub,
        familyId: user.familyId,
        payload: {
          taskId: savedTask.id,
          assignedTo: savedTask.assignedTo,
          assignedBy: user.sub,
          dueDate: savedTask.deadline,
        },
      });
    }

    return savedTask;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: any): Promise<Task> {
    const task = await this.findOne(id, user);

    // Only creator can update
    if (task.createdBy !== user.sub && user.role !== UserRole.SUPERUSER) {
      throw new ForbiddenException('You can only update tasks you created');
    }

    Object.assign(task, updateTaskDto);
    const updatedTask = await this.tasksRepository.save(task);

    // Emit event
    await this.eventsService.publishEvent('task-events', {
      eventType: 'task.updated',
      userId: user.sub,
      familyId: user.familyId,
      payload: {
        taskId: updatedTask.id,
        changes: updateTaskDto,
      },
    });

    return updatedTask;
  }

  async remove(id: string, user: any): Promise<void> {
    const task = await this.findOne(id, user);

    if (task.createdBy !== user.sub && user.role !== UserRole.SUPERUSER) {
      throw new ForbiddenException('You can only delete tasks you created');
    }

    await this.tasksRepository.remove(task);

    // Emit event
    await this.eventsService.publishEvent('task-events', {
      eventType: 'task.deleted',
      userId: user.sub,
      familyId: user.familyId,
      payload: {
        taskId: id,
      },
    });
  }
}
