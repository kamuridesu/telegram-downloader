import { Injectable } from '@angular/core';

import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private CACHE_EXPIRATION: number = 3600; // cache expiration in seconds
  private CACHE_NAME: string = "TELEGRAM_CHATS_CACHE"
  private cacheCreationDate: number | undefined;

  constructor(
    private dataService: DataService
  ) {
    setInterval(async () => {
      await this.expireCache();
    }, 1000);
  }

  public async cacheChats(chats: any[]) {
    if (! await this.dataService.hasKey(this.CACHE_NAME)) {
      this.cacheCreationDate = Date.now() / 1000;
      const data = JSON.stringify({
        cacheCrationDate: this.cacheCreationDate,
        data: chats
      })
      await this.dataService.set(this.CACHE_NAME, data);
    }
  }

  public async getCache() {
    if (await this.dataService.hasKey(this.CACHE_NAME)) {
      const data = JSON.parse(await this.dataService.get(this.CACHE_NAME));
      return data.data;
    }
    return undefined;
  }

  private async expireCache() {
    if (await this.dataService.hasKey(this.CACHE_NAME)) {
      const data = JSON.parse(await this.dataService.get(this.CACHE_NAME));
      if ((Date.now() / 1000) - data.cacheCrationDate >= this.CACHE_EXPIRATION) {
        await this.dataService.delete(this.CACHE_NAME);
      }
    }
  }
}
