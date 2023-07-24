import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/StringSession";

import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export default class TelegramService {
  private apiId: number = 0;
  private apiHash: string = ;
  private stringSession: StringSession = new StringSession("");
  private phoneNumber: string | undefined = undefined
  private phoneNumberHash: string | undefined = undefined;

  public client: TelegramClient | undefined = undefined;
  public needsPasswordAuth: boolean = false;
  public loggedIn: boolean = false;

  constructor(
    private dataService: DataService
  ) { }

  async init() {
    if (await this.dataService.hasKey("TELEGRAM_SESSION_STRING")) {
      this.stringSession = new StringSession(await this.dataService.get("TELEGRAM_SESSION_STRING"));
    }
    this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
      autoReconnect: true,
      downloadRetries: 10,
    });
    await this.client.connect();
    if (await this.client.isUserAuthorized()) {
      this.loggedIn = true;
    }
  }

  async connect() {
    try {
      await this.client?.connect();
      await this.client?.getMe();
    } catch (e) {
      console.warn(e);
      await this.init();
    }
  }

  async checkConnection(retries: number = 0): Promise<boolean> {
    try {
      await this.client?.getMe();
      return true;
    } catch (e) {
      if (retries === 10) {
        return false;
      } else {
        await this.connect();
        return this.checkConnection(retries++);
      }
    }
  }

  public async loginWithPhoneNumber(phoneNumber: string) {
    if (!this.loggedIn) {
      const result = await this.client?.sendCode({
        apiId: this.apiId,
        apiHash: this.apiHash
      }, phoneNumber);
      this.phoneNumberHash = result?.phoneCodeHash;
      this.phoneNumber = phoneNumber;
    }
  }

  public async inputTelegramCode(codeNumber: string) {
    if (!this.loggedIn) {
      try {
        await this.client?.invoke(
          new Api.auth.SignIn({
            phoneNumber: this.phoneNumber,
            phoneCodeHash: this.phoneNumberHash,
            phoneCode: codeNumber
          })
        );
        this.loggedIn = true;
      } catch (e) {
        this.needsPasswordAuth = true;
      }
    }
  }

  public async inputPassword(password: string) {
    if (!this.loggedIn) {
      await this.client?.signInWithPassword({
        apiId: this.apiId,
        apiHash: this.apiHash,
      },
        {
          password: async () => password,
          onError: (err: any) => {
            this.loggedIn = false;
            throw err;
          }
        });
      if (this.loggedIn) {
        this.loggedIn = true;
      }
    }
  }

  public async loadChats() {
    if (this.loggedIn) {
      const results = await this.client?.getDialogs({
        limit: 1000
      })
      return results ? results : [];
    }
    return [];
  }

  public async loadMessages(chatEntity: any) {
    if (this.loggedIn) {
      const chats = await this.client?.getMessages(chatEntity);
      return chats ? chats : [];
    }
    return [];
  }

  public async logOut() {
    this.loggedIn = false;
    await this.client?.invoke(
      new Api.auth.LogOut()
    );
  }

  public async loadMedias(chatEntity: any) {
    await this.checkConnection();
    const messages = await this.loadMessages(chatEntity);
    const medias: any[] = [];
    for (let message of messages) {
      if ((message as any)?.media && (message as any).media.className != "MessageMediaWebPage") {
        medias.push((message));
      }
    }
    return medias;
  }

  public async getMessage(messageId: number, chatEntity: any) {
    if (! await this.checkConnection()) {
      await this.connect();
    }
    const messages = (await this.client?.getMessages(chatEntity, {
      ids: [messageId]
    }));
    return messages ? messages : [];
  }

}
