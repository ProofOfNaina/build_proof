// Mock Database for BuildProof
// In a real app, this would be Supabase or another DB.

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
  role?: string;
}

export interface Post {
  id: string;
  author: string; // wallet address
  content: string;
  mediaUrl?: string;
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
}

export interface Message {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  mediaUrl?: string;
  timestamp: string;
}

// In-memory store
const globalStore: {
  users: Record<string, User>;
  posts: Post[];
  jobs: Job[];
  messages: Message[];
} = (global as any).bpStore || {
  users: {},
  posts: [
    {
      id: '1',
      author: '0x123',
      content: 'Just finished the initial design system for BuildProof! 🚀 Focusing on minimal aesthetics and futuristic glassmorphism. What do you all think about the new indigo-centric palette?',
      mediaUrl: 'https://picsum.photos/seed/design1/800/500',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: '2',
      author: '0x456',
      content: 'The future of work is not just remote, it is decentralized. We are seeing a massive shift in how teams collaborate across timezones. Exciting times ahead!',
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    }
  ],
  jobs: [
    { id: '1', title: 'Senior UI Designer', company: 'BuildProof', description: 'Lead our design team.', location: 'Remote', type: 'Full-time', salary: '$140k - $180k', logo: 'https://picsum.photos/seed/bp/100/100' },
    { id: '2', title: 'Frontend Engineer', company: 'Vercel', description: 'Build the future of the web.', location: 'Hybrid', type: 'Full-time', salary: '$150k - $200k', logo: 'https://picsum.photos/seed/vercel/100/100' },
    { id: '3', title: 'Product Manager', company: 'Stripe', description: 'Scale global payments.', location: 'San Francisco', type: 'Full-time', salary: '$160k - $210k', logo: 'https://picsum.photos/seed/stripe/100/100' },
  ],
  messages: []
};

if (process.env.NODE_ENV !== 'production') {
  (global as any).bpStore = globalStore;
}

export const db = {
  getUsers: () => Object.values(globalStore.users),
  getUser: (wallet: string) => globalStore.users[wallet],
  createUser: (user: User) => {
    globalStore.users[user.wallet] = {
      ...globalStore.users[user.wallet],
      ...user
    };
    return globalStore.users[user.wallet];
  },
  getPosts: () => globalStore.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  createPost: (post: Omit<Post, 'id' | 'createdAt'>) => {
    const newPost: Post = {
      ...post,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
    };
    globalStore.posts.push(newPost);
    return newPost;
  },
  getJobs: () => globalStore.jobs,
  createJob: (job: Omit<Job, 'id'>) => {
    const newJob: Job = {
      ...job,
      id: Math.random().toString(36).substring(7),
    };
    globalStore.jobs.push(newJob);
    return newJob;
  },
  getMessages: (user1: string, user2: string) => {
    return globalStore.messages.filter(m => 
      (m.sender === user1 && m.receiver === user2) || 
      (m.sender === user2 && m.receiver === user1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  createMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...msg,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    };
    globalStore.messages.push(newMessage);
    return newMessage;
  }
};
