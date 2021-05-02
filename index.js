const dotenv = require('dotenv')
dotenv.config()
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const WatsonAssistantService = require('./utils/watson-assistant.service')
const watsonAssistantService = new WatsonAssistantService()

const startMessage = "Vamos lá. Me diga qual é a sua dúvida"
const helpMessage = "Sou simples de usar.\nBasta digitar o comando /start e começar a tirar suas dúvidas"
const sorryMessage = "Sorry..."
const settingsMessage = "Settings..."

const chatOn = {}

bot.command('quit', (ctx) => {
    ctx.leaveChat()
})

bot.command('end', (ctx) => {
    watsonAssistantService.deleteSession(chatOn[ctx.message.chat.id])
    delete chatOn[ctx.message.chat.id]
    ctx.reply("Até a próxima dúvida!")
})

bot.start(async (ctx) => {
    if(chatOn[ctx.message.chat.id]) {
        ctx.reply("Deseja reiniciar a sessão?")
    } else {
        const idSession = await watsonAssistantService.createSession()
        chatOn[ctx.message.chat.id] = idSession.session_id
        ctx.reply(startMessage)
    }
    console.log(chatOn)
})

bot.help((ctx) => {
    ctx.reply(helpMessage)
})

bot.on('text', async (ctx) => {
    if(chatOn[ctx.message.chat.id]) {
        const response = await watsonAssistantService.sendMessage(ctx.message.text, chatOn[ctx.message.chat.id])
        try{
            ctx.reply(response.output.generic[0].text)
        }catch{
            ctx.reply("bip bop\n Algo deu errado. Tente novamente mais tarde!")
        }
    } else {
        ctx.reply(helpMessage)
    }
})


bot.launch()

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))