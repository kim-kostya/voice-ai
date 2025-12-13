import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
}

export type NotificationsState = {
  notifications: Notification[];
  pushNotificationSubscription: PushSubscription | null;
  setNotifications: (notifications: Notification[]) => void;
  setPushNotificationSubscription: (
    subscription: PushSubscription | null,
  ) => void;
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  pushNotificationSubscription: null,
  setNotifications: (notifications) => set({ notifications }),
  setPushNotificationSubscription: (subscription) =>
    set({ pushNotificationSubscription: subscription }),
}));
