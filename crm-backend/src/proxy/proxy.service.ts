import {
  Injectable,
  HttpException,
  Logger,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ProxyService {
  private readonly client: AxiosInstance;
  private readonly logger = new Logger(ProxyService.name);
  private readonly maxRetries: number;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly cacheTtl: number;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get<string>('django.baseUrl');
    this.apiKey = this.configService.get<string>('django.apiKey');
    this.timeout = this.configService.get<number>('django.timeout', 5000);
    this.maxRetries = this.configService.get<number>('django.retries', 3);
    this.cacheTtl = this.configService.get<number>('redis.ttl', 60);

    // Initialize HTTP client
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${this.apiKey}`,
      },
    });
  }

  // Generic request method with retries and caching
  private async makeRequest<T>(
    url: string,
    method: string,
    config: AxiosRequestConfig = {},
    useCache = true,
  ): Promise<T> {
    let attempts = 0;
    const cacheKey = `${method}-${url}-${JSON.stringify(config)}`;
    console.log({ cacheKey });

    try {
      // Check cache first
      if (useCache && method.toLowerCase() === 'get') {
        const cachedData = await this.cacheManager.get<T>(cacheKey);

        if (cachedData) {
          this.logger.debug(`Cache hit for: ${cacheKey}`);
          return cachedData;
        }
      }

      // Implement retry logic
      while (attempts < this.maxRetries) {
        try {
          attempts++;
          const response = await this.client.request<T>({
            url,
            method,
            ...config,
          });

          // Cache successful GET responses
          if (useCache && method.toLowerCase() === 'get') {
            await this.cacheManager.set(
              cacheKey,
              response.data,
              this.cacheTtl * 1000,
            );
          }

          return response.data;
        } catch (error) {
          // Only retr for network errors or server errors
          const isRetryable =
            !error.response || (error.response && error.response.status >= 500);

          if (attempts >= this.maxRetries || !isRetryable) {
            throw error;
          }

          this.logger.warn(
            `Request failed (attempt count=> ${attempts}/${this.maxRetries}), retrying: ${error.message}`,
          );

          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, 2 ** attempts * 100),
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Request failed after >${attempts}< attempts: ${error.message}`,
        error.stack,
      );

      // Format error response
      if (error.response) {
        throw new HttpException(
          error.response.data || 'External API error',
          error.response.status,
        );
      }

      throw new InternalServerErrorException(
        'Unable to communicate with Django API',
      );
    }
  }

  async getCustomerOrders(customerId: string) {
    try {
      return this.makeRequest<any>(
        `/django-orders/${customerId}`,
        'get',
        {},
        true, // Use cache
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch orders for customer ${customerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
