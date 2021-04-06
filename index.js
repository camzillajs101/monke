const Discord = require('discord.js');
const client = new Discord.Client();
let ffmpeg = require('ffmpeg');
let fs = require('fs');
let colors = require('colors');
const config = JSON.parse(fs.readFileSync('config.json','utf8'));

function log(message){
  console.log(` ${new Date(Date.now()-18000000).toLocaleTimeString()} `.inverse+" "+message);
}

client.once('ready', () => {
  log("Ready!".bgBlue);
});

client.login(config.token);

let vc, vccon, currentTimeout, dispatcher, queue = [];

function genQueue(){
  for (let i = 0; i < config.passive.length; i++) queue[i] = i; // generate array
  for (let i in queue){ // shuffle array
    let random = Math.floor(Math.random() * config.passive.length);
    let temp = queue[i];
    queue[i] = queue[random];
    queue[random] = temp;
  }
}

client.on('message', message => {
  if (message.author.bot) return; // if the bot said it, disregard

  let text = message.content.toLowerCase();

  if (text.includes("hello")){
		message.channel.send("https://cdn.discordapp.com/attachments/728325501566844951/809301951485313054/hello.mov");
	}
	if (text.includes("goodbye")){
		message.channel.send("https://cdn.discordapp.com/attachments/791387944828141599/809312250292469800/video0.mov");
	}

  if (text.startsWith("join")){
    text = text.slice(5).replace(/\s/g, ''); // remove spaces

    vc = client.channels.cache.get(text === "" ? config.vcs.hotcocoaplace : config.vcs[text]);

    if (vc === undefined){ // make sure vc is valid
      message.channel.send(config.info.unknownvc);
    } else {
      vc.join().then(connection => {
        log(`Joined ${text}`.bgGreen.black);
        vccon = connection;
        dispatcher = vccon.play("sound/hello.mp3").on('finish', () => {
          genQueue();
          playPassive(queue,0);
        });
      });
    }
  }
  if (text.startsWith("leave") && vccon !== undefined){
    vccon.play("sound/goodbye.mp3").on('finish', () => {
      vc.leave();
      clearTimeout(currentTimeout);
      vccon = undefined, queue = []; // reset connection and queue to signify leaving vc
      log(`Left vc`.bgGreen.black);
    });
  }

  if (text.startsWith("play")){
    let name = text.slice(5);
    if (vccon !== undefined){
      if (vccon.speaking.bitfield){
        dispatcher.end();
      }
      if (config.allsounds.includes(name)){
        dispatcher = vccon.play("sound/"+name+".mp3");
        log(`Playing sound ${name} (requested)`.magenta);
      } else if (name === "random"){
        let random = Math.round(Math.random()*(config.passive.length-1));
        dispatcher = vccon.play("sound/"+config.passive[random]+".mp3");
        log(`Playing sound ${config.passive[random]} (requested, random)`.magenta);
      } else {
        message.channel.send(config.info.unknownsound);
      }
    } else {
      message.channel.send(config.info.notinvc);
      if (!vccon.speaking.bitfield){
        dispatcher = vccon.play("sound/sounddoesntexist.mp3");
      }
    }
  }

  if (text.startsWith("stop") && dispatcher){
    dispatcher.end();
  }

  if (text.startsWith("list")){ // this is not very clean or dry
    let list;
    let listtype = text.slice(5);
    switch (listtype){
      case "passive":
        list = "These are all the sounds I play on my own: ```"
        for (let i of config.passive){
          list = list.concat("\n",i);
        }
      break;
      default:
        list = "These are all the sounds I can play: ```"
        for (let i of config.allsounds){
          list = list.concat("\n",i)
        }
    }
    list = list.concat("```");

    message.channel.send(list);
  }
});

client.on('voiceStateUpdate', (oldMember,newMember) => {
  if (vccon !== undefined){
    if (vccon.speaking.bitfield){
      dispatcher.end();
    }
    if (oldMember.channel === null && newMember.channel !== null){ // someone entered
      let userid = newMember.id;
      let username = newMember.guild.members.cache.get(userid).user.username;
      if (config.people[userid] !== undefined){ // play sound, either greeting or generic hello
        log(`${username} joined, playing greeting`.green);
        vccon.play(`sound/greetings/${config.people[userid]}.mp3`);
      } else {
        log(`${username} joined (unknown)`.green);
        vccon.play("sound/hello.mp3");
      }
    } else if (oldMember.channel !== null && newMember.channel === null){ // someone left
      log(`${oldMember.guild.members.cache.get(oldMember.id).user.username} left`.red);
      vccon.play("sound/goodbye.mp3");
    }
  }
});

function playPassive(queue,index){ // delay first, then sound to avoid overlapping at call join
  let delay = Math.round(Math.random() * (config.delayTimes.max - config.delayTimes.min) + config.delayTimes.min);
  log(`Next sound at: ${new Date(Date.now()+delay).toLocaleTimeString()} (${delay} ms)`.cyan);
  currentTimeout = setTimeout(() => {
    log(`Playing sound ${config.passive[queue[index]]} (random)`.magenta);
    dispatcher = vccon.play(`sound/${config.passive[queue[index]]}.mp3`).on('finish', () => {
      if (queue !== []){
        if (queue[index+1] === undefined){
          log("Resetting queue".green);
          genQueue();
          playPassive(queue,0);
        } else {
          playPassive(queue,index+1);
        }
      }
    });
  },delay);
}
