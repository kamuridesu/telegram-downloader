import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) { this.init() };

  async init(): Promise<void> {
    const storage = await this.storage.create()
    this._storage = storage;
  }

  async set(key: string, value: any): Promise<void> {
    this._storage?.set(key, value);
  }

  async get(key: string): Promise<any> {
    return this._storage?.get(key);
  }

  async delete(key: string): Promise<void> {
    await this._storage?.remove(key);
  }

  async removeAll(): Promise<void> {
    await this._storage?.clear();
  }

  async getKeys(): Promise<string[]|undefined> {
    return await this._storage?.keys();
  }

  async hasKey(key: string): Promise<boolean> {
    const keys = await this.getKeys();
    if (!keys) return false;
    for (let _key of keys) {
      if (_key === key) {
        return true
      }
    }
    return false;
  }

  async length(): Promise<number|undefined> {
    return await this._storage?.length();
  }
}
