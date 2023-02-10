import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const headerApiKey = req.headers['x-api-key'];
    const configApiKey = this.configService.get('apiKey');
    if (configApiKey) {
      return configApiKey === headerApiKey;
    }
    return true;
  }
}
