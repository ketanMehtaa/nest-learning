import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

@InputType()
export class DeleteUserInput {
  @Field(() => Int)
  @IsNotEmpty()
  id: number;
}
