// src/data/mockUser.js

export const initialUser = {
  name: "Darpan Patel",
  email: "darpan.patel@healthmail.com",
  role: "Primary Policyholder",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  memberSince: "March 2024",
  phone: "+91 98765 43210",
  preferences: {
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    emailNotifications: true,
    claimReminders: true,
    weeklyReportDigest: false,
    darkMode: false,
    compactView: false,
  },
  dependents: [
    { name: "Pooja Patel", relation: "Spouse", age: 31 },
    { name: "Aarav Patel", relation: "Child", age: 5 },
  ]
};
