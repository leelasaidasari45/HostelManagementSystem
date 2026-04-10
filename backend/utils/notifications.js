import { Expo } from 'expo-server-sdk';

let expo = new Expo();

/**
 * Send push notifications to a list of Expo push tokens
 * @param {string[]} pushTokens - Array of Expo push tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional extra data payload
 */
export const sendPushNotifications = async (pushTokens, title, body, data = {}) => {
  let messages = [];
  
  for (let pushToken of pushTokens) {
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message
    messages.push({
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    });
  }

  // Batch the messages into chunks as recommended by Expo
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending notification chunk:', error);
    }
  }

  return tickets;
};
