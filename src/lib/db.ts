// Data access for BuildProof.
//
// Backed by Supabase when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set,
// and by an in-process store otherwise, so the app still runs (and the test
// suite still passes) before a database is configured. The fallback loses
// everything on restart — see supabase/schema.sql to set up the real thing.
//
// No file bytes are stored either way. Media lives on Shelby; a row keeps the
// Shelby explorer link as the durable reference plus the RPC URL used to render
// it, so deleting a row never destroys the blob.
//
// Every method is async regardless of backend, so callers don't change shape
// when the database appears.

import { supabase, supabaseConfigured } from './supabase';

export interface User {
  wallet: string;
  name: string;
  bio: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  /** Original filename of the uploaded resume, for display. */
  resumeName?: string;
  role?: string;
}

export interface Post {
  id: string;
  author: string; // wallet address
  content: string;
  mediaUrl?: string;
  /** How to render the attachment. Absent on posts made before this existed. */
  mediaType?: 'image' | 'pdf';
  /** Original filename, shown for PDF attachments. */
  mediaName?: string;
  /** Shelby explorer link — the canonical reference to the stored blob. */
  explorerUrl?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  salary: string;
  logo: string;
  /** Wallet that posted the job. Absent on the seeded sample listings. */
  postedBy?: string;
}

export interface Message {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  mediaUrl?: string;
  timestamp: string;
}

// ------------------------------------------------------------------ mapping
// Postgres columns are snake_case; the app speaks camelCase. Undefined is used
// for absent values so `compact()` in the API layer keeps behaving the same.

type Row = Record<string, any>;

const nullToUndefined = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

function toUser(row: Row): User {
  return {
    wallet: row.wallet,
    name: row.name ?? '',
    bio: row.bio ?? '',
    location: nullToUndefined(row.location),
    website: nullToUndefined(row.website),
    github: nullToUndefined(row.github),
    twitter: nullToUndefined(row.twitter),
    linkedin: nullToUndefined(row.linkedin),
    avatarUrl: nullToUndefined(row.avatar_url),
    resumeUrl: nullToUndefined(row.resume_url),
    resumeName: nullToUndefined(row.resume_name),
    role: nullToUndefined(row.role),
  };
}

function fromUser(user: User): Row {
  return {
    wallet: user.wallet,
    name: user.name,
    bio: user.bio,
    location: user.location ?? null,
    website: user.website ?? null,
    github: user.github ?? null,
    twitter: user.twitter ?? null,
    linkedin: user.linkedin ?? null,
    avatar_url: user.avatarUrl ?? null,
    resume_url: user.resumeUrl ?? null,
    resume_name: user.resumeName ?? null,
    role: user.role ?? null,
  };
}

function toPost(row: Row): Post {
  return {
    id: row.id,
    author: row.author,
    content: row.content ?? '',
    mediaUrl: nullToUndefined(row.media_url),
    mediaType: nullToUndefined(row.media_type),
    mediaName: nullToUndefined(row.media_name),
    explorerUrl: nullToUndefined(row.explorer_url),
    createdAt: row.created_at,
  };
}

function toMessage(row: Row): Message {
  return {
    id: row.id,
    sender: row.sender,
    receiver: row.receiver,
    // `text` is a Postgres type name, so the column is `body`.
    text: row.body ?? '',
    mediaUrl: nullToUndefined(row.media_url),
    timestamp: row.created_at,
  };
}

function toJob(row: Row): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    description: row.description,
    location: row.location,
    type: row.type,
    salary: row.salary,
    logo: row.logo ?? '',
    postedBy: nullToUndefined(row.posted_by),
  };
}

/** Turns a PostgrestError into a thrown Error so routes report a real failure. */
function assertOk(error: { message: string } | null, action: string) {
  if (error) throw new Error(`Supabase ${action} failed: ${error.message}`);
}

// ------------------------------------------------------- in-process fallback

const fallbackStore: {
  users: Record<string, User>;
  posts: Post[];
  jobs: Job[];
  messages: Message[];
} = ((global as any).bpStore ??= {
  // Deliberately empty. Everything shown in the app is real data written by a
  // real wallet; there is no seeded content to mistake for activity.
  users: {},
  posts: [],
  jobs: [],
  messages: [],
});

const randomId = () => Math.random().toString(36).substring(2, 10);

// ------------------------------------------------------------------ queries

export const db = {
  /** True when reads and writes are hitting Supabase rather than the fallback. */
  isPersistent: () => supabaseConfigured,

  async getUsers(): Promise<User[]> {
    if (!supabase) return Object.values(fallbackStore.users);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    assertOk(error, 'getUsers');
    return (data ?? []).map(toUser);
  },

  async getUser(wallet: string): Promise<User | undefined> {
    if (!supabase) return fallbackStore.users[wallet];
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet', wallet)
      .maybeSingle();
    assertOk(error, 'getUser');
    return data ? toUser(data) : undefined;
  },

  /** Inserts or updates a profile, keyed by wallet. */
  async createUser(user: User): Promise<User> {
    if (!supabase) {
      fallbackStore.users[user.wallet] = { ...fallbackStore.users[user.wallet], ...user };
      return fallbackStore.users[user.wallet];
    }
    const { data, error } = await supabase
      .from('users')
      .upsert(fromUser(user), { onConflict: 'wallet' })
      .select()
      .single();
    assertOk(error, 'createUser');
    return toUser(data);
  },

  async getPosts(): Promise<Post[]> {
    if (!supabase) {
      // Sort a copy — `Array.prototype.sort` is in-place and would reorder the store.
      return [...fallbackStore.posts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    assertOk(error, 'getPosts');
    return (data ?? []).map(toPost);
  },

  async createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    if (!supabase) {
      const newPost: Post = { ...post, id: randomId(), createdAt: new Date().toISOString() };
      fallbackStore.posts.push(newPost);
      return newPost;
    }
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author: post.author,
        content: post.content,
        media_url: post.mediaUrl ?? null,
        explorer_url: post.explorerUrl ?? null,
        media_type: post.mediaType ?? null,
        media_name: post.mediaName ?? null,
      })
      .select()
      .single();
    assertOk(error, 'createPost');
    return toPost(data);
  },

  async getJobs(): Promise<Job[]> {
    if (!supabase) return fallbackStore.jobs;
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    assertOk(error, 'getJobs');
    return (data ?? []).map(toJob);
  },

  async createJob(job: Omit<Job, 'id'>): Promise<Job> {
    if (!supabase) {
      const newJob: Job = { ...job, id: randomId() };
      fallbackStore.jobs.push(newJob);
      return newJob;
    }
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: job.title,
        company: job.company,
        description: job.description,
        location: job.location,
        type: job.type,
        salary: job.salary,
        logo: job.logo,
        posted_by: job.postedBy ?? null,
      })
      .select()
      .single();
    assertOk(error, 'createJob');
    return toJob(data);
  },

  async getMessages(user1: string, user2: string): Promise<Message[]> {
    if (!supabase) {
      return fallbackStore.messages
        .filter(
          (m) =>
            (m.sender === user1 && m.receiver === user2) ||
            (m.sender === user2 && m.receiver === user1),
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    // These values are interpolated into PostgREST filter syntax, so reject
    // anything that isn't a normalized address. Callers already run them through
    // `normalizeAddress()`, but a filter-injection surface shouldn't rely on a
    // caller remembering to.
    for (const wallet of [user1, user2]) {
      if (!/^0x[0-9a-f]{64}$/i.test(wallet)) {
        throw new Error('Invalid wallet address in conversation lookup');
      }
    }

    // Either direction of the pair, and nothing involving a third party.
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender.eq.${user1},receiver.eq.${user2}),and(sender.eq.${user2},receiver.eq.${user1})`,
      )
      .order('created_at', { ascending: true })
      .limit(500);
    assertOk(error, 'getMessages');
    return (data ?? []).map(toMessage);
  },

  async createMessage(msg: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    if (!supabase) {
      const newMessage: Message = {
        ...msg,
        id: randomId(),
        timestamp: new Date().toISOString(),
      };
      fallbackStore.messages.push(newMessage);
      return newMessage;
    }
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender: msg.sender,
        receiver: msg.receiver,
        body: msg.text,
        media_url: msg.mediaUrl ?? null,
      })
      .select()
      .single();
    assertOk(error, 'createMessage');
    return toMessage(data);
  },
};
