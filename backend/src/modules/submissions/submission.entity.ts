import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';

export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  NEEDS_REVISION = 'needs_revision',
  REJECTED = 'rejected',
}

export enum ContentType {
  TEXT = 'text',
  FILE = 'file',
  QUIZ = 'quiz',
  PHOTO = 'photo',
  EXPLANATION = 'explanation',
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => Task, (task) => task.submissions)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'submitted_by' })
  submittedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitted_by' })
  submitter: User;

  @Column({
    type: 'enum',
    enum: ContentType,
    name: 'content_type',
  })
  contentType: ContentType;

  @Column('text', { nullable: true })
  content: string;

  @Column('simple-array', { nullable: true, name: 'file_urls' })
  fileUrls: string[];

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.DRAFT,
  })
  status: SubmissionStatus;

  @Column({ name: 'attempt_number', default: 1 })
  attemptNumber: number;

  @Column({ name: 'is_late', default: false })
  isLate: boolean;

  @Column({ type: 'int', nullable: true })
  grade: number;

  @Column({ type: 'int', nullable: true, name: 'max_grade' })
  maxGrade: number;

  @Column('text', { nullable: true })
  feedback: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
