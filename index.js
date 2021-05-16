const dotenv = require('dotenv')
dotenv.config()
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const WatsonAssistantService = require('./utils/watson-assistant.service')
const watsonAssistantService = new WatsonAssistantService()

const messages = {
    start: "Vamos lá. Me diga qual é a sua dúvida",
    end: "Até a próxima dúvida!",
    help: "Sou simples de usar.\nBasta digitar o comando /start e começar a tirar suas dúvidas",
    sorry: "Sorry...",
    settings: "Settings...",
    noRestart: "Prosseguindo... De onde paramos?",
    genericError: "bip bop\n Algo deu errado. Tente novamente mais tarde!",
    restart: "Quer reiniciar a sessão?"
}

const chatOn = {}

const inlineKeyboardSimNao = {
    reply_markup: {
        inline_keyboard: [
            [{
                text: "Sim",
                callback_data: 'sim'
            },
            {
                text: "Não",
                callback_data: 'nao'
            }],
        ]
    }
}

async function startSession(id) {
    const idSession = await watsonAssistantService.createSession()
    chatOn[id] = idSession.session_id
}

bot.command('quit', (ctx) => {
    ctx.leaveChat()
})

bot.command('end', (ctx) => {
    watsonAssistantService.deleteSession(chatOn[ctx.message.chat.id])
    delete chatOn[ctx.message.chat.id]
    ctx.reply(messages.end)
})

bot.start(async (ctx) => {
    if(chatOn[ctx.message.chat.id]) {
        bot.telegram.sendMessage(ctx.chat.id, messages.restart, inlineKeyboardSimNao)
    } else {
        await startSession(ctx.chat.id)
        ctx.reply(messages.start)
    }
})

bot.action('sim', async ctx => {
    await startSession(ctx.from.id)
    ctx.reply(messages.start)
})

bot.action('nao', ctx => {
    ctx.reply(messages.noRestart)
})

bot.help((ctx) => {
    ctx.reply(messages.help)
})

bot.on('text', async (ctx) => {
    if(chatOn[ctx.message.chat.id]) {
        const response = await watsonAssistantService.sendMessage(ctx.message.text, chatOn[ctx.message.chat.id])
        try{
            ctx.reply(response.output.generic[0].text)
        }catch{
            ctx.reply(messages.genericError)
        }
    } else {
        ctx.reply(messages.help)
    }
})

bot.launch()

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))