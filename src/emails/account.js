const mailer = require('@sendgrid/mail');

const {SENDGRID_API_KEY} = process.env;

mailer.setApiKey(SENDGRID_API_KEY);

const sendWelcomeEmail = ({name, email}) => {
    mailer.send({
        from: email,
        to: 'contact@dimitrilahaye.net',
        subject: 'Welcome to the task manager',
        text: `Welcome to the task manager ${name}. Hope you'll have fun there :)`
    })
}

const sendGoodbyeEmail = ({name, email}) => {
    mailer.send({
        from: email,
        to: 'contact@dimitrilahaye.net',
        subject: 'Sad to see you go away',
        text: `Goodbye ${name}. See you in another life :'(`
    })
}

module.exports = { sendWelcomeEmail, sendGoodbyeEmail };