import { Client, MessageEmbed } from "discord.js";
import { ZDK } from "@zoralabs/zdk";
require('dotenv').config()
const BOT_AUTHOR = "Ale"
const BOT_NAME = "MyZoraBot";
const BOT_NAME_FOOTER = "MyZoraBot";
const BOT_THUMBNAIL = `https://i.imgur.com/UFKWUBQ.png`
const BOT_IMAGE = 'https://i.imgur.com/1VqLClA.png'
const BOT_VERSION = "1.0.0";
const EMBED_COLOR_C = 'FFFFFF';


const EXAMPLE_COMMAND_BALANCE = `!balance 0xc729Ce9bF1030fbb639849a96fA8BBD013680B64`;
const EXAMPLE_COMMAND_BALANCE2 = `!balance 0x8d04a8c79cEB0889Bdd12acdF3Fa9D207eD3Ff63`
const EXAMPLE_COMMAND_BALANCE3 = `!balance 0x335eeef8e93a7a757d9e7912044d9cd264e2b2d8`
const EXAMPLE_MINTED = `!minted jacob.eth`
const EXAMPLE_ZORA = `!zora`
const GIT_URL_BOT = `https://github.com/aadorian/myzorabot.git`

const params = {

	DISCORD_TOKEN: process.env.DISCORD_TOKEN,
	RPC_URL: process.env.RPC_URL,
	TOKEN_COUNT: BigInt(process.env.TOKEN_COUNT || 10),
}


Object.keys(params).forEach(param => {
	if (!params[param]) {
		console.log(`Missing ${param} env variables`);
		process.exit(1);
	}
})


console.log(`Starting ZoraBot...`);
console.log(`Connecting discord to ${params.RPC_URL}...`);

const client: Client = new Client();


client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});




const onReceiveMessage = async (msg) => {
	const authorId = msg.author.id;
	const messageContent = msg.content;
	const channelId = msg.channel.id;
	const zdk = new ZDK(); //
	let args = {
		token: {
			address: "0x8d04a8c79cEB0889Bdd12acdF3Fa9D207eD3Ff63",
			tokenId: "314"
		},
		includeFullDetails: false // Optional, provides more data on the NFT such as all historical events
	}

	let response = await zdk.token(args)


	if (messageContent.startsWith("!minted")) {
		let minteraddress = messageContent.slice("!minted".length).trim();


		const resource = await zdk.mints({
			where: {
				minterAddresses: [minteraddress],
			},
		});

		const mintedEmbed = new MessageEmbed()
			.setColor(EMBED_COLOR_C)
			.setTitle("Minted")
			.setDescription(
				resource.mints.__typename + " # " + resource.mints.nodes.length
			)
			.setThumbnail(BOT_THUMBNAIL)
			.addField("Collection Address", resource.mints.nodes[0].mint.collectionAddress, true)
			.addField("Token Address", resource.mints.nodes[0].mint.originatorAddress, true)
			.addField("Token ID", resource.mints.nodes[0].mint.tokenId, true)
			.addField("Transaction Blocknumber", resource.mints.nodes[0].mint.transactionInfo.blockNumber, true)
			.addField("Transaction Hash", resource.mints.nodes[0].mint.transactionInfo.transactionHash, true)
			.setImage(BOT_IMAGE)
		msg.channel.send(mintedEmbed);
	}

	if (messageContent.startsWith("!zora")) {
		const helpEmbed = new MessageEmbed()
			.setColor(EMBED_COLOR_C)
			.setTitle("Token")
			.setDescription(
				response.token.token.description
			)
			.setThumbnail(response.token.token.image.url)
			.addField("tokenName", response.token.token.name)
			.addField("typeName", response.token.__typename, true)
			.addField("collection Address", response.token.token.collectionAddress, true)
			.addField("token Owner", response.token.token.owner)
			.addField("token last refresh time", response.token.token.lastRefreshTime)

			.setImage(BOT_IMAGE)
		msg.channel.send(helpEmbed);
	}
	if (messageContent.startsWith("!help")) {
		const helpEmbed = new MessageEmbed()
			.setColor(EMBED_COLOR_C)
			.setTitle("Help")
			.setDescription(`
				${EXAMPLE_COMMAND_BALANCE}
				${EXAMPLE_COMMAND_BALANCE2}
				${EXAMPLE_COMMAND_BALANCE3}
				${EXAMPLE_MINTED}
				${EXAMPLE_ZORA}
		
			`)
			.setThumbnail(BOT_THUMBNAIL)
			.addField("Author", BOT_AUTHOR, true)
			.addField("Name", BOT_NAME, true)
			.addField("Version", BOT_VERSION, true)
			.setFooter(BOT_NAME_FOOTER)
			.setTimestamp()
		msg.channel.send(helpEmbed);
	}
	if (messageContent.startsWith("!balance")) {
		let address = messageContent.slice("!balance".length).trim();
		args.token.address = address
		let response = await zdk.token(args)
		const balanceEmbed = new MessageEmbed()
			.setColor(EMBED_COLOR_C)
			.setTitle(`${response.token.token.name}`)
			.setThumbnail(response.token.token.image.url)
			.addField("tokenName", response.token.token.name)
			.addField("typeName", response.token.__typename, true)
			.addField("collection Address", response.token.token.collectionAddress, true)
			.addField("token owner", response.token.token.owner)
			.addField("token last refresh time", response.token.token.lastRefreshTime)
			.addField("token id", response.token.token.tokenId)
			.addField("Description", response.token.token.description)
		msg.channel.send(balanceEmbed);

	}
};

client.on("message", async (msg) => {
	try {
		await onReceiveMessage(msg);
	} catch (e) {
		msg.reply('ERROR');
		console.log(new Date().toISOString(), "ERROR", e.stack || e);
	}
});

client.login(params.DISCORD_TOKEN);