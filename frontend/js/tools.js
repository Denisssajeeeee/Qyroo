/* =========================================
   DENN HOSTING - TOOLS JS
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const TIKWM_API_URL =
  "https://www.tikwm.com/api/";




/* =========================================
   QR CODE
========================================= */

let qrCode = null;
let currentQRText = "";


function generateQR() {

  if (!guardToolAccess("qrGenerator", "QR Code Generator")) {
    return;
  }

  const input =
    document.getElementById("qrText");

  if (!input) {
    return;
  }


  const text =
    input.value.trim();


  if (!text) {

    alert(
      "Masukkan teks atau URL terlebih dahulu."
    );

    return;

  }


  currentQRText =
    text;


  const result =
    document.getElementById("qrResult");


  if (!result) {
    return;
  }


  result.innerHTML =
    "";


  qrCode =
    new QRCode(
      result,
      {
        text: text,
        width: 220,
        height: 220,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel:
          QRCode.CorrectLevel.H
      }
    );


  const actions =
    document.getElementById(
      "qrActions"
    );


  if (actions) {

    actions.style.display =
      "flex";

  }

}


/* =========================================
   DOWNLOAD QR
========================================= */

function downloadQR() {

  const canvas =
    document.querySelector(
      "#qrResult canvas"
    );


  if (!canvas) {

    alert(
      "Generate QR Code terlebih dahulu."
    );

    return;

  }


  const link =
    document.createElement(
      "a"
    );


  link.download =
    "DennHosting-QRCode.png";


  link.href =
    canvas.toDataURL(
      "image/png"
    );


  link.click();

}


/* =========================================
   COPY QR TEXT
========================================= */

function copyQRText() {

  if (!currentQRText) {
    return;
  }


  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

    navigator.clipboard
      .writeText(
        currentQRText
      )
      .then(
        function () {

          alert(
            "Text berhasil disalin."
          );

        }
      )
      .catch(
        function () {

          alert(
            "Gagal menyalin text."
          );

        }
      );

  }

}


/* =========================================
   TIKTOK DOWNLOADER
========================================= */

async function downloadTikTok() {
  if (!guardToolAccess("tikTokDownloader", "TikTok Downloader")) return;
  const input=document.getElementById("tiktokUrl"), button=document.getElementById("tiktokButton"), loading=document.getElementById("tiktokLoading"), result=document.getElementById("tiktokResult"), error=document.getElementById("tiktokError");
  const url=input?.value.trim();
  if(!url)return showTikTokError("Masukkan link TikTok terlebih dahulu.");
  if(!/tiktok\.com/i.test(url))return showTikTokError("Link yang dimasukkan bukan link TikTok.");
  if(result)result.style.display="none"; if(error){error.style.display="none";error.textContent=""} if(loading)loading.style.display="block"; if(button){button.disabled=true;button.textContent="Mengambil data..."}
  try{
    const data=await QyrooAPI.api('/tools/tiktok?url='+encodeURIComponent(url));
    const parsed=data.data||{};
    if(!parsed.video&&!parsed.audio)throw new Error('Video tidak ditemukan dari TikWM.');
    showTikTokResult(parsed);
  }catch(e){console.error(e);showTikTokError(e.message||'TikTok downloader gagal.')}finally{if(loading)loading.style.display="none";if(button){button.disabled=false;button.textContent="Download TikTok"}}
}

async function downloadInstagram(){
  if (!guardToolAccess("instagramDownloader", "Instagram Downloader")) return;
  const input=document.getElementById('instagramUrl'),button=document.getElementById('instagramButton'),loading=document.getElementById('instagramLoading'),result=document.getElementById('instagramResult'),error=document.getElementById('instagramError');
  const url=input?.value.trim();
  if(!url)return showInstagramError('Masukkan link Instagram terlebih dahulu.');
  if(!/instagram\.com/i.test(url))return showInstagramError('Link yang dimasukkan bukan link Instagram.');
  if(result)result.style.display='none';if(error){error.style.display='none';error.textContent=''}if(loading)loading.style.display='block';if(button){button.disabled=true;button.textContent='Mengambil data...'}
  try{
    const data=await QyrooAPI.api('/tools/instagram?url='+encodeURIComponent(url));
    const p=data.data||{};
    const media=Array.isArray(p.media)?p.media:[];
    if(!p.video&&!p.image&&!media.length)throw new Error('Media Instagram tidak ditemukan.');
    showInstagramResult(p);
  }catch(e){console.error(e);showInstagramError(e.message||'Instagram downloader gagal.')}finally{if(loading)loading.style.display='none';if(button){button.disabled=false;button.textContent='Download Instagram'}}
}

function showInstagramResult(data){
  const result=document.getElementById('instagramResult');if(!result)return;
  const title=document.getElementById('instagramTitle'),thumb=document.getElementById('instagramThumbnail'),actions=document.getElementById('instagramActions');
  if(title)title.textContent=data.title||'Instagram Media';
  if(thumb){if(data.thumbnail){thumb.src=data.thumbnail;thumb.style.display='block'}else thumb.style.display='none'}
  const links=[]; if(data.video)links.push(`<a class="tool-button" href="${escapeAttr(data.video)}" target="_blank" rel="noopener noreferrer">Download Video</a>`); if(data.image)links.push(`<a class="tool-button" href="${escapeAttr(data.image)}" target="_blank" rel="noopener noreferrer">Download Foto</a>`);
  (data.media||[]).forEach((u,i)=>{if(!links.some(x=>x.includes(u)))links.push(`<a class="tool-small-btn" href="${escapeAttr(u)}" target="_blank" rel="noopener noreferrer">Media ${i+1}</a>`)});
  if(actions)actions.innerHTML=links.join(''); result.style.display='block';
}
function showInstagramError(msg){const e=document.getElementById('instagramError');if(e){e.textContent=msg;e.style.display='block'}const r=document.getElementById('instagramResult');if(r)r.style.display='none'}
function escapeAttr(v){return String(v||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

/* =========================================
   PARSE TIKTOK RESPONSE
========================================= */

function parseTikTokResponse(data) {
  const result = {
    video: null,
    audio: null,
    thumbnail: null,
    title: "TikTok Video",
    author: ""
  };

  const payload = data && data.data ? data.data : data;

  if (!payload) {
    return result;
  }

  if (typeof payload.title === "string") {
    result.title = payload.title;
  }

  if (typeof payload.cover === "string") {
    result.thumbnail = payload.cover;
  }

  if (typeof payload.origin_cover === "string") {
    result.thumbnail = payload.origin_cover;
  }

  if (typeof payload.author === "string") {
    result.author = payload.author;
  }

  if (payload.author && typeof payload.author === "object") {
    if (typeof payload.author.nickname === "string") {
      result.author = payload.author.nickname;
    }
  }

  if (typeof payload.play === "string") {
    result.video = payload.play;
  }

  if (typeof payload.hdplay === "string") {
    result.video = payload.hdplay;
  }

  if (typeof payload.wmplay === "string") {
    result.video = payload.wmplay;
  }

  if (typeof payload.music === "string") {
    result.audio = payload.music;
  }

  if (typeof payload.music_info === "object") {
    if (typeof payload.music_info.play === "string") {
      result.audio = payload.music_info.play;
    }
  }

  function scan(object) {
    if (!object || typeof object !== "object") {
      return;
    }

    if (Array.isArray(object)) {
      object.forEach(scan);
      return;
    }

    Object.keys(object).forEach((key) => {
      const value = object[key];
      const keyLower = key.toLowerCase();

      if (!result.thumbnail && typeof value === "string" && (keyLower.includes("cover") || keyLower.includes("thumbnail") || keyLower.includes("image")) && isImageUrl(value)) {
        result.thumbnail = value;
      }

      if (!result.video && typeof value === "string" && (keyLower.includes("play") || keyLower.includes("video") || keyLower.includes("download")) && isMediaUrl(value)) {
        result.video = value;
      }

      if (!result.audio && typeof value === "string" && (keyLower.includes("music") || keyLower.includes("audio")) && isMediaUrl(value)) {
        result.audio = value;
      }

      if (!result.author && typeof value === "string" && (keyLower.includes("nickname") || keyLower.includes("author") || keyLower.includes("username"))) {
        result.author = value;
      }

      if (!result.title && typeof value === "string" && (keyLower === "title" || keyLower === "desc" || keyLower === "description")) {
        result.title = value;
      }

      scan(value);
    });
  }

  scan(payload);
  return result;
}


/* =========================================
   MEDIA URL
========================================= */

function isMediaUrl(
  value
) {

  if (
    typeof value !==
    "string"
  ) {

    return false;

  }


  return (
    value.startsWith(
      "http://"
    ) ||
    value.startsWith(
      "https://"
    )
  );

}


/* =========================================
   IMAGE URL
========================================= */

function isImageUrl(
  value
) {

  if (
    typeof value !==
    "string"
  ) {

    return false;

  }


  const lower =
    value.toLowerCase();


  return (
    lower.includes(
      ".jpg"
    ) ||
    lower.includes(
      ".jpeg"
    ) ||
    lower.includes(
      ".png"
    ) ||
    lower.includes(
      ".webp"
    ) ||
    lower.includes(
      "image"
    ) ||
    lower.includes(
      "cover"
    )
  );

}


/* =========================================
   SHOW TIKTOK RESULT
========================================= */

function showTikTokResult(
  data
) {

  const result =
    document.getElementById(
      "tiktokResult"
    );


  const thumbnail =
    document.getElementById(
      "tiktokThumbnail"
    );


  const title =
    document.getElementById(
      "tiktokTitle"
    );


  const author =
    document.getElementById(
      "tiktokAuthor"
    );


  const video =
    document.getElementById(
      "tiktokVideo"
    );


  const audio =
    document.getElementById(
      "tiktokAudio"
    );


  if (!result) {
    return;
  }


  /* TITLE */

  if (title) {

    title.innerText =
      data.title ||
      "TikTok Video";

  }


  /* AUTHOR */

  if (author) {

    if (data.author) {

      author.innerText =
        "@" +
        data.author;

    } else {

      author.innerText =
        "";

    }

  }


  /* THUMBNAIL */

  if (
    thumbnail &&
    data.thumbnail
  ) {

    thumbnail.src =
      data.thumbnail;

    thumbnail.style.display =
      "block";

  } else if (thumbnail) {

    thumbnail.style.display =
      "none";

  }


  /* VIDEO */

  if (
    video &&
    data.video
  ) {

    video.href =
      data.video;

    video.style.display =
      "block";

  } else if (video) {

    video.style.display =
      "none";

  }


  /* AUDIO */

  if (
    audio &&
    data.audio
  ) {

    audio.href =
      data.audio;

    audio.style.display =
      "block";

  } else if (audio) {

    audio.style.display =
      "none";

  }


  result.style.display =
    "block";

}


/* =========================================
   TIKTOK ERROR
========================================= */

function showTikTokError(
  message
) {

  const error =
    document.getElementById(
      "tiktokError"
    );


  const result =
    document.getElementById(
      "tiktokResult"
    );


  const loading =
    document.getElementById(
      "tiktokLoading"
    );


  if (loading) {

    loading.style.display =
      "none";

  }


  if (result) {

    result.style.display =
      "none";

  }


  if (error) {

    error.innerText =
      message;

    error.style.display =
      "block";

  } else {

    alert(
      message
    );

  }

}


/* =========================================
   CREATE BASE BOT
========================================= */

function createBaseBot() {

  if (!guardToolAccess("createBaseBot", "Create Base Bot")) {
    return;
  }

  if (
    typeof JSZip ===
    "undefined"
  ) {

    alert(
      "Library JSZip belum dimuat."
    );

    return;

  }


  const zip =
    new JSZip();


  const indexJS = `const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");

async function startBot() {

  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const denn =
    makeWASocket({
      auth: state,
      logger: pino({
        level: "silent"
      }),
      printQRInTerminal: true
    });

  denn.ev.on(
    "creds.update",
    saveCreds
  );

  denn.ev.on(
    "connection.update",
    ({ connection, lastDisconnect }) => {

      if (connection === "open") {

        console.log(
          "Denn Bot berhasil terhubung."
        );

      }

      if (
        connection === "close"
      ) {

        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;

        if (shouldReconnect) {
          startBot();
        }

      }

    }
  );

  denn.ev.on(
    "messages.upsert",
    async ({ messages }) => {

      const msg =
        messages[0];

      if (!msg.message) {
        return;
      }

      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

      if (body === ".menu") {

        await denn.sendMessage(
          msg.key.remoteJid,
          {
            text:
              "╭───「 DENN BOT 」\\n" +
              "│\\n" +
              "│ .menu\\n" +
              "│ .ping\\n" +
              "│ .owner\\n" +
              "│\\n" +
              "╰────────────"
          }
        );

      }

      if (body === ".ping") {

        await denn.sendMessage(
          msg.key.remoteJid,
          {
            text: "Pong!"
          }
        );

      }

    }
  );

}

startBot();
`;


  const caseJS = `module.exports = {

  ping: async function (denn, jid) {

    await denn.sendMessage(
      jid,
      {
        text: "Pong!"
      }
    );

  },

  menu: async function (denn, jid) {

    await denn.sendMessage(
      jid,
      {
        text:
          "╭───「 DENN BOT 」\\\\n" +
          "│\\\\n" +
          "│ .menu\\\\n" +
          "│ .ping\\\\n" +
          "│ .owner\\\\n" +
          "│\\\\n" +
          "╰────────────"
      }
    );

  }

};
`;


  const configJS = `require("dotenv").config();

module.exports = {
  name: process.env.BOT_NAME || "DennBot",
  prefix: process.env.BOT_PREFIX || ".",
  ownerNumber: process.env.OWNER_NUMBER || "6281234567890",
  sessionPath: process.env.SESSION_PATH || "./session",
  timezone: process.env.TIMEZONE || "Asia/Jakarta",
  isProduction: process.env.NODE_ENV === "production"
};
`;


  const commandsJS = `const config = require("./config");

async function handleCommand(denn, msg, body) {
  const text = body.trim();

  if (!text.startsWith(config.prefix)) {
    return;
  }

  const command = text.slice(config.prefix.length).split(" ")[0].toLowerCase();
  const args = text.slice(config.prefix.length + command.length).trim();

  if (command === "menu") {
    await denn.sendMessage(msg.key.remoteJid, {
      text:
        "╭───「 DENN BOT 」\n" +
        "│\n" +
        "│ .menu\n" +
        "│ .ping\n" +
        "│ .owner\n" +
        "│ .status\n" +
        "│\n" +
        "╰────────────"
    });
    return;
  }

  if (command === "ping") {
    await denn.sendMessage(msg.key.remoteJid, { text: "Pong!" });
    return;
  }

  if (command === "owner") {
    await denn.sendMessage(msg.key.remoteJid, { text: "Owner: " + config.ownerNumber });
    return;
  }

  if (command === "status") {
    await denn.sendMessage(msg.key.remoteJid, { text: "Bot online • Prefix: " + config.prefix });
    return;
  }

  if (command === "say") {
    if (!args) {
      await denn.sendMessage(msg.key.remoteJid, { text: "Format: .say <teks>" });
      return;
    }

    await denn.sendMessage(msg.key.remoteJid, { text: args });
  }
}

module.exports = { handleCommand };
`;


  const envExample = `BOT_NAME=DennBot
BOT_PREFIX=.
OWNER_NUMBER=6281234567890
SESSION_PATH=./session
TIMEZONE=Asia/Jakarta
NODE_ENV=development
`;


  const gitignore = `node_modules
.env
session/
*.log
`;


  const packageJSON = `{
  "name": "denn-base-bot",
  "version": "1.0.0",
  "description": "Denn Hosting Base WhatsApp Bot",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "latest",
    "dotenv": "latest",
    "pino": "latest"
  }
}
`;


  const readme = `# Denn Hosting - Base Bot

Template bot WhatsApp dasar yang siap dikembangkan.

## Persiapan

1. Copy file .env.example menjadi .env
2. Ubah nilai sesuai kebutuhan
3. Jalankan:

npm install
npm start

## Struktur File

- index.js
- config.js
- commands.js
- .env.example
- README.md

## Catatan

Folder session akan otomatis dibuat untuk menyimpan autentikasi bot.
Jangan membagikan file session atau .env ke publik.
`;


  zip.file(
    "denn-base-bot/index.js",
    indexJS
  );


  zip.file(
    "denn-base-bot/config.js",
    configJS
  );


  zip.file(
    "denn-base-bot/commands.js",
    commandsJS
  );


  zip.file(
    "denn-base-bot/.env.example",
    envExample
  );


  zip.file(
    "denn-base-bot/.gitignore",
    gitignore
  );


  zip.file(
    "denn-base-bot/package.json",
    packageJSON
  );


  zip.file(
    "denn-base-bot/README.md",
    readme
  );


  zip.generateAsync({
    type: "blob"
  })
  .then(
    function(blob) {

      const link =
        document.createElement(
          "a"
        );


      link.href =
        URL.createObjectURL(
          blob
        );


      link.download =
        "denn-base-bot.zip";


      link.click();


      URL.revokeObjectURL(
        link.href
      );


      const botResult =
        document.getElementById(
          "botResult"
        );


      if (botResult) {

        botResult.classList.remove("hidden");
        botResult.innerHTML =
          '<span class="bot-result-text">✓ Base Bot berhasil dibuat.</span>';

      }

    }
  )
  .catch(
    function(error) {

      console.error(
        error
      );

      alert(
        "Gagal membuat Base Bot."
      );

    }
  );

}

