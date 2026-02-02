import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthorizeRoles } from 'src/shared/decorators/authorize-roles.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { UserRoles } from 'src/shared/common/user-roles.enum';
import { AuthorizeGuard } from 'src/shared/guards/authorization.guard';
import { QueryDto } from 'src/shared/dto/query.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @AuthorizeRoles(UserRoles.ADMIN)
  @UseGuards(AuthGuard, AuthorizeGuard)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // @AuthorizeRoles(UserRoles.ADMIN)
  // @UseGuards(AuthGuard, AuthorizeGuard)
  @Get()
  findAll(@Query() queryDto: QueryDto) {
    return this.categoriesService.findAll(queryDto);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoriesService.findOne(slug);
  }

  @AuthorizeRoles(UserRoles.ADMIN)
  @UseGuards(AuthGuard, AuthorizeGuard)
  @Patch(':slug')
  update(
    @Param('slug') slug: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(slug, updateCategoryDto);
  }

  @AuthorizeRoles(UserRoles.ADMIN)
  @UseGuards(AuthGuard, AuthorizeGuard)
  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.categoriesService.remove(slug);
  }
}
