import chattersRaw from './chatters.json';
import convosRaw from './conversations.json';
import galleryRaw from './gallery.json';
import pollsRaw from './polls.json';
import notificationsRaw from './notifications.json';

export type Chatter = (typeof chattersRaw)[number];
export type Message = { id?: string; from: string; text: string; moment?: string; t?: number };
export type Moment = { t: number; label: string; kind?: string };
export type Conversation = {
  id: string;
  kind: 'text' | 'audio';
  status: 'live' | 'upcoming' | 'ended';
  title: string;
  tag: string;
  chatters: string[];
  viewers?: number;
  galleryCount?: number;
  heat?: number;
  startedMinAgo?: number;
  poll?: string;
  seed?: Message[];
  script?: Message[];
  startsAt?: string;
  reminders?: number;
  duration?: number;
  endedAgo?: string;
  moments?: Moment[];
  density?: number[];
  messages?: Message[];
};
export type PollOption = { id: string; label: string; votes: number };
export type Poll = { question: string; askedBy: string; closesIn: number; options: PollOption[] };
export type AudienceMember = (typeof galleryRaw.audience)[number];
export type Comment = { id: string; by: string; text: string; likes: number; ago: string; pinned?: boolean; replies?: Comment[] };
export type Notification = (typeof notificationsRaw)[number];

export const chatters = chattersRaw as Chatter[];
export const conversations = convosRaw as Conversation[];
export const gallery = galleryRaw as { audience: AudienceMember[]; comments: Comment[]; incoming: { by: string; text: string }[]; sideRooms: { id: string; name: string; about: string; members: number; last: string; hot?: boolean }[] };
export const polls = pollsRaw as Record<string, Poll>;
export const notifications = notificationsRaw as Notification[];

export const getChatter = (id: string) => chatters.find((c) => c.id === id) ?? chatters[0];
export const getConvo = (id: string) => conversations.find((c) => c.id === id);
export const getAudience = (id: string) => gallery.audience.find((a) => a.id === id) ?? gallery.audience[0];
export const liveNow = () => conversations.filter((c) => c.status === 'live');
export const upcoming = () => conversations.filter((c) => c.status === 'upcoming');
export const replays = () => conversations.filter((c) => c.status === 'ended');
