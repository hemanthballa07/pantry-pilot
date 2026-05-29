// Household domain: the user, roommates, activity timeline, and inbox.

import type { Actor } from './pantry';

export interface User {
  name: string;
  first: string;
  last: string;
  initials: string;
  household: string;
  roommates: number;
}

export type HouseholdRole = 'Owner' | 'Member';

export interface HouseholdMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: HouseholdRole;
  added: number;
  spent: number;
}

export type ActivityIcon =
  | 'alert'
  | 'cart'
  | 'chef'
  | 'bag'
  | 'scan'
  | 'save'
  | 'plus';

export interface ActivityEntry {
  when: string;
  who: Actor;
  action: string;
  icon: ActivityIcon;
}

export type InboxType = 'recipe' | 'grocery' | 'voice' | 'photo' | 'todo';

export interface InboxEntry {
  id: string;
  type: InboxType;
  text: string;
  when: string;
}
