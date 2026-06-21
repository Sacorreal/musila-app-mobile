const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://musila-api-development.up.railway.app';

export const apiURLs = {
  auth: {
    login: `${BASE_URL}/auth/login` as const,
    register: '/auth/register' as const,
    forgotPassword: '/auth/forgot-password' as const,
    resetPassword: '/auth/reset-password' as const,
  },
  users: {
    base: '/users' as const,
    roles: '/users/roles' as const,
    authors: '/users/authors' as const,
    userById: (id: string) => `/users/${id}` as const,
    me: '/users/me' as const,
    deleteMe: '/users/me' as const,
  },
  tracks: {
    base: '/tracks' as const,
    myTracks: '/tracks/my-tracks' as const,
    me: '/tracks/me' as const,
    byId: (id: string) => `/tracks/${id}` as const,
  },
  storage: {   
    presignedUrls: '/storage/upload-url' as const,
    deleteBatch: '/storage/delete-batch' as const,
  },
  search: {
    base:'/search' as const,
  },
  playlists: {
    base: '/playlists' as const,
    byId: (id: string) => `/playlists/${id}` as const,
    collaborators: (playlistId: string) => `/playlists/${playlistId}/collaborators` as const,
    collaboratorsBulk: (playlistId: string) => `/playlists/${playlistId}/collaborators/bulk` as const,
    collaboratorById: (playlistId: string, guestId: string) => `/playlists/${playlistId}/collaborators/${guestId}` as const,
  },
  requestedTracks: {
    base: '/requested-tracks' as const, // POST, GET
    byId: (id: string) => `/requested-tracks/${id}` as const, // GET, PUT, DELETE
    price: (id: string) => `/requested-tracks/${id}/price` as const,
  },
  musicalGenre: {
    base: '/musical-genre' as const, // POST, GET
    byId: (id: string) => `/musical-genre/${id}` as const, // GET, PUT, DELETE
  },
  intellectualProperty: {
    base: '/intellectual-property' as const, // POST, GET
    byId: (id: string) => `/intellectual-property/${id}` as const, // GET, PUT, DELETE
  },
  languages: {
    base: '/languages' as const,
  },
  guests: {
    base: '/guests' as const,
    byId: (id: string) => `/guests/${id}` as const,
    registerFromInvite: '/guests/register-from-invite' as const,
  },
  invites: {
    base: '/invites' as const,
    byToken: (token: string) => `/invites/${token}` as const,
  },
  chats: {
    guests: (chatId: string) => `/chats/${chatId}/guests` as const,
    messages: (chatId: string) => `/chats/${chatId}/messages` as const,
    read: (chatId: string) => `/chats/${chatId}/read` as const,
  },
  notifications: {
    base: '/notifications' as const,
    unreadCount: '/notifications/unread-count' as const,
    readAll: '/notifications/read-all' as const,
    readById: (id: string) => `/notifications/${id}/read` as const,
  },
  app: {
    health: `${BASE_URL}` as const,
  },
  admin: {
    stats: '/users/admin/stats' as const,
    createAdmin: '/users/admin/create' as const,
  },
  payments: {
    checkout: `${BASE_URL}/payments/checkout` as const,
    licenseCheckout: `${BASE_URL}/payments/license-checkout` as const,
    licenseStatus: (reference: string) => `${BASE_URL}/payments/license-status/${reference}` as const,
    paymentSources: `${BASE_URL}/payments/payment-sources` as const,
    paymentSourceMe: `${BASE_URL}/payments/payment-sources/me` as const,
    paymentSourceById: (id: string) => `${BASE_URL}/payments/payment-sources/${id}` as const,
    status: (reference: string) => `${BASE_URL}/payments/status/${reference}` as const,
    byId: (id: string) => `${BASE_URL}/payments/${id}` as const,
    receipt: (id: string) => `${BASE_URL}/payments/${id}/receipt` as const,
    wompiWebhook: `${BASE_URL}/payments/wompi/webhook` as const,
  },
  me: {
    profile: `${BASE_URL}/users/me` as const,
    email: `${BASE_URL}/users/me/email` as const,
    password: `${BASE_URL}/users/me/password` as const,
    avatar: `${BASE_URL}/users/me/avatar` as const,
    plan: `${BASE_URL}/users/me/plan` as const,
    billing: `${BASE_URL}/users/me/billing` as const,
    paymentHistory: `${BASE_URL}/users/me/payments` as const,
  },
} as const;

export type ApiURLs = typeof apiURLs;