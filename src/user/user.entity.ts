import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

@ObjectType()
@Entity('users') // Explicit table name
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn() 
  id: number;

  @Field()
  @Column({ length: 100 })
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @Field()
  @Column({ unique: true, length: 255 })
  @IsEmail()
  email: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
