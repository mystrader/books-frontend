import { appConfig } from './app.config';

describe('app config', () => {
  it('deve definir os providers da aplicação', () => {
    expect(appConfig.providers).toBeTruthy();
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect(appConfig.providers?.length).toBe(3);
  });
});
