const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const postRoutes = require("./routes/posts");
const convertRoutes = require("./routes/convert")

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();

//Using EJS for views
app.set("view engine", "ejs");

//Static Folder
app.use(express.static("public"));

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/post", postRoutes);
app.use("/convert", convertRoutes);


//Server Running
app.listen(process.env.PORT, () => {
  console.log("Server is running, you better catch it!");
});




const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const pdf2json = require("./middleware/pdf2json");
const Anthropic = require('@anthropic-ai/sdk')
const { toFile } = require('@anthropic-ai/sdk')

require("dotenv").config({ path: "./config/.env" })


// Note: The 'gmail.readonly' scope is sufficient for listing/getting messages and attachments.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// --- Helper Functions (From Quickstart) ---

async function loadSavedCredentialsIfExist() {
    // ... (authorization helper function remains the same) ...
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

async function saveCredentials(client) {
    // ... (authorization helper function remains the same) ...
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

// --- NEW Core Functions for Attachments ---

/**
 * Lists messages matching the PDF filter.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of message resources (IDs only).
 */
async function listPdfMessages(auth) {
    const gmail = google.gmail({ version: 'v1', auth });

    // Gmail search query: has:attachment AND filename:pdf
    const query = 'has:attachment filename:pdf';

    console.log(`\n--- Searching for messages with PDF attachments (query: "${query}") ---`);

    try {
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 5, // Limit to 5 for testing
        });

        const messages = res.data.messages || [];

        if (messages.length === 0) {
            console.log('No messages with PDF attachments found.');
            return [];
        }

        console.log(`Found ${messages.length} messages. Processing...`);
        return messages;

    } catch (err) {
        console.error('Error listing messages:', err);
        return [];
    }
}

/**
 * Gets the full message content and identifies the PDF attachment part.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} messageId The ID of the message.
 * @returns {Promise<Object|null>} The message part containing the PDF, or null.
 */
async function getFullMessage(auth, messageId) {
    const gmail = google.gmail({ version: 'v1', auth });

    try {
        const res = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full', // Important: must fetch 'full' to get payload parts
        });

        // Recursively search the message parts for the PDF
        const findPdfPart = (parts) => {
            if (!parts) return null;
            for (const part of parts) {
                // Check if it's a PDF attachment
                if (part.mimeType === 'application/pdf' && part.filename) {
                    return part;
                }
                // Recursively check nested parts (e.g., multipart/mixed)
                const foundInNested = findPdfPart(part.parts);
                if (foundInNested) return foundInNested;
            }
            return null;
        };

        return findPdfPart(res.data.payload.parts);

    } catch (err) {
        console.error(`Error getting message ${messageId}:`, err.message);
        return null;
    }
}

/**
 * Downloads the attachment data and saves it as a file.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} messageId The ID of the message.
 * @param {Object} attachmentPart The message part containing the PDF information.
 */
let hasInbox
async function downloadPdfAttachment(auth, messageId, attachmentPart) {
    const gmail = google.gmail({ version: 'v1', auth });

    // Check if the attachment data is inline or requires a separate API call
    const attachmentId = attachmentPart.body.attachmentId;
    const filename = attachmentPart.filename;

    if (!attachmentId) {
        console.log(`  Skipping: PDF "${filename}" in message ${messageId} is too large or inline to download easily via this method.`);
        return;
    }

    try {
        const res = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: messageId,
            id: attachmentId,
        });

        // The data is Base64 URL-safe encoded
        const fileData = res.data.data;
        const buffer = Buffer.from(fileData, 'base64');

        const savePath = path.join(process.cwd(), 'downloads', filename);
        await fs.writeFile(savePath, buffer);

        console.log(`  ✅ Successfully downloaded PDF: ${filename} to ${savePath}`);
        hasInbox = true
    } catch (err) {
        console.error(`  ❌ Error downloading attachment ${filename} from message ${messageId}:`, err.message);
    }
}


// --- Main Execution Logic ---

async function gmailRead() {
    try {
        const authClient = await authorize();
        console.log('Authorization successful.');

        // 1. Create a downloads directory if it doesn't exist
        const downloadsDir = path.join(process.cwd(), 'downloads');
        await fs.mkdir(downloadsDir, { recursive: true });
        console.log(`Created download directory at: ${downloadsDir}`);

        // 2. List all messages containing a PDF attachment
        const messages = await listPdfMessages(authClient);

        // 3. Process each message to find and download the PDF
        for (const msg of messages) {
            console.log(`\n--> Checking Message ID: ${msg.id}`);
            const pdfPart = await getFullMessage(authClient, msg.id);

            if (pdfPart) {
                console.log(`  Found PDF: ${pdfPart.filename}`);
                await downloadPdfAttachment(authClient, msg.id, pdfPart);
            } else {
                console.log('  No PDF attachment found in message payload (might be due to MIME structure or not being a direct PDF attachment).');
            }
        }
        console.log('\n--- PDF Download process complete. ---');

    } catch (error) {
        console.error('An error occurred during execution:', error);
    }
}

gmailRead()


if(!hasInbox) return
async function getPdf() {
    try {
        convertPdf('./downloads/resume.pdf')
    }
    catch (err) {
        console.error(err)
    }
}

getPdf()

// with claude file

// let file
// async function fileRead() {
//     const anthropic = new Anthropic({
//         apiKey: process.env.API_KEY_CLAUDE
//     });

//     await anthropic.beta.files.upload({
//         file: await toFile(fs.createReadStream('./downloads/resume.pdf'), undefined, { type: 'application/pdf' })
//     }, {
//         betas: ['files-api-2025-04-14']
//     }).then(res => file = res.id)

//     const response = await anthropic.beta.messages.create({
//         model: "claude-sonnet-4-5",
//         max_tokens: 1024,
//         messages: [
//         {
//             role: "user",
//             content: [
//                 {
//                     type: "text",
//                     text: "Please summarize this document for me."
//                 },
//                 {
//                     type: "document",
//                     source: {
//                         type: "file",
//                         file_id: `${file}`
//                     }
//                 }
//             ]
//         }
//     ],
//         betas: ["files-api-2025-04-14"],
//     });

// console.log(response);
// }

fileRead()




//old method

// class ClaudeAPIClient {
//     constructor() {
//         this.anthropic = new Anthropic({
//             apiKey: process.env.API_KEY_CLAUDE,
//         });
//     }

//     async simpleChat(message, model = 'claude-sonnet-4-20250514') {
//         try {
//             const response = await this.anthropic.messages.create({
//                 model: model,
//                 max_tokens: 1000,
//                 temperature: 0.7,
//                 messages: [
//                     { role: 'user', content: message }
//                 ]
//             });
//             return response.content[0].text;
//         } catch (error) {
//             console.error('Claude API Error:', error);
//             return `Error: ${error.message}`;
//         }
//     }
// }


// async function grabJson() {

//     fs.readFile('./downloads/convertedPDFs/output.json', 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading file:', err);
//             return;
//         }
//         console.log('File contents:', data, 'done!');
//         const claude = new ClaudeAPIClient();

//         claude.simpleChat(`Hello. You are a model that scans PDF documents and returns yes or no if it is an invoice or if it is not an invoice. Please read the following document, which is a PDF converted to JSON format. Return yes if it is an invoice and no if it is not an invoice. Then, Please let me know if you are able to read this output format or if you would prefer the format to be a txt file. Let me know wether a pdf converted to json, txt, or the raw pdf file would be easier for you to understand. Document:${data}`).then(response => console.log(response))
//     });
// }

// grabJson()



// async function claudeRun() {
//     const anthropic = new Anthropic({
//         apiKey: process.env.ANTHROPIC_API_KEY
//     });

//     const msg = await anthropic.messages.create({
//         model: "claude-haiku-4-5",
//         max_tokens: 1000,
//         messages: [
//             {
//                 role: "user",
//                 content: "can you read this PDF and tell me what it is?"
//             }
//         ]
//     });
//     console.log(msg);
// }

// claudeRun().catch(console.error);