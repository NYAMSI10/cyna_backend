import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

/**
 * Crée et configure l'application NestJS.
 *
 * @param expressInstance  instance Express existante (utilisée par le handler
 *   serverless Vercel). Si absente, Nest crée sa propre instance (mode local).
 *
 * NB : cette fonction n'appelle NI `listen()` NI `init()`. C'est à l'appelant
 * de choisir : `listen()` en local, `init()` en serverless.
 */
export async function createNestApp(
  expressInstance?: unknown,
): Promise<NestExpressApplication> {
  const app = expressInstance
    ? await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(expressInstance as any),
        { rawBody: true },
      )
    : await NestFactory.create<NestExpressApplication>(AppModule, {
        rawBody: true,
      });

  app.enableCors();
  // prefix API
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  // === CORS ===
  // En dev : autorise uniquement le front Angular. En prod, remplace par l'origine réelle ou une fonction.
  // === CORS ===
  // En dev : autorise uniquement le front Angular. En prod, remplace par l'origine réelle ou une fonction.
  const allowedOrigin = [
    'http://localhost:4200',
    'http://localhost:5173',
    'https://cynaapp.vercel.app',
  ];

  app.enableCors({
    origin: allowedOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Authorization, Accept, X-Requested-With, X-Message-Lang',
    credentials: true, // true si tu utilises cookies/auth basés sur cookie
  });

  // Optionnel : middleware pour répondre proprement aux OPTIONS (préflight)
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', allowedOrigin);
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept, X-Requested-With, X-Message-Lang',
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.status(204).send('');
    }
    next();
  });
  // === Swagger Configuration ===
  const config = new DocumentBuilder()
    .setTitle('CYNA API')
    .setDescription('The CYNA API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Sur Vercel (serverless), les assets statiques de Swagger UI ne sont pas
  // embarqués dans la fonction → on les charge depuis un CDN (même version que
  // swagger-ui-dist installé) pour que la page /api/docs s'affiche correctement.
  const SWAGGER_UI_VERSION = '5.30.2';
  const SWAGGER_CDN = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}`;
  SwaggerModule.setup('api/docs', app, document, {
    customCssUrl: `${SWAGGER_CDN}/swagger-ui.css`,
    customJs: [
      `${SWAGGER_CDN}/swagger-ui-bundle.js`,
      `${SWAGGER_CDN}/swagger-ui-standalone-preset.js`,
    ],
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // NB : le stockage local des images (dossier `storage/`) a été remplacé par
  // Cloudinary (cf. CloudinaryService) car le système de fichiers est en
  // lecture seule sur Vercel.

  return app;
}

async function bootstrap() {
  const app = await createNestApp();
  await app.listen(process.env.PORT ?? 3000);
}

// En local / hébergement classique : on démarre un serveur HTTP.
// Sur Vercel (serverless), c'est `api/index.js` qui pilote l'app, donc on
// n'appelle pas listen() pour éviter d'ouvrir un port.
if (!process.env.VERCEL) {
  bootstrap();
}
