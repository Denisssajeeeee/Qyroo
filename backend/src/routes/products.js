const express=require('express');
const {admin}=require('../firebase');
const {requireAuth,requireAdmin}=require('../auth');
const {money,safeText,timestampValue}=require('../helpers');
const router=express.Router(); const db=()=>admin.firestore();
const categories=['Hosting','Game','Layanan'];

function cleanProduct(body,id){
  const price=money(body.price);
  return {id:id||undefined,name:safeText(body.name,120),price,description:safeText(body.description,500),category:categories.includes(body.category)?body.category:'Layanan',icon:safeText(body.icon,10)||'◆',promo:safeText(body.promo,60)||'Promo',discount:safeText(body.discount,80)||'',active:body.active!==false,updatedAt:admin.firestore.FieldValue.serverTimestamp()};
}

router.get('/',requireAuth,async(req,res)=>{
  try{
    const snap=await db().collection('products').get();
    const userFav=await db().collection('users').doc(req.user.uid).collection('favorites').get();
    const fav=new Set(userFav.docs.map(d=>d.id));
    let products=snap.docs.map(d=>({id:d.id,...d.data(),favorite:fav.has(d.id)})).filter(x=>x.active!==false);
    const sort=String(req.query.sort||'newest');
    if(sort==='name_asc') products.sort((a,b)=>String(a.name).localeCompare(String(b.name)));
    else if(sort==='price_asc') products.sort((a,b)=>money(a.price)-money(b.price));
    else if(sort==='price_desc') products.sort((a,b)=>money(b.price)-money(a.price));
    else if(sort==='favorite') products.sort((a,b)=>Number(b.favorite)-Number(a.favorite));
    else products.sort((a,b)=>timestampValue(b.createdAt)-timestampValue(a.createdAt));
    res.json({ok:true,products});
  }catch(e){console.error(e);res.status(500).json({ok:false,error:'Gagal mengambil produk'});}
});

router.get('/admin',requireAuth,requireAdmin,async(req,res)=>{
  try{const snap=await db().collection('products').get();const products=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>timestampValue(b.createdAt)-timestampValue(a.createdAt));res.json({ok:true,products});}
  catch(e){console.error(e);res.status(500).json({ok:false,error:'Gagal mengambil produk admin'});}
});

router.post('/',requireAuth,requireAdmin,async(req,res)=>{
  try{
    const data=cleanProduct(req.body);
    if(!data.name)return res.status(400).json({ok:false,error:'Nama produk wajib diisi'});
    if(data.price<0)return res.status(400).json({ok:false,error:'Harga tidak valid'});
    const ref=db().collection('products').doc(); data.id=ref.id; data.createdAt=admin.firestore.FieldValue.serverTimestamp(); await ref.set(data);
    res.status(201).json({ok:true,product:{...data,id:ref.id,createdAt:null}});
  }catch(e){console.error(e);res.status(500).json({ok:false,error:'Gagal menambahkan produk'});}
});

router.patch('/:id',requireAuth,requireAdmin,async(req,res)=>{
  try{const ref=db().collection('products').doc(req.params.id);const snap=await ref.get();if(!snap.exists)return res.status(404).json({ok:false,error:'Produk tidak ditemukan'});const data=cleanProduct(req.body,req.params.id);delete data.createdAt;await ref.set(data,{merge:true});res.json({ok:true,message:'Produk diperbarui'});}
  catch(e){console.error(e);res.status(500).json({ok:false,error:'Gagal memperbarui produk'});}
});

router.delete('/:id',requireAuth,requireAdmin,async(req,res)=>{try{await db().collection('products').doc(req.params.id).delete();res.json({ok:true,message:'Produk dihapus'});}catch(e){console.error(e);res.status(500).json({ok:false,error:'Gagal menghapus produk'});}});

router.post('/:id/favorite',requireAuth,async(req,res)=>{
  try{const product=await db().collection('products').doc(req.params.id).get();if(!product.exists)return res.status(404).json({ok:false,error:'Produk tidak ditemukan'});const ref=db().collection('users').doc(req.user.uid).collection('favorites').doc(req.params.id);const current=await ref.get();if(current.exists){await ref.delete();return res.json({ok:true,favorite:false});}await ref.set({productId:req.params.id,createdAt:admin.firestore.FieldValue.serverTimestamp()});res.json({ok:true,favorite:true});}
  catch(e){console.error(e);res.status(500).json({ok:false,error:'Gagal mengubah favorit'});}
});
module.exports=router;
