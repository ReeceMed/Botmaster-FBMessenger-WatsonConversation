const Botmaster = require('botmaster');
const express = require('express');
const R = require('ramda');
const {
  fulfillOutgoingWare
} = require('botmaster-fulfill');
const standardActions = require('botmaster-fulfill-actions');
const watsonConversationStorageMiddleware = require('./watson_conversation_storage_middleware');
const watson = require('watson-developer-cloud');
const cfenv = require('cfenv');
const request = require('request-promise');
const app = express();

const actions = R.merge(standardActions, myActions);

const appEnv = cfenv.getAppEnv();

// Credentials Begin for Watson Services
const watsonConversation = watson.conversation({
  username: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD',
  version: 'v1',
  version_date: '2016-05-19',
});
const watsonVisualRecognition = watson.visual_recognition({
  api_key: 'YOUR_API_KEY',
  version: 'v3',
  version_date: '2016-05-19',
});
const tone_analyzer = watson.tone_analyzer({
  username: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD',
  version: 'v3',
  version_date: '2016-05-19'
});

const messengerSettings = {
  credentials: {
    verifyToken: '12345',
    pageToken: 'YOUR_PAGE_TOKEN',
    fbAppSecret: 'YOUR_FB_APP_SECRET',
  },
  // !! see Readme if you have any issues with understanding webhooks
  webhookEndpoint: '/webhook',
};

const botsSettings = [{
  messenger: messengerSettings
}];

const botmasterSettings = {
  botsSettings,
  app
};

const botmaster = new Botmaster(botmasterSettings);

// Facebook Fulfill Actions begin
const myActions = {
  weather: {
    controller: function(params) {
      return getWeather(params)
        .then(function(result) {
          console.log(result);
          return 'I thought you might like a weather forecast for that location.<pause />' + result;
        })
        .catch(function(err) {
          console.log(err);
          return 'Sorry, not weather forecast available at the moment.';
        });
    }
  },
  buttons: {
    controller: (params, next) => {
      const buttonTitles = params.content.split(',');
      next().then(() => {
        params.bot.sendDefaultButtonMessageTo(buttonTitles, params.update.sender.id);
      });
      return '';
    },
  },
  carousel: {
    controller: (params, next) => {
      next(null, '').then(() => {
        const carouselEntries = params.content.split('|');
        var elements = [];
        for (var i in carouselEntries) {
          const values = carouselEntries[i].split(',');
          console.log(values)
          var element = {
            title: values[0],
            image_url: values[1],
            subtitle: values[2],
            item_url: values[3],
            buttons: [{
              type: "postback",
              title: values[4],
              payload: values[5]

            }]
          };
          elements.push(element);
        }
        params.bot.sendMessage({
          recipient: {
            id: params.update.sender.id
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: elements
              }
            }
          }
        }, {
          ignoreMiddleware: true
        });
      });
    },
  },
  urlButton: { // FB URL Button, only works on FB
    controller: (params, next) => {
      next(null, '').then(() => {
        const parameters = params.content.split(',');
        params.bot.sendMessage({
          recipient: {
            id: params.update.sender.id
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text: parameters[1],
                buttons: [{
                  type: 'web_url',
                  url: parameters[2],
                  title: 'jhgjh',
                  webview_height_ratio: parameters[0],
                }]
              }
            }
          }
        }, {
          ignoreMiddleware: true
        });
      });
    },
  },

  video: { // FB Video - plays video in msg, only works on FB
    controller: (params, next) => {
      next(null, '').then(() => {
        params.bot.sendMessage({
          recipient: {
            id: params.update.sender.id
          },
          message: {
            attachment: {
              type: 'video',
              payload: {
                url: params.content
              }
            }
          }
        }, {
          ignoreMiddleware: true
        });
      });
    },
  },

  image: { // FB Image - shows image in msg, only works on FB
    controller: (params, next) => {
      next(null, '').then(() => {
        params.bot.sendMessage({
          recipient: {
            id: params.update.sender.id
          },
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: params.content
              }
            }
          }
        }, {
          ignoreMiddleware: true
        });
      });
    },
  },

  locButton: { // FB get user location button, only works on FB
    controller: (params, next) => {
      next().then(() => {
        params.bot.sendMessage({
          recipient: {
            id: params.update.sender.id
          },
          message: {
            text: params.content,
            quick_replies: [{
              content_type: 'location',
            }]
          }
        }, {
          ignoreMiddleware: true
        });
        return '';
      });
    },
  },

  shareButton: { // FB share button, for sharing a msg bubble with friends, only works on FB
    controller: (params, next) => {
      next(null, '').then(() => {
        params.bot.sendMessage({
          recipient: {
            id: params.update.sender.id
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: [{
                  title: params.content,
                  buttons: [{
                    type: 'element_share',
                  }]
                }]
              }
            }
          }
        }, {
          ignoreMiddleware: true
        });
      });
    },
  },
};


botmaster.use('incoming', (bot, update, next) => {
  console.log(`got update ${JSON.stringify(update, null, 2)}`);
  next();
});

botmaster.use('incoming', watsonConversationStorageMiddleware.retrieveSession);

botmaster.use('incoming', (bot, update, next) => {
  if (!(update.message && update.message.attachments && update.message.attachments[0].type === 'image')) {
    next();
  }

  const imageURL = update.message.attachments[0].payload.url;
  //SET CUSTOM CLASSIFIER
  const classifierid = 'YOUR_CUSTOM_CLASSIFIER'

  const params = {
    // must be a .zip file containing images
    url: imageURL,
    classifier_ids: classifierid,
  };
  //CLASSIFY AN IMAGE AND STORE IN CONTEXT VARIABLE
  console.log('about to classify');
  watsonVisualRecognition.classify(params, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log('classified');
      const imageClasses = res.images[0].classifiers[0].classes[0].class;
      const imageHierarchy = res.images[0].classifiers[0].classes[0].type_hierarchy;
      // const imageClasses2 = res.images[0].classifiers[0].classes[1].class;

      //SET CONTEXT VARIABLE WITH CLASSIFICATION
      console.log('Context is')
      console.log(JSON.stringify(update.session.context, null, 2));
      if (!update.session.context)
        update.session.context = {};
      update.session.context.imageClasses = imageClasses;
      update.session.context.imageHierarchy = imageHierarchy;
      // update.session.context.imageClasses2 = imageClasses2;

      console.log('Res is now')
      console.log(JSON.stringify(res, null, 2));


      //  console.log(JSON.stringify(update.session.context))

      next();
    }
  });
});

// TONE ANALYZER
botmaster.use('incoming', (bot, update, next) => {
  if (update.postback) {
    update.message = {
      text: update.postback.payload
    }
  }
  if (update.message.attachments) {
    return next();
  }
  const tonetext = update.message.text;
  const toneparams = {
    text: tonetext,
  };
  console.log(update.message.attachments)
  console.log('Analysing tone')
  tone_analyzer.tone(toneparams, function(err, tone) {
    if (err)
      console.log(err);
    else
      console.log('tones are', JSON.stringify(tone, null, 2))
    const angerTone = tone.document_tone.tone_categories[0].tones[0].score; // angertone score
    const DisgustTone = tone.document_tone.tone_categories[0].tones[1].score; // disgusttone score
    const FearTone = tone.document_tone.tone_categories[0].tones[2].score; // feartone score
    const JoyTone = tone.document_tone.tone_categories[0].tones[3].score; // joytone score
    const SadnessTone = tone.document_tone.tone_categories[0].tones[4].score; // sadnesstone score

    let Emotion
    //STORE KEY TONE TO USE IN CONTEXT
    if (angerTone > 0.50) {
      Emotion = "Angry"
    } else {
      Emotion = "none"
    };

    // const AngerTone = tone.document_tone.tone_categories[0].tones[1].tone_name;

    //UPDATE CONTEXT WITH LATEST TONE
    if (!update.session.context)
      update.session.context = {};

    update.session.context.angerTone = angerTone.toString();
    update.session.context.DisgustTone = DisgustTone;
    update.session.context.FearTone = FearTone;
    update.session.context.JoyTone = JoyTone;
    update.session.context.SadnessTone = SadnessTone;
    update.session.context.Emotion = Emotion;
    console.log('Context is')
    console.log(JSON.stringify(update.session.context, null, 2));
    next();
  });
});

botmaster.on('update', (bot, update) => {
  let messageForWatson;
  if (!(update.message.attachments && update.message.attachments[0].type === 'image')) {
    messageForWatson = {
      context: update.session.context,
      workspace_id: 'SET WORKSPACE ID HERE', // SET YOUR WORKSPACE ID HERE
      input: {
        text: update.message.text,
      },
    };
  } else {
    messageForWatson = {
      context: update.session.context,
      workspace_id: 'SET WORKSPACE ID HERE', // SET YOUR WORKSPACE ID HERE
      input: {
        text: '',
      },
    };
  }
  watsonConversation.message(messageForWatson, (err, watsonUpdate) => {
    if (err)
      return console.log(err);
    watsonConversationStorageMiddleware.updateSession(update.sender.id, watsonUpdate);
    console.error(watsonUpdate)
    const watsontext = watsonUpdate.output.text;
    if (watsontext.length > 0)
      bot.sendTextCascadeTo(watsontext, update.sender.id)
    else
      console.error('no update from watson conversation!')
  });

});

botmaster.use('outgoing', fulfillOutgoingWare({
  actions
}));

botmaster.use('outgoing', (bot, update, message, next) => {
  console.log(`sending update ${JSON.stringify(message, null, 2)}`);
  next();
});

const port = appEnv.isLocal ? 3000 : appEnv.port;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

botmaster.on('error', (bot, err) => {
  console.log(err.stack);
});

function getWeather(params) {
  const lat = params.content.split(',')[0];
  const long = params.content.split(',')[1];
  const requestOptions = {
    url: 'https://twcservice.mybluemix.net/api/weather/v1/geocode/' + lat + '/' + long + '/forecast/daily/3day.json?language=en-US&units=e',
    auth: {
      user: 'WEATHER_CREDENTIALS',
      pass: 'WEATHER_CREDENTIALS',
      sendImmediately: true,
    },
    json: true,
  };
  return request(requestOptions)
    .then((body) => body.forecasts[0].narrative);
}
