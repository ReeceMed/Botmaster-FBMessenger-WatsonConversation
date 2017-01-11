# Botmaster | Messenger | Watson Conversation
<div align="center">
Powered by <img src="https://botmasterai.github.io/images/botmaster_light.svg" width="100">
</div>

Botmaster framework with IBM Watson Conversation dependencies to deploy Facebook messenger bot. Botmaster is a lightweight highly extendable, highly configurable chatbot framework. It was meant to be used both in small scale and large scale projects. Its purpose is to integrate your chatbot into a variety of messaging channels.
<div align="center">
<a href="https://bluemix.net/deploy?repository=https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation.git" # [required]><img src="https://bluemix.net/deploy/button.png" alt="Deploy to Bluemix"></a></div>

# Before you begin

* Create a Bluemix account
    *    [Sign up](https://bluemix.net/registration) in Bluemix, or use an existing account. Your account must have available space for at least 1 app and 1 service.
* Make sure that you have the following prerequisites installed:
    * [The Node.js runtime](https://nodejs.org/en/) (including the npm package manager)
    * [The Cloud Foundry and BlueMix](https://console.ng.bluemix.net/docs/cli/index.html#cli) command-line client

## Getting Watson Conversation Credentials

In order for Watson Conversation to integrate with Botmaster, the following credentials are required
  - Service Credentials
  - Conversation Workspace ID
  
### Service Credentials
---
1. Find your service within BlueMix and click to view the service details screen
![Find your service] (https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/services.png?raw=true)
2. From this screen click the "Service Credentials" tab
![Get workspace ID](https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/servicecredentials.png?raw=true)
3. Copy the username and password information (we will use this later when connecting our conversation to Botmaster)

### Conversation Workspace ID
---
1. Open the conversation instance you have created
2. In the service instance detail click "Launch Tool"
![Launch tooling](https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/launchtool.png?raw=true)
3. Once in the Conversation tooling locate your conversation workspace
4. Click the menu located top right and select "View Details"
<div align="center">![Get workspace ID](https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/workspaceid.png?raw=true)</div>
5. Copy your workspace ID and make note (we will use this with service credentials to connect our Watson Conversation to Botmaster)


###Set up your Facebook page
---
In order to connect to Facebook messenger, you must first have a Facebook Developers account and page created. 

[Click here to see how] (https://medium.com/@yrezgui/setup-your-first-messenger-chatbot-a28482a407d4#.k2f7xpobi)


# Getting Started with Botmaster on BlueMix

If you wish to simply deploy a Botmaster instance without having to edit any of the pre existing code or do not wish to connect any additional API or additional functionality, use the steps below.

1. In order to setup botmatser and a webhook for messenger to link to your Watson conversation we first need to deploy a BlueMix application. So go ahead and hit the button.
<div align="center">
<a href="https://bluemix.net/deploy?repository=https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation.git/" # [required]><img src="https://bluemix.net/deploy/button.png" alt="Deploy to Bluemix"></a></div>

2. Log into BlueMix
3. Give you application a unique name (this will be the URL for the base of your webhook e.g wwww.helloworld.mybluemix.net/webhook)
4. Select the space and organisation to deploy to.
![Name your application] (https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/bluemixname.png?raw=true)
5. Once complete you will be presented with this screen, now you can click edit code if you wish to add additional functionality.
![Success deployment] (https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/success.png?raw=true)
6. Once successfully deployed, go to your BlueMix app dashboard and view your app.
![Success deployment] (https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/appdetail.png?raw=true)
7. Select Runtime followed by Environment Variables
![Success deployment] (https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/envvar.png?raw=true)
8. Populate these fields with the required information
9. Hit save to restart your application

### Connecting Facebook 
   
6. Go to your Facebook Developer page for your application
7. Under Webhooks, create "New Subscription" for pages
![Facebook Webhook] (https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/facebookwebhook.png?raw=true)
8. In the callback URL field, paste in your app URL from BlueMix using your webhook by default this is set to /webhook (e.g myapp.bluemix.net/messenger/webhook) or in code **line 23**
9. Enter your verify token you created in Environent Variables or in code **Line 18**
10. Select the following fields messages, messaging_postbacks
11. Once your webhook is set up you need to subscribe to events within messenger
12. Go to Messenger in the Facebook Developer portal product tab
13. Go to Settings
14. Locate Webhooks
15. Subscribe your event to the page you created
![Subscribe Webhook] (https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/messengerevent.png?raw=true)

# Getting started with Botmaster Locally

The best way to begin to utilise Botmaster is to run the app locally. This will allow you to customise the code if you so wish. If however you are happy with what is already included go ahead and skip to Getting Started with Botmaster on BlueMix.

Begin by changing to the directory of this repository you have just cloned or downloaded.
	
* This can be done via command line e.g `cd Desktop/Botmaster-FBMessenger-Watson `

To customise your Botmaster framework, such as adding additional actions or API services find documentation here [Botmaster Documentation] (https://Botmasterai.github.io/) 

Otherwise lets get going!

## Connecting IBM Watson Conversation & Facebook Messenger
You will notice within the repository files is a manifest.yml file. This file is where we will enter our credentials to connect Botmaster to IBM Watson Conversation and Facebook Messenger. In order to achieve this change the following lines with your information.
![Environment Variables] (https://github.com/ReeceMed/Botmaster-FBMessenger-WatsonConversation/blob/master/readmeimages/env.png?raw=true)


##Logging into BlueMix
BlueMix is where we will host our application, therefore we will make use of the cloud foundry to help us manage and push the application. 

1. Open terminal or command prompt
2. Set the API endpoint of your BlueMix space
	* `cf api https://api.ng.bluemix.net` - US South
	* `cf api https://api.eu-gb.bluemix.net` - UK
3. Login to BlueMix using:
	* `cf login`
	* Enter your email address of your BlueMix account
	* Hit enter
	* Enter your password of your BlueMix Account (*it will appear your password is not typing*)
	* Hit enter
4. Select your space following on screen prompt
5. To confirm and check which region, org and space is currently targeted type:
	* `cf target`

Once you have successfully logged in and targetted BlueMix you can now push your application to BlueMix.

##Pushing to BlueMix
Once you have finished working on your application you can now push this to BlueMix to be hosted. Using the steps above login to BlueMix.

1. Open terminal or command prompt
2. Login to BlueMix
2. Change directory to your repository using `cd yourrepository`
3. Use the following command to push to BlueMix `cf push`


#Additional Links

Botmaster Documentation : [Botmaster Documentation] (https://Botmasterai.github.io/)

Facebook Messenger Webhook Reference : [Facebook Webhooks] (https://developers.facebook.com/docs/messenger-platform/webhook-reference#setup)

Watson Conversation Documentation : [Watson Conversation] (http://www.ibm.com/watson/developercloud/doc/conversation/index.html)

Santa Bot Example App : [Santa Bot] (fb.me/santachatbot)