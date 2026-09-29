require('dotenv').config({path:require('path').join(__dirname,'..','.env')});
const path=require('path');const express=require('express');const cors=require('cors');const helmet=require('helmet');const morgan=require('morgan');const {initFirebase}=require('./firebase');initFirebase();
const app=express();const PORT=Number(process.env.PORT||3000);const FRONTEND=path.join(__dirname,'..','..','frontend');
app.use(helmet({crossOriginResourcePolicy:false}));app.use(cors({origin:true,credentials:false}));app.use(express.json({limit:'1mb'}));app.use(morgan('tiny'));
app.get('/api/health',(req,res)=>res.json({ok:true,service:'Qyroo Backend',version:'2.0.0',time:new Date().toISOString()}));
app.use('/api/users',require('./routes/users'));app.use('/api/products',require('./routes/products'));app.use('/api/settings',require('./routes/settings'));app.use('/api/tools',require('./routes/tools'));app.use('/api/topups',require('./routes/topup'));
app.use('/server', (req,res)=>res.status(404).json({ok:false,error:'Not found'}));
app.use(express.static(FRONTEND,{dotfiles:'deny'}));app.get('*',(req,res)=>{if(req.path.startsWith('/api/'))return res.status(404).json({ok:false,error:'Endpoint tidak ditemukan'});res.sendFile(path.join(FRONTEND,'index.html'));});
app.use((err,req,res,next)=>{console.error('SERVER:',err);res.status(500).json({ok:false,error:'Internal server error'});});
async function seedProducts(){
  const db=require('./firebase').admin.firestore();
  const snap=await db.collection('products').limit(1).get();
  if(!snap.empty)return;
  const items=[
    {name:'Panel Pterodactyl',price:30000,description:'Hosting untuk menjalankan bot WhatsApp dan berbagai project.',category:'Hosting',icon:'🤖',promo:'Promo',discount:'',active:true},
    {name:'Top Up Game',price:15000,description:'Layanan top up game sesuai pilihan.',category:'Game',icon:'🎮',promo:'Promo',discount:'',active:true},
    {name:'Web Hosting',price:50000,description:'Hosting untuk website dan project web pribadi.',category:'Hosting',icon:'🌐',promo:'Promo',discount:'',active:true}
  ];
  const batch=db.batch();items.forEach(item=>{const ref=db.collection('products').doc();batch.set(ref,{...item,id:ref.id,createdAt:require('./firebase').admin.firestore.FieldValue.serverTimestamp(),updatedAt:require('./firebase').admin.firestore.FieldValue.serverTimestamp()})});await batch.commit();
}
seedProducts().catch(e=>console.error('SEED PRODUCTS:',e.message));
app.listen(PORT,()=>console.log(`Qyroo v2 berjalan di http://localhost:${PORT}`));
