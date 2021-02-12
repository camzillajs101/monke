const Discord = require('discord.js');
const client = new Discord.Client();
let ffmpeg = require('ffmpeg');

const vcs = {
	hotcocoaplace: '806025884657778708',
	church: '792606152633745429',
	cozyplace: '779579659250696222',
	gaming: '779519829253947442',
	btgeneral: '775902986383130658'
}
const sounds = ["bathroom","can_anybody_hear_me","cheese","cough","dammit","joe_biden","laugh","osu","rap","spinning","stfu","typing"];
const delayTimes = {
	min: 45000,
	max: 450000
}

let vc, vccon;

function playRandomSound(nosound){
	if (!nosound){
		playSound("random");
	}
	let delay = Math.round(Math.random() * (delayTimes.max - delayTimes.min) + delayTimes.min);
	let nextdate = new Date(Date.now() + delay);
	let nexttime = `${nextdate.getHours()}:${nextdate.getMinutes()}:${nextdate.getSeconds()}`;
	console.log(`next sound at: ${nexttime}`);
	setTimeout(function(){
		if (vccon !== undefined){
			playRandomSound();
		}
	},delay);
}

function playSound(name,message){
	if (vccon !== undefined){
		if (sounds.includes(name)){
			console.log(`playing sound: ${name}`);
			vccon.play(`sound/${name}.mp3`);
		} else if (name === "random"){
			let random = Math.round(Math.random()*(sounds.length-1));
			console.log(`playing sound: ${sounds[random]}`);
			vccon.play(`sound/${sounds[random]}.mp3`);
		} else {
			message.channel.send("That sound doesn't exist you unballer man!!!!!!!!!!!!");
		}
	} else {
		message.channel.send("I'm not in a voice channel you unballer man!!!!!!!!!!!!");
	}
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	let text = message.content.toLowerCase();

	if (message.author.username !== "BrandonBot"){
		if (text.includes("hello")){
			message.channel.send("https://cdn.discordapp.com/attachments/728325501566844951/809301951485313054/hello.mov");
		}
		if (text.includes("goodbye")){
			message.channel.send("https://cdn.discordapp.com/attachments/791387944828141599/809312250292469800/video0.mov");
		}
	}

	if (message.content.substring(0,4) === "JOIN"){
		switch (message.content){
			case "JOIN!!!":
				vc = client.channels.cache.get(vcs.hotcocoaplace);
			break;
			case "JOIN CHURCH!!!":
				vc = client.channels.cache.get(vcs.church);
			break;
			case "JOIN GAMING!!!":
				vc = client.channels.cache.get(vcs.gaming);
			break;
			case "JOIN COZY PLACE!!!":
				vc = client.channels.cache.get(vcs.cozyplace);
			break;
		}
		vc.join().then(connection => {
			vccon = connection;
			vccon.play("sound/hello.mp3");
			playRandomSound(true);
		});
	} else if (message.content === "LEAVE!!!!"){
		vccon.play("sound/goodbye.mp3").on("finish", () => {
			vc.leave();
			vccon = undefined;
		});
	}

	if (message.content.substring(0,4) === "play"){
		playSound(message.content.slice(5),message);
	}
});

client.on('voiceStateUpdate', (oldMember,newMember) => {
	if (vccon !== undefined){
		if (oldMember.channel === null && newMember.channel !== null){ // someone entered
			vccon.play("sound/hello.mp3");
		} else if (oldMember.channel !== null && newMember.channel === null){ // someone left
			vccon.play("sound/goodbye.mp3");
		}
	}
});

client.login(process.env.TOKEN);

/*
responds what do you mean by that

let author = message.author.username;
let text = message.content.toLowerCase();

if (author === "cheese" || (author === "the gooch man" && text === "test")){
	console.log(`Replying to ${author} (ID ${message.author.id})'s message (${text})`); // log reply

	if (text === "what do you mean by that" || text === "what do you mean by that?" || text.includes("https://cdn.discordapp.com/attachments/792554114798190613/807676879791849512/balzac.mp4")){
		message.channel.send("fuck you");
	} else {
		message.channel.send("https://cdn.discordapp.com/attachments/792554114798190613/807676879791849512/balzac.mp4");
	}
}

bauer bot

let text = message.content.toLowerCase();
if (text.includes("trevor bauer") && message.author.username !== "BauerBot"){
	message.channel.send("Trevor Bauer");
} */

/* IDs:
360412564645216258: the gooch man#8842
369224966761086986: Lidiloth#4377
*/
