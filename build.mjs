// Usage: node build.mjs  — scans images/, optimises, renders ./dist
import fs from 'fs';import path from 'path';
const R=(f)=>JSON.parse(fs.readFileSync(f,'utf8')),S=R('data/site.json');
let P=R('data/catalog.json');
// 1. add any new images in /images as editable entries
const known=new Set(P.flatMap(p=>[p.image,...p.images]));let n=P.length;
for(const f of fs.readdirSync('images').filter(f=>/\.(jpe?g|png|webp)$/i.test(f)&&!known.has(f)).sort()){n++;const id='d'+String(n).padStart(3,'0');
 P.push({id,slug:'design-'+String(n).padStart(3,'0'),name:'Design '+String(n).padStart(3,'0'),image:f,images:[],collection:S.collections[0].slug,tags:[],description:'',price:null,comparePrice:null,featured:false,isNew:true,active:true});}
fs.writeFileSync('data/catalog.json',JSON.stringify(P,null,1));
P=P.filter(p=>p.active!==false);
const D='dist';fs.rmSync(D,{recursive:true,force:true});fs.mkdirSync(D+'/img',{recursive:true});
// 2. thumbnails (400w) + large (1200w) webp; falls back to copying originals if sharp is missing
let sharp;try{sharp=(await import('sharp')).default}catch{console.warn('sharp missing: run npm i sharp for webp thumbnails')}
for(const p of P)for(const f of [p.image,...p.images]){const b=path.parse(f).name;
 if(sharp){await sharp('images/'+f).rotate().resize(420).webp({quality:78}).toFile(`${D}/img/${b}-s.webp`);await sharp('images/'+f).rotate().resize(1200,null,{withoutEnlargement:true}).webp({quality:85}).toFile(`${D}/img/${b}-l.webp`);}
 else{fs.copyFileSync('images/'+f,`${D}/img/${b}-s.webp`);fs.copyFileSync('images/'+f,`${D}/img/${b}-l.webp`);}}
const th=(f,s='s')=>`img/${path.parse(f).name}-${s}.webp`;
const e=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cname=c=>S.collections.find(x=>x.slug===c)?.title||c;
const price=p=>p.price!=null?`<span class=pr>₹${p.price}${p.comparePrice?` <s>₹${p.comparePrice}</s>`:''}</span>`:'';
const card=(p,b)=>`<a class=card href="${b}product/${p.slug}/"><span class=im><img src="${b}${th(p.image)}" alt="${e(p.name)} phone case" loading=lazy>${p.isNew?'<i class=bd>New</i>':''}</span><span class=ct><b>${e(p.name)}</b><small>${e(cname(p.collection))}</small>${price(p)}</span></a>`;
const ct=S.contact,wa=ct.whatsapp?`https://wa.me/${ct.whatsapp.replace(/\D/g,'')}`:'';
function page(file,title,desc,body,{script=''}={}){const d=file.split('/').length-1,b='../'.repeat(d);
 const nav=[['Home',''],['Shop All','shop/'],['New Arrivals','shop/?new=1'],['Bestsellers','shop/?f=1']];
 const html=`<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${e(title)} · ${e(S.name)}</title><meta name=description content="${e(desc)}"><link rel=stylesheet href="${b}style.css"></head><body>
${S.announcement?`<div class=ann>${e(S.announcement)}</div>`:''}
<header class=hd><a class=logo href="${b}">${e(S.name)}</a><nav id=nv aria-label=Primary>${nav.map(([t,u])=>`<a href="${b}${u}">${t}</a>`).join('')}<details class=dd><summary>Collections</summary><div>${S.collections.map(c=>`<a href="${b}collections/${c.slug}/">${e(c.title)}</a>`).join('')}</div></details></nav>
<form class=sf action="${b}shop/" role=search><input name=q type=search placeholder="Search designs" aria-label="Search designs"><button aria-label=Search>⌕</button></form><button class=mb aria-expanded=false aria-controls=nv>Menu</button></header>
<main>${body}</main>
<footer class=ft><div><b>${e(S.name)}</b><p>Phone case designs.</p></div><div><h3>Shop</h3><a href="${b}shop/">Shop All</a>${S.collections.map(c=>`<a href="${b}collections/${c.slug}/">${e(c.title)}</a>`).join('')}</div><div><h3>Info</h3><a href="${b}contact/">Contact</a>${['privacy','terms','shipping','returns'].map(x=>`<a href="${b}${x}/">${x[0].toUpperCase()+x.slice(1)} Policy</a>`).join('').replace('Terms Policy','Terms &amp; Conditions')}${ct.instagram?`<a href="${e(ct.instagram)}">Instagram</a>`:''}</div></footer>
<script>window.B="${b}";</script><script src="${b}products.js"></script><script src="${b}app.js"></script>${script}</body></html>`;
 fs.mkdirSync(path.dirname(`${D}/${file}`),{recursive:true});fs.writeFileSync(`${D}/${file}`,html);}
fs.writeFileSync(D+'/products.js','window.P='+JSON.stringify(P.map(p=>({s:p.slug,n:p.name,i:th(p.image),c:p.collection,t:p.tags,p:p.price,w:p.isNew,f:p.featured})))+';window.C='+JSON.stringify(S.collections)+';');
fs.copyFileSync('style.css',D+'/style.css');fs.copyFileSync('app.js',D+'/app.js');
// Home
const feat=P.filter(p=>p.featured).slice(0,8),neu=P.filter(p=>p.isNew).slice(0,8),hero=P.filter(p=>p.featured).slice(0,3);
const cov=c=>P.find(p=>p.collection===c.slug);
page('index.html','Your Phone. Your Style.','Browse phone case designs by collection.',
`<section class=hero><div><p class=ey>The Collection</p><h1>Your Phone.<br><em>Your Style.</em></h1><p>Find the case that feels like you.</p><p><a class="btn" href="shop/">Explore the Collection</a> <a class="btn o" href="shop/?new=1">Discover New Arrivals</a></p></div><div class=col3>${hero.map((p,i)=>`<img class=h${i} src="${th(p.image,'l')}" alt="${e(p.name)}" ${i?'loading=lazy':''}>`).join('')}</div></section>
<section class=sec><h2>Shop by collection</h2><div class=cols>${S.collections.map(c=>cov(c)?`<a class=tile href="collections/${c.slug}/"><img src="${th(cov(c).image)}" alt="" loading=lazy><span>${e(c.title)}</span></a>`:'').join('')}</div></section>
${feat.length?`<section class=sec><h2>Featured designs</h2><div class=grid>${feat.map(p=>card(p,'')).join('')}</div></section>`:''}
<section class="sec story"><div><h2>Made to match you</h2><p>A phone case is the part of your phone that's all yours. We gather designs for every mood — soft florals, playful bows, quiet neutrals — so you can pick the one that feels like everyday you.</p></div><div class=pair>${P.slice(10,12).map(p=>`<img src="${th(p.image)}" alt="" loading=lazy>`).join('')}</div></section>
${neu.length?`<section class=sec><h2>Latest designs</h2><div class=grid>${neu.map(p=>card(p,'')).join('')}</div></section>`:''}
<section class=cta><h2>See every design</h2><a class="btn" href="shop/">Shop All</a></section>`);
// Shop + collections (client-side filtering from products.js)
const shopBody=(c)=>`<section class=sec><p class=ey><a href="${c?'../../shop/':'./'}">${c?'← All designs':''}</a></p><h1>${c?e(c.title):'Shop All'}</h1>${c?`<p>${e(c.desc)}</p>`:''}<p id=count aria-live=polite></p>
<div class=bar><button class=fb aria-expanded=false>Filters</button><div id=filters><input id=q type=search placeholder="Search name or tag" aria-label=Search>${c?'':'<div id=chips></div>'}<select id=sort aria-label=Sort><option value=new>Newest</option><option value=name>Name A–Z</option>${P.some(p=>p.price!=null)?'<option value=lo>Price low–high</option><option value=hi>Price high–low</option>':''}</select><button id=clr>Clear filters</button></div></div>
<div class=grid id=grid></div><p id=empty hidden>No designs match. Try clearing filters.</p><button class="btn o" id=more hidden>Load more</button></section>`;
page('shop/index.html','Shop All','Browse all phone case designs.',shopBody(null),{script:'<script>shop()</script>'});
for(const c of S.collections)page(`collections/${c.slug}/index.html`,c.title,c.desc,shopBody(c),{script:`<script>shop("${c.slug}")</script>`});
// Product pages
for(const p of P){const rel=P.filter(x=>x!==p&&x.collection===p.collection).slice(0,4);const brands=Object.keys(S.phones||{});
 const msg=encodeURIComponent(`Hi, I'm interested in ${p.name}.`);
 const cta=wa?`<a class=btn href="${wa}?text=${msg}" id=enq>Enquire on WhatsApp</a>`:ct.email?`<a class=btn id=enq href="mailto:${e(ct.email)}?subject=${encodeURIComponent(p.name)}">Enquire by email</a>`:`<a class="btn o" href="../../contact/">Enquire</a>`;
 page(`product/${p.slug}/index.html`,p.name,p.description||`${p.name} phone case from the ${cname(p.collection)} collection.`,
 `<section class="sec pd"><div class=gal>${[p.image,...p.images].map((f,i)=>`<img src="../../${th(f,'l')}" alt="${e(p.name)} phone case" ${i?'loading=lazy':''}>`).join('')}</div><div><p class=ey><a href="../../collections/${p.collection}/">${e(cname(p.collection))}</a></p><h1>${e(p.name)}</h1>${price(p)}${p.description?`<p>${e(p.description)}</p>`:''}
 ${brands.length?`<label>Phone brand<select id=br><option value="">Select brand</option>${brands.map(b=>`<option>${e(b)}</option>`).join('')}</select></label><label>Model<select id=md disabled><option>Select brand first</option></select></label><script>window.PH=${JSON.stringify(S.phones)}</script>`:'<p class=note>Compatibility information for this design isn’t available yet. Please confirm your phone model with us before ordering.</p>'}
 ${cta}</div></section>${rel.length?`<section class=sec><h2>Related designs</h2><div class=grid>${rel.map(x=>card(x,'../../')).join('')}</div></section>`:''}`,{script:brands.length?'<script>phones()</script>':''});}
// Contact + policies
page('contact/index.html','Contact','Get in touch.',`<section class="sec narrow"><h1>Contact</h1>${ct.email||wa||ct.instagram?`<p>${ct.email?`Email: <a href="mailto:${e(ct.email)}">${e(ct.email)}</a><br>`:''}${wa?`<a href="${wa}">WhatsApp</a>`:''}</p>`:'<p class=note>Contact details haven’t been set yet. Add them in data/site.json.</p>'}
<p class=note>Enquiry form: this site has no server, so no message can be sent from here yet. Connect a form service (e.g. Formspree) or use the links above.</p></section>`);
const pol={privacy:'Privacy Policy',terms:'Terms & Conditions',shipping:'Shipping Policy',returns:'Returns Policy'};
for(const[k,v]of Object.entries(pol))page(`${k}/index.html`,v,v,`<section class="sec narrow"><h1>${v}</h1><p class=note>Placeholder — replace with your actual policy before launch (data/policies or edit build.mjs).</p></section>`);
fs.writeFileSync(D+'/robots.txt','User-agent: *\nAllow: /\n');
console.log('Built',P.length,'products');
