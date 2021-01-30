require("dotenv").config()
const axios = require("axios")
const Discord = require("discord.js")
const { prefix, token } = require('./config.json');
const client = new Discord.Client()
const Keyv = require('keyv')

const keyv = new Keyv()

keyv.on('error', err => console.error('Keyv connection error:', err));

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }
function sendVerify(member, response) {
    const properties = response.data.data.properties
    const randProp = getRndInteger(0, properties.length)
    const randomSell = getRndInteger(5000000, 5000000000)
    const toVerify = properties[randProp].full_address
    member.send(`set ${toVerify} to ${randomSell}`)
    let verifyObject = {
        property: toVerify,
        price: randomSell
    }
    keyv.set(verifyObject, JSON.stringify(verifyObject))
  console.log('verifyObject', verifyObject);
} 

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})


client.on("message", (msg) => {
    if (!msg.guild) return;
    let verified = msg.guild.roles.cache.get('804910729555083295')
    let member = msg.member

    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const username = args[1]
    const command = args.shift().toLowerCase();

    if (command === "verify") {
        const url = `http://127.0.0.1:5544/upland/${username}`
        axios.get(url)
        .then(function (response) {
            sendVerify(member, response)
        })
        .catch(function (error) {
          console.log(error);
        })
        .then(function () {
          // always executed
        }); 

        // member.roles.add(verified)

    }
})

client.on("guildMemberAdd", (member) => {

    member.send(
      `Verify yourself by setting`
    )
  })

client.login(token);