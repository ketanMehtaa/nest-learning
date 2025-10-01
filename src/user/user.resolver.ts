import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User])
  users() {
    return this.userService.findAll();
  }

  @Mutation(() => User)
  createUser(
    @Args('name') name: string,
    @Args('email') email: string,
  ): Promise<User> {
    return this.userService.createUser(name, email);
  }
}
