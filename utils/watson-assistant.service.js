const AssistantV2 = require('ibm-watson/assistant/v2')
const { IamAuthenticator } = require('ibm-watson/auth')
const dotenv = require('dotenv')
dotenv.config()
assistant = new AssistantV2({
    version: '2020-09-24',
    authenticator: new IamAuthenticator({
        apikey: process.env.IBM_API_KEY
    }),
    serviceurl: process.env.IBM_SERVICE_URL
})

class WatsonAssistantService {

    createSession() {
        const sessionId = assistant.createSession({
            assistantId: process.env.IBM_ASSISTANT_ID
        }).then( res => {
                return res.result
            }).catch( err => {
                console.log(err)
            })
        return sessionId
    }

    deleteSession(sessionId) {
        assistant.deleteSession({
            assistantId: process.env.IBM_ASSISTANT_ID,
            sessionId: sessionId
        }).catch(err => {
            console.log(err)
        })
    }

    sendMessage(message, sessionId) {
        return assistant.message({
            assistantId: process.env.IBM_ASSISTANT_ID,
            sessionId: sessionId,
            input: {
                message_type: 'text',
                text: message
            }
        }).then(res => {
            return res.result
        }).catch ( err => {
            console.log(err)
        })
    }
}

module.exports = WatsonAssistantService