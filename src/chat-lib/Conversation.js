import * as fs from 'fs';

class Conversation {
  private _id: string;
  private _data: { id: string, lastIndex: number, items: Array<{ question: string, answer: string, timeAt: number }> };
  private lastMessage: { question: string, answer: string, timeAt: number };
  private numRelatedMessage: number;
  private answerLimit: number;

  constructor(id?: string) {
    this.init(id);
  }

  public init(id?: string): void {
    this.setLimitAnswer();
    this.setNumRelatedMessage();

    if (!id) {
      this.makeId();
      this.emptyData();
      return;
    }

    this._id = id;
    this.readData();
  }

  private makeId(): void {
    this._id = Math.random().toString(32).slice(2, 16);
  }

  private emptyData(): void {
    this._data = {
      id: this._id,
      lastIndex: 0,
      items: []
    }
  }

  /**
   * Set the message sending limit most relevant to the conversationi
   * @param {number} limit maximum messages send to gpt
   * */
  public setNumRelatedMessage(limit = 5): void {
    this.numRelatedMessage = limit;
  }

  /**
   * Set limit tokens and optimizer quotas.
   * @param {number} limit maximum gpt response characters 
   */
  public setLimitAnswer(limit = 160): void {
    this.answerLimit = limit;
  }

  public writeData(): void {
    try {
      fs.writeFileSync(`./data/${this._id}`, JSON.stringify(this._data));
    } catch (error) {
      console.log(`Error: has error when write conversation_id ${this._id} :`, error.message);
    }
  }

  public readData(): void {
    try {
      const data = fs.readFileSync(`./data/${this._id}`, { encoding: 'utf-8' });
      this._data = JSON.parse(data);
    } catch (error) {
      console.log(`Error: has error when read conversation_id ${this._id} :`, error.message);
      this.emptyData();
    }
  }

  /**
   * Set message
   * @param {string} type question (Q), answer (A)
   * @param {string} message Message from client and gpt api
   */
  public setMessage(type: string, message: string): void {
    this.lastMessage = this._data.items[this._data.lastIndex];

    // This is question
    if (!this.lastMessage) {
      this.lastMessage = { question: '', answer: '', timeAt: Date.now() };
      this._data.items.push(this.lastMessage);
      this._data.lastIndex = this._data.items.length - 1;
    }

    // Next message
    if (type === 'answer') {
      this._data.lastIndex = this._data.items.length;
    }

    this.lastMessage[type] = message;

    // Commit to file
    this.writeData();
  }

  public getRelatedMessage(): Array<{ question: string, answer: string, timeAt: number }> {
    if (this._data.items.length > this.numRelatedMessage) {
      return this._data.items.slice(0 - this.numRelatedMessage);
    } else {
      return this._data.items;
    }
  }

  public makePromt(): string {
    let promt = ``;
    this.getRelatedMessage().forEach(item => {
      promt += `Q:${item.question}, limit ${this.answerLimit} chars\nA:${item.answer}\n\n`;
    });
    return promt;
  }
}

export = Conversation;
