
const Botmaster = require('botmaster');
const watsonConversationStorageMiddleware = require('./watson_conversation_storage_middleware');
const watson = require('watson-developer-cloud');
const cfenv = require('cfenv');
const request = require('request-promise');

const appEnv = cfenv.getAppEnv();

const watsonConversation = watson.conversation({
  username: process.env.WATSON_CONVERSATION_USERNAME,
  password: process.env.WATSON_CONVERSATION_PASSWORD,
  version: 'v1',
  version_date: '2016-05-19',
});

const messengerSettings = {
  credentials: {
    verifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
    pageToken: process.env.FACEBOOK_PAGE_TOKEN,
    fbAppSecret: process.env.FACEBOOK_APP_SECRET,
  },
  // !! see Readme if you have any issues with understanding webhooks
  webhookEndpoint: '/webhook/',
};

const botsSettings = [{ messenger: messengerSettings }];

const botmasterSettings = {
  botsSettings,
  port: appEnv.isLocal ? 3000 : appEnv.port,
};

const botmaster = new Botmaster(botmasterSettings);

botmaster.use('incoming', watsonConversationStorageMiddleware.retrieveSession);

botmaster.on('update', (bot, update) => {
  console.log(update);
  const messageForWatson = {
    context: update.session.context,
    workspace_id: process.env.WATSON_WORKSPACE_ID,
    input: {
      text: update.message.text,
    },
  };
  watsonConversation.message(messageForWatson, (err, watsonUpdate) => {
    watsonConversationStorageMiddleware.updateSession(update.sender.id, watsonUpdate);
    const text = watsonUpdate.output.text[0];

    if (watsonUpdate.output.action === 'weather') {
      const requestOptions = {
        url: 'https://twcservice.mybluemix.net/api/weather/v1/geocode/52.379189/4.899431/forecast/daily/3day.json?language=en-US&units=e',
        auth: {
          user: '68e5c50b-4f4f-4ea4-acff-bdc55a244a83',
          pass: '72cQFTI93X',
          sendImmediately: true,
        },
        json: true,
      }
      request(requestOptions)
      .then((body) => {
        const someText = body.forecasts[0].narrative;
        return bot.reply(update, someText)

      })

      .catch((err) => {
        console.log(err);
      })
    } else {
    	const watsontext = watsonUpdate.output.text;
     bot.sendTextCascadeTo(watsontext,update.sender.id)
    }
  });
});


botmaster.on('server running', (message) => {
  console.log(message);
});

botmaster.on('error', (bot, err) => {
  console.log(err.stack);
});
