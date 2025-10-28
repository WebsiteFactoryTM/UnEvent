import type { Profile, User } from "@/types/payload-types"

export const mockCurrentUser: User = {
  id: 1,
  displayName: "Maria Popescu",
  avatarURL: "/professional-avatar.png",
  roles: ["organizer", "host", "client"],
  status: "active",
  email: "maria.popescu@example.com",
  agreeTermsAndConditions: true,
  agreePrivacyPolicy: true,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-12-20T15:30:00Z",
}

export const mockProfile: Profile = {
  id: 1,
  user: 1,
  slug: "maria-popescu",
  name: "Maria Popescu",
  displayName: "Maria Popescu",
  bio: "Organizator de evenimente cu peste 10 ani experiență în organizarea de nunți și evenimente corporate.",
  phone: "+40 722 123 456",
  website: "https://mariapopescu.ro",
  city: "București",
  socialMedia: {
    facebook: "https://facebook.com/mariapopescu",
    instagram: "https://instagram.com/mariapopescu",
    linkedin: "https://linkedin.com/in/mariapopescu",
    youtube: null,
    tiktok: null,
    twitch: null,
    x: null,
  },
  verified: {
    status: "approved",
    documents: [],
    verificationData: {
      fullName: "Maria Elena Popescu",
      address: "Str. Victoriei nr. 123, București",
      isCompany: false,
      companyName: null,
      cui: null,
      companyAddress: null,
    },
  },
  rating: {
    average: 4.8,
    count: 127,
  },
  memberSince: "2024-01-15T10:00:00Z",
  lastOnline: "2024-12-22T14:30:00Z",
  views: 1543,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-12-20T15:30:00Z",
}
