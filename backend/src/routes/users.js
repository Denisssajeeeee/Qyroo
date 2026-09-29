const express = require('express');
const { admin } = require('../firebase');
const { requireAuth, requireAdmin } = require('../auth');
const { safeText } = require('../helpers');
const router = express.Router();
const db = () => admin.firestore();

async function ensureUser(decoded) {
  const ref = db().collection('users').doc(decoded.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    const data = {
      uid: decoded.uid,
      email: String(decoded.email || '').toLowerCase(),
      name: decoded.name || String(decoded.email || '').split('@')[0] || 'User',
      role: 'Free',
      active: true,
      balance: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await ref.set(data);
    return {...data, createdAt:null, updatedAt:null};
  }
  await ref.set({email:String(decoded.email||'').toLowerCase(),updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
  return snap.data();
}

router.post('/sync', requireAuth, async (req,res)=>{
  try { res.json({ok:true,user:await ensureUser(req.user)}); }
  catch(e){ console.error(e); res.status(500).json({ok:false,error:'Gagal sinkronisasi user'}); }
});

router.get('/me', requireAuth, async (req,res)=>{
  try { const user=await ensureUser(req.user); res.json({ok:true,user,isAdmin:await isAdmin(req)}); }
  catch(e){ console.error(e); res.status(500).json({ok:false,error:'Gagal mengambil data user'}); }
});

async function isAdmin(req) {
  const uid=String(process.env.ADMIN_UID||'').trim();
  const email=String(process.env.ADMIN_EMAIL||'admin@gmail.com').trim().toLowerCase();
  return (uid && req.user.uid===uid) || (email && String(req.user.email||'').toLowerCase()===email);
}

router.get('/admin/list', requireAuth, requireAdmin, async (req,res)=>{
  try {
    const snap=await db().collection('users').get();
    const users=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(a.email||'').localeCompare(String(b.email||'')));
    res.json({ok:true,totalUsers:users.length,users});
  } catch(e){console.error(e);res.status(500).json({ok:false,error:'Gagal mengambil daftar user'});}
});

router.patch('/admin/:uid/role', requireAuth, requireAdmin, async (req,res)=>{
  try {
    const uid=req.params.uid, role=safeText(req.body.role,40);
    const roles=['Free','Premium','VIP','Pro','Admin'];
    if(!roles.includes(role)) return res.status(400).json({ok:false,error:'Role tidak valid'});
    if(uid===req.user.uid && role!=='Admin') return res.status(400).json({ok:false,error:'Role admin aktif tidak boleh diturunkan dari panel ini'});
    const target=await admin.auth().getUser(uid);
    const targetEmail=String(target.email||'').toLowerCase();
    if(targetEmail===String(process.env.ADMIN_EMAIL||'admin@gmail.com').toLowerCase() && role!=='Admin') return res.status(400).json({ok:false,error:'Akun admin utama harus tetap Admin'});
    await db().collection('users').doc(uid).set({uid,email:targetEmail,role,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
    res.json({ok:true,message:`Role ${targetEmail} diubah menjadi ${role}`,role});
  } catch(e){console.error(e);res.status(500).json({ok:false,error:'Gagal mengubah role user'});}
});

router.patch('/admin/:uid/status', requireAuth, requireAdmin, async (req,res)=>{
  try {
    const active=Boolean(req.body.active);
    if(req.params.uid===req.user.uid && !active) return res.status(400).json({ok:false,error:'Admin yang sedang login tidak dapat dinonaktifkan'});
    await db().collection('users').doc(req.params.uid).set({active,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
    res.json({ok:true,active});
  } catch(e){console.error(e);res.status(500).json({ok:false,error:'Gagal mengubah status user'});}
});

router.delete('/admin/:uid', requireAuth, requireAdmin, async (req,res)=>{
  try {
    if(req.params.uid===req.user.uid) return res.status(400).json({ok:false,error:'Admin yang sedang login tidak dapat dihapus'});
    const target=await admin.auth().getUser(req.params.uid);
    const email=String(target.email||'').toLowerCase();
    if(email===String(process.env.ADMIN_EMAIL||'admin@gmail.com').toLowerCase()) return res.status(400).json({ok:false,error:'Admin utama tidak dapat dihapus'});
    await admin.auth().deleteUser(req.params.uid);
    await db().collection('users').doc(req.params.uid).delete();
    res.json({ok:true,message:`User ${email} dihapus`});
  } catch(e){console.error(e);res.status(500).json({ok:false,error:'Gagal menghapus user'});}
});

module.exports=router;
