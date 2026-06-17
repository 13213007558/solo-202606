import { UserInfo, ConnectionStatus } from './syncManager';
import { ToolbarUI } from './toolbarUI';

export class UserPanel {
  private userListEl: HTMLElement;
  private statusDot: HTMLElement;
  private statusText: HTMLElement;
  private users: Map<string, UserInfo> = new Map();

  constructor() {
    this.userListEl = document.getElementById('user-list')!;
    this.statusDot = document.getElementById('status-dot')!;
    this.statusText = document.getElementById('status-text')!;
  }

  setStatus(status: ConnectionStatus): void {
    this.statusDot.className = 'status-dot';
    this.statusDot.classList.add(status);

    const textMap: Record<ConnectionStatus, string> = {
      connected: '已连接',
      reconnecting: '重连中',
      disconnected: '离线'
    };
    this.statusText.textContent = textMap[status];
  }

  setUsers(users: UserInfo[]): void {
    const existingIds = new Set(this.users.keys());
    const newIds = new Set(users.map(u => u.id));

    for (const id of existingIds) {
      if (!newIds.has(id)) {
        this.removeUser(id, false);
      }
    }

    for (const user of users) {
      if (!existingIds.has(user.id)) {
        this.addUser(user, false);
      } else {
        this.users.set(user.id, user);
        this.updateUserEl(user);
      }
    }
  }

  addUser(user: UserInfo, notify = true): void {
    if (this.users.has(user.id)) {
      this.updateUserEl(user);
      return;
    }

    this.users.set(user.id, user);
    const userEl = this.createUserEl(user);
    this.userListEl.appendChild(userEl);

    if (notify) {
      ToolbarUI.showNotification(`${user.name} 加入了画布`, 'join');
    }
  }

  removeUser(userId: string, notify = true): void {
    const user = this.users.get(userId);
    if (!user) return;

    const el = this.userListEl.querySelector(`[data-user-id="${userId}"]`);
    if (el) {
      (el as HTMLElement).classList.add('leaving');
      setTimeout(() => el.remove(), 400);
    }

    this.users.delete(userId);

    if (notify) {
      ToolbarUI.showNotification(`${user.name} 离开了画布`, 'leave');
    }
  }

  private createUserEl(user: UserInfo): HTMLElement {
    const item = document.createElement('div');
    item.className = 'user-item';
    item.dataset.userId = user.id;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.style.backgroundColor = user.color;
    avatar.style.borderColor = this.darkenColor(user.color, 20);
    avatar.textContent = user.name.charAt(0);

    const name = document.createElement('span');
    name.className = 'user-name';
    name.textContent = user.name;

    item.appendChild(avatar);
    item.appendChild(name);

    return item;
  }

  private updateUserEl(user: UserInfo): void {
    const el = this.userListEl.querySelector(`[data-user-id="${user.id}"]`);
    if (!el) return;

    const avatar = el.querySelector('.avatar') as HTMLElement;
    const name = el.querySelector('.user-name') as HTMLElement;

    if (avatar) {
      avatar.style.backgroundColor = user.color;
      avatar.style.borderColor = this.darkenColor(user.color, 20);
      avatar.textContent = user.name.charAt(0);
    }
    if (name) {
      name.textContent = user.name;
    }
  }

  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  }

  getUserCount(): number {
    return this.users.size;
  }

  getUsers(): UserInfo[] {
    return Array.from(this.users.values());
  }
}
