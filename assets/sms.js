const accountSid = 'AC2b0673c979f326e7a2ad737d4bd20d26';
const authToken = '4119ce28cc2dde9a973b4473a36d6e0d';
const client = require('twilio')(accountSid, authToken);


client.messages
  .create({
     body: listToSend,
     from: '+18302660950',
     to: phoneNumber,
   })
  .then(message => console.log(message.sid));
  

  