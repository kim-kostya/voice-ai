export interface TestPushNotification {
  type: "test";
  title: string;
  body: string;
}

export type PushNotification = TestPushNotification;
