import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { ProxyModule } from './proxy/proxy.module';
import configuration from './config/configuration';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Rate limiting
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 2,
        },
      ],
    }),

    // Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host', 'localhost'),
        port: config.get('database.port', 5432),
        username: config.get('database.username', 'postgres'),
        password: config.get('database.password', 'postgres'),
        database: config.get('database.name', 'crm'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('database.synchronize', false),
        ssl: config.get('database.ssl', false)
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),

    // Application modules
    CustomersModule,
    AuthModule,
    ProxyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
