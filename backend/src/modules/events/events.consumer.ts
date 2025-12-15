import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventsService } from './events.service';

@Injectable()
export class EventsConsumer implements OnModuleInit {
  private readonly logger = new Logger(EventsConsumer.name);

  constructor(
    private eventsService: EventsService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Example consumer - in production, you'd have separate services for each consumer
    // This is just to demonstrate the pattern
    await this.startTaskEventsConsumer();
  }

  private async startTaskEventsConsumer() {
    const consumer = this.eventsService.createConsumer('task-events-consumer');

    try {
      await consumer.connect();
      await consumer.subscribe({
        topic: 'task-events',
        fromBeginning: false,
      });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const event = JSON.parse(message.value.toString());
          this.logger.debug(`Received event: ${event.eventType}`);

          // Handle different event types
          switch (event.eventType) {
            case 'task.assigned':
              await this.handleTaskAssigned(event);
              break;
            case 'task.completed':
              await this.handleTaskCompleted(event);
              break;
            // Add more event handlers
          }
        },
      });

      this.logger.log('✅ Task events consumer started');
    } catch (error) {
      this.logger.error('❌ Failed to start task events consumer', error);
    }
  }

  private async handleTaskAssigned(event: any) {
    // Example: Send notification, update analytics, etc.
    this.logger.log(`Task assigned: ${event.payload.taskId}`);
  }

  private async handleTaskCompleted(event: any) {
    // Example: Update streaks, check achievements, etc.
    this.logger.log(`Task completed: ${event.payload.taskId}`);
  }
}
