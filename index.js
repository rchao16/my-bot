require("dotenv").config()
const AWS = require('aws-sdk')
const Discord = require("discord.js")
const axios = require("axios")

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
})

const client = new Discord.Client()
const docClient = new AWS.DynamoDB.DocumentClient();
const prefix = "!"

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

    function sendVerify(member, response, username) {
    const verified = member.guild.roles.cache.get('804910729555083295')
    const properties = response.data.data.properties

    //verify user

    const getParams = {
        TableName: "upland-discord-bot",
        Key: {
            "id": member.id
        }
    }

    let didVerify = docClient.get(getParams)
        .promise()
        .then(data => {
            if (Object.keys(data).length > 0){
                const {property, price} = data.Item.answer
                for (let i=0 ; i < properties.length ; i++){
                    if (properties[i].full_address === property 
                        && properties[i].sale_price_upx === price) {
                            member.roles.add(verified)
                            member.setNickname(username)
                            return true
                    }
                }
            } else {
                return false
            }
        })
        .then(didVerify => {
            if (didVerify === false){
                const randProp = getRndInteger(0, properties.length)
                const randomSell = getRndInteger(999999, 99999999)
                const toVerify = properties[randProp].full_address
                member.send(`set ${toVerify} to ${randomSell}`)
        
                let putParams = {
                    TableName: 'upland-discord-bot',
                    Item: {
                        "id": member.id,
                        "username": username,
                        "answer": {
                            "property": toVerify,
                            "price": randomSell
                        }
                    }
                }
                docClient.put(putParams)
                .promise()
                .then(data => {
                    console.log('created!')
                })
                .catch(console.error)
            }
        })
        .catch(console.error)
} 

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", (msg) => {
    let member = msg.member

    //check if msg sent from server
    if (!msg.guild) return;
    //check for command
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const username = args[1]
    const command = args.shift().toLowerCase();

    if (command === "verify") {
        const url = `https://api.uplandworld.me/upland/{username}`
        axios.get(url)
        .then(function (response) {
            sendVerify(member, response, username)
        })
        .catch(function (error) {
          console.log(error);
        })
        .then(function () {

        }); 
    }
})

client.on("guildMemberAdd", (member) => {
    member.send(
      `Verify yourself by using "!verify <upland_username>", 
      changing the necessary sale price and then "!verify <upland_username>" again!`
    )
})

client.login(process.env.BOT_TOKEN);