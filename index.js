const Telegraf = require('telegraf');
var mqtt = require("mqtt");
var sleep = require('sleep');
var arrayGal = []

var client  = mqtt.connect('mqtt://things.ubidots.com',
              {username:process.env.UBIDOTS_TOKEN, password:""});


const bot = new Telegraf(process.env.BOT_TOKEN);
const welcomeMessage = `Selamat Datang di bot Earthquake Mikro!
Gunakan perintah listen untuk memulai berlangganan.`;

const helpMessage = `Under construction`;


// basic commands
bot.start((ctx) => ctx.reply(welcomeMessage));
bot.help((ctx) => ctx.reply(helpMessage));

// Listen to commands
bot.command('listen', (ctx) => {
  ctx.reply("Anda telah memulai berlangganan");
  client.subscribe({"/v1.6/devices/arduinoearthquake/gal/lv": 1}, function(err, granted) {
    console.log(granted);
  });
  client.on('message', function(topic, message, packet) {
      var gal = parseFloat(message.toString()) - 3;
      arrayGal.push(gal);
      if(arrayGal.length == 20){
        gal = Math.max(...arrayGal);
        while(arrayGal.length > 0) {
          arrayGal.pop();
        }
        if(gal >= 10 && gal <= 88) {
          ctx.reply("Terjadi gempa skala intensitas BMKG II (dirasakan) dengan Peak Ground Acceleration : " + gal + " gal");
        } else if (gal > 88 && gal <= 167) {
          ctx.reply("Terjadi gempa skala intensitas BMKG III (kerusakan ringan) dengan Peak Ground Acceleration : " + gal + " gal");        
        } else if (gal > 167 && gal <= 564) {
          ctx.reply("Terjadi gempa skala intensitas BMKG IV (kerusakan sedang) dengan Peak Ground Acceleration : " + gal + " gal");        
        } else if (gal > 564) {
          ctx.reply("Terjadi gempa skala intensitas BMKG V (kerusakan berat) dengan Peak Ground Acceleration : " + gal + " gal");        
        }
      }
  });
});

// bot.hears('stop', (ctx) => {
//   ctx.reply("Anda telah berhenti berlangganan");
//   client.unsubscribe({"/v1.6/devices/arduinoearthquake/gal/lv": 1}, function(err) {
//     console.log(err);
//   });
//   client.on('message', function(topic, message, packet) {
//
//   });
// });
bot.launch();