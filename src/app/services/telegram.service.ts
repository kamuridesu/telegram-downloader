import { Injectable } from '@angular/core';

// import { TelegramClient } from "telegram";
// import { StringSession } from 'telegram/sessions';

@Injectable({
  providedIn: 'root'
})
export default class TelegramService {
  // apiId: number = parseInt(process.env['TELEGRAM_API_ID'] ? process.env['TELEGRAM_API_ID'] : "");
  // apiHash: string = process.env['TELEGRAM_API_HASH'] ? process.env['TELEGRAM_API_HASH'] : "";
  // stringSession: StringSession = new StringSession("");
  // client: TelegramClient = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
  //   connectionRetries: 5,
  // });

  constructor() { }

  public async loginWithPhoneNumber(phoneNumber: string) {
    console.log(phoneNumber);
  }

  public async inputTelegramCode(codeNumber: string) {
    console.log(codeNumber);
  }

  public async inputPassword(password: string) {
    console.log(password);
  }

  public async loadChats() {
    return [];
  }

  private async loadMessages(chatId: string) {
    return [];
  }

  public async loadMedias(chatId: string) {
    const messages = await this.loadMessages(chatId);
    for (let message of messages) {
      console.log(message);
    }
    return [];
  }

  public async downloadMedia(chatId: string, mediaId: string) {
    return [];
  }
}
