import { Module, Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Repository,
  CreateDateColumn,
  UpdateDateColumn,
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
} from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

/** Combined User entity */
@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID, { description: 'Unique user id (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Full name of the user' })
  @Column({ length: 100 })
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @Field(() => String, { description: 'Email address' })
  @Column({ unique: true, length: 255 })
  @IsEmail()
  email: string;

  @Field(() => GraphQLISODateTime, { description: 'When the user was created' })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { description: 'When the user was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}

/** Input type for creating a user */
@InputType()
export class CreateUserInputDTO {
  @Field(() => String, { description: 'Full name (2-100 chars)' })
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @Field(() => String, { description: 'Valid email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

/** Input type for deleting a user by ID */
@InputType()
export class DeleteUserInputDTO {
  @Field(() => ID, { description: 'UUID of the user to delete' })
  @IsNotEmpty()
  id: string;
}

/** Combined User service */
@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  createUser(name: string, email: string) {
    const user = this.userRepo.create({ name, email });
    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }
  async deleteUser(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    // copy user data before removal so we can return a stable object
    const deleted = { ...user } as User;
    await this.userRepo.remove(user);
    return deleted;
  }
}

/** Combined GraphQL resolver */
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly service: UserService) {}

  @Query(() => [User])
  users(): Promise<User[]> {
    return this.service.findAll();
  }

  @Mutation(() => User)
  createUser(
    @Args('input', { type: () => CreateUserInputDTO })
    input: CreateUserInputDTO,
  ): Promise<User> {
    return this.service.createUser(input.name, input.email);
  }

  @Mutation(() => User)
  deleteUser(
    @Args('input', { type: () => DeleteUserInputDTO })
    input: DeleteUserInputDTO,
  ): Promise<User> {
    return this.service.deleteUser(input.id);
  }
}

/** User module combining entity, service, and resolver */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserResolver],
})
export class UserModule {}
