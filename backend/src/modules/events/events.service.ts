import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

export interface BaseEvent {
  eventId: string;
  eventType: string;
  eventVersion: string;
  timestamp: string;
  correlationId?: string;
  userId?: string;
  familyId?: string;
  payload: any;
  metadata?: {
    source: string;
    environment: string;
  };
}

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsService.name);
  private kafka: Kafka;
  private producer: Producer;
  private readonly serviceName = 'questify-backend';

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID'),
      brokers: this.configService.get('KAFKA_BROKERS').split(','),
      retry: {
        retries: 8,
        initialRetryTime: 300,
      },
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('✅ Kafka producer connected');
    } catch (error) {
      this.logger.error('❌ Failed to connect Kafka producer', error);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }

  async publishEvent(topic: string, event: Partial<BaseEvent>): Promise<void> {
    const fullEvent: BaseEvent = {
      eventId: uuidv4(),
      eventVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      metadata: {
        source: this.serviceName,
        environment: this.configService.get('NODE_ENV') || 'development',
      },
      ...event,
    } as BaseEvent;

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: fullEvent.userId || fullEvent.eventId,
            value: JSON.stringify(fullEvent),
            headers: {
              eventType: fullEvent.eventType,
              eventVersion: fullEvent.eventVersion,
            },
          },
        ],
      });

      this.logger.debug(`Published event: ${fullEvent.eventType} to ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish event to ${topic}`, error);
      throw error;
    }
  }

  createConsumer(groupId: string): Consumer {
    return this.kafka.consumer({ groupId });
  }
}
