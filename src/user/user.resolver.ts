import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserInput, DeleteUserInput } from './user.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User])
  users() {
    return this.userService.findAll();
  }

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.userService.createUser(input.name, input.email);
  }
    
  @Mutation(() => User)
  deleteUser(@Args('input') input: DeleteUserInput): Promise<User> {
    // Delete a user by ID and return the removed entity
    return this.userService.deleteUser(input.id);
  }
}
