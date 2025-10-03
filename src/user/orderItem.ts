import { Module, Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Repository,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  InputType,
  Field,
  ObjectType,
  ID,
  GraphQLISODateTime,
  Int,
} from '@nestjs/graphql';
import { IsNotEmpty, Length, IsEmail } from 'class-validator';
import { User } from './user';
import { Order } from './order';


@ObjectType() // 👈 Tells GraphQL to include this in schema.gql
@Entity('orderItem') // 👈 Tells TypeORM this is a DB table
export class OrderItem {
  @Field(() => ID, { description: 'Unique order id (UUID)' }) //👈 Exposed in schema.gql
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.orderItem, { onDelete: 'CASCADE' }) //👈 Relation to Order
  @JoinColumn({ name: 'orderId' }) // ensures relation uses `orderId` column
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

@InputType()
export class CreateOrderItemInputDTO {
  @Field(() => Int, { description: 'Quantity of the item' })
  @IsNotEmpty()
  quantity: number;

  @Field(() => Number, { description: 'Unit price of the item' })
  @IsNotEmpty()
  unitPrice: number;

  @Field(() => ID, { description: 'Order ID this item belongs to' })
  @IsNotEmpty()
  orderId: string;
}

@InputType()
export class DeleteOrderItemInputDTO {
  @Field(() => ID, { description: 'UUID of the order item to delete' })
  @IsNotEmpty()
  id: string;
}

@Injectable()
export class OrderItemService {
  constructor(@InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>) {}

  createOrderItem(orderId: string, quantity: number, unitPrice: number) {
    const orderItem = this.orderItemRepo.create({ order: { id: orderId }, quantity, unitPrice });
    return this.orderItemRepo.save(orderItem);
  }

  findAll() {
    return this.orderItemRepo.find();
  }
  async deleteOrderItem(id: string) {
    const orderItem = await this.orderItemRepo.findOneBy({ id });
    if (!orderItem) {
      throw new NotFoundException(`OrderItem with id ${id} not found`);
    }
    const deleted = { ...orderItem } as OrderItem;
    await this.orderItemRepo.remove(orderItem);
    return deleted;
  }
}

@Resolver(() => OrderItem)
export class OrderItemResolver {
  constructor(private readonly service: OrderItemService) {}

  @Query(() => [OrderItem])
  orderItems(): Promise<OrderItem[]> {
    return this.service.findAll();
  }

  @Mutation(() => OrderItem)
  createOrderItem(
    @Args('input', { type: () => CreateOrderItemInputDTO })
    input: CreateOrderItemInputDTO,
  ): Promise<OrderItem> {
    return this.service.createOrderItem(input.orderId, input.quantity, input.unitPrice);
  }

  @Mutation(() => OrderItem)
  deleteOrderItem(
    @Args('input', { type: () => DeleteOrderItemInputDTO })
    input: DeleteOrderItemInputDTO,
  ): Promise<OrderItem> {
    return this.service.deleteOrderItem(input.id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem])],
  providers: [OrderItemService, OrderItemResolver],
})
export class OrderItemModule {}
