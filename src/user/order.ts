import { Module, Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Repository,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
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
import { IsNotEmpty, Length, IsEmail, isNotEmptyObject, IsNotEmptyObject, ArrayMinSize } from 'class-validator';
import { User } from './user';
import { OrderItem } from './orderItem';

// -----------------------------ENTITY--------------------------------
@ObjectType() // 👈 Tells GraphQL to include this in schema.gql
@Entity('orders') // 👈 Tells TypeORM this is a DB table
export class Order {
  @Field(() => ID, { description: 'Unique order id (UUID)' }) //👈 Exposed in schema.gql
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relation to User

  @Field(() => User, { description: 'User who placed the order' })
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' }) //👈 Relation to User
  @JoinColumn({ name: 'userId' }) // ensures relation uses `userId` column
  user: User;

  @Field(() => [OrderItem], {
    nullable: true,
    description: 'List of order items in the order',
  })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItem?: OrderItem[];

  @Field({ description: 'Order status' })
  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'shipped', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Field(() => Number, { description: 'Order total amount' })
  @Column('decimal', { precision: 10, scale: 2 })
  totalCost: number;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}

// -----------------------------DTO--------------------------------

@InputType() // 👈 Tells GraphQL to include this in schema.gql
export class CreateOrderInputDTO {
  @Field(() => ID, { description: 'User id who placed the order' })
  @IsNotEmpty()
  userId: string;

  @Field(() => String, { description: 'Order status' })
  @IsNotEmpty()
  status: string;

  @Field(() => Number, { description: 'Order total amount' })
  @IsNotEmpty()
  totalCost: number;

  @Field(() => [CreateOrderOrderItemInputDTO], {
    description: 'List of order items',
  })
  @IsNotEmpty()
  @ArrayMinSize(1)
  orderItems: CreateOrderOrderItemInputDTO[];
}

@InputType()
export class DeleteOrderInputDTO {
  @Field(() => ID, { description: 'UUID of the order to delete' })
  @IsNotEmpty()
  id: string;
}

@InputType()
export class CreateOrderOrderItemInputDTO {
  @Field(() => Int, { description: 'Quantity of the item' })
  @IsNotEmpty()
  quantity: number;

  @Field(() => Number, { description: 'Unit price of the item' })
  @IsNotEmpty()
  unitPrice: number;
}


// -----------------------------SERVICE--------------------------------
@Injectable()
export class OrderService {
  constructor(@InjectRepository(Order) private orderRepo: Repository<Order>) {}

  createOrder(
    userId: string,
    status: string,
    totalCost: number,
    orderItems: CreateOrderOrderItemInputDTO[],
  ) {
    const orderItemsEntities = orderItems.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));
    const order = this.orderRepo.create({
      user: { id: userId },
      status,
      totalCost,
      orderItem: orderItemsEntities,
    });
    return this.orderRepo.save(order);
  }

  findAll() {
    return this.orderRepo.find({ relations: ['user', 'orderItem'] });
  }
  async deleteOrder(id: string) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['orderItem'] });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    // copy order data before removal so we can return a stable object
    const deleted = { ...order } as Order;
    await this.orderRepo.remove(order);
    return deleted;
  }
}


// -----------------------------RESOLVER--------------------------------
@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly service: OrderService) {}

  @Query(() => [Order])
  orders(): Promise<Order[]> {
    return this.service.findAll();
  }

  @Mutation(() => Order)
  createOrder(
    @Args('input', { type: () => CreateOrderInputDTO })
    input: CreateOrderInputDTO,
  ): Promise<Order> {
    return this.service.createOrder(
      input.userId,
      input.status,
      input.totalCost,
      input.orderItems,
    );
  }

  @Mutation(() => Order)
  deleteOrder(
    @Args('input', { type: () => DeleteOrderInputDTO })
    input: DeleteOrderInputDTO,
  ): Promise<Order> {
    return this.service.deleteOrder(input.id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrderService, OrderResolver],
})
export class OrderModule {}
