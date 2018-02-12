
var restify = require('restify');
var builder = require('botbuilder');


//Boot Setup
// Create the host web server
var server = restify.createServer();

server.listen(
  process.env.PORT || 3978,
  () => console.log('%s Listening to %s', server.name, server.url)
)

// Get secrets from server environment
var botConnectorOptions = {
    appId: 'b581f81e-1b57-441d-8227-35ec7360a889',
    appPassword:'kkoxPCSYX4}bwxUM5428=}!'
};

// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector,
[
  (session) => {
          session.beginDialog('/ensureProfile', session.userData.profile);
  },
  (session,results) => {
    const profile = session.userData.profile = results.response;
    session.endConversation(`Hello ${profile.name}. I love ${profile.company}`);
  }
]

);
server.post('/api/messages', connector.listen());
bot.dialog('help',[
  (session) => {
    session.endDialog(`I'm a simple bot..`);
  }
]).triggerAction({
  matches: /^help$/i,
  onSelectAction: (session,args) => {
    //Execute just before the dialog launches
    //change the default behaviour
    //the default behaviour is to REPLACE the dialog stack
    session.beginDialog(args.action,args);
  }
})
bot.dialog('/ensureProfile', [
     (session, args, next) => {
        session.dialogData.profile = args || {};
        //Checks whether or not we already have the user's name
        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, "What's your name?");
        } else {
            next();
        }
    },
    (session, results, next) => {
      if(results.response){
        session.dialogData.profile.name = results.response;
      }
      if(!session.dialogData.profile.company){
        builder.Prompts.text(session, `What company do you work for?`);
      }
      else {
        next();
      }
    },
    (session,results) => {
      if(results.response){
        session.dialogData.profile.company = results.response;
      }
      session.endDialogWithResult({response: session.dialogData.profile});
    }

]);

// Serve a static web page
server.get(/.*/, restify.plugins.serveStatic({
        'directory': '.',
        'default': 'index.html'
}));
