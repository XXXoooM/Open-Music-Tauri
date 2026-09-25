import type { ApiSource } from '../types';

export const API_SOURCES: Record<
  ApiSource,
  {
    baseUrl: string;
    buildUrl: (type: string, id: string) => string;
  }
> = {
  qijieya: {
    baseUrl: 'https://api.qijieya.cn/meting/',
    buildUrl: (type: string, id: string): string =>
      `https://api.qijieya.cn/meting/?type=${type}&id=${id}`,
  },
  mikus: {
    baseUrl: 'https://meting.mikus.ink/api',
    buildUrl: (type: string, id: string): string =>
      `https://meting.mikus.ink/api?server=netease&type=${type}&id=${id}`,
  },
};
