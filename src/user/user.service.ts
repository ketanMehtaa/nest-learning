import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

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
}
