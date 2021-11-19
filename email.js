/**
 * A module for sending emails with nodemailer
 */

const fs = require('fs');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');

const TIMEOUT = 1000 * 5; /* Milliseconds (5 Seconds) */

/** @type {nodemailer.Transporter<SMTPTransport.SentMessageInfo>}*/
let transport = null;

const email = {

    /**
     * @param {string} name 
     * @param {string} host 
     * @param {number} port 
     * @returns True if initialization was successful, false otherwise
     */
    async initialize(name, host, port) {
        transport = nodemailer.createTransport({
            name: name,
            host: host,
            port: port,
            secure: false,
            greetingTimeout: TIMEOUT,
            connectionTimeout: TIMEOUT,
            socketTimeout: TIMEOUT
        });
        return await email.verify();
    },

    /**
     * Verifies that the email configuration is properly configured.
     * @returns True if email configuration is verified, false otherwise.
     */
    verify() {
        return new Promise((resolve, reject) => {
            transport.verify((error, success) => {
                if (error) reject(error);
                else resolve(success);
            });
        });
    },

    /**
     * Sends an email
     * @param {string} to Recipient email address
     * @param {string} from Sender email address (optionally prefixed with "<display name>") I.E. "NovaXpress Robot" robot@novaxpress.ca
     * @param {string} html HTML content to be rendered
     * @param {string} subject The subject line for the email
     * @param {object[]} attachments Nodemailer attachments {filename: content:}
     * @returns Nodemailer info object
     */
    send(to, from, html, subject = '', attachments = []) {
        return new Promise((resolve, reject) => {
            transport.sendMail({ to, from, subject, html, attachments }, (error, info) => {
                if (error) reject(error);
                else resolve(info);
            });
        });
    },

    render(viewFile, context) {
        const code = fs.readFileSync(viewFile, { encoding: 'utf-8' });
        const template = handlebars.compile(code);
        return template(context);
    },

    /**
     * Sends a rendered view email
     * @param {string} to Recipient email address
     * @param {string} from Sender email address (optionally prefixed with "<display name>") I.E. "NovaXpress Robot" robot@novaxpress.ca
     * @param {string} viewFile The file name of the view to rendered 
     * @param {object} context The rendering context for the view 
     * @param {string} subject The subject line for the email
     * @param {object[]} attachments Nodemailer attachments {filename: content:}
     * @returns Nodemailer info object
     */
    sendRendered(to, from, viewFile, context, subject = '', attachments = []) {
        return new Promise(async (resolve, reject) => {
            email.send(to, from, email.render(viewFile, context), subject, attachments).then(resolve).catch(reject);
        });
    }
};

module.exports = email;