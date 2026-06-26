import { Module } from '@nestjs/common';

import { config } from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { CategoriesModule } from './features/categories/categories.module';
import { ServicesModule } from './features/services/services.module';
import { ProductsModule } from './features/products/products.module';
import { SlidersModule } from './features/sliders/sliders.module';
import { CarteBancairesModule } from './features/carte_bancaires/carte_bancaires.module';
import { AdresseFacturationsModule } from './features/adresse_facturations/adresse_facturations.module';
import { SearchModule } from './features/search/search.module';
import { ContactModule } from './features/contact/contact.module';
import { CommandesModule } from './features/commandes/commandes.module';
import { CouponsModule } from './features/coupons/coupons.module';
import { AuditModule } from './features/audit/audit.module';

config();
@Module({
  imports: [
    MongooseModule.forRoot(`${process.env.DATABASE_URL}`),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ServicesModule,
    ProductsModule,
    SlidersModule,
    CarteBancairesModule,
    AdresseFacturationsModule,
    SearchModule,
    ContactModule,
    CommandesModule,
    CouponsModule,
    AuditModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
