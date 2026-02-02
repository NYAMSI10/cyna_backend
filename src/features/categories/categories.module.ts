import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category, CategorySchema } from './entities/category.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { JwtService } from '@nestjs/jwt';
import { SharedService } from 'src/shared/services/shared.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    UsersModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, JwtService, SharedService],
  exports: [CategoriesService, MongooseModule],
})
export class CategoriesModule {}
