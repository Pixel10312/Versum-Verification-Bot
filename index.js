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

    return profileJson
}

async function fetchStatus(address) {
    const result = await fetch(`https://api.tzkt.io/v1/contracts/${IDENTITY_ADDRESS}/bigmaps/users/keys?key.eq=${address}`)
    const statusJson = await result.json()

    return statusJson
}

client.on('messageCreate', async (message) => {
    let verifiedRole = message.guild.roles.cache.find(role => role.name === 'Verified')

    const author = message.author
    let profile, status;

    const fetchPrereqs = [
        '!verify',
        '!status'
    ]

    if (fetchPrereqs.includes(message.content)) {
        try {
            profile = await fetchProfile(author.tag)
        } catch (err) {
            return message.reply({ // Error during tzprofiles fetch
                content: 'Something went wrong while checking your profile. Please try again later. (Fetch Error)',
            })
        }
    
        /* Fetch calee's status if there's an associated tzprofiles */
        if (profile.data.tzprofiles.length > 0) {
            status = await fetchStatus(profile.data.tzprofiles[0].account)
        }
    }

    switch (message.content) {
        case '!status':
            if (profile.data.tzprofiles.length === 0) { // No profile found
                return message.reply({
                    content: 'You have not linked your profile to a Tezos account. Please do so by following the instructions on <https://tzprofiles.com>.',
                })
            }

            if (status[0].value.flags.includes("verified")) {
                return message.reply({
                    content: `You're verified on-chain, try !verify to link your versum account. (Checked <@${author.id}>)`,
                })
            } else {
                return message.reply({
                    content: `You're not verified on-chain. Try linking your tzprofiles account to your discord account. (Checked <@${author.id}>)`,
                })
            }

            break
        case '!verify':
            if (message.member.roles.cache.has(verifiedRole.id)) {
                return message.reply({
                    content: 'You\'re already verified!',
                })
            }

            if (profile.data.tzprofiles.length === 0) { // No profile found
                return message.reply({
                    content: `I Can\'t find your tzprofiles account! Make sure you have one, and that your discord username is the same as your tzprofiles account. If you've recently changed your tzprofiles linked discord, try again in a few minutes. (Checked <@${author.id}>)`,
                })
            }
            
            if (status[0].value.flags.includes("verified")) {
                message.member.roles.add(verifiedRole)

                return message.reply({
                    content: `You have been verified! You can now use the !verify command to check your status again. (Checked <@${author.id}>)`,
                })
            }

            break
        case '!unlink':
            message.member.roles.remove(verifiedRole)

            return message.reply({
                content: `You have been unlinked from your versum account. You can use the !verify command to link your versum account again. (Checked <@${author.id}>)`,
            })

            break
        case '!help':
            let embed = new Discord.MessageEmbed()
                .setTitle('Versum\'s Little Helper')
                .setDescription('This bot is used to do cool stuff on this Discord server, it can link your versum profile, provide help, and quickly link information.')
                .addFields(
                    {
                        name: '!status',
                        value: 'Check your verification status.',
                    },
                    {
                        name: '!verify',
                        value: 'Link your versum account to your discord account.',
                    },
                    {
                        name: '!unlink',
                        value: 'Unlink your discord account from your versum account.',
                    },
                    {
                        name: '!help',
                        value: 'Display this message.',
                    }
                )
                .setColor('#0099ff')

                return message.reply({
                    embeds: [embed],
                })
            break
        default:
            return        
    }
})

client.login(process.env.TOKEN)