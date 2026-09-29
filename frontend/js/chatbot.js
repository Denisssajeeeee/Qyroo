/* QYROO FLOATING SUPPORT CHATBOT */
(function(){
  function reply(message){
    const t=String(message||'').trim().toLowerCase();
    if(!t) return 'Silakan tulis pertanyaanmu.';
    if(/halo|hai|hello|hi/.test(t)) return 'Halo! Saya Qyroo Support. Ada yang bisa saya bantu?';
    if(/produk|layanan|paket/.test(t)) return 'Kamu bisa melihat layanan yang tersedia di halaman Produk.';
    if(/harga|biaya|price/.test(t)) return 'Cek halaman Produk untuk harga dan detail paket terbaru.';
    if(/order|beli|pesan/.test(t)) return 'Pilih produk di halaman Produk, lalu ikuti proses pembelian yang tersedia.';
    if(/topup|saldo|isi saldo/.test(t)) return 'Untuk top up, buka menu Top Up dan ikuti petunjuk pembayaran serta upload bukti.';
    if(/kontak|admin|whatsapp|wa/.test(t)) return 'Untuk bantuan admin, gunakan kontak yang tercantum di halaman website.';
    if(/bantuan|help|cara/.test(t)) return 'Saya bisa membantu tentang produk, harga, order, top up, dan penggunaan website.';
    return 'Maaf, saya belum memahami pertanyaan itu. Coba tanyakan tentang produk, harga, order, top up, atau bantuan.';
  }
  function init(){
    if(document.getElementById('qyrooChatbotFab')) return;
    const fab=document.createElement('button'); fab.id='qyrooChatbotFab'; fab.className='qyroo-chatbot-fab'; fab.type='button'; fab.title='Tanya / Bantuan'; fab.setAttribute('aria-label','Buka bantuan'); fab.textContent='?';
    const panel=document.createElement('div'); panel.id='qyrooChatbotPanel'; panel.className='qyroo-chatbot-panel'; panel.innerHTML=`<div class="qyroo-chatbot-head"><div><strong>Qyroo Support</strong><small>Tanya jawab & bantuan</small></div><button class="qyroo-chatbot-close" type="button" aria-label="Tutup">×</button></div><div class="qyroo-chatbot-messages" id="qyrooChatMessages"><div class="qyroo-chat-msg bot">Halo! Saya Qyroo Support. Ada yang bisa saya bantu?</div></div><div class="qyroo-chat-suggestions"><button type="button" data-q="Apa saja produknya?">Produk</button><button type="button" data-q="Cara order?">Order</button><button type="button" data-q="Cara top up?">Top Up</button><button type="button" data-q="Kontak admin">Admin</button></div><form class="qyroo-chat-form" id="qyrooChatForm"><input id="qyrooChatInput" autocomplete="off" placeholder="Tulis pertanyaan..."><button type="submit">Kirim</button></form>`;
    document.body.append(fab,panel);
    const messages=panel.querySelector('#qyrooChatMessages'), input=panel.querySelector('#qyrooChatInput');
    function send(text){text=String(text||'').trim();if(!text)return; const u=document.createElement('div');u.className='qyroo-chat-msg user';u.textContent=text;messages.appendChild(u);input.value='';setTimeout(()=>{const b=document.createElement('div');b.className='qyroo-chat-msg bot';b.textContent=reply(text);messages.appendChild(b);messages.scrollTop=messages.scrollHeight;},180);messages.scrollTop=messages.scrollHeight;}
    fab.onclick=()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))input.focus();}; panel.querySelector('.qyroo-chatbot-close').onclick=()=>panel.classList.remove('open');
    panel.querySelector('#qyrooChatForm').onsubmit=e=>{e.preventDefault();send(input.value);};
    panel.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>send(b.dataset.q));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
