import {
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
  Int,
} from '@nestjs/graphql';
import { IsNotEmpty, Length, IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user';
import { Order } from './order';


@ObjectType() // 👈 Tells GraphQL to include this in schema.gql
@Entity('orderItem') // 👈 Tells TypeORM this is a DB table
export class OrderItem {
  @Field(() => ID, { description: 'Unique order id (UUID)' }) //👈 Exposed in schema.gql
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items) //👈 Relation to Order
  @JoinColumn({ name: 'orderId' }) // 👈 Foreign key column
  order: Order;

  @Field(() => Int)
  @Column('int')
  quantity: number;

  @Field(() => Number)
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
