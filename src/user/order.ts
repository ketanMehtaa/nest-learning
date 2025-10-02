import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
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
import { OrderItem } from './orderItem';

@ObjectType() // 👈 Tells GraphQL to include this in schema.gql
@Entity('orders') // 👈 Tells TypeORM this is a DB table
export class Order {
  @Field(() => ID, { description: 'Unique order id (UUID)' }) //👈 Exposed in schema.gql
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders) //👈 Relation to User
  @JoinColumn({ name: 'userId' }) // 👈 Foreign key column
  user: User;

  @Field(() => ID, { description: 'User id who placed the order' }) // this is for GraphQL
  @Column('uuid') // this is for TypeORM
  userId: string;

  @Field(() => [OrderItem], { nullable: true, description: 'List of order items in the order' })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: ['insert', 'update'] })
  items?: OrderItem[];

  @Field({ description: 'Order status' })
  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'shipped', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Field(() => Number, { description: 'Order total amount' })
  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
