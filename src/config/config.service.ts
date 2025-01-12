export const authenticatorOptions: Record<string, any> = {
  digits: 6,
  period: 30,
  window: 1,
};

export const configService = {
  authenticatorOptions,
};

export default configService;

export type ConfigService = typeof configService;
