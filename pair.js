const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const zlib = require('zlib');
let router = express.Router();
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function GetPairingCode() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                // Use Ubuntu/Chrome for better server compatibility
                browser: Browsers.ubuntu("Chrome"), 
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                
                // Request the official code from WhatsApp
                const code = await sock.requestPairingCode(num);
                
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                
                if (connection === 'open') {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    
                    // --- BWM-XMD Encryption ---
                    let compressed = zlib.gzipSync(data);
                    let b64data = compressed.toString('base64');
                    let session = await sock.sendMessage(sock.user.id, { text: 'BWM-XMD;;;' + b64data });
                    // --------------------------

                    let msg = `
╔════════════════════◇
║『 SESSION CONNECTED 』
║ ✅ Code: ${code}
║ ✨ Arslan-MD Connected
╚════════════════════╝`;

                    await sock.sendMessage(sock.user.id, { text: msg }, { quoted: session });
                    
                    await delay(2000);
                    await sock.ws.close();
                    return await removeFile('./temp/' + id);
                } 
                else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(2000);
                    GetPairingCode();
                }
            });
        } catch (err) {
            console.log('Error:', err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Unavailable' });
            }
        }
    }
    
    return await GetPairingCode();
});

module.exports = router;
