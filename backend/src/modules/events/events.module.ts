import { Module, Global } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsConsumer } from './events.consumer';

@Global()
@Module({
  providers: [EventsService, EventsConsumer],
  exports: [EventsService],
})
export class EventsModule {}
