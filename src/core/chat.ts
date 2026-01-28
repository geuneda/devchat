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

  /**
   * 저장된 메시지를 복원합니다.
   * 방을 다시 열 때 사용됩니다.
   */
  setMessages(messages: ChatMessage[]): void {
    this.messages = [...messages];
    // Keep only recent messages if exceeds max
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  /**
   * 현재 메시지 개수를 반환합니다.
   */
  getMessageCount(): number {
    return this.messages.length;
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
