import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  app.setGlobalPrefix(process.env.API_PREFIX || "v1");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cookieParser());
  const configuredOrigins = (
    process.env.APP_URL || "http://localhost:3000"
  ).split(",");
  const origins =
    process.env.NODE_ENV === "development"
      ? [
          ...new Set([
            ...configuredOrigins,
            "http://localhost:3001",
            "http://localhost:3002",
          ]),
        ]
      : configuredOrigins;
  app.enableCors({
    origin: origins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle("Trauner API")
    .setDescription(
      "API REST da plataforma Trauner — lojas, produtos, checkout, pagamentos, cursos, afiliados.",
    )
    .setVersion("1.0.0")
    .addBearerAuth()
    .addCookieAuth("access_token")
    .build();
  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, swagger));

  const port = Number(process.env.PORT || 4000);
  await app.listen(port, "0.0.0.0");
  console.log(`Trauner API http://localhost:${port}/v1  docs: /docs`);
}

bootstrap();
