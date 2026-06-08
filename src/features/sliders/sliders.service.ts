import { Injectable } from '@nestjs/common';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { Slider } from './entities/slider.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiResponse } from 'src/shared/responses/api-response';
import { SlidersModule } from './sliders.module';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SlidersService {
  private readonly sliderStorageDir = path.resolve(
    process.cwd(),
    'storage/sliders',
  );
  private readonly sliderStorageRelativeDir = path.join('storage', 'sliders');
  private readonly sliderImageFileNamePattern =
    /^slider-\d+-\d+\.(?:jpe?g|png|webp)$/i;

  constructor(
    @InjectModel(Slider.name) private readonly sliderModel: Model<Slider>,
  ) {}

  private resolveSliderImagePath(imagePath: string): string | null {
    const normalizedPath = path.normalize(imagePath);
    const fileName = path.basename(normalizedPath);

    if (
      path.isAbsolute(normalizedPath) ||
      path.dirname(normalizedPath) !== this.sliderStorageRelativeDir ||
      !this.sliderImageFileNamePattern.test(fileName)
    ) {
      return null;
    }

    return path.join(this.sliderStorageDir, fileName);
  }

  private unlinkSliderImage(imagePath: string): boolean {
    const fullPath = this.resolveSliderImagePath(imagePath);

    if (!fullPath) {
      return false;
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return true;
  }

  async create(
    createSliderDto: CreateSliderDto,
    files: { newImage?: Express.Multer.File[] },
  ) {
    const file = files.newImage?.[0];
    let fullPath = '';
    let relativePath = '';

    try {
      // 1. Vérifications initiales
      const existingSlider = await this.sliderModel.findOne({
        title: createSliderDto.title,
      });
      if (existingSlider) return ApiResponse.error('Le slider existe déjà');

      const existingOrder = await this.sliderModel.findOne({
        order: createSliderDto.order,
      });
      if (existingOrder) return ApiResponse.error('Cet ordre est déjà utilisé');

      // 2. Gestion du fichier image
      if (file) {
        const uploadDir = './storage/sliders';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const fileName = `slider-${uniqueSuffix}${path.extname(file.originalname)}`;

        fullPath = path.join(uploadDir, fileName);
        relativePath = `storage/sliders/${fileName}`;

        fs.writeFileSync(fullPath, file.buffer);
      }

      // 3. Création de l'instance et sauvegarde en BDD
      const newSlider = new this.sliderModel({
        ...createSliderDto,
        image: relativePath, // On stocke le chemin relatif
      });
      const savedSlider = await newSlider.save();

      return ApiResponse.success('Slider créé avec succès', savedSlider);
    } catch (error) {
      if (fullPath) {
        this.unlinkSliderImage(fullPath);
      }
      return ApiResponse.error('Erreur lors de la création du slider');
    }
  }
  //Récuperation des sliders sans order 1
  async findAll() {
    try {
      const sliders = await this.sliderModel.find().sort({ order: -1 }).exec();
      return ApiResponse.success('Liste des sliders récupérée', sliders);
    } catch (error) {
      return ApiResponse.error('Erreur lors de la récupération des sliders');
    }
  }
  // Retoune les sliders avec les orders les plus grand.
  async findTopSliders(limit: number) {
    try {
      const finalLimit = Math.max(1, Math.floor(limit));

      const topSliders = await this.sliderModel
        .find({ order: { $gt: 0 } })
        .sort({ order: 1 })
        .limit(finalLimit) // Utilise la limite dynamique
        .exec();
      return ApiResponse.success(
        `Top ${finalLimit} sliders récupérés`,
        topSliders,
      );
    } catch (error) {
      return ApiResponse.error('Erreur lors de la récupération des sliders');
    }
  }
  async update(
    idSlider: string,
    updateSliderDto: UpdateSliderDto,
    files: { newImage?: Express.Multer.File[] },
  ) {
    const file = files?.newImage?.[0];
    let oldImagePath: string | null = null;
    let newRelativePath: string | null = null;

    try {
      // 1. Trouver le slider actuel
      const slider = await this.sliderModel.findById(idSlider);
      if (!slider) {
        return ApiResponse.error('Slider introuvable');
      }
      // 2. GÉRER L'UNICITÉ DU TITRE
      if (
        updateSliderDto.title !== undefined &&
        updateSliderDto.title !== slider.title
      ) {
        const dupTitle = await this.sliderModel.findOne({
          title: updateSliderDto.title,
          _id: { $ne: idSlider },
        });
        if (dupTitle) {
          return ApiResponse.error('Un slider avec ce titre existe déjà');
        }
      }

      // 3. GÉRER L'UNICITÉ DE L'ORDRE
      if (updateSliderDto.order !== undefined) {
        const existingOrder = await this.sliderModel.findOne({
          order: updateSliderDto.order,
          _id: { $ne: idSlider },
        });
        if (existingOrder) {
          return ApiResponse.error(
            `L'ordre ${updateSliderDto.order} est déjà utilisé par un autre slider`,
          );
        }
      }
      // 2. Gestion de la nouvelle image (si présente)
      if (file) {
        const uploadDir = './storage/sliders';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = `slider-${uniqueSuffix}${path.extname(file.originalname)}`;

        newRelativePath = `storage/sliders/${fileName}`;
        const fullPath = path.join(uploadDir, fileName);
        // Écriture du fichier
        fs.writeFileSync(fullPath, file.buffer);

        // On mémorise l'ancienne image pour la supprimer après le succès en BDD
        oldImagePath = slider.image;

        // Mise à jour du chemin dans le DTO
        updateSliderDto.newImage = newRelativePath;
      }
      const updatedSlider = await this.sliderModel.findByIdAndUpdate(
        idSlider, // Mongoose sait qu'il s'agit de l'ID technique
        { $set: updateSliderDto },
        { new: true }, // Pour récupérer l'objet APRÈS modification
      );

      if (!updatedSlider) {
        return ApiResponse.error('Slider introuvable, mise à jour impossible.');
      }

      // La suite de votre logique pour l'image...
      if (file && oldImagePath) {
        try {
          const isSafePath = this.unlinkSliderImage(oldImagePath);

          if (!isSafePath) {
            return ApiResponse.error('Chemin d’image invalide');
          }
        } catch (fileError) {
          return ApiResponse.error(
            'Erreur lors de la suppression de l’ancienne image.',
          );
        }
      }

      return ApiResponse.success(
        'Slider mis à jour avec succès',
        updatedSlider,
      );
    } catch (error) {
      if (newRelativePath) {
        this.unlinkSliderImage(newRelativePath);
      }
      return ApiResponse.error('Erreur lors de la mise à jour');
    }
  }
  async remove(idSlider: string) {
    try {
      // 1. Récupérer le slider pour avoir le chemin de l'image
      const slider = await this.sliderModel.findById(idSlider);

      if (!slider) {
        return ApiResponse.error('Slider introuvable.');
      }
      await this.sliderModel.findByIdAndDelete(idSlider);
      // 2. Suppression du fichier physique
      if (slider.image) {
        try {
          const isSafePath = this.unlinkSliderImage(slider.image);

          if (!isSafePath) {
            return ApiResponse.error('Chemin d’image invalide');
          }
        } catch (fileError) {
          return ApiResponse.error('Erreur lors de la suppression du slider.');
        }
      }
      return ApiResponse.success('Slider supprimé avec succès.');
    } catch (error) {
      return ApiResponse.error('Erreur lors de la suppression du slider.');
    }
  }
}
