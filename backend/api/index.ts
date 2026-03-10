import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

export default async function handler(req: any, res: any) {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api/v1');
    await app.init();
    const instance = app.getHttpAdapter().getInstance();
    instance(req, res);
}
