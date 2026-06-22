import { ConsoleLogger } from '@nestjs/common';

// Framework contexts that spam the startup output. We keep our own
// application logs (e.g. PrismaService, Bootstrap) and drop the rest.
const MUTED_CONTEXTS = new Set([
  'InstanceLoader',
  'RoutesResolver',
  'RouterExplorer',
  'NestFactory',
  'NestApplication',
]);

export class QuietLogger extends ConsoleLogger {
  log(message: unknown, ...rest: unknown[]) {
    const context = rest[rest.length - 1];
    if (typeof context === 'string' && MUTED_CONTEXTS.has(context)) {
      return;
    }
    super.log(message, ...(rest as string[]));
  }
}
