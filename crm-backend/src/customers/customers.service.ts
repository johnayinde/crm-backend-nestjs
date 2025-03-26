import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UserStatus } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomerDto } from './dto/filter-customer.dto';

@Injectable()
export class CustomersService {
  private readonly encryptionKey: string;

  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get<string>(
      'security.encryptionKey',
    );
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Check if customer with same email already exists
    const existingCustomer = await this.customersRepository.findOne({
      where: { email: createCustomerDto.email },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    // Create customer entity
    const customer = this.customersRepository.create(createCustomerDto);

    // Encrypt sensitive data manually
    if (customer.phone) {
      customer.phone = Customer.encrypt(customer.phone, this.encryptionKey);
    }

    if (customer.address) {
      customer.address = Customer.encrypt(customer.address, this.encryptionKey);
    }

    return this.customersRepository.save(customer);
  }
  async findAll(
    filterDto: FilterCustomerDto,
  ): Promise<{ data: Customer[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status } = filterDto;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: FindOptionsWhere<Customer> = {};

    if (status) {
      whereConditions.status = status as UserStatus;
    }

    const [customers, total] = await this.customersRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Decrypt sensitive data

    const decryptedCustomers = customers.map((customer) => {
      const decrypted = { ...customer };
      decrypted.phone = Customer.decrypt(customer.phone, this.encryptionKey);
      decrypted.address = Customer.decrypt(
        customer.address,
        this.encryptionKey,
      );
      return decrypted;
    });

    return {
      data: decryptedCustomers,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Decrypt sensitive data
    customer.phone = Customer.decrypt(customer.phone, this.encryptionKey);
    customer.address = Customer.decrypt(customer.address, this.encryptionKey);

    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    // Check if email is being updated and if it's already in use
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.customersRepository.findOne({
        where: { email: updateCustomerDto.email },
      });

      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    const encryptionKey = this.configService.get<string>(
      'security.encryptionKey',
    );

    // Encrypt sensitive data if they're being updated
    if (updateCustomerDto.phone) {
      updateCustomerDto.phone = Customer.encrypt(
        updateCustomerDto.phone,
        encryptionKey,
      );
    }

    if (updateCustomerDto.address) {
      updateCustomerDto.address = Customer.encrypt(
        updateCustomerDto.address,
        encryptionKey,
      );
    }

    // Update entity
    Object.assign(customer, updateCustomerDto);
    await this.customersRepository.save(customer);

    return this.findOne(id);
  }

  async remove(id: string) {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }
}
