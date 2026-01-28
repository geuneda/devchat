import { nanoid } from 'nanoid';
import { ChatMessage, User } from '../types';

export class ChatManager {
  private messages: ChatMessage[] = [];
  private maxMessages = 1000;

  addMessage(sender: string, content: string, type: ChatMessage['type'] = 'chat'): ChatMessage {
    const message: ChatMessage = {
      id: nanoid(),
      type,
      sender,
      content,
      timestamp: Date.now(),
    };

    this.messages.push(message);

    // Keep only recent messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    return message;
  }

  addSystemMessage(content: string): ChatMessage {
    return this.addMessage('System', content, 'system');
  }

  addPluginMessage(pluginName: string, content: string): ChatMessage {
    return this.addMessage(pluginName, content, 'plugin');
  }

  getMessages(limit?: number): ChatMessage[] {
    if (limit) {
      return this.messages.slice(-limit);
    }
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
  }

  formatMessage(msg: ChatMessage): string {
    const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    switch (msg.type) {
      case 'system':
        return `[${time}] *** ${msg.content} ***`;
      case 'plugin':
        return `[${time}] [${msg.sender}] ${msg.content}`;
      default:
        return `[${time}] ${msg.sender}: ${msg.content}`;
    }
  }
}
