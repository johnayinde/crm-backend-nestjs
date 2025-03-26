import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  // CacheInterceptor,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomersService } from '../customers/customers.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(
    private readonly proxyService: ProxyService,
    private readonly customersService: CustomersService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get(':id/orders')
  @UseInterceptors(CacheInterceptor)
  async getCustomerOrders(@Param('id') id: string) {
    try {
      // First verify the customer exists in our system
      await this.customersService.findOne(id);

      // Then fetch orders from Django API
      return this.proxyService.getCustomerOrders(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Error fetching customer orders: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        'Unable to retrieve customer orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
