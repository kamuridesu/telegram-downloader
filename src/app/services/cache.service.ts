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
  ) {}

  public async autoExpire(name: string = this.CACHE_NAME) {
    setInterval(async () => {
      await this.expireCache(undefined, name);
    }, 5000);
  }

  public async setCache(chats: any[], name: string = this.CACHE_NAME) {
    if (! await this.dataService.hasKey(name)) {
      this.cacheCreationDate = Date.now() / 1000;
      const data = JSON.stringify({
        cacheCrationDate: this.cacheCreationDate,
        data: chats
      })
      await this.dataService.set(name, data);
    }
  }

  public async getCache(name: string = this.CACHE_NAME) {
    if (await this.dataService.hasKey(name)) {
      const data = JSON.parse(await this.dataService.get(name));
      return data.data;
    }
    return undefined;
  }

  public async expireCache(prune: boolean = false, name: string = this.CACHE_NAME) {
    if (await this.dataService.hasKey(name)) {
      const data = JSON.parse(await this.dataService.get(name));
      if ((Date.now() / 1000) - data.cacheCrationDate >= this.CACHE_EXPIRATION || prune) {
        await this.dataService.delete(name);
      }
    }
  }
}
