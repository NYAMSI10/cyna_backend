import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { isValidObjectId, Model } from 'mongoose';
import { ApiResponse } from 'src/shared/responses/api-response';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    try {
      if (!isValidObjectId(id)) return ApiResponse.error(" L'id est invalide");

      const user = await this.userModel.findById(id).exec();
      if (!user) return ApiResponse.error('L"utilisateur n"existe pas');
      return ApiResponse.success('Utilisateur trouvé', user);
    } catch (error) {
      return ApiResponse.error(
        "Une erreur est survenue lors de la recuperation de l'utilisateur",
      );
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
