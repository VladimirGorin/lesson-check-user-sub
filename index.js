require("dotenv").config({ path: "./.env" });

const TelegramBotApi = require("node-telegram-bot-api");
const bot = new TelegramBotApi(process.env.TOKEN, { polling: true });

// https://t.me/+1r4IZplc39kxZTRh
// https://t.me/+lP_-VYDxIvBlOTkx
// https://t.me/CheckGroupSubBot

async function checkSub(channelId, userId) {
  const data = await bot.getChatMember(channelId, userId);

  if (data.status === "left" || data.status === "kicked") {
    return false;
  }

  return true;
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const username =
    `@${msg.from.username}` || `${msg.from.first_name} ${msg.from.last_name}`;

  if (msg?.new_chat_members) {
    bot.sendMessage(chatId, `${username} новый участник в группе!`);
    return;
  }

  if (msg?.left_chat_member) {
    bot.sendMessage(chatId, `${username} покинул группу :(`);
    return;
  }

  const messageId = msg.message_id;

  const isAdmin = Number(process.env.ADMINID) === userId;
  const channelId = process.env.CHANNELID;

  if (!isAdmin) {
    const userIsSub = await checkSub(channelId, userId);

    if (!userIsSub) {
      bot.deleteMessage(chatId, messageId);
      bot.sendMessage(chatId, "Прежде чем писать в чат подпишитесь на канал", {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: "Подписатся",
                callback_data: "subToChannel",
                url: "https://t.me/+lP_-VYDxIvBlOTkx",
              },
            ],
          ],
        }),
      });
    } else {
      bot.sendMessage(chatId, "Пользователь подписан!");
    }
  } else {
    console.log("Сообщение отправил владелец!");
  }
});
