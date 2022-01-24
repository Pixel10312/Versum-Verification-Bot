require('dotenv').config()

const Discord = require('discord.js')
const Intents = Discord.Intents

const fetch = require('node-fetch')

const IDENTITY_ADDRESS = "KT1NUrzs7tiT4VbNPqeTxgAFa4SXeV1f3xe9"

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
})

client.on('ready', () => {
    console.log('Ready!')
})

const query_profile = `
    query queryVersumProfile($user: String!) {
        tzprofiles(where: {
                discord: { _eq: $user }
            }) {
            account
        }
    }
`

async function fetchProfile(discord) {
    const result = await fetch(`https://indexer.tzprofiles.com/v1/graphql`, {
        method: 'POST',
        body: JSON.stringify({
            query: query_profile,
            variables: { user: discord },
            operationName: 'queryVersumProfile'    
        }),
    })
    const profileJson = await result.json()
    console.log(JSON.stringify(profileJson))

    return profileJson
}

async function fetchStatus(address) {
    const result = await fetch(`https://api.tzkt.io/v1/contracts/${IDENTITY_ADDRESS}/bigmaps/users/keys?key.eq=${address}`)
    const statusJson = await result.json()
    console.log(JSON.stringify(statusJson))

    return statusJson
}

client.on('messageCreate', async (message) => {
    const author = message.author
    let profile, status;

    let verifiedRole = message.guild.roles.cache.find(role => role.name === 'Verified')

    switch (message.content) {
        case '!status':
            profile = await fetchProfile(author.tag)

            if (profile.data.tzprofiles.length === 0 || !profile.data.tzprofiles[0]?.account) { // No profile found
                return message.reply({
                    content: `You're not verified on-chain. Try linking yor tzprofiles account to your discord account. (Checked <@${author.id}>)`,
                })
            }

            status = await fetchStatus(profile.data.tzprofiles[0].account)

            if (status[0].value.flags.includes("verified")) {
                return message.reply({
                    content: `You're verified on-chain, try !verify to get the 'Verified' role. (Checked <@${author.id}>)`,
                })
            }

            break
        case '!verify':
            if (message.member.roles.cache.has(verifiedRole.id)) {
                return message.reply({
                    content: 'You\'re already verified!',
                })
            }

            try {
                profile = await fetchProfile(author.tag)
            } catch (err) {
                message.reply({ // Error during tzprofiles fetch
                    content: 'Something went wrong while checking your profile. Please try again later. (Fetch Error)',
                })
            }

            if (profile.data.tzprofiles.length === 0 || !profile.data.tzprofiles[0]?.account) { // No profile found
                return message.reply({
                    content: `I Can\'t find your tzprofiles account! Make sure you have one, and that your discord username is the same as your tzprofiles account. If you've recently changed your tzprofiles linked discord, try again in a few minutes. (Checked <@${author.id}>)`,
                })
            }
            
            status = await fetchStatus(profile.data.tzprofiles[0].account)

            if (status[0].value.flags.includes("verified")) {
                message.member.roles.add(verifiedRole)

                return message.reply({
                    content: `You have been verified! You can now use the !verify command to check your status again. (Checked <@${author.id}>)`,
                })
            }

            break
        case '!help':
            message.reply({
                content: '!status - Check your profile verification status.\n!verify - Link your verified versum account to your discord account.\n!help - This message.',
            })
            break
        default:
            return        
    }

    if (message.content === '!verify') {
        
    }
})

client.login(process.env.TOKEN)
