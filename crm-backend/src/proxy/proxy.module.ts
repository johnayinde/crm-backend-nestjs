import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { CustomersModule } from '../customers/customers.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CustomersModule,
    CacheModule.register({
      ttl: 60,
      max: 100,
      isGlobal: true,
    }),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
