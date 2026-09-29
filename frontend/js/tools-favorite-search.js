/* =========================================
   QYROO 2026 - TOOLS SEARCH & FAVORITES
   Works alongside the existing tools.js
========================================= */
(function(){
  "use strict";
  const KEY="qyroo_tools_favorites_v1";
  let filter="all", query="";

  function getFavs(){
    try{
      const v=JSON.parse(localStorage.getItem(KEY)||"[]");
      return Array.isArray(v)?v:[];
    }catch(e){return []}
  }
  function saveFavs(v){localStorage.setItem(KEY,JSON.stringify(v));}
  function cards(){return Array.from(document.querySelectorAll(".tools-grid .tool-card"));}
  function idFor(card,i){
    if(!card.dataset.qyrooToolId){
      const title=card.querySelector(".tool-title, h2, h3, h4");
      const base=(card.dataset.toolId||(title?title.textContent:"tool-"+i)).trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      card.dataset.qyrooToolId=base||("tool-"+i);
    }
    return card.dataset.qyrooToolId;
  }
  function updateButtons(){
    const favs=getFavs();
    cards().forEach((card,i)=>{
      const id=idFor(card,i), btn=card.querySelector(".tool-favorite-btn");
      if(!btn)return;
      const active=favs.includes(id);
      btn.classList.toggle("is-favorite",active);
      btn.textContent=active?"★":"☆";
      btn.title=active?"Hapus dari favorit":"Tambah ke favorit";
      btn.setAttribute("aria-label",btn.title);
    });
  }
  function toggle(id){
    const favs=getFavs(), pos=favs.indexOf(id);
    if(pos>=0)favs.splice(pos,1); else favs.push(id);
    saveFavs(favs); updateButtons(); apply();
  }
  function addButtons(){
    cards().forEach((card,i)=>{
      const id=idFor(card,i);
      if(card.querySelector(".tool-favorite-btn"))return;
      if(getComputedStyle(card).position==="static")card.style.position="relative";
      const btn=document.createElement("button");
      btn.type="button"; btn.className="tool-favorite-btn"; btn.dataset.favoriteId=id;
      btn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();toggle(id);});
      card.appendChild(btn);
    });
    updateButtons();
  }
  function apply(){
    const favs=getFavs(); let visible=0;
    cards().forEach((card,i)=>{
      const text=(card.innerText||"").toLowerCase();
      const id=idFor(card,i);
      const okSearch=!query||text.includes(query);
      const okFilter=filter!=="favorite"||favs.includes(id);
      const show=okSearch&&okFilter;
      card.hidden=!show;
      if(show)visible++;
    });
    const empty=document.getElementById("toolsNoResult");
    if(empty)empty.style.display=visible?"none":"block";
  }
  function init(){
    addButtons();
    const input=document.getElementById("toolsSearch"), clear=document.getElementById("clearToolsSearch");
    if(input){input.addEventListener("input",()=>{query=input.value.trim().toLowerCase();if(clear)clear.style.display=query?"block":"none";apply();});}
    if(clear)clear.addEventListener("click",()=>{input.value="";query="";clear.style.display="none";input.focus();apply();});
    document.querySelectorAll("[data-tools-filter]").forEach(btn=>btn.addEventListener("click",()=>{
      filter=btn.dataset.toolsFilter||"all";
      document.querySelectorAll("[data-tools-filter]").forEach(x=>x.classList.toggle("active",x===btn));
      apply();
    }));
    apply();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.QyrooToolsFavorites={get:getFavs,clear:()=>{saveFavs([]);updateButtons();apply();}};
})();
