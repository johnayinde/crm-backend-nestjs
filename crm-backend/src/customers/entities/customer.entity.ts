import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as crypto from 'crypto';
import { UserStatus } from '../dto/create-customer.dto';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Utility method for encryption
  static encrypt(text: string, key: string): string {
    // Already encrypted or empty
    if (!text || text.startsWith('enc:')) return text;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(key.padEnd(32).slice(0, 32)),
      iv,
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `enc:${iv.toString('hex')}:${encrypted}`;
  }

  // Utility method for decryption (  used by the service)
  static decrypt(text: string, key: string): string {
    if (!text || !text.startsWith('enc:')) return text;

    const parts = text.split(':');
    if (parts.length !== 3) return text;

    const iv = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key.padEnd(32).slice(0, 32)),
      iv,
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
