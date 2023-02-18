const { Expo } = require('expo-server-sdk')
const { EXPO_ACCESS_TOKE } = require('../config/prod')
let expo = new Expo({ accessToken: EXPO_ACCESS_TOKE })

exports.pushNotification = (title, body, data, pushTokens) => {
  let messages = []
  for (let pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`)
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      title,
      body,
      data
    })
  }

  let chunks = expo.chunkPushNotifications(messages)
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        console.log(ticketChunk)
        tickets.push(...ticketChunk)
      } catch (error) {
        console.error(error)
      }
    }
  })()

  let receiptIds = [];
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id)
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds)
  (async () => {
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk)
        console.log(receipts)
        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === 'ok') {
            continue;
          } else if (status === 'error') {
            console.error(
              `There was an error sending a notification: ${message}`
            )
            if (details && details.error) {
              console.error(`The error code is ${details.error}`)
            }
          }
        }
      } catch (error) {
        console.error(error)
      }
    }
  })()
}