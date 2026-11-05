(function(){
"use strict";
/* =====================================================================
   Utilidades
   ===================================================================== */
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => "l" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const nowISO = () => new Date().toISOString();
const pad = n => String(n).padStart(2, "0");
function fmtDate(v, withTime){
  if(!v) return "—";
  const d = new Date(v.length === 10 ? v + "T00:00:00" : v);
  if(isNaN(d)) return esc(v);
  const s = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  return withTime ? `${s} ${pad(d.getHours())}:${pad(d.getMinutes())}` : s;
}
function rel(v){
  const d = new Date(v); const s = (Date.now() - d) / 1000;
  if(s < 60) return "hace un momento";
  if(s < 3600) return `hace ${Math.floor(s/60)} min`;
  if(s < 86400) return `hace ${Math.floor(s/3600)} h`;
  return fmtDate(v, true);
}
function toast(msg, err){
  const r = $("#toastRoot"); r.innerHTML = `<div class="toast${err?" err":""}">${esc(msg)}</div>`;
  clearTimeout(toast.t); toast.t = setTimeout(() => r.innerHTML = "", 3200);
}
function confirmBox(title, text, okLabel="Eliminar", danger=true){
  return new Promise(res => {
    const el = document.createElement("div"); el.className = "confirm";
    el.innerHTML = `<div class="box" role="dialog" aria-modal="true"><h3>${esc(title)}</h3><p>${esc(text)}</p>
      <div class="actions"><button class="btn" data-a="no">Cancelar</button><button class="btn ${danger?"dan":"pri"}" data-a="si">${esc(okLabel)}</button></div></div>`;
    document.body.appendChild(el);
    el.addEventListener("click", e => { const a = e.target.closest("[data-a]")?.dataset.a; if(a || e.target === el){ el.remove(); res(a === "si"); } });
    $("[data-a=si]", el).focus();
  });
}
const I = {
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
  pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  mega:'<path d="M3 10v4h3l6 4V6L6 10z"/><path d="M16 8.5a5 5 0 0 1 0 7"/>',
  gift:'<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v7h14v-7M12 8v12M12 8S10.5 3 8 4s0 4 4 4zm0 0s1.5-5 4-4 0 4-4 4z"/>',
  clip:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
  news:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h6M7 13h10M7 16h7"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  down:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  hist:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 3"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
  up:'<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  back:'<path d="M15 6l-6 6 6 6"/>',
  bank:'<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>'
};
const ic = (n, cls="") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]||""}</svg>`;

/* Íconos de tarjetas del App (vista previa) */
const APP_ICONS = {
  tarjeta:["Tarjeta / pagos",'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>'],
  documento:["Documento",'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'],
  busqueda:["Consulta",'<rect x="3" y="4" width="14" height="12" rx="2"/><circle cx="16" cy="16" r="3"/><path d="M18.2 18.2L21 21M6 8h8M6 11h5"/>'],
  bitacora:["Bitácora",'<path d="M5 4h11v16H5z"/><path d="M16 14l4-4-2-2-4 4v2z"/>'],
  personas:["Personas",'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15 14.5c3 0 6 1.8 6 5.5"/>'],
  convenio:["Convenio",'<path d="M3 12l4-4 5 3 5-3 4 4-4 4-5-3-5 3z"/>'],
  empleo:["Empleo",'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3M3 13h18"/>'],
  certificado:["Certificado",'<rect x="3" y="4" width="18" height="12" rx="2"/><circle cx="8" cy="15" r="3"/><path d="M7 18l-1 3 2-1 2 1-1-3M12 8h6M13 12h5"/>'],
  normativa:["Normativa",'<path d="M5 3h10l4 4v14H5z"/><path d="M8 10h8M8 14h8M8 18h5"/>'],
  estadistica:["Estadísticas",'<circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/>'],
  web:["Sitio web",'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>']
};
const appIc = k => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${(APP_ICONS[k]||APP_ICONS.web)[1]}</svg>`;

const COLEGIOS = [
  ["CFIA","CFIA (sedes institucionales)"],
  ["CIVILES","Colegio de Ingenieros Civiles"],
  ["CACR","Colegio de Arquitectos de Costa Rica"],
  ["CIEMI","Colegio de Ingenieros Electricistas, Mecánicos e Industriales"],
  ["CIT","Colegio de Ingenieros Topógrafos"],
  ["CITEC","Colegio de Ingenieros Tecnólogos"]
];
const DIRIGIDO = [["colegiados","Colegiados"],["empresas","Empresas"],["ambos","Colegiados y empresas"]];
const ACCIONES_BTN = [["webview","Abrir un enlace en WebView"],["navegador","Abrir en navegador del dispositivo"]];
const TIPOS_PUB = [["evento","Evento"],["novedad","Novedad / noticia"],["anuncio","Anuncio"]];
const COLEGIOS_BASE = COLEGIOS.filter(c => c[0] !== "CFIA");
function colegiosMiembro(){
  const d = ((() => { try { return S.data.colegios; } catch(e){ return null; } })() || []).filter(c => (c.tipo || "colegio") === "colegio" && c.activo !== false)
    .sort((a,b) => (Number(a.ordenCarrusel)||99) - (Number(b.ordenCarrusel)||99)).map(c => [c.id, c.nombre || c.id]);
  return d.length ? d : COLEGIOS_BASE;
}
const colName = id => { const c = ((() => { try { return S.data.colegios; } catch(e){ return null; } })() || []).find(x => x.id === id); return c ? (c.nombre || id) : (COLEGIOS.find(c => c[0] === id) || [id, id || "—"])[1]; };
const colShort = id => id === "CFIA" ? "CFIA" : (id || "—");
const PROVINCIAS = ["San José","Alajuela","Cartago","Heredia","Guanacaste","Puntarenas","Limón"].map(p => [p,p]);
/* División Territorial Administrativa 2026 (IGN, Registro Nacional): 7 provincias, 84 cantones y 494 distritos.
   Datos de github.com/ryze-cr/ubicaciones-cr (licencia MIT). */
const DTA = {"San José":{"San José":["Carmen","Merced","Hospital","Catedral","Zapote","San Francisco de Dos Ríos","Uruca","Mata Redonda","Pavas","Hatillo","San Sebastián"],"Escazú":["Escazú","San Antonio","San Rafael"],"Desamparados":["Desamparados","San Miguel","San Juan de Dios","San Rafael Arriba","San Antonio","Frailes","Patarrá","San Cristobal","Rosario","Damas","San Rafael Abajo","Gravilias","Los Guido"],"Puriscal":["Santiago","Mercedes Sur","Barbacoas","Grifo Alto","San Rafael","Candelarita","Desamparaditos","San Antonio","Chires"],"Tarrazú":["San Marcos","San Lorenzo","San Carlos"],"Aserrí":["Aserrí","Tarbaca","Vuelta de Jorco","San Gabriel","Legua","Monterrey","Salitrillos"],"Mora":["Colón","Guayabo","Tabarcia","Piedras Negras","Picagres","Jaris","Quitirrisí"],"Goicoechea":["Guadalupe","San Francisco","Calle Blancos","Mata de Plátano","Ipís","Rancho Redondo","Purral"],"Santa Ana":["Santa Ana","Salitral","Pozos","Uruca","Piedades","Brasil"],"Alajuelita":["Alajuelita","San Josecito","San Antonio","Concepción","San Felipe"],"Vázquez de Coronado":["San Isidro","San Rafael","Dulce Nombre de Jesús","Patalillo","Cascajal"],"Acosta":["San Ignacio","Guaitil","Palmichal","Cangrejal","Sabanillas"],"Tibás":["San Juan","Cinco Esquinas","Anselmo Llorente","León XIII","Colima"],"Moravia":["San Vicente","San Jerónimo","La Trinidad"],"Montes de Oca":["San Pedro","Sabanilla","Mercedes","San Rafael"],"Turrubares":["San Pablo","San Pedro","San Juan de Mata","San Luis","Carara"],"Dota":["Santa María","Jardín","Copey"],"Curridabat":["Curridabat","Granadilla","Sánchez","Tirrases"],"Pérez Zeledón":["San Isidro de El General","El General","Daniel Flores","Rivas","San Pedro","Platanares","Pejivalle","Cajón","Barú","Río Nuevo","Páramo","La Amistad"],"León Cortés Castro":["San Pablo","San Andrés","Llano Bonito","San Isidro","Santa Cruz","San Antonio"]},"Alajuela":{"Alajuela":["Alajuela","San José","Carrizal","San Antonio","Guácima","San Isidro","Sabanilla","San Rafael","Río Segundo","Desamparados","Turrúcares","Tambor","Garita","Sarapiquí"],"San Ramón":["San Ramón","Santiago","San Juan","Piedades Norte","Piedades Sur","San Rafael","San Isidro","Ángeles","Alfaro","Volio","Concepción","Zapotal","Peñas Blancas","San Lorenzo"],"Grecia":["Grecia","San Isidro","San José","San Roque","Tacares","Puente de Piedra","Bolivar"],"San Mateo":["San Mateo","Desmonte","Jesús María","Labrador"],"Atenas":["Atenas","Jesús","Mercedes","San Isidro","Concepción","San José","Santa Eulalia","Escobal"],"Naranjo":["Naranjo","San Miguel","San José","Cirrí Sur","San Jerónimo","San Juan","El Rosario","Palmitos"],"Palmares":["Palmares","Zaragoza","Buenos Aires","Santiago","Candelaria","Esquipulas","La Granja"],"Poás":["San Pedro","San Juan","San Rafael","Carrillos","Sabana Redonda"],"Orotina":["Orotina","El Mastate","Hacienda Vieja","Coyolar","La Ceiba"],"San Carlos":["Quesada","Florencia","Buenavista","Aguas Zarcas","Venecia","Pital","La Fortuna","La Tigra","La Palmera","Venado","Cutris","Monterrey","Pocosol"],"Zarcero":["Zarcero","Laguna","Tapesco","Guadalupe","Palmira","Zapote","Brisas"],"Sarchí":["Sarchí Norte","Sarchí Sur","Toro Amarillo","San Pedro","Rodríguez"],"Upala":["Upala","Aguas Claras","San José O Pizote","Bijagua","Delicias","Dos Ríos","Yolillal","Canalete"],"Los Chiles":["Los Chiles","Caño Negro","El Amparo","San Jorge"],"Guatuso":["San Rafael","Buenavista","Cote","Katira"],"Río Cuarto":["Río Cuarto","Santa Rita","Santa Isabel"]},"Cartago":{"Cartago":["Oriental","Occidental","Carmen","San Nicolás","Aguacaliente o San Francisco","Guadalupe o Arenilla","Corralillo","Tierra Blanca","Dulce Nombre","Llano Grande","Quebradilla"],"Paraíso":["Paraíso","Santiago","Orosi","Cachí","Llanos de Santa Lucía","Birrisito"],"La Unión":["Tres Ríos","San Diego","San Juan","San Rafael","Concepción","Dulce Nombre","San Ramón","Río Azul"],"Jiménez":["Juan Viñas","Tucurrique","Pejibaye","La Victoria"],"Turrialba":["Turrialba","La Suiza","Peralta","Santa Cruz","Santa Teresita","Pavones","Tuis","Tayutic","Santa Rosa","Tres Equis","La Isabel","Chirripó"],"Alvarado":["Pacayas","Cervantes","Capellades"],"Oreamuno":["San Rafael","Cot","Potrero Cerrado","Cipreses","Santa Rosa"],"El Guarco":["El Tejar","San Isidro","Tobosi","Patio de Agua"]},"Heredia":{"Heredia":["Heredia","Mercedes","San Francisco","Ulloa","Varablanca"],"Barva":["Barva","San Pedro","San Pablo","San Roque","Santa Lucía","San José de la Montaña","Puente Salas"],"Santo Domingo":["Santo Domingo","San Vicente","San Miguel","Paracito","Santo Tomás","Santa Rosa","Tures","Pará"],"Santa Bárbara":["Santa Bárbara","San Pedro","San Juan","Jesús","Santo Domingo","Purabá"],"San Rafael":["San Rafael","San Josecito","Santiago","Ángeles","Concepción"],"San Isidro":["San Isidro","San José","Concepción","San Francisco"],"Belén":["San Antonio","La Ribera","La Asunción"],"Flores":["San Joaquín","Barrantes","Llorente"],"San Pablo":["San Pablo","Rincón de Sabanilla"],"Sarapiquí":["Puerto Viejo","La Virgen","Las Horquetas","Llanuras del Gaspar","Cureña"]},"Guanacaste":{"Liberia":["Liberia","Cañas Dulces","Mayorga","Nacascolo","Curubandé"],"Nicoya":["Nicoya","Mansión","San Antonio","Quebrada Honda","Sámara","Nosara","Belén de Nosarita"],"Santa Cruz":["Santa Cruz","Bolsón","Veintisiete de Abril","Tempate","Cartagena","Cuajiniquil","Diriá","Cabo Velas","Tamarindo"],"Bagaces":["Bagaces","La Fortuna","Mogote","Río Naranjo","Pijije"],"Carrillo":["Filadelfia","Palmira","Sardinal","Belén"],"Cañas":["Cañas","Palmira","San Miguel","Bebedero","Porozal"],"Abangares":["Las Juntas","Sierra","San Juan","Colorado"],"Tilarán":["Tilarán","Quebrada Grande","Tronadora","Santa Rosa","Líbano","Tierras Morenas","Arenal","Cabeceras"],"Nandayure":["Carmona","Santa Rita","Zapotal","San Pablo","Porvenir","Bejuco"],"La Cruz":["La Cruz","Santa Cecilia","La Garita","Santa Elena"],"Hojancha":["Hojancha","Monte Romo","Puerto Carrillo","Huacas","Matambú"]},"Puntarenas":{"Puntarenas":["Puntarenas","Pitahaya","Chomes","Lepanto","Paquera","Manzanillo","Guacimal","Barranca","Isla del Coco","Cóbano","Chacarita","Chira","Acapulco","El Roble","Arancibia"],"Esparza":["Espíritu Santo","San Juan Grande","Macacona","San Rafael","San Jerónimo","Caldera"],"Buenos Aires":["Buenos Aires","Volcán","Potrero Grande","Boruca","Pilas","Colinas","Chánguena","Biolley","Brunka","Cabagra"],"Montes de Oro":["Miramar","La Unión","San Isidro"],"Osa":["Puerto Cortés","Palmar","Sierpe","Bahía Ballena","Piedras Blancas","Bahía Drake"],"Quepos":["Quepos","Savegre","Naranjito"],"Golfito":["Golfito","Guaycará","Pavón"],"Coto Brus":["San Vito","Sabalito","Aguabuena","Limoncito","Pittier","Gutiérrez Braun"],"Parrita":["Parrita"],"Corredores":["Corredor","La Cuesta","Canoas","Laurel"],"Garabito":["Jacó","Tárcoles","Lagunillas"],"Monteverde":["Monteverde"],"Puerto Jiménez":["Puerto Jiménez"]},"Limón":{"Limón":["Limón","Valle La Estrella","Río Blanco","Matama"],"Pococí":["Guápiles","Jiménez","Rita","Roxana","Cariari","Colorado","La Colonia"],"Siquirres":["Siquirres","Pacuarito","Florida","Germania","El Cairo","Alegría","Reventazón"],"Talamanca":["Bratsi","Sixaola","Cahuita","Telire"],"Matina":["Matina","Batán","Carrandí"],"Guácimo":["Guácimo","Mercedes","Pocora","Río Jiménez","Duacarí"]}};
const opcionesDe = a => String(a.valor || "").split(",").map(x => x.trim()).filter(Boolean);
const atributosElige = gid => ((byId("regalias", gid) || {}).atributos || []).filter(a => a.tipo === "elige" && a.nombre);
const cantonesDe = p => Object.keys(DTA[p] || {}).map(c => [c, c]);
const distritosDe = (p, c) => ((DTA[p] || {})[c] || []).map(d => [d, d]);

/* =====================================================================
   Estado y conexión con la plataforma
   ===================================================================== */
const COLLS = ["colegios","tramites","sedes","anuncios","regalias","reservas","novedades","auditoria"];
const S = {
  db:null, user:null, assets:null, downloads:null, meId:null, me:null,
  canWrite:true, mode:"cargando",
  data:Object.fromEntries(COLLS.map(c => [c, []])),
  loaded:{}, route:"resumen", f:{}, open:null
};
const byId = (c, id) => S.data[c].find(r => r.id === id);
const imgSrc = v => v && (v.id ? "/_blob/" + v.id : v.url) || "";

async function useCap(n){
  try { return (window.claude && typeof window.claude.use === "function") ? await window.claude.use(n) : null; }
  catch(e){ return null; }
}

let renderQueued = false;
function scheduleRender(){
  if(renderQueued) return; renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; renderNav(); refreshView(); });
}

async function boot(){
  renderNav(); renderView();
  const [db, user, assets, downloads] = await Promise.all(["db","user","assets","downloads"].map(useCap));
  S.user = user; S.assets = assets; S.downloads = downloads;
  if(user){
    try { S.me = await user.me(); S.meId = S.me.id; } catch(e){}
    try { const c = await user.can("data.write"); if(c === false) S.canWrite = false; } catch(e){}
  }
  if(db){
    S.db = db; S.mode = "db";
    COLLS.forEach(c => {
      const q = c === "auditoria" ? db.collection(c).orderBy("fecha","desc").limit(1000) : db.collection(c);
      q.onSnapshot(snap => {
        S.data[c] = snap.docs.map(d => Object.assign({ id:d.id }, d.data()));
        S.loaded[c] = true; scheduleRender();
      }, err => { if(err.code !== "revoked") toast("No fue posible sincronizar " + c + ".", true); });
    });
  } else {
    S.mode = "memoria";
    const pre = window.CFIA_DATOS;
    if(pre && typeof pre === "object") COLLS.forEach(c => { if(Array.isArray(pre[c])) S.data[c] = JSON.parse(JSON.stringify(pre[c])); });
    COLLS.forEach(c => S.loaded[c] = true);
  }
  renderMe(); renderNav(); renderView();
}

/* Perfiles para auditoría (se resuelven en cada render) */
async function resolveWho(root){
  const els = $$("[data-uid]", root || document);
  if(!els.length) return;
  const ids = [...new Set(els.map(e => e.dataset.uid).filter(Boolean))];
  let ps = {};
  if(S.user && ids.length){ try { ps = await S.user.profiles(ids); } catch(e){} }
  els.forEach(e => {
    const id = e.dataset.uid; const p = ps[id];
    const name = !id ? (S.mode === "memoria" ? "Usted (demostración)" : "Carga inicial") : (p && p.name) || (id === S.meId ? "Usted" : "Usuario del gestor");
    const n = $(".nm", e); if(n) n.textContent = name;
    const im = $("img", e); if(im){ if(p && p.avatarUrl){ im.src = p.avatarUrl; im.classList.remove("hidden"); } else im.classList.add("hidden"); }
  });
}
const who = id => `<span class="who" data-uid="${esc(id||"")}"><img class="hidden" alt=""><span class="nm">…</span></span>`;

function perfil(){ try { return localStorage.getItem("cfia-gestor-perfil") || "admin"; } catch(e){ return S.perfilMem || "admin"; } }
function esAdmin(){ return perfil() === "admin"; }
const DEPARTAMENTOS = [["dep-CENDEPRO","CENDEPRO"],["dep-CFIA","CFIA"],["dep-OR","Oficinas Regionales"]];
const perfiles = () => [["admin","Administrador CFIA"]].concat(DEPARTAMENTOS, colegiosMiembro().map(c => [c[0], c[0]]));
function esDepto(){ return perfil().startsWith("dep-"); }
function esColegio(){ return colegiosMiembro().some(c => c[0] === perfil()); }
function perfilNombre(p){ return (perfiles().find(x => x[0] === p) || [p, p || "—"])[1]; }
function registrador(r){ return r.registradoPor || (r.publico === "colegios" && (r.colegios||[]).length === 1 ? r.colegios[0] : "admin"); }
const puedeVer = r => esAdmin() || registrador(r) === perfil();
function perfilSelect(){
  return `<label style="display:block;margin-top:10px;font-size:12px;color:var(--gris7)">Perfil de acceso (prueba)
    <select id="perfilSel" style="margin-top:4px;width:100%;min-height:34px;padding:4px 8px;background:#2F2A2B;color:#fff;border:1px solid #3A3536;border-radius:6px;font-size:13px">
      <option value="admin" ${esAdmin() ? "selected" : ""}>Administrador CFIA</option>
      <optgroup label="Departamentos del CFIA">${DEPARTAMENTOS.map(d => `<option value="${d[0]}" ${perfil() === d[0] ? "selected" : ""}>${esc(d[1])}</option>`).join("")}</optgroup>
      <optgroup label="Colegios miembros">${colegiosMiembro().map(c => `<option value="${c[0]}" ${perfil() === c[0] ? "selected" : ""}>Gestor ${esc(c[0])}</option>`).join("")}</optgroup>
    </select></label>`;
}
function renderMe(){
  const el = $("#me");
  if(!S.me){ el.innerHTML = `<div style="width:100%"><strong>Modo demostración</strong><span>Los cambios no se guardan</span>${perfilSelect()}</div>`; return; }
  el.innerHTML = `<img src="${esc(S.me.avatarUrl)}" alt=""><div style="flex:1"><strong>${esc(S.me.name || "Usuario del gestor")}</strong><span>${S.canWrite ? "Puede editar" : "Solo lectura"}</span>${perfilSelect()}</div>`;
}
document.addEventListener("change", e => {
  if(e.target.id !== "perfilSel") return;
  try { localStorage.setItem("cfia-gestor-perfil", e.target.value); } catch(err){ S.perfilMem = e.target.value; }
  renderNav(); renderView();
  toast(e.target.value === "admin" ? "Perfil: Administrador CFIA" : "Perfil: Gestor " + e.target.value);
});

/* =====================================================================
   Persistencia + auditoría
   ===================================================================== */
const META_KEYS = ["id","creadoEn","creadoPor","actualizadoEn","actualizadoPor"];
function diff(mod, before, after){
  const out = [];
  const fields = mod ? mod.fields.filter(f => f.key) : [];
  const keys = new Set(fields.map(f => f.key));
  Object.keys(Object.assign({}, before, after)).forEach(k => { if(!META_KEYS.includes(k)) keys.add(k); });
  keys.forEach(k => {
    const a = before ? before[k] : undefined, b = after ? after[k] : undefined;
    const ea = JSON.stringify(a ?? null), eb = JSON.stringify(b ?? null);
    if(ea === eb) return;
    if((a === "" || a == null || (Array.isArray(a) && !a.length)) && (b === "" || b == null || (Array.isArray(b) && !b.length))) return;
    const f = fields.find(x => x.key === k);
    out.push({ campo:k, etiqueta:f ? f.label : k, antes:fmtAudit(mod, k, a), despues:fmtAudit(mod, k, b) });
  });
  return out;
}
function fmtAudit(mod, k, v){
  if(v == null || v === "") return "";
  const f = mod && mod.fields.find(x => x.key === k);
  if(typeof v === "boolean") return v ? "Sí" : "No";
  if(f && f.type === "file") return v.nombre || "Archivo adjunto";
  if(f && f.type === "image") return v.id ? "Imagen cargada (" + v.id.slice(0,8) + "…)" : (v.url || "");
  if(f && (f.type === "select" || f.type === "checks")){
    const opts = f.options ? f.options({}) : [];
    const lab = x => (opts.find(o => o[0] === x) || [x, x])[1];
    return Array.isArray(v) ? v.map(lab).join(", ") : lab(v);
  }
  if(Array.isArray(v)) return v.map(x => typeof x === "object" ? Object.values(x).filter(Boolean).join(": ") : x).join(" | ");
  if(typeof v === "object") return JSON.stringify(v);
  if(f && (f.type === "datetime" || f.type === "date")) return fmtDate(v, f.type === "datetime");
  return String(v);
}
async function writeAudit(modKey, recId, nombre, accion, cambios, nota){
  const entry = { fecha:nowISO(), actorId:S.meId || null, modulo:modKey, registroId:recId, registroNombre:nombre || "", accion, cambios:cambios || [], nota:nota || "" };
  if(S.mode === "db") await S.db.collection("auditoria").add(entry);
  else { S.data.auditoria.unshift(Object.assign({ id:uid() }, entry)); }
}
function handleWriteError(e){
  if(e && e.code === "invalid_argument"){ S.canWrite = false; renderMe(); toast("No tiene permiso para modificar registros en este gestor.", true); }
  else if(e && e.code === "quota_exceeded") toast("Se alcanzó el límite de almacenamiento del gestor. Exporte y depure registros antiguos.", true);
  else toast("No fue posible guardar. Intente de nuevo.", true);
}
async function putRecord(coll, id, body){
  if(S.mode === "db"){
    const ref = id ? S.db.collection(coll).doc(id) : S.db.collection(coll).doc();
    await ref.set(body); return ref.id;
  }
  const nid = id || uid(); const arr = S.data[coll]; const i = arr.findIndex(r => r.id === nid);
  const rec = Object.assign({ id:nid }, body); if(i >= 0) arr[i] = rec; else arr.push(rec);
  scheduleRender(); return nid;
}
async function saveRecord(modKey, id, values, prev){
  const mod = MODS[modKey]; const t = nowISO();
  const body = Object.assign({}, values, {
    creadoEn: prev ? (prev.creadoEn || t) : t, creadoPor: prev ? (prev.creadoPor ?? null) : (S.meId || null),
    actualizadoEn: t, actualizadoPor: S.meId || null
  });
  const clean = Object.assign({}, prev || {}); delete clean.id;
  const cambios = diff(mod, prev ? clean : null, body);
  if(prev && !cambios.length) return { id, unchanged:true };
  const nid = await putRecord(mod.coll, id || (mod.idFrom ? mod.idFrom(body) : null), body);
  await writeAudit(modKey, nid, body[mod.nameKey] || "", prev ? "modificar" : "crear", cambios);
  return { id:nid };
}
async function deleteRecord(modKey, rec){
  const mod = MODS[modKey];
  if(S.mode === "db") await S.db.collection(mod.coll).doc(rec.id).delete();
  else { S.data[mod.coll] = S.data[mod.coll].filter(r => r.id !== rec.id); scheduleRender(); }
  const clean = Object.assign({}, rec); delete clean.id;
  await writeAudit(modKey, rec.id, rec[mod.nameKey] || "", "eliminar", diff(mod, clean, null));
}

/* =====================================================================
   Estados calculados
   ===================================================================== */
function vigencia(inicio, fin, activo){
  if(activo === false) return ["Inactivo",""];
  const n = Date.now();
  const a = inicio ? new Date(inicio.length === 10 ? inicio + "T00:00:00" : inicio).getTime() : -Infinity;
  const b = fin ? new Date(fin.length === 10 ? fin + "T23:59:59" : fin).getTime() : Infinity;
  if(n < a) return ["Programado","warn"];
  if(n > b) return ["Finalizado",""];
  return ["Vigente","ok"];
}
function estadoRegalia(r){
  const v = vigencia(r.inicio, r.fin, r.activo);
  if(v[0] === "Vigente" && Number(r.disponible) <= 0) return ["Agotada","err"];
  return [v[0].replace(/o$/, "a"), v[1]];
}
const consume = e => e === "reservada" || e === "entregada";
const ESTADOS_RES = [["reservada","Reservada"],["entregada","Entregada"],["cancelada","Cancelada"],["liberada","Liberada (no retirada)"]];
const ESTADOS_PAGO = [["pendiente","Pendiente de revisión"],["verificado","Verificado"],["rechazado","Rechazado"]];
const pagoPill = e => { const m = {pendiente:"warn", verificado:"ok", rechazado:"err"}; return `<span class="pill ${m[e]||"warn"}">${esc((ESTADOS_PAGO.find(x => x[0] === e) || ESTADOS_PAGO[0])[1])}</span>`; };
const resPill = e => { const m = {reservada:"warn", entregada:"ok", cancelada:"err", liberada:""}; return `<span class="pill ${m[e]||""}">${esc((ESTADOS_RES.find(x => x[0] === e) || [e,e])[1])}</span>`; };
const pill = ([t, c]) => `<span class="pill ${c}">${esc(t)}</span>`;

/* =====================================================================
   Definición de módulos
   ===================================================================== */
const sedeOpts = colegio => S.data.sedes
  .filter(s => s.activo !== false)
  .sort((a,b) => (a.nombre||"").localeCompare(b.nombre||""))
  .map(s => [s.id, s.nombre]);

const MODS = {
  colegios:{
    nuevo:"Nuevo registro", crear:"Crear registro", coll:"colegios", nameKey:"nombre", title:"Colegios y Mutualidad", singular:"colegio o entidad", icon:"bank",
    intro:"Catálogo único de los colegios miembros y de la Mutualidad CFIA: logos, datos del carrusel del App, contacto para regalías y arte del aviso de regalías de cada campaña.",
    defaults:() => ({ tipo:"colegio", ordenCarrusel:(S.data.colegios.length + 1), activo:true, arteAnio:new Date().getFullYear() + 1 }),
    idFrom:r => (r.sigla || "").toUpperCase(),
    canCreate:() => esAdmin(),
    visible:r => esAdmin() || esDepto() || r.id === perfil(),
    fields:[
      {sec:"Datos del colegio"},
      {key:"tipo", label:"Tipo", type:"select", req:true, lock:() => !esAdmin(), options:() => [["colegio","Colegio miembro"],["mutualidad","Otra entidad del carrusel (Mutualidad CFIA)"]]},
      {key:"sigla", label:"Sigla", type:"text", req:true, max:12, ph:"Ej. CIVILES", lock:r => !esAdmin() || !!r.creadoEn, help:"Identifica al colegio en todo el gestor y en el App. No se puede cambiar después de creado."},
      {key:"nombre", label:"Nombre oficial", type:"text", req:true, span:2, lock:() => !esAdmin(), ph:"Ej. Colegio de Ingenieros Civiles"},
      {key:"logoColor", label:"Logo a color", type:"image", span:2, lock:() => !esAdmin(), help:"PNG con fondo transparente. Se usa sobre fondos claros, como el listado del gestor y los correos."},
      {key:"logo", label:"Logo en blanco", type:"image", span:2, lock:() => !esAdmin(), help:"PNG con fondo transparente. Se muestra sobre el color de marca en la tarjeta del carrusel."},
      {key:"color", label:"Color de marca", type:"text", req:true, ph:"#4A1F7A", lock:() => !esAdmin(), help:"Formato hexadecimal. Es el fondo de la tarjeta del carrusel."},
      {key:"sitioWeb", label:"Sitio web oficial", type:"url", req:true, ph:"https://…", lock:() => !esAdmin()},
      {sec:"Carrusel «Colegios Miembros y Mutualidad CFIA»"},
      {key:"textoCarrusel", label:"Texto de la tarjeta", type:"text", req:true, span:2, max:60, ph:"Explore el sitio web oficial del CACR", lock:() => !esAdmin()},
      {key:"ordenCarrusel", label:"Orden base en el carrusel", type:"number", req:true, min:1, lock:() => !esAdmin(), help:"En el App, el colegio del profesional se muestra primero y la Mutualidad CFIA al final."},
      {key:"activo", label:"Activo", type:"toggle", lock:() => !esAdmin()},
      {sec:"Imagen de la tarjeta del carrusel"},
      {key:"_avisoImgCarrusel", type:"info", when:() => true, text:() => "Opcional. Si se cargan los tres tamaños, el App muestra esta imagen como tarjeta completa del carrusel (al tocarla abre el sitio web). Si no, arma la tarjeta con el color, el texto, el logo en blanco y el botón «IR AL SITIO WEB». Proporción 2,13:1 (ancho de la tarjeta en el App: 343 pt)."},
      {key:"imgCarrusel", label:"Imagen original · 1200 × 564 px", type:"image", dims:[1200,564], span:2, lock:r => !(esAdmin() || r.id === perfil()), help:"JPG o PNG."},
      {key:"imgCarrusel3x", label:"Imagen @3x · 1029 × 483 px", type:"image", dims:[1029,483], span:2, lock:r => !(esAdmin() || r.id === perfil()), help:"JPG o PNG. Para pantallas de alta densidad."},
      {key:"imgCarrusel2x", label:"Imagen @2x · 686 × 322 px", type:"image", dims:[686,322], span:2, lock:r => !(esAdmin() || r.id === perfil()), help:"JPG o PNG. Para pantallas de densidad estándar."},
      {sec:"Contacto para regalías", when:r => r.tipo !== "mutualidad"},
      {key:"telefonoRegalias", label:"Teléfono", type:"tel", ph:"0000-0000", when:r => r.tipo !== "mutualidad", lock:r => !(esAdmin() || r.id === perfil())},
      {key:"correoRegalias", label:"Correo electrónico", type:"email", ph:"regalias@colegio.cr", when:r => r.tipo !== "mutualidad", lock:r => !(esAdmin() || r.id === perfil()), help:"Se muestran en el correo de confirmación de retiro de regalías."},
      {sec:"Arte del aviso de regalías", when:r => r.tipo !== "mutualidad"},
      {key:"arteAnio", label:"Año de la campaña", type:"number", min:2024, when:r => r.tipo !== "mutualidad", lock:r => !(esAdmin() || r.id === perfil()), help:"El App muestra este arte en el aviso de regalías de la campaña de ese año (HU 4)."},
      {key:"arteOriginal", label:"Arte original · 1200 × 1500 px", type:"image", dims:[1200,1500], span:2, when:r => r.tipo !== "mutualidad", lock:r => !(esAdmin() || r.id === perfil()), help:"JPG o PNG, proporción 4:5."},
      {key:"arte3x", label:"Arte @3x · 1176 × 1470 px", type:"image", dims:[1176,1470], span:2, when:r => r.tipo !== "mutualidad", lock:r => !(esAdmin() || r.id === perfil()), help:"JPG o PNG. Para pantallas de alta densidad."},
      {key:"arte2x", label:"Arte @2x · 784 × 980 px", type:"image", dims:[784,980], span:2, when:r => r.tipo !== "mutualidad", lock:r => !(esAdmin() || r.id === perfil()), help:"JPG o PNG. Para pantallas de densidad estándar."}
    ],
    filters:[
      {key:"tipo", label:"Todos los tipos", options:[["colegio","Colegios miembros"],["mutualidad","Otras entidades"]], test:(r,v) => (r.tipo || "colegio") === v},
      {key:"estado", label:"Todos los estados", options:[["activo","Activos"],["inactivo","Inactivos"]], test:(r,v) => v === "activo" ? r.activo !== false : r.activo === false}
    ],
    sort:(a,b) => (Number(a.ordenCarrusel)||99) - (Number(b.ordenCarrusel)||99),
    columns:[
      {label:"", cell:r => imgSrc(r.logoColor) ? `<div class="thumb" style="background:#fff url('${esc(imgSrc(r.logoColor))}') center/80% no-repeat;border:1px solid var(--border)"></div>` : `<div class="thumb" style="background:${/^#[0-9a-f]{6}$/i.test(r.color||"") ? r.color : "var(--surface-2)"} ${imgSrc(r.logo) ? `url('${esc(imgSrc(r.logo))}') center/70% no-repeat` : ""}"></div>`},
      {label:"Colegio", cell:r => `<div class="t1">${esc(r.nombre)}</div><div class="sub"><span class="mono">${esc(r.id)}</span> · ${(r.tipo || "colegio") === "colegio" ? "Colegio miembro" : "Otra entidad del carrusel"}</div>`},
      {label:"Carrusel", cell:r => `<div class="mono">Orden ${esc(r.ordenCarrusel)}</div><div class="sub">${esc(r.textoCarrusel)}</div>${(r.imgCarrusel && r.imgCarrusel3x && r.imgCarrusel2x) ? `<span class="pill ok" style="margin-top:4px">Imagen de tarjeta</span>` : ""}`},
      {label:"Contacto", cell:r => r.tipo === "mutualidad" ? "—" : ([r.telefonoRegalias, r.correoRegalias].filter(Boolean).map(x => `<div class="sub">${esc(x)}</div>`).join("") || `<span class="sub">Sin contacto</span>`)},
      {label:"Arte de regalías", cell:r => r.tipo === "mutualidad" ? "—" : ((r.arteOriginal && r.arte3x && r.arte2x) ? pill([`${r.arteAnio || ""} · 3 tamaños`,"ok"]) : pill(["Pendiente","warn"]))},
      {label:"Estado", cell:r => pill(r.activo === false ? ["Inactivo",""] : ["Activo","ok"])}
    ],
    preview:r => {
      const arte = imgSrc(r.arte2x) || imgSrc(r.arte3x) || imgSrc(r.arteOriginal);
      const color = /^#[0-9a-f]{6}$/i.test(r.color||"") ? r.color : "#76777B";
      const logo = imgSrc(r.logo);
      const pop = r.tipo === "mutualidad" ? "" : `<h3>Aviso de regalías en el App</h3><div class="phone"><div class="screen" style="min-height:560px">
        <div class="sb"><img src="assets/cfia_logo.png" alt=""><span></span></div>
        <div class="ov" style="align-items:center"><div style="background:#fff;border-radius:14px;overflow:hidden;width:100%;position:relative">
          <div style="aspect-ratio:4/5;max-height:300px;background:${arte ? `url('${esc(arte)}') center/cover no-repeat` : "repeating-conic-gradient(#ddd 0 25%,#f2f2f2 0 50%) 0 0/16px 16px"}"></div>
          <span style="position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:14px;box-shadow:0 1px 4px rgba(0,0,0,.25)">✕</span>
          <div style="padding:14px">
            <h4 style="margin:0;font-size:14px;font-weight:600;line-height:1.3">¡Ya disponibles las Regalías ${esc((r.sigla || r.id || "[COLEGIO]").toUpperCase())} ${esc(r.arteAnio || "[AÑO]")}!</h4>
            <p style="font-size:11px;margin:8px 0;font-family:'Source Sans 3',Arial,sans-serif">Toque RESERVAR MI REGALÍA para conocer las regalías disponibles y obtener la suya.</p>
            <span class="b1" style="display:block;text-align:center;border-radius:6px;padding:8px;font-weight:600;font-size:11px;background:#FCB429">RESERVAR MI REGALÍA</span>
            <span style="display:block;text-align:center;font-weight:600;font-size:11px;margin-top:8px">NO VOLVER A MOSTRAR</span>
          </div></div></div></div></div>`;
      const imgC = imgSrc(r.imgCarrusel2x) || imgSrc(r.imgCarrusel3x) || imgSrc(r.imgCarrusel);
      if(imgC) return pop + `<h3 style="margin-top:18px">Tarjeta del carrusel (imagen)</h3><div style="aspect-ratio:686/322;border-radius:14px;background:url('${esc(imgC)}') center/cover no-repeat"></div>`;
      const card = `<h3 style="margin-top:18px">Tarjeta del carrusel</h3><div style="background:${color};border-radius:14px;padding:16px;color:#fff;display:flex;gap:12px;align-items:center;min-height:110px;font-family:'Poppins',Arial,sans-serif">
        <div style="flex:1"><div style="font-size:13px;font-weight:600;line-height:1.35">${esc(r.textoCarrusel || "Texto de la tarjeta")}</div><span style="display:inline-block;margin-top:10px;border:1.5px solid #fff;border-radius:8px;padding:5px 10px;font-size:10px;font-weight:600">IR AL SITIO WEB</span></div>
        <div style="width:90px;height:60px;background:${logo ? `url('${esc(logo)}') center/contain no-repeat` : "transparent"};${logo ? "" : "border:1px dashed rgba(255,255,255,.6);border-radius:6px;display:grid;place-items:center;font-size:10px"}">${logo ? "" : "Logo"}</div></div>`;
      return pop + card;
    },
    validate:(r, prev) => {
      const e = {};
      const sig = (r.sigla || "").toUpperCase();
      if(sig && !/^[A-Z0-9]{2,12}$/.test(sig)) e.sigla = "Use solo letras y números, sin espacios (2 a 12 caracteres).";
      else if(sig && !prev && S.data.colegios.some(c => c.id === sig)) e.sigla = "Ya existe un colegio con esta sigla.";
      if(r.color && !/^#[0-9a-f]{6}$/i.test(r.color)) e.color = "Use el formato #RRGGBB.";
      if(r.sitioWeb && !/^https:\/\//i.test(r.sitioWeb)) e.sitioWeb = "Debe iniciar con https://";
      if(r.telefonoRegalias && !/^\d{4}-?\d{4}$/.test(r.telefonoRegalias)) e.telefonoRegalias = "Use el formato 0000-0000.";
      if(r.correoRegalias && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.correoRegalias)) e.correoRegalias = "Ingrese un correo válido.";
      const nc = [r.imgCarrusel, r.imgCarrusel3x, r.imgCarrusel2x].filter(x => imgSrc(x)).length;
      if(nc && nc < 3) e.imgCarrusel = "Suba los tres tamaños de la imagen del carrusel (original, @3x y @2x).";
      const n = [r.arteOriginal, r.arte3x, r.arte2x].filter(x => imgSrc(x)).length;
      if(r.tipo !== "mutualidad" && n && n < 3) e.arteOriginal = "Suba los tres tamaños del arte (original, @3x y @2x).";
      if(r.tipo !== "mutualidad" && n && !r.arteAnio) e.arteAnio = "Indique el año de la campaña del arte.";
      return e;
    },
    beforeSave:(r, prev) => { r.sigla = prev ? prev.id : (r.sigla || "").toUpperCase(); return r; },
    canDelete:r => !esAdmin() ? "Solo el Administrador CFIA puede eliminar colegios." :
      (S.data.regalias.some(g => g.colegio === r.id) ? "Este colegio tiene regalías registradas. Desactívelo en lugar de eliminarlo." : "")
  },

  tramites:{
    nuevo:"Nuevo trámite", crear:"Crear trámite", coll:"tramites", nameKey:"nombre", title:"Trámites y servicios", singular:"trámite", icon:"link",
    intro:"Enlaces de los trámites y servicios del App CFIA que se abren dentro de un WebView. Los cambios se reflejan en el catálogo y en el Onboarding de accesos rápidos.",
    defaults:() => ({ apertura:"webview", icono:"web", visibleTramites:true, visibleOnboarding:true, activo:true, orden:(S.data.tramites.length + 1) }),
    fields:[
      {sec:"Tarjeta en el App"},
      {key:"nombre", label:"Nombre del trámite", type:"text", req:true, max:60, ph:"Ej. Certificaciones Digitales de Membresía"},
      {key:"icono", label:"Ícono", type:"select", req:true, options:() => Object.entries(APP_ICONS).map(([k,v]) => [k, v[0]])},
      {key:"descripcion", label:"Descripción corta", type:"textarea", req:true, max:90, span:2, ph:"Ej. Solicite sus certificaciones digitales", help:"En la tarjeta se muestran dos líneas; el resto se trunca con puntos suspensivos."},
      {sec:"Enlace"},
      {key:"url", label:"URL del sitio", type:"url", req:true, span:2, ph:"https://servicios.cfia.or.cr/…", help:"Debe iniciar con https://"},
      {key:"dirigido", label:"Trámite para", type:"select", req:true, options:() => DIRIGIDO, help:"Define si el trámite se muestra a colegiados, a empresas o a ambos."},
      {key:"apertura", label:"Se abre en", type:"select", req:true, options:() => [["webview","WebView dentro del App"],["externo","Navegador del dispositivo"]]},
      {key:"tituloAppBar", label:"Título en la cabecera del WebView", type:"text", max:40, ph:"Ej. Certificaciones", when:r => r.apertura === "webview"},
      {sec:"Visibilidad"},
      {key:"orden", label:"Orden en el catálogo", type:"number", min:1, req:true},
      {key:"activo", label:"Trámite activo", type:"toggle"},
      {key:"visibleTramites", label:"Mostrar en Trámites y servicios", type:"toggle"},
      {key:"visibleOnboarding", label:"Mostrar en Onboarding (accesos rápidos)", type:"toggle"}
    ],
    filters:[
      {key:"dirigido", label:"Colegiados y empresas", options:DIRIGIDO, test:(r,v) => r.dirigido === v},
      {key:"estado", label:"Todos los estados", options:[["activo","Activos"],["inactivo","Inactivos"]], test:(r,v) => v === "activo" ? r.activo !== false : r.activo === false}
    ],
    sort:(a,b) => (a.orden||0) - (b.orden||0),
    columns:[
      {label:"Orden", cell:r => `<span class="mono">${esc(r.orden)}</span>`},
      {label:"Trámite", cell:r => `<div class="t1">${esc(r.nombre)}</div><div class="sub">${esc(r.descripcion)}</div>`},
      {label:"Enlace", cell:r => `<div class="sub"><a class="link" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url)}</a></div>`},
      {label:"Trámite para", cell:r => r.dirigido ? `<span class="tag">${esc((DIRIGIDO.find(d => d[0] === r.dirigido) || [0, r.dirigido])[1])}</span>` : `<span class="sub">Sin definir</span>`},
      {label:"Se abre en", cell:r => r.apertura === "externo" ? "Navegador" : "WebView"},
      {label:"Visible en", cell:r => (r.visibleTramites !== false ? `<span class="tag">Trámites</span>` : "") + (r.visibleOnboarding !== false ? `<span class="tag">Onboarding</span>` : "") || "—"},
      {label:"Estado", cell:r => pill(r.activo === false ? ["Inactivo",""] : ["Activo","ok"])}
    ],
    preview:r => {
      const others = S.data.tramites.filter(t => t.id !== r.id && t.activo !== false && t.visibleTramites !== false).sort((a,b) => (a.orden||0)-(b.orden||0));
      const list = others.slice(); const pos = Math.max(0, Math.min(list.length, (Number(r.orden)||1) - 1));
      list.splice(pos, 0, Object.assign({}, r, {_me:true}));
      const cards = list.slice(Math.max(0, pos - 2), Math.max(0, pos - 2) + 6).map(t => `<div class="appcard ${t._me ? "" : "ghost"}">${appIc(t.icono)}<strong>${esc(t.nombre || "Nombre del trámite")}</strong><span>${esc(t.descripcion || "Descripción")}</span></div>`).join("");
      return `<h3>Así se verá en el App</h3><div class="phone"><div class="screen">
        <div class="wv">${ic("back")}<span>Trámites y servicios</span></div>
        <div class="gridcards">${cards}</div>
        ${r.apertura === "webview" ? `<div class="wv" style="border-top:1px solid #eee">${ic("back")}<span>${esc(r.tituloAppBar || r.nombre || "WebView")}</span></div><div class="wv url" style="border:0">${esc(r.url || "https://…")}</div>` : `<div class="wv url">Se abrirá en el navegador del dispositivo:<br>${esc(r.url || "https://…")}</div>`}
      </div></div>`;
    },
    validate:r => {
      const e = {};
      if(r.url && !/^https:\/\/[^\s.]+\.[^\s]+$/i.test(r.url)) e.url = "Ingrese una URL válida que inicie con https://";
      const dup = S.data.tramites.find(t => t.id !== r.id && (t.nombre||"").trim().toLowerCase() === (r.nombre||"").trim().toLowerCase());
      if(dup) e.nombre = "Ya existe un trámite con este nombre.";
      return e;
    }
  },

  sedes:{
    nuevo:"Nueva sede", crear:"Crear sede", coll:"sedes", nameKey:"nombre", title:"Sedes", singular:"sede", icon:"pin",
    intro:"Sedes del CFIA donde se retiran las regalías. Se muestran en el App en «Ubicación de entrega» y en los correos de confirmación.",
    defaults:() => ({ provincia:"San José", activo:true, telefonos:[""], correos:[""], horario:[{dias:"Lunes a viernes", horas:"8:00 a. m. a 4:00 p. m."}] }),
    fields:[
      {sec:"Datos generales"},
      {key:"nombre", label:"Nombre de la sede", type:"text", req:true, ph:"Ej. Sede Central CFIA"},
      {sec:"Ubicación"},
      {key:"provincia", label:"Provincia", type:"select", req:true, options:() => PROVINCIAS},
      {key:"canton", label:"Cantón", type:"select", req:true, dependsOn:["provincia"], options:r => cantonesDe(r.provincia)},
      {key:"distrito", label:"Distrito", type:"select", req:true, dependsOn:["provincia","canton"], options:r => distritosDe(r.provincia, r.canton)},
      {key:"mapa", label:"Enlace de mapa (opcional)", type:"url", ph:"https://maps.app.goo.gl/…"},
      {key:"direccion", label:"Dirección", type:"textarea", req:true, span:2, ph:"Ej. Contiguo al Indoor Club de Curridabat, San José"},
      {sec:"Contacto"},
      {key:"telefonos", label:"Teléfonos", type:"list", itemType:"tel", req:true, ph:"0000-0000", addLabel:"Agregar teléfono"},
      {key:"correos", label:"Correos electrónicos", type:"list", itemType:"email", req:true, ph:"correo@cfia.or.cr", addLabel:"Agregar correo"},
      {sec:"Horario de atención"},
      {key:"horario", label:"Horario", type:"pairs", span:2, req:true, cols:[{k:"dias", ph:"Días (ej. Lunes a viernes)"},{k:"horas", ph:"Horas (ej. 8:00 a. m. a 4:00 p. m.)"}], addLabel:"Agregar franja"},
      {sec:"Estado"},
      {key:"activo", label:"Sede activa", type:"toggle"},
      {key:"notas", label:"Notas internas", type:"textarea", span:2}
    ],
    filters:[
      {key:"provincia", label:"Todas las provincias", options:PROVINCIAS, test:(r,v) => r.provincia === v},
      {key:"estado", label:"Todos los estados", options:[["activo","Activas"],["inactivo","Inactivas"]], test:(r,v) => v === "activo" ? r.activo !== false : r.activo === false}
    ],
    sort:(a,b) => (a.nombre||"").localeCompare(b.nombre||""),
    columns:[
      {label:"Sede", cell:r => `<div class="t1">${esc(r.nombre)}</div>`},
      {label:"Ubicación", cell:r => `<div>${esc([r.provincia, r.canton, r.distrito].filter(Boolean).join(", "))}</div><div class="sub" style="white-space:normal;max-width:36ch">${esc(r.direccion)}</div>`},
      {label:"Teléfonos", cell:r => (r.telefonos||[]).filter(Boolean).map(t => `<span class="tag mono">${esc(t)}</span>`).join("") || "—"},
      {label:"Correos", cell:r => (r.correos||[]).filter(Boolean).map(t => `<div class="sub">${esc(t)}</div>`).join("") || "—"},
      {label:"Horario", cell:r => (r.horario||[]).map(h => `<div class="sub">${esc(h.dias)}: ${esc(h.horas)}</div>`).join("") || "—"},
      {label:"Estado", cell:r => pill(r.activo === false ? ["Inactiva",""] : ["Activa","ok"])}
    ],
    validate:r => {
      const e = {};
      const tels = (r.telefonos||[]).filter(Boolean);
      if(!tels.length) e.telefonos = "Agregue al menos un teléfono.";
      else if(tels.some(t => !/^\+?(506)?\s?\d{4}-?\d{4}$/.test(t.replace(/\s/g,"")))) e.telefonos = "Use el formato 0000-0000 (8 dígitos).";
      const cor = (r.correos||[]).filter(Boolean);
      if(!cor.length) e.correos = "Agregue al menos un correo.";
      else if(cor.some(c => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c))) e.correos = "Hay un correo con formato inválido.";
      if(!(r.horario||[]).some(h => h.dias && h.horas)) e.horario = "Indique al menos una franja de horario completa.";
      return e;
    },
    canDelete:r => {
      const n = S.data.regalias.filter(g => (g.sedes||[]).includes(r.id)).length;
      return n ? `Esta sede está habilitada en ${n} regalía(s). Desactívela en lugar de eliminarla, o quítela primero de esas regalías.` : "";
    }
  },

  anuncios:{
    nuevo:"Nuevo aviso", crear:"Crear aviso", coll:"anuncios", nameKey:"titulo", title:"Avisos", singular:"aviso", icon:"mega",
    intro:"Avisos emergentes que se muestran sobre la pantalla de Inicio del App para informar eventos específicos. Todo aviso se cierra con la X. Las regalías no se registran aquí: el App las muestra automáticamente al colegio del profesional cuando hay disponibles y están en su período de solicitud.",
    defaults:() => ({ publico:"todos", colegios:[], frecuencia:"hasta_accion", prioridad:1, activo:true }),
    fields:[
      {sec:"Contenido"},
      {key:"titulo", label:"Título", type:"text", req:true, span:2, max:90, ph:"Ej. Asamblea General Ordinaria [AÑO]", help:"Puede usar las variables [NOMBRE COLEGIO MIEMBRO] y [AÑO]; el App las reemplaza con los datos de cada profesional."},
      {key:"mensaje", label:"Mensaje", type:"textarea", req:true, span:2, max:280},
      {key:"imagen", label:"Imagen", type:"image", span:2, help:"Recomendado: 600 × 600 px, JPG o PNG."},
      {sec:"Enlace (opcional)"},
      {key:"destinoUrl", label:"Abrir un enlace en WebView", type:"url", span:2, ph:"https://…", help:"Opcional. Si se indica, al tocar el aviso se abre este enlace en un WebView dentro del App. El aviso no tiene botones y siempre se puede cerrar con la X."},
      {sec:"Público y vigencia"},
      {key:"_avisoColegio", type:"info", when:() => esColegio(), text:() => `Este aviso se publicará únicamente para los profesionales del ${colName(perfil())}.`},
      {key:"_avisoDepto", type:"info", when:() => esDepto(), text:() => `Este aviso quedará registrado a nombre de ${perfilNombre(perfil())}, según su usuario del SSO del CFIA.`},
      {key:"registradoPor", label:"Registrado por", type:"select", when:() => false, options:() => perfiles()},
      {key:"publico", label:"Colegios a los que se dirige", type:"select", req:true, when:() => !esColegio(), options:() => [["todos","Todos los colegios"],["colegios","Uno o varios colegios"]]},
      {key:"prioridad", label:"Prioridad", type:"number", min:1, req:true, help:"1 es la más alta. Si hay varios avisos vigentes, se muestra primero el de menor número."},
      {key:"colegios", label:"Colegios", type:"checks", span:2, req:true, when:r => !esColegio() && r.publico === "colegios", options:() => colegiosMiembro()},
      {key:"inicio", label:"Visible desde", type:"datetime", req:true},
      {key:"fin", label:"Visible hasta", type:"datetime", req:true},
      {key:"frecuencia", label:"Frecuencia", type:"select", req:true, span:2, options:() => [["hasta_accion","En cada inicio de sesión mientras esté vigente"],["diaria","Una vez al día"],["una_vez","Una sola vez"]]},
      {key:"activo", label:"Aviso activo", type:"toggle"}
    ],
    filters:[
      {key:"estado", label:"Todos los estados", options:[["Vigente","Vigentes"],["Programado","Programados"],["Finalizado","Finalizados"],["Inactivo","Inactivos"]], test:(r,v) => vigencia(r.inicio, r.fin, r.activo)[0] === v}
    ],
    beforeSave:(r, prev) => { r.registradoPor = prev ? registrador(prev) : perfil(); if(esColegio()){ r.publico = "colegios"; r.colegios = [perfil()]; } return r; },
    visible:puedeVer,
    sort:(a,b) => (a.prioridad||9) - (b.prioridad||9),
    columns:[
      {label:"", cell:r => imgSrc(r.imagen) ? `<img class="thumb" src="${esc(imgSrc(r.imagen))}" alt="">` : `<div class="thumb"></div>`},
      {label:"Aviso", cell:r => `<div class="t1">${esc(r.titulo)}</div><div class="sub">${esc(r.mensaje)}</div>`},
      {label:"Registrado por", cell:r => `<span class="tag">${esc(perfilNombre(registrador(r)))}</span>`},
      {label:"Público", cell:r => r.publico === "colegios" ? (r.colegios||[]).map(c => `<span class="tag">${esc(c)}</span>`).join("") : "Todos"},
      {label:"Enlace", cell:r => r.destinoUrl ? `<span class="tag">WebView</span>` : "—"},
      {label:"Vigencia", cell:r => `<div class="sub mono">${fmtDate(r.inicio,true)}<br>${fmtDate(r.fin,true)}</div>`},
      {label:"Prioridad", cell:r => `<span class="mono">${esc(r.prioridad)}</span>`},
      {label:"Estado", cell:r => pill(vigencia(r.inicio, r.fin, r.activo))}
    ],
    preview:r => {
      const year = r.inicio ? new Date(r.inicio).getFullYear() : new Date().getFullYear();
      const pub = esColegio() ? perfil() : (r.publico === "colegios" && (r.colegios||[])[0]);
      const col = pub ? colName(pub) : "Colegio de Arquitectos de Costa Rica";
      const v = s => esc(s || "").replace(/\[NOMBRE (DE )?COLEGIO MIEMBRO\]/gi, col).replace(/\[AÑO\]/gi, year);
      const src = imgSrc(r.imagen);
      return `<h3>Así se verá en el App</h3><div class="phone"><div class="screen">
        <div class="sb"><img src="assets/cfia_logo.png" alt=""><span></span></div><div class="hello">¡Hola, Mariana!</div>
        <div class="ov"><div class="mdl"><div class="top"><h4>${v(r.titulo) || "Título del aviso"}</h4><span style="font-size:16px;line-height:1">✕</span></div>
          <p>${v(r.mensaje) || "Mensaje del aviso."}</p>
          <div class="img" ${src ? `style="background:url('${esc(src)}') center/cover no-repeat"` : ""}></div>
          ${r.destinoUrl ? `<p style="font-size:10px;color:#76777B;margin:8px 0 0">Al tocar el aviso se abre en WebView: ${esc(r.destinoUrl)}</p>` : ""}
        </div></div></div></div>
        <p class="help" style="font-size:13px;color:var(--muted);margin:12px 4px 0">Vista previa con datos de ejemplo de un profesional del ${esc(col)}. El aviso no tiene botones: se cierra con la X${r.destinoUrl ? " y al tocarlo abre el enlace" : ""}.</p>`;
    },
    validate:r => {
      const e = {};
      if(r.inicio && r.fin && new Date(r.fin) <= new Date(r.inicio)) e.fin = "Debe ser posterior a la fecha de inicio.";
      if(r.destinoUrl && !/^https:\/\//i.test(r.destinoUrl)) e.destinoUrl = "Debe iniciar con https://";
      return e;
    }
  },

  regalias:{
    nuevo:"Nueva regalía", crear:"Crear regalía", coll:"regalias", nameKey:"nombre", title:"Regalías", singular:"regalía", icon:"gift",
    intro:"Catálogo de regalías por colegio. Cada producto define sus propios atributos (dimensiones, talla, color, material o lo que el colegio necesite).",
    defaults:() => ({ campana:new Date().getFullYear() + 1, limitePorPersona:1, atributos:[{nombre:"",valor:""}], sedes:[], activo:true }),
    fields:[
      {sec:"Producto"},
      {key:"colegio", label:"Colegio", type:"select", req:true, options:() => colegiosMiembro()},
      {key:"campana", label:"Campaña (año)", type:"number", req:true, min:2024},
      {key:"nombre", label:"Nombre del producto", type:"text", req:true, span:2, max:60, ph:"Ej. Paraguas Antigoteo"},
      {key:"descripcion", label:"Descripción", type:"textarea", req:true, span:2, max:500},
      {key:"imagen", label:"Imagen del producto", type:"image", span:2, help:"Se recomienda fondo blanco o transparente."},
      {sec:"Atributos del producto"},
      {key:"atributos", label:"Atributos", type:"attrs", span:2, addLabel:"Agregar atributo", dependsOn:["colegio"],
        help:"Agregue los atributos que su colegio necesite; cada uno se muestra en «Características del producto» del App. Si el profesional debe elegir (por ejemplo, la talla), seleccione «El profesional elige» y escriba las opciones separadas por coma."},
      {sec:"Inventario y período de solicitud"},
      {key:"cantidadTotal", label:"Cantidad total", type:"number", req:true, min:0},
      {key:"disponible", label:"Cantidad disponible", type:"number", req:true, min:0, help:"Se descuenta automáticamente con cada reserva."},
      {key:"inicio", label:"Se puede solicitar desde", type:"date", req:true},
      {key:"fin", label:"Se puede solicitar hasta", type:"date", req:true},
      {key:"limitePorPersona", label:"Límite por profesional", type:"number", req:true, min:1},
      {key:"activo", label:"Regalía activa", type:"toggle"},
      {sec:"Envío por Correos de Costa Rica"},
      {key:"envioCorreos", label:"Permitir envío por Correos de Costa Rica", type:"toggle", span:2, help:"El profesional podrá elegir el envío en el App y deberá subir el comprobante de pago del envío."},
      {key:"costoEnvio", label:"Costo del envío (₡)", type:"number", req:true, min:0, when:r => r.envioCorreos === true, help:"Se muestra en el App en el campo «Costo de envío» y como {monto} en la pantalla «¿Cómo solicitar el envío de la regalía a través de Correos de Costa Rica?»."},
      {key:"instruccionesPago", label:"Medios de pago del envío", type:"textarea", req:true, span:2, when:r => r.envioCorreos === true, ph:"Ej. Banco Nacional, cuenta IBAN CR00 0000 0000 0000 0000 00 a nombre de …\nSINPE Móvil 8888-0000 a nombre de …", help:"Describa el o los números de cuenta y bancos y/o el número SINPE Móvil. Se muestran en el App como {descripción} en la pantalla «¿Cómo solicitar el envío de la regalía a través de Correos de Costa Rica?»."},
      {sec:"Retiro"},
      {key:"sedes", label:"Sedes de retiro habilitadas", type:"checks", span:2, req:true, dependsOn:["colegio"], options:r => sedeOpts(r.colegio), empty:"Primero registre sedes en el módulo Sedes, o seleccione un colegio."}
    ],
    filters:[
      {key:"colegio", label:"Todos los colegios", options:() => colegiosMiembro(), test:(r,v) => r.colegio === v},
      {key:"estado", label:"Todos los estados", options:[["Vigente","Vigentes"],["Programada","Programadas"],["Agotada","Agotadas"],["Finalizada","Finalizadas"],["Inactiva","Inactivas"]], test:(r,v) => estadoRegalia(r)[0] === v}
    ],
    sort:(a,b) => (b.campana||0) - (a.campana||0) || (a.nombre||"").localeCompare(b.nombre||""),
    columns:[
      {label:"", cell:r => imgSrc(r.imagen) ? `<img class="thumb" src="${esc(imgSrc(r.imagen))}" alt="">` : `<div class="thumb"></div>`},
      {label:"Producto", cell:r => `<div class="t1">${esc(r.nombre)}</div><div class="sub">${esc(colShort(r.colegio))} · Campaña ${esc(r.campana)}${r.envioCorreos ? " · Envío por Correos" : ""}</div>`},
      {label:"Atributos", cell:r => (r.atributos||[]).filter(a => a.nombre).map(a => `<span class="tag">${esc(a.nombre)}: ${esc(a.valor)}</span>`).join("") || "—"},
      {label:"Disponibles", cell:r => { const t = Number(r.cantidadTotal)||0, d = Number(r.disponible)||0; const p = t ? Math.round(d/t*100) : 0;
        return `<div class="mono" style="min-width:110px">${d} de ${t}</div><div class="bar ${p <= 15 ? "low" : ""}"><i style="width:${p}%"></i></div>`; }},
      {label:"Período", cell:r => `<div class="sub mono">${fmtDate(r.inicio)} al ${fmtDate(r.fin)}</div>`},
      {label:"Estado", cell:r => pill(estadoRegalia(r))}
    ],
    preview:r => {
      const src = imgSrc(r.imagen);
      const det = (r.atributos||[]).filter(a => a.nombre).map(a => a.tipo === "elige"
        ? `<div class="det"><b>${esc(a.nombre)} · Seleccione una opción</b>${opcionesDe(a).map(o => `<span style="display:inline-block;border:1px solid #ccc;border-radius:6px;padding:1px 7px;margin:3px 4px 0 0">${esc(o)}</span>`).join("")}</div>`
        : `<div class="det"><b>${esc(a.nombre)}</b>${esc(a.valor)}</div>`).join("");
      return `<h3>Así se verá en el App</h3><div class="phone"><div class="screen">
        <div class="wv">${ic("back")}<span style="flex:1">Regalías ${esc(r.colegio || "[COLEGIO]")} ${esc(r.campana || "[AÑO]")}</span>✕</div>
        <div class="gift"><div class="img" ${src ? `style="background-image:url('${esc(src)}')"` : ""}></div>
          <h4>${esc(r.nombre || "Nombre del producto")}</h4><p>${esc(r.descripcion || "Descripción del producto.")}</p>
          <div style="font-weight:600;margin-top:10px">Características del producto</div>${det}
          ${r.envioCorreos ? `<div class="det"><b>Entrega</b>Retiro en sede o envío por Correos de Costa Rica${r.costoEnvio ? ` (₡${esc(Number(r.costoEnvio).toLocaleString("es-CR"))})` : ""}</div>` : ""}
          <div class="cta">${Number(r.disponible) > 0 ? "RESERVAR" : "AGOTADO"}</div></div>
      </div></div>`;
    },
    validate:r => {
      const e = {};
      if(r.inicio && r.fin && r.fin < r.inicio) e.fin = "Debe ser igual o posterior a la fecha de inicio.";
      if(Number(r.disponible) > Number(r.cantidadTotal)) e.disponible = "No puede ser mayor que la cantidad total.";
      const at = (r.atributos||[]);
      if(at.some(a => (a.nombre && !a.valor) || (!a.nombre && a.valor))) e.atributos = "Complete el nombre y el valor de cada atributo, o elimine la fila.";
      else if(at.some(a => a.tipo === "elige" && opcionesDe(a).length < 2)) e.atributos = "Los atributos que elige el profesional necesitan al menos dos opciones separadas por coma.";
      const names = at.filter(a => a.nombre).map(a => a.nombre.trim().toLowerCase());
      if(new Set(names).size !== names.length) e.atributos = "Hay atributos con el mismo nombre.";
      return e;
    },
    beforeSave:r => { r.atributos = (r.atributos||[]).filter(a => a.nombre || a.valor); return r; },
    canDelete:r => {
      const n = S.data.reservas.filter(x => x.regalia === r.id).length;
      return n ? `Esta regalía tiene ${n} reserva(s) asociadas. Desactívela en lugar de eliminarla para conservar el historial.` : "";
    }
  },

  reservas:{
    nuevo:"Nueva reserva", crear:"Registrar reserva", coll:"reservas", nameKey:"numero", title:"Reservas de regalías", singular:"reserva", icon:"clip",
    intro:"Reservas realizadas desde el App o registradas manualmente. El inventario de cada regalía se ajusta automáticamente al crear, cambiar de estado o anular una reserva.",
    defaults:() => ({ cantidad:1, estado:"reservada", canal:"gestor", modalidad:"sede", estadoPago:"pendiente" }),
    fields:[
      {sec:"Regalía"},
      {key:"regalia", label:"Regalía", type:"select", req:true, span:2, options:r => S.data.regalias
        .filter(g => g.id === r.regalia || (g.activo !== false && Number(g.disponible) > 0))
        .map(g => [g.id, `${g.nombre} · ${colShort(g.colegio)} ${g.campana} (${g.disponible} disp.)`])},
      {key:"cantidad", label:"Cantidad", type:"number", req:true, min:1},
      {key:"opcionesElegidas", label:"Opciones elegidas por el profesional", type:"choices", span:2, dependsOn:["regalia"], when:r => atributosElige(r.regalia).length > 0},
      {key:"canal", label:"Canal", type:"select", req:true, options:() => [["app","App CFIA"],["gestor","Registro manual en el gestor"]]},
      {sec:"Profesional"},
      {key:"profesional", label:"Nombre del profesional", type:"text", req:true, ph:"Nombre Apellido"},
      {key:"carne", label:"Carné CFIA", type:"text", req:true, ph:"A-00000"},
      {sec:"Datos de retiro"},
      {key:"modalidad", label:"Modalidad de entrega", type:"select", req:true, span:2, dependsOn:["regalia"], options:r => { const g = byId("regalias", r.regalia); return [["sede","Retiro en sede"]].concat(g && g.envioCorreos ? [["correos","Envío por Correos de Costa Rica"]] : []); }},
      {key:"sede", label:"Sede de retiro", type:"select", req:true, span:2, when:r => r.modalidad !== "correos", dependsOn:["regalia"], options:r => { const g = byId("regalias", r.regalia); return g ? (g.sedes||[]).map(id => byId("sedes", id)).filter(Boolean).map(s => [s.id, s.nombre]) : []; }},
      {key:"personaRetira", label:"Persona que retira", type:"text", req:true, ph:"Nombre Apellido"},
      {key:"telefono", label:"Teléfono", type:"tel", req:true, ph:"0000-0000"},
      {key:"correo", label:"Correo electrónico", type:"email", req:true, span:2, ph:"correo@ejemplo.com"},
      {sec:"Envío por Correos de Costa Rica", when:r => r.modalidad === "correos"},
      {key:"envioNombre", label:"Nombre de quien recibe", type:"text", req:true, span:2, when:r => r.modalidad === "correos", ph:"Nombre y apellidos, o razón social"},
      {key:"envioTelefono", label:"Teléfono", type:"tel", req:true, when:r => r.modalidad === "correos", ph:"0000-0000"},
      {key:"envioCedula", label:"Número de cédula", type:"text", when:r => r.modalidad === "correos", ph:"000000000", help:"Opcional para envíos nacionales, pero recomendado."},
      {key:"envioProvincia", label:"Provincia", type:"select", req:true, when:r => r.modalidad === "correos", options:() => PROVINCIAS},
      {key:"envioCanton", label:"Cantón", type:"select", req:true, when:r => r.modalidad === "correos", dependsOn:["envioProvincia"], options:r => cantonesDe(r.envioProvincia)},
      {key:"envioDistrito", label:"Distrito", type:"select", req:true, when:r => r.modalidad === "correos", dependsOn:["envioProvincia","envioCanton"], options:r => distritosDe(r.envioProvincia, r.envioCanton)},
      {key:"envioDireccion", label:"Dirección exacta", type:"textarea", req:true, span:2, when:r => r.modalidad === "correos", ph:"Señas exactas de la dirección de entrega o el código del Apartado Postal Inteligente (API) / Locker si utiliza esta modalidad"},
      {key:"comprobante", label:"Comprobante de pago del envío", type:"file", req:true, span:2, when:r => r.modalidad === "correos", help:"Obligatorio. JPG, PNG o PDF, con un peso máximo de 5 MB. Lo sube el profesional desde el App; en un registro manual se adjunta aquí."},
      {key:"estadoPago", label:"Revisión del comprobante", type:"select", req:true, when:r => r.modalidad === "correos", options:() => ESTADOS_PAGO},
      {sec:"Estado"},
      {key:"estado", label:"Estado", type:"select", req:true, options:() => ESTADOS_RES},
      {key:"fechaEntrega", label:"Fecha de entrega", type:"datetime", req:true, when:r => r.estado === "entregada"},
      {key:"observaciones", label:"Observaciones", type:"textarea", span:2}
    ],
    filters:[
      {key:"estado", label:"Todos los estados", options:ESTADOS_RES, test:(r,v) => r.estado === v},
      {key:"colegio", label:"Todos los colegios", options:() => colegiosMiembro(), test:(r,v) => (byId("regalias", r.regalia)||{}).colegio === v},
      {key:"regalia", label:"Todas las regalías", options:() => S.data.regalias.map(g => [g.id, `${g.nombre} (${g.campana})`]), test:(r,v) => r.regalia === v},
      {key:"modalidad", label:"Todas las entregas", options:[["sede","Retiro en sede"],["correos","Correos de Costa Rica"]], test:(r,v) => (r.modalidad || "sede") === v}
    ],
    sort:(a,b) => (b.creadoEn||"").localeCompare(a.creadoEn||""),
    columns:[
      {label:"N.º de reserva", cell:r => `<span class="t1 mono">${esc(r.numero)}</span><div class="sub">${r.canal === "app" ? "App CFIA" : "Gestor"}</div>`},
      {label:"Profesional", cell:r => `<div class="t1">${esc(r.profesional)}</div><div class="sub mono">${esc(r.carne)}</div>`},
      {label:"Regalía", cell:r => { const g = byId("regalias", r.regalia); return g ? `<div>${esc(g.nombre)}</div><div class="sub">${esc(colShort(g.colegio))} · ${esc(g.campana)} · ${esc(r.cantidad)} u.${Object.entries(r.opcionesElegidas || {}).filter(([k, v]) => v).map(([k, v]) => " · " + esc(k) + ": " + esc(v)).join("")}</div>` : `<span class="sub">Regalía eliminada</span>`; }},
      {label:"Entrega", cell:r => r.modalidad === "correos"
        ? `<div>Correos de Costa Rica</div><div class="sub">${esc(r.envioNombre || "")}</div><div class="sub">${esc([r.envioProvincia, r.envioCanton, r.envioDistrito].filter(Boolean).join(", "))}</div>${r.comprobante ? `<button class="btn sm" data-comp="${esc(r.id)}" style="margin-top:6px">${ic("eye")}Ver comprobante</button> ${pagoPill(r.estadoPago)}` : `<span class="pill warn" style="margin-top:6px">Sin comprobante</span>`}`
        : esc((byId("sedes", r.sede)||{}).nombre || "—")},
      {label:"Registrada", cell:r => `<span class="sub mono">${fmtDate(r.creadoEn, true)}</span>`},
      {label:"Estado", cell:r => resPill(r.estado)}
    ],
    searchText:r => [r.numero, r.profesional, r.carne, r.personaRetira, r.correo, (byId("regalias", r.regalia)||{}).nombre, r.modalidad === "correos" ? "correos" : ""].join(" "),
    validate:(r, prev) => {
      const e = {};
      if(r.telefono && !/^\d{4}-?\d{4}$/.test(r.telefono.trim())) e.telefono = "Use el formato 0000-0000.";
      const faltan = atributosElige(r.regalia).filter(a => !((r.opcionesElegidas || {})[a.nombre]));
      if(faltan.length) e.opcionesElegidas = "Seleccione: " + faltan.map(a => a.nombre).join(", ") + ".";
      if(r.modalidad === "correos" && !((byId("regalias", r.regalia)||{}).envioCorreos)) e.modalidad = "Esta regalía no permite envío por Correos de Costa Rica.";
      if(r.modalidad === "correos" && r.envioTelefono && !/^\d{4}-?\d{4}$/.test(r.envioTelefono.trim())) e.envioTelefono = "Use el formato 0000-0000.";
      if(r.modalidad === "correos" && r.envioCedula && !/^\d{9,12}$/.test(r.envioCedula.replace(/[\s-]/g, ""))) e.envioCedula = "Ingrese una cédula válida (9 a 12 dígitos).";
      if(r.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.correo)) e.correo = "Ingrese un correo válido.";
      if(r.carne && !/^[A-Za-z]{1,4}-?\d{2,7}$/.test(r.carne.trim())) e.carne = "Use el formato del carné, por ejemplo A-12345.";
      const g = byId("regalias", r.regalia);
      if(g){
        const q = Number(r.cantidad)||0;
        const lim = Number(g.limitePorPersona)||1;
        const prevSame = prev && prev.regalia === r.regalia && consume(prev.estado) ? Number(prev.cantidad)||0 : 0;
        if(consume(r.estado) && q - prevSame > (Number(g.disponible)||0)) e.cantidad = `Solo quedan ${g.disponible} unidad(es) disponibles.`;
        const otras = S.data.reservas.filter(x => x.id !== (prev && prev.id) && x.regalia === r.regalia && consume(x.estado) && (x.carne||"").toUpperCase().replace("-","") === (r.carne||"").toUpperCase().replace("-",""))
          .reduce((s,x) => s + (Number(x.cantidad)||0), 0);
        if(consume(r.estado) && otras + q > lim) e.carne = `Este profesional supera el límite de ${lim} unidad(es) para esta regalía.`;
      }
      return e;
    },
    beforeSave:(r, prev) => { if(!prev) r.numero = `RG-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`; else r.numero = prev.numero; if(r.estado !== "entregada") r.fechaEntrega = ""; return r; },
    afterSave:async (r, prev, id) => {
      const deltas = {};
      if(prev && consume(prev.estado) && prev.regalia) deltas[prev.regalia] = (deltas[prev.regalia]||0) + (Number(prev.cantidad)||0);
      if(r && consume(r.estado) && r.regalia) deltas[r.regalia] = (deltas[r.regalia]||0) - (Number(r.cantidad)||0);
      for(const [gid, d] of Object.entries(deltas)){
        if(!d) continue;
        const g = byId("regalias", gid); if(!g) continue;
        const before = Object.assign({}, g); delete before.id;
        const after = Object.assign({}, before, { disponible:Math.max(0, (Number(g.disponible)||0) + d), actualizadoEn:nowISO(), actualizadoPor:S.meId || null });
        await putRecord("regalias", gid, after);
        await writeAudit("regalias", gid, g.nombre, "modificar",
          [{campo:"disponible", etiqueta:"Cantidad disponible", antes:String(g.disponible), despues:String(after.disponible)}],
          `Ajuste automático de inventario por la reserva ${(r || prev).numero}`);
      }
    },
    onDelete:async r => { await MODS.reservas.afterSave(null, r); },
    deleteText:"Si la reserva estaba vigente, las unidades vuelven al inventario de la regalía."
  },

  novedades:{
    nuevo:"Nuevo evento, novedad o anuncio", crear:"Crear publicación", coll:"novedades", nameKey:"titulo", title:"Eventos, novedades y anuncios", singular:"evento, novedad o anuncio", icon:"news",
    intro:"Contenido de la sección «Novedades CFIA» de la pantalla de Inicio: eventos, novedades y anuncios de los colegios y de los departamentos del CFIA (CENDEPRO, CFIA y Oficinas Regionales).",
    defaults:() => ({ tipo:"evento", duracion:"fecha", btnPrimario:"CONOCER MÁS", accionPrimario:"webview", publico:"todos", colegios:[], estado:"borrador", destacado:false }),
    fields:[
      {sec:"Contenido"},
      {key:"tipo", label:"Tipo", type:"select", req:true, options:() => TIPOS_PUB},
      {key:"estado", label:"Estado", type:"select", req:true, options:() => [["borrador","Borrador"],["publicado","Publicado"]]},
      {key:"titulo", label:"Título", type:"text", req:true, span:2, max:80, ph:"Ej. Congreso Nacional de Ingeniería 2027"},
      {key:"resumen", label:"Resumen", type:"textarea", span:2, max:300},
      {key:"imagen", label:"Imagen", type:"image", span:2, help:"Recomendado: 1200 × 800 px."},
      {sec:"Datos del evento", when:r => r.tipo === "evento"},
      {key:"duracion", label:"Duración del evento", type:"select", req:true, when:r => r.tipo === "evento", options:() => [["fecha","Fecha específica"],["rango","Rango de fechas"]]},
      {key:"fecha", label:"Fecha del evento", type:"date", req:true, when:r => r.tipo === "evento", help:"Si el evento tiene un rango de fechas, es la fecha de inicio."},
      {key:"fechaFin", label:"Fecha de finalización", type:"date", req:true, when:r => r.tipo === "evento" && r.duracion === "rango"},
      {key:"hora", label:"Hora", type:"time", when:r => r.tipo === "evento"},
      {key:"lugar", label:"Lugar", type:"text", span:2, req:true, ph:"Ej. Auditorio CFIA", when:r => r.tipo === "evento"},
      {sec:"Botones"},
      {key:"btnPrimario", label:"Texto del botón principal", type:"text", req:true, max:24},
      {key:"accionPrimario", label:"Acción del botón principal", type:"select", req:true, options:() => ACCIONES_BTN},
      {key:"urlPrimario", label:"Enlace del botón principal", type:"url", req:true, span:2, ph:"https://…"},
      {key:"btnSecundario", label:"Texto del botón secundario", type:"text", max:24, help:"Opcional. Déjelo vacío para no mostrarlo."},
      {key:"accionSecundario", label:"Acción del botón secundario", type:"select", req:true, when:r => !!r.btnSecundario, options:() => ACCIONES_BTN},
      {key:"urlSecundario", label:"Enlace del botón secundario", type:"url", req:true, span:2, when:r => !!r.btnSecundario, ph:"https://…"},
      {sec:"Publicación"},
      {key:"publicarDesde", label:"Publicar desde", type:"datetime"},
      {key:"publicarHasta", label:"Publicar hasta", type:"datetime"},
      {key:"_avisoColegioNov", type:"info", when:() => esColegio(), text:() => `Esta publicación se mostrará únicamente a los profesionales del ${colName(perfil())}.`},
      {key:"_avisoDeptoNov", type:"info", when:() => esDepto(), text:() => `Esta publicación quedará registrada a nombre de ${perfilNombre(perfil())}, según su usuario del SSO del CFIA.`},
      {key:"registradoPor", label:"Registrado por", type:"select", when:() => false, options:() => perfiles()},
      {key:"publico", label:"Se muestra a", type:"select", req:true, when:() => !esColegio(), options:() => [["todos","Todos los profesionales"],["colegios","Profesionales de colegios específicos"]]},
      {key:"destacado", label:"Mostrar primero en el carrusel", type:"toggle"},
      {key:"colegios", label:"Colegios", type:"checks", span:2, req:true, when:r => !esColegio() && r.publico === "colegios", options:() => colegiosMiembro()}
    ],
    beforeSave:(r, prev) => { r.registradoPor = prev ? registrador(prev) : perfil(); if(esColegio()){ r.publico = "colegios"; r.colegios = [perfil()]; } return r; },
    visible:puedeVer,
    filters:[
      {key:"tipo", label:"Todos los tipos", options:[["evento","Eventos"],["novedad","Novedades"],["anuncio","Anuncios"]], test:(r,v) => r.tipo === v},
      {key:"registradoPor", label:"Todos los registradores", options:() => perfiles(), test:(r,v) => registrador(r) === v},
      {key:"estado", label:"Todos los estados", options:[["publicado","Publicados"],["borrador","Borradores"]], test:(r,v) => r.estado === v}
    ],
    sort:(a,b) => (b.destacado?1:0) - (a.destacado?1:0) || (b.fecha||b.publicarDesde||"").localeCompare(a.fecha||a.publicarDesde||""),
    columns:[
      {label:"", cell:r => imgSrc(r.imagen) ? `<img class="thumb" src="${esc(imgSrc(r.imagen))}" alt="">` : `<div class="thumb"></div>`},
      {label:"Título", cell:r => `<div class="t1">${r.destacado ? "★ " : ""}${esc(r.titulo)}</div><div class="sub">${esc(r.resumen)}</div>`},
      {label:"Tipo", cell:r => esc((TIPOS_PUB.find(t => t[0] === r.tipo) || [0, r.tipo])[1])},
      {label:"Registrado por", cell:r => `<span class="tag">${esc(perfilNombre(registrador(r)))}</span>`},
      {label:"Fecha y lugar", cell:r => r.tipo === "evento" ? `<div class="mono">${fmtDate(r.fecha)}${r.duracion === "rango" && r.fechaFin ? " al " + fmtDate(r.fechaFin) : ""} ${esc(r.hora||"")}</div><div class="sub">${esc(r.lugar)}</div>` : "—"},
      {label:"Publicación", cell:r => { if(r.estado !== "publicado") return pill(["Borrador",""]); return pill(vigencia(r.publicarDesde, r.publicarHasta, true)); }}
    ],
    preview:r => {
      const src = imgSrc(r.imagen);
      return `<h3>Así se verá en el App</h3><div class="phone"><div class="screen">
        <div class="sb"><img src="assets/cfia_logo.png" alt=""><span></span></div>
        <div style="padding:14px 14px 0;font-weight:600;font-size:13px;display:flex;justify-content:space-between"><span>Novedades CFIA</span><span style="font-size:11px">VER TODAS</span></div>
        <div class="evt"><div class="img" ${src ? `style="background-image:url('${esc(src)}')"` : ""}></div><div class="in">
          <h4>${esc(r.titulo || "Título del evento: congreso, webinar, etc")}</h4>
          ${r.tipo === "evento" ? `<div class="m">${ic("cal")}${r.fecha ? fmtDate(r.fecha) : "DD/MM/AAAA"}${r.duracion === "rango" ? " al " + (r.fechaFin ? fmtDate(r.fechaFin) : "DD/MM/AAAA") : ""}${r.hora ? " · " + esc(r.hora) : ""}</div><div class="m">${ic("pin")}${esc((r.lugar || "Lugar").toUpperCase())}</div>` : `<div class="m" style="display:block">${esc(r.resumen || "")}</div>`}
          <div class="cta">${esc(r.btnPrimario || "BOTÓN PRINCIPAL")}</div>${r.btnSecundario ? `<div class="cta" style="background:#fff;border:1px solid #FCB429;margin-top:6px">${esc(r.btnSecundario)}</div>` : ""}
        </div></div></div></div>`;
    },
    validate:r => {
      const e = {};
      if(r.publicarDesde && r.publicarHasta && new Date(r.publicarHasta) <= new Date(r.publicarDesde)) e.publicarHasta = "Debe ser posterior a la fecha de inicio.";
      if(r.tipo === "evento" && r.duracion === "rango" && r.fecha && r.fechaFin && r.fechaFin <= r.fecha) e.fechaFin = "Debe ser posterior a la fecha del evento.";
      if(r.urlPrimario && !/^https:\/\//i.test(r.urlPrimario)) e.urlPrimario = "Debe iniciar con https://";
      if(r.btnSecundario && r.urlSecundario && !/^https:\/\//i.test(r.urlSecundario)) e.urlSecundario = "Debe iniciar con https://";
      if(r.estado === "publicado" && !imgSrc(r.imagen)) e.imagen = "Agregue una imagen antes de publicar.";
      return e;
    }
  }
};
const MOD_ORDER = ["colegios","tramites","sedes","anuncios","regalias","reservas","novedades"];

/* =====================================================================
   Navegación
   ===================================================================== */
function renderNav(){
  const items = [["resumen","Resumen","home"]].concat(MOD_ORDER.map(k => [k, MODS[k].title, MODS[k].icon])).concat([["auditoria","Auditoría","eye"]]);
  $("#nav").innerHTML = items.map(([k,t,i], idx) =>
    (idx === 1 ? `<div class="grp">Contenido del App</div>` : "") + (k === "regalias" ? `<div class="grp">Regalías</div>` : "") + (k === "novedades" ? `<div class="grp">Comunicación</div>` : "") + (k === "auditoria" ? `<div class="grp">Control</div>` : "") +
    `<button data-route="${k}" ${S.route === k ? 'aria-current="page"' : ""}>${ic(i)}<span>${esc(t)}</span>${MODS[k] && S.loaded[MODS[k].coll] ? `<span class="cnt">${S.data[MODS[k].coll].length}</span>` : ""}</button>`
  ).join("");
}
$("#nav").addEventListener("click", e => {
  const b = e.target.closest("[data-route]"); if(!b) return;
  S.route = b.dataset.route; $("#side").classList.remove("open"); renderNav(); renderView(); $("#main").scrollTop = 0;
});
$("#menuBtn").addEventListener("click", () => $("#side").classList.toggle("open"));

function banner(){
  if(S.mode === "memoria") return `<div class="banner">${ic("info")}<div><strong>Modo demostración.</strong> ${window.CFIA_DATOS && window.CFIA_DATOS.exportado ? `Se muestran los datos exportados del gestor el ${fmtDate(window.CFIA_DATOS.exportado, true)}. ` : ""}Los cambios no se guardan al recargar; abra el gestor desde su enlace de claude.ai para guardarlos de forma permanente y compartida.</div></div>`;
  if(!S.canWrite) return `<div class="banner">${ic("info")}<div><strong>Acceso de solo lectura.</strong> Puede consultar los registros, pero no crear ni modificar. Solicite permiso de colaborador al administrador del gestor.</div></div>`;
  return "";
}

function renderView(){
  const v = $("#view");
  if(S.route === "resumen") v.innerHTML = viewResumen();
  else if(S.route === "auditoria") v.innerHTML = viewAuditShell();
  else v.innerHTML = viewModuleShell(S.route);
  refreshView();
}
function refreshView(){
  if(S.route === "resumen"){ $("#view").innerHTML = viewResumen(); resolveWho($("#view")); return; }
  if(S.route === "auditoria"){ renderAuditRows(); return; }
  renderRows(S.route);
}

/* =====================================================================
   Resumen
   ===================================================================== */
function viewResumen(){
  const d = S.data;
  const tram = d.tramites.filter(t => t.activo !== false).length;
  const anu = d.anuncios.filter(a => vigencia(a.inicio, a.fin, a.activo)[0] === "Vigente").length;
  const regV = d.regalias.filter(g => estadoRegalia(g)[0] === "Vigente");
  const pend = d.reservas.filter(r => r.estado === "reservada").length;
  const nov = d.novedades.filter(n => n.estado === "publicado" && vigencia(n.publicarDesde, n.publicarHasta, true)[0] === "Vigente").length;
  const loading = S.mode === "cargando";
  const k = (n, l, route) => `<button class="card kpi" data-go="${route}" style="text-align:left;cursor:pointer;border-top:0;border-right:0;border-bottom:0"><div class="n">${loading ? "–" : n}</div><div class="l">${l}</div></button>`;
  const inv = regV.concat(d.regalias.filter(g => estadoRegalia(g)[0] === "Agotada")).slice(0, 6).map(g => {
    const t = Number(g.cantidadTotal)||0, x = Number(g.disponible)||0, p = t ? Math.round(x/t*100) : 0;
    return `<div class="prow"><div class="grow"><div><strong>${esc(g.nombre)}</strong></div><small>${esc(colShort(g.colegio))} · cierra ${fmtDate(g.fin)}</small><div class="bar ${p <= 15 ? "low" : ""}"><i style="width:${p}%"></i></div></div><div class="mono" style="white-space:nowrap">${x} / ${t}</div></div>`;
  }).join("") || `<div class="empty" style="padding:28px">No hay regalías en período de solicitud.</div>`;
  const log = d.auditoria.slice(0, 8).map(a => `<div class="prow"><div class="grow"><div>${accionTxt(a.accion)} ${esc((MODS[a.modulo]||{}).singular || a.modulo)}: <strong>${esc(a.registroNombre || "sin nombre")}</strong></div><small>${who(a.actorId)} · ${rel(a.fecha)}</small></div></div>`).join("")
    || `<div class="empty" style="padding:28px">Aún no hay cambios registrados.</div>`;
  const prox = d.novedades.filter(n => n.tipo === "evento" && n.fecha && (n.duracion === "rango" && n.fechaFin ? n.fechaFin : n.fecha) >= new Date().toISOString().slice(0,10)).sort((a,b) => a.fecha.localeCompare(b.fecha)).slice(0, 4)
    .map(n => `<div class="prow"><div class="grow"><div><strong>${esc(n.titulo)}</strong></div><small>${fmtDate(n.fecha)}${n.duracion === "rango" && n.fechaFin ? " al " + fmtDate(n.fechaFin) : ""} · ${esc(n.lugar || "")}</small></div>${n.estado === "publicado" ? pill(["Publicado","ok"]) : pill(["Borrador",""])}</div>`).join("")
    || `<div class="empty" style="padding:28px">No hay eventos próximos.</div>`;
  return `${banner()}<div class="pagehead"><div><h1>Resumen</h1><p>Estado actual del contenido que se publica en el App CFIA.</p></div></div>
    <div class="kpis">${k(tram,"Trámites activos","tramites")}${k(anu,"Avisos vigentes","anuncios")}${k(regV.length,"Regalías en solicitud","regalias")}${k(pend,"Reservas por entregar","reservas")}${k(nov,"Eventos, novedades y anuncios publicados","novedades")}</div>
    <div class="dash"><div style="display:flex;flex-direction:column;gap:18px">
      <section class="card panel"><h2>Inventario de regalías</h2><div class="rows">${inv}</div></section>
      <section class="card panel"><h2>Próximos eventos</h2><div class="rows">${prox}</div></section></div>
      <section class="card panel"><h2>Últimos cambios</h2><div class="rows">${log}</div></section></div>`;
}
$("#view").addEventListener("click", e => {
  const g = e.target.closest("[data-go]"); if(g){ S.route = g.dataset.go; renderNav(); renderView(); }
});
const accionTxt = a => ({crear:"Creó", modificar:"Modificó", eliminar:"Eliminó"}[a] || a);

/* =====================================================================
   Vistas de módulo (listado)
   ===================================================================== */
function viewModuleShell(k){
  const m = MODS[k]; S.f[k] = S.f[k] || {};
  const fl = (m.filters||[]).map(f => {
    const opts = typeof f.options === "function" ? f.options() : f.options;
    return `<select data-filter="${f.key}" aria-label="${esc(f.label)}"><option value="">${esc(f.label)}</option>${opts.map(o => `<option value="${esc(o[0])}" ${S.f[k][f.key] === o[0] ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select>`;
  }).join("");
  return `${banner()}<div class="pagehead"><div><h1>${esc(m.title)}</h1><p>${esc(m.intro)}</p></div>
    <div class="actions">${k === "reservas" || k === "tramites" ? `<button class="btn" data-xls="${k}">${ic("down")}Exportar Excel</button>` : ""}${S.downloads ? `<button class="btn" data-export="${k}">${ic("down")}Exportar JSON</button>` : ""}
    <button class="btn pri" data-new="${k}" ${S.canWrite && (!m.canCreate || m.canCreate()) ? "" : "disabled"}>${ic("plus")}${esc(m.nuevo)}</button></div></div>
    <div class="toolbar"><div class="search">${ic("search")}<input type="text" data-q placeholder="Buscar en ${esc(m.title.toLowerCase())}" value="${esc(S.f[k].q || "")}"></div>${fl}</div>
    <div class="card"><div class="tablewrap" id="rows"></div></div>`;
}
function filtered(k){
  const m = MODS[k], f = S.f[k] || {};
  let rows = S.data[m.coll].slice();
  if(m.visible) rows = rows.filter(m.visible);
  (m.filters||[]).forEach(fl => { if(f[fl.key]) rows = rows.filter(r => fl.test(r, f[fl.key])); });
  if(f.q){
    const q = f.q.toLowerCase();
    rows = rows.filter(r => (m.searchText ? m.searchText(r) : JSON.stringify(r)).toLowerCase().includes(q));
  }
  return rows.sort(m.sort);
}
function renderRows(k){
  const box = $("#rows"); if(!box) return;
  const m = MODS[k];
  if(!S.loaded[m.coll]){ box.innerHTML = `<div class="empty">Cargando registros…</div>`; return; }
  const rows = filtered(k);
  if(!rows.length){
    const any = m.visible ? S.data[m.coll].filter(m.visible).length : S.data[m.coll].length;
    box.innerHTML = `<div class="empty"><h3>${any ? "Ningún registro coincide con la búsqueda" : "Todavía no hay registros"}</h3><p>${any ? "Pruebe con otro texto o quite los filtros." : `Use «${esc(m.nuevo)}» para agregar el primero.`}</p></div>`;
    return;
  }
  box.innerHTML = `<table class="grid"><thead><tr>${m.columns.map(c => `<th>${esc(c.label)}</th>`).join("")}<th><span class="hidden">Acciones</span></th></tr></thead><tbody>
    ${rows.map(r => `<tr data-open="${esc(r.id)}">${m.columns.map(c => `<td>${c.cell(r)}</td>`).join("")}
      <td class="act"><button class="iconbtn" data-hist="${esc(r.id)}" title="Historial de cambios" aria-label="Historial de cambios">${ic("hist")}</button>${S.canWrite ? `<button class="iconbtn" data-del="${esc(r.id)}" title="Eliminar" aria-label="Eliminar">${ic("trash")}</button>` : ""}</td></tr>`).join("")}
  </tbody></table>`;
}
$("#view").addEventListener("input", e => {
  if(e.target.matches("[data-q]")){ S.f[S.route].q = e.target.value; renderRows(S.route); }
  if(e.target.matches("[data-aq]")){ S.af.q = e.target.value; renderAuditRows(); }
});
$("#view").addEventListener("change", e => {
  if(e.target.matches("[data-filter]")){ S.f[S.route][e.target.dataset.filter] = e.target.value; renderRows(S.route); }
  if(e.target.matches("[data-af]")){ S.af[e.target.dataset.af] = e.target.value; renderAuditRows(); }
});
$("#view").addEventListener("click", async e => {
  const k = S.route;
  if(e.target.closest("a[href]")) return;
  const cp = e.target.closest("[data-comp]");
  if(cp){ e.stopPropagation(); const rr = byId("reservas", cp.dataset.comp); if(rr) openFile(rr.comprobante, rr.numero); return; }
  const t = e.target.closest("[data-new],[data-del],[data-hist],[data-open],[data-export],[data-aexp],[data-arow],[data-xls],[data-axls]");
  if(!t) return;
  if(t.dataset.new) return openForm(k, null);
  if(t.dataset.export) return exportJSON(k);
  if(t.dataset.xls) return t.dataset.xls === "tramites" ? exportTramitesXLSX() : exportReservasXLSX();
  if(t.dataset.axls !== undefined) return exportAuditXLSX();
  if(t.dataset.aexp !== undefined) return exportAudit();
  if(t.dataset.arow) return toggleAuditRow(t);
  if(t.dataset.hist){ e.stopPropagation(); return openHistory(k, t.dataset.hist); }
  if(t.dataset.del){
    e.stopPropagation();
    const m = MODS[k], r = byId(m.coll, t.dataset.del); if(!r) return;
    const block = m.canDelete && m.canDelete(r);
    if(block){ await confirmBox("No se puede eliminar", block, "Entendido", false); return; }
    if(!await confirmBox(`¿Eliminar ${m.singular}?`, `Se eliminará «${r[m.nameKey] || "registro"}». ${m.deleteText || ""} La acción quedará registrada en la auditoría.`)) return;
    try { await deleteRecord(k, r); if(m.onDelete) await m.onDelete(r); toast("Registro eliminado."); } catch(err){ handleWriteError(err); }
    return;
  }
  if(t.dataset.open) return openForm(k, t.dataset.open);
});

async function exportJSON(k){
  const m = MODS[k];
  try { await S.downloads.save({ filename:`app-cfia-${k}-${new Date().toISOString().slice(0,10)}.json`, data:JSON.stringify(S.data[m.coll], null, 2) }); }
  catch(e){ if(e && e.code && e.code !== "declined" && e.code !== "cancelled") toast("No fue posible exportar el archivo.", true); }
}

/* =====================================================================
   Formulario (drawer)
   ===================================================================== */
function fieldHTML(f, r){
  const v = r[f.key];
  const id = "f_" + f.key;
  const req = f.req ? `<span class="req" aria-hidden="true">*</span>` : "";
  const help = f.help ? `<span class="help">${esc(f.help)}</span>` : "";
  const ro = S.canWrite && !(f.lock && f.lock(r)) ? "" : "disabled";
  let ctl = "";
  const max = f.max ? `maxlength="${f.max}"` : "";
  switch(f.type){
    case "text": case "url": case "email": case "tel":
      ctl = `<input id="${id}" type="${f.type}" value="${esc(v)}" placeholder="${esc(f.ph||"")}" ${max} ${ro}>`; break;
    case "number": ctl = `<input id="${id}" type="number" inputmode="numeric" value="${esc(v)}" ${f.min != null ? `min="${f.min}"` : ""} ${ro}>`; break;
    case "date": ctl = `<input id="${id}" type="date" value="${esc(v)}" ${ro}>`; break;
    case "time": ctl = `<input id="${id}" type="time" value="${esc(v)}" ${ro}>`; break;
    case "datetime": ctl = `<input id="${id}" type="datetime-local" value="${esc((v||"").slice(0,16))}" ${ro}>`; break;
    case "textarea": ctl = `<textarea id="${id}" placeholder="${esc(f.ph||"")}" ${max} ${ro}>${esc(v)}</textarea>`; break;
    case "select": {
      const opts = f.options(r);
      ctl = `<select id="${id}" ${ro}><option value="">Seleccione…</option>${opts.map(o => `<option value="${esc(o[0])}" ${o[0] == v ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select>`; break;
    }
    case "checks": {
      const opts = f.options(r); const set = new Set(v || []);
      ctl = opts.length ? `<div class="checks" id="${id}">${opts.map(o => `<label><input type="checkbox" value="${esc(o[0])}" ${set.has(o[0]) ? "checked" : ""} ${ro}>${esc(o[1])}</label>`).join("")}</div>` : `<div class="help" id="${id}">${esc(f.empty || "No hay opciones disponibles.")}</div>`;
      break;
    }
    case "info": return `<div class="f span2" data-key="${f.key}"><div class="banner" style="margin:0">${ic("info")}<div>${esc(f.text(r))}</div></div></div>`;
    case "choices": {
      const at = atributosElige(r.regalia); const val = v || {};
      ctl = `<div class="choices" id="${id}">${at.map(a => `<label>${esc(a.nombre)}<select data-attr="${esc(a.nombre)}" ${ro}><option value="">Seleccione…</option>${opcionesDe(a).map(o => `<option value="${esc(o)}" ${val[a.nombre] === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`).join("")}</div>`;
      break;
    }
    case "toggle": return `<div class="f" data-key="${f.key}"><label class="toggle"><input id="${id}" type="checkbox" ${v !== false && v != null ? "checked" : ""} ${ro}><span>${esc(f.label)}</span></label>${help}</div>`;
    case "list": {
      const items = (v && v.length ? v : [""]);
      ctl = `<div class="listed" id="${id}">${items.map(x => listRow(f, x)).join("")}${S.canWrite ? `<button type="button" class="btn sm ghost addrow" data-add="${f.key}">${ic("plus")}${esc(f.addLabel)}</button>` : ""}</div>`; break;
    }
    case "pairs": case "attrs": {
      const cols = f.type === "attrs" ? [{k:"nombre", ph:"Atributo (ej. Dimensiones)"},{k:"valor", ph:"Valor, u opciones separadas por coma"}] : f.cols;
      const items = (v && v.length ? v : [{}]);
      let dl = "";
      if(f.type === "attrs"){
        const names = new Set(); S.data.regalias.filter(g => !r.colegio || g.colegio === r.colegio).forEach(g => (g.atributos||[]).forEach(a => a.nombre && names.add(a.nombre)));
        ["Dimensiones","Color","Talla","Material","Capacidad","Peso"].forEach(n => names.add(n));
        dl = `<datalist id="dl_attr">${[...names].map(n => `<option value="${esc(n)}">`).join("")}</datalist>`;
      }
      ctl = `<div class="listed ${f.type === "attrs" ? "attrs attrs3" : "attrs"}" id="${id}">${items.map(x => pairRow(f, cols, x)).join("")}${S.canWrite ? `<button type="button" class="btn sm ghost addrow" data-add="${f.key}">${ic("plus")}${esc(f.addLabel)}</button>` : ""}${dl}</div>`; break;
    }
    case "file": {
      const src = imgSrc(v); const isPdf = v && /pdf/i.test(v.tipo || v.nombre || "");
      const canUp = S.canWrite && !(f.lock && f.lock(r)) && (S.assets || S.mode === "memoria");
      ctl = `<div class="imgbox" id="${id}" data-file='${esc(JSON.stringify(v || null))}'><div class="ph" ${src && !isPdf ? `style="background-image:url('${esc(src)}')"` : ""}>${src ? (isPdf ? "PDF" : "") : "Sin archivo"}</div>
        <div class="ctl">${src ? `<p style="margin:0;font-weight:600;word-break:break-all">${esc(v.nombre || "Comprobante")}</p>` : `<p style="margin:0;color:var(--muted)">El profesional aún no ha subido el comprobante.</p>`}
        <div class="actions">${src ? `<button type="button" class="btn sm" data-viewfile="${f.key}">${ic("eye")}Ver comprobante</button>` : ""}${canUp ? `<label class="btn sm">${ic("up")}${src ? "Reemplazar" : "Adjuntar"}<input type="file" accept="image/png,image/jpeg,application/pdf" hidden data-upload="${f.key}"></label>${src ? `<button type="button" class="btn sm ghost" data-clearimg="${f.key}">Quitar</button>` : ""}` : ""}</div></div></div>`;
      break;
    }
    case "image": {
      const src = imgSrc(v);
      const canUp = S.canWrite && !(f.lock && f.lock(r)) && (S.assets || S.mode === "memoria");
      ctl = `<div class="imgbox" id="${id}" data-img='${esc(JSON.stringify(v || {}))}'><div class="ph" ${src ? `style="background-image:url('${esc(src)}')"` : ""}>${src ? "" : "Sin imagen"}</div>
        <div class="ctl">${canUp ? `<div class="actions"><label class="btn sm">${ic("up")}Subir imagen<input type="file" accept="image/png,image/jpeg,image/webp" hidden data-upload="${f.key}"></label>${src ? `<button type="button" class="btn sm ghost" data-clearimg="${f.key}">Quitar</button>` : ""}</div>` : ""}
        <input type="url" data-imgurl placeholder="O pegue la URL pública de la imagen (https://…)" value="${esc(v && !v.id && v.url && !String(v.url).startsWith("data:") ? v.url : "")}" ${ro}></div></div>`;
      break;
    }
  }
  return `<div class="f ${f.span === 2 ? "span2" : ""}" data-key="${f.key}">${f.type === "checks" || f.type === "list" || f.type === "pairs" || f.type === "attrs" || f.type === "image" || f.type === "file" ? `<span class="lbl">${esc(f.label)}${req}</span>` : `<label for="${id}">${esc(f.label)}${req}</label>`}${ctl}${help}<span class="err" role="alert"></span></div>`;
}
const listRow = (f, x) => `<div class="li"><input type="${f.itemType}" value="${esc(x)}" placeholder="${esc(f.ph||"")}" ${S.canWrite ? "" : "disabled"}>${S.canWrite ? `<button type="button" class="iconbtn" data-rm aria-label="Quitar">${ic("x")}</button>` : ""}</div>`;
const pairRow = (f, cols, x) => `<div class="li">${cols.map((c, i) => `<input type="text" data-c="${c.k}" value="${esc((x||{})[c.k])}" placeholder="${esc(c.ph)}" ${f.type === "attrs" && i === 0 ? 'list="dl_attr"' : ""} ${S.canWrite ? "" : "disabled"}>`).join("")}${f.type === "attrs" ? `<select data-c="tipo" ${S.canWrite ? "" : "disabled"} aria-label="Tipo de atributo"><option value="info" ${(x||{}).tipo !== "elige" ? "selected" : ""}>Informativo</option><option value="elige" ${(x||{}).tipo === "elige" ? "selected" : ""}>El profesional elige</option></select>` : ""}${S.canWrite ? `<button type="button" class="iconbtn" data-rm aria-label="Quitar">${ic("x")}</button>` : `<span></span>`}</div>`;

function readForm(m, root){
  const r = {};
  m.fields.forEach(f => {
    if(!f.key) return;
    const box = $(`.f[data-key="${f.key}"]`, root); if(!box) return;
    const el = $("#f_" + f.key, root);
    switch(f.type){
      case "toggle": r[f.key] = el.checked; break;
      case "number": r[f.key] = el.value === "" ? "" : Number(el.value); break;
      case "datetime": r[f.key] = el.value || ""; break;
      case "checks": r[f.key] = $$("input:checked", box).map(i => i.value); break;
      case "list": r[f.key] = $$(".li input", box).map(i => i.value.trim()).filter(Boolean); break;
      case "pairs": case "attrs": r[f.key] = $$(".li", box).map(li => Object.fromEntries($$("input,select", li).map(i => [i.dataset.c, i.value.trim()]))).filter(o => Object.entries(o).some(([k, v]) => k !== "tipo" && v)); break;
      case "choices": r[f.key] = Object.fromEntries($$("select[data-attr]", box).map(sel => [sel.dataset.attr, sel.value])); break;
      case "file": r[f.key] = JSON.parse(el.dataset.file || "null"); break;
      case "image": { const o = JSON.parse(el.dataset.img || "{}"); const u = $("[data-imgurl]", box).value.trim(); r[f.key] = o.id ? { id:o.id } : (u ? { url:u } : (o.url ? { url:o.url } : null)); break; }
      case "info": break;
      default: r[f.key] = (el.value || "").trim();
    }
  });
  return r;
}
function applyWhen(m, root, r){
  m.fields.forEach(f => {
    if(!f.when) return;
    const show = f.when(r);
    if(f.key){ const b = $(`.f[data-key="${f.key}"]`, root); if(b) b.classList.toggle("hidden", !show); }
    else { const b = $(`.sec[data-sec="${esc(f.sec)}"]`, root); if(b) b.classList.toggle("hidden", !show); }
  });
}
function validateForm(m, root, r, prev){
  let errs = {};
  m.fields.forEach(f => {
    if(!f.key || !f.req) return;
    if(f.when && !f.when(r)) return;
    const v = r[f.key];
    const empty = v == null || v === "" || (Array.isArray(v) && !v.length);
    if(empty) errs[f.key] = f.type === "checks" ? "Seleccione al menos una opción." : "Este campo es obligatorio.";
    else if(f.type === "number" && f.min != null && Number(v) < f.min) errs[f.key] = `Debe ser mayor o igual a ${f.min}.`;
  });
  if(m.validate) errs = Object.assign(m.validate(Object.assign({}, r, { id:prev && prev.id }), prev) || {}, errs);
  $$(".f", root).forEach(b => { const k = b.dataset.key; const msg = errs[k]; b.classList.toggle("invalid", !!msg); const e = $(".err", b); if(e) e.textContent = msg || ""; });
  return errs;
}

function openForm(k, id){
  const m = MODS[k];
  const prev = id ? byId(m.coll, id) : null;
  if(id && !prev) return;
  let r = prev ? JSON.parse(JSON.stringify(prev)) : m.defaults();
  if(!prev && k === "regalias") r.disponible = r.cantidadTotal ?? "";
  const root = document.createElement("div"); root.className = "scrim";
  const title = prev ? `${S.canWrite ? "Editar" : "Ver"} ${m.singular}` : m.nuevo;
  const sub = prev && k === "reservas" ? ` · <span class="mono">${esc(prev.numero)}</span>` : "";
  root.innerHTML = `<div class="drawer" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <header><button class="iconbtn" data-close aria-label="Cerrar">${ic("x")}</button><h2>${esc(title)}${sub}</h2>
      ${prev ? `<button class="btn sm ghost" data-hist="${esc(prev.id)}">${ic("hist")}Historial</button>` : ""}</header>
    <div class="body ${m.preview ? "" : "noprev"}"><form class="form" novalidate>${m.fields.map(f => f.sec ? `<div class="sec" data-sec="${esc(f.sec)}">${esc(f.sec)}</div>` : fieldHTML(f, r)).join("")}</form>
      ${m.preview ? `<aside class="preview" id="pv"></aside>` : ""}</div>
    <footer><span class="meta">${prev ? `Última modificación ${rel(prev.actualizadoEn || prev.creadoEn)} por ${who(prev.actualizadoPor)}` : "Los campos con * son obligatorios."}</span>
      <div class="actions"><button class="btn" data-close>${S.canWrite ? "Cancelar" : "Cerrar"}</button>${S.canWrite ? `<button class="btn pri" data-save>${ic("edit")}${prev ? "Guardar cambios" : esc(m.crear)}</button>` : ""}</div></footer></div>`;
  $("#drawerRoot").appendChild(root);
  resolveWho(root);
  const form = $("form", root);
  let dirty = false;
  const sync = () => {
    r = Object.assign({}, r, readForm(m, root));
    applyWhen(m, root, r);
    if(m.preview) $("#pv", root).innerHTML = m.preview(r);
  };
  sync();
  const rerenderDeps = key => {
    m.fields.filter(f => f.dependsOn && f.dependsOn.includes(key)).forEach(f => {
      const box = $(`.f[data-key="${f.key}"]`, root); const tmp = document.createElement("div");
      tmp.innerHTML = fieldHTML(f, r); box.replaceWith(tmp.firstElementChild);
    });
  };
  form.addEventListener("input", () => { dirty = true; sync(); });
  form.addEventListener("change", e => {
    dirty = true; sync();
    const key = e.target.closest(".f")?.dataset.key;
    if(key){ rerenderDeps(key); sync(); }
    if(k === "regalias" && key === "cantidadTotal" && !prev){ $("#f_disponible", root).value = $("#f_cantidadTotal", root).value; sync(); }
  });
  form.addEventListener("submit", e => e.preventDefault());
  root.addEventListener("click", async e => {
    const add = e.target.closest("[data-add]");
    if(add){
      const f = m.fields.find(x => x.key === add.dataset.add); const tmp = document.createElement("div");
      tmp.innerHTML = f.type === "list" ? listRow(f, "") : pairRow(f, f.type === "attrs" ? [{k:"nombre",ph:"Atributo (ej. Dimensiones)"},{k:"valor",ph:"Valor (ej. 60x10x10 cm)"}] : f.cols, {});
      add.before(tmp.firstElementChild); $("input", add.previousElementSibling).focus(); dirty = true; sync(); return;
    }
    const rm = e.target.closest("[data-rm]"); if(rm){ rm.closest(".li").remove(); dirty = true; sync(); return; }
    const vf = e.target.closest("[data-viewfile]"); if(vf){ openFile(r[vf.dataset.viewfile]); return; }
    const ci = e.target.closest("[data-clearimg]");
    if(ci){ const f = m.fields.find(x => x.key === ci.dataset.clearimg); r[f.key] = null; const box = $(`.f[data-key="${f.key}"]`, root); const tmp = document.createElement("div"); tmp.innerHTML = fieldHTML(f, r); box.replaceWith(tmp.firstElementChild); dirty = true; sync(); return; }
    const h = e.target.closest("[data-hist]"); if(h){ openHistory(k, h.dataset.hist); return; }
    if(e.target.closest("[data-close]") || e.target === root){
      if(dirty && S.canWrite && !await confirmBox("¿Descartar cambios?", "Hay cambios sin guardar en este formulario.", "Descartar")) return;
      root.remove(); return;
    }
    const sv = e.target.closest("[data-save]");
    if(sv){
      sync();
      const errs = validateForm(m, root, r, prev);
      if(Object.keys(errs).length){ const first = $(".f.invalid", root); if(first){ first.scrollIntoView({block:"center", behavior:"smooth"}); const i = $("input,select,textarea", first); if(i) i.focus({preventScroll:true}); } toast("Revise los campos marcados.", true); return; }
      let vals = readForm(m, root);
      m.fields.forEach(f => { if(f.key && f.type !== "info" && f.when && !f.when(vals)) vals[f.key] = f.type === "checks" ? [] : ""; });
      if(m.beforeSave) vals = m.beforeSave(vals, prev);
      sv.disabled = true; sv.textContent = "Guardando…";
      try {
        const res = await saveRecord(k, prev ? prev.id : null, vals, prev);
        if(!res.unchanged && m.afterSave) await m.afterSave(vals, prev, res.id);
        root.remove();
        toast(res.unchanged ? "No había cambios por guardar." : (prev ? "Cambios guardados." : (k === "reservas" ? `Reserva ${vals.numero} registrada.` : "Registro creado.")));
      } catch(err){ sv.disabled = false; sv.innerHTML = `${ic("edit")}${prev ? "Guardar cambios" : esc(m.crear)}`; handleWriteError(err); }
    }
  });
  root.addEventListener("change", async e => {
    const up = e.target.closest("[data-upload]"); if(!up || !up.files[0]) return;
    const file = up.files[0]; const f = m.fields.find(x => x.key === up.dataset.upload);
    if(f.type === "file" && !/^(image\/png|image\/jpeg|application\/pdf)$/.test(file.type)){ toast("Use un archivo JPG, PNG o PDF.", true); return; }
    if(f.type === "file" && file.size > 5 * 1024 * 1024){ toast("El comprobante supera los 5 MB.", true); return; }
    if(file.size > 20 * 1024 * 1024){ toast("La imagen supera los 20 MB.", true); return; }
    if(f.dims){
      if(!/^(image\/png|image\/jpeg)$/.test(file.type)){ toast("Use una imagen JPG o PNG.", true); return; }
      const okDims = await new Promise(res => { const u = URL.createObjectURL(file); const im = new Image(); im.onload = () => { URL.revokeObjectURL(u); res(im.naturalWidth === f.dims[0] && im.naturalHeight === f.dims[1]); }; im.onerror = () => res(false); im.src = u; });
      if(!okDims){ toast(`La imagen debe medir exactamente ${f.dims[0]} × ${f.dims[1]} px.`, true); return; }
    }
    const box = $(`.f[data-key="${f.key}"]`, root); $(".ph", box).textContent = "Subiendo…";
    try {
      let val;
      if(S.assets){ const res = await S.assets.upload(file); val = { id:res.id }; }
      else { val = { url:await new Promise((ok, ko) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = ko; fr.readAsDataURL(file); }) }; }
      if(f.type === "file") val = Object.assign(val, { nombre:file.name, tipo:file.type || "" });
      r[f.key] = val; const tmp = document.createElement("div"); tmp.innerHTML = fieldHTML(f, r); box.replaceWith(tmp.firstElementChild); dirty = true; sync();
    } catch(err){ $(".ph", box).textContent = f.type === "file" ? "Sin archivo" : "Sin imagen"; toast(f.type === "file" ? "No fue posible adjuntar el archivo. Use JPG, PNG o PDF." : "No fue posible subir la imagen. Use JPG, PNG o WebP.", true); }
  });
  const onKey = e => { if(e.key === "Escape" && document.body.contains(root) && !$(".confirm")){ $("[data-close]", root).click(); } };
  document.addEventListener("keydown", onKey);
  const first = $("input:not([type=hidden]):not([type=file]),select,textarea", form); if(first) first.focus();
}

/* =====================================================================
   Historial de un registro
   ===================================================================== */
function diffTable(c){
  if(!c || !c.length) return `<div class="help" style="color:var(--muted);font-size:13px">Sin detalle de campos.</div>`;
  return `<div class="tablewrap"><table class="diff"><thead><tr><th>Campo</th><th>Antes</th><th>Después</th></tr></thead><tbody>${c.map(x => `<tr><td>${esc(x.etiqueta)}</td><td class="old">${esc(x.antes) || "—"}</td><td class="new">${esc(x.despues) || "—"}</td></tr>`).join("")}</tbody></table></div>`;
}
function openFile(v, titulo){
  const src = imgSrc(v); if(!src){ toast("No hay archivo para mostrar.", true); return; }
  const isPdf = /pdf/i.test((v && (v.tipo || v.nombre)) || "") || String(src).startsWith("data:application/pdf");
  const el = document.createElement("div"); el.className = "confirm";
  el.innerHTML = `<div class="box" role="dialog" aria-modal="true" style="max-width:900px;width:100%">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><h3 style="flex:1;margin:0">Comprobante de pago${titulo ? " · " + esc(titulo) : ""}</h3><button class="iconbtn" data-x aria-label="Cerrar">${ic("x")}</button></div>
    <p style="margin:0 0 12px;color:var(--muted);word-break:break-all">${esc((v && v.nombre) || "")}</p>
    ${isPdf ? `<iframe src="${esc(src)}" title="Comprobante" style="width:100%;height:68vh;border:1px solid var(--border);border-radius:8px;background:#fff"></iframe>`
            : `<div style="max-height:70vh;overflow:auto;text-align:center;background:var(--surface-2);border-radius:8px;padding:8px"><img src="${esc(src)}" alt="Comprobante de pago" style="max-width:100%"></div>`}
    <div class="actions" style="justify-content:flex-end;margin-top:12px"><a class="btn" href="${esc(src)}" target="_blank" rel="noopener">${ic("down")}Abrir en una pestaña nueva</a></div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click", e => { if(e.target === el || e.target.closest("[data-x]")) el.remove(); });
}
function openHistory(k, id){
  const m = MODS[k]; const r = byId(m.coll, id);
  const items = S.data.auditoria.filter(a => a.registroId === id);
  const el = document.createElement("div"); el.className = "confirm";
  el.innerHTML = `<div class="box" role="dialog" aria-modal="true" style="max-width:640px;max-height:86vh;overflow:auto">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><h3 style="flex:1;margin:0">Historial: ${esc((r && r[m.nameKey]) || "registro")}</h3><button class="iconbtn" data-x aria-label="Cerrar">${ic("x")}</button></div>
    <div class="timeline">${items.map(a => `<div class="tl ${a.accion[0]}"><div class="h">${fmtDate(a.fecha, true)} · ${who(a.actorId)}</div><div style="margin:2px 0 6px"><strong>${accionTxt(a.accion)}</strong>${a.nota ? ` · ${esc(a.nota)}` : ""}</div>${diffTable(a.cambios)}</div>`).join("") || `<div class="empty" style="padding:24px">No hay cambios registrados para este registro.</div>`}</div></div>`;
  document.body.appendChild(el); resolveWho(el);
  el.addEventListener("click", e => { if(e.target === el || e.target.closest("[data-x]")) el.remove(); });
}

/* =====================================================================
   Auditoría
   ===================================================================== */
S.af = {};
function viewAuditShell(){
  const ids = [...new Set(S.data.auditoria.map(a => a.actorId || ""))];
  return `${banner()}<div class="pagehead"><div><h1>Auditoría</h1><p>Registro de quién creó, modificó o eliminó cada registro del gestor, con el detalle de los campos que cambiaron.</p></div>
    <div class="actions"><button class="btn" data-axls>${ic("down")}Exportar Excel</button>${S.downloads ? `<button class="btn" data-aexp>${ic("down")}Exportar JSON</button>` : ""}</div></div>
    <div class="toolbar"><div class="search">${ic("search")}<input type="text" data-aq placeholder="Buscar por registro o campo" value="${esc(S.af.q||"")}"></div>
      <select data-af="modulo" aria-label="Módulo"><option value="">Todos los módulos</option>${MOD_ORDER.map(k => `<option value="${k}" ${S.af.modulo === k ? "selected" : ""}>${esc(MODS[k].title)}</option>`).join("")}</select>
      <select data-af="accion" aria-label="Acción"><option value="">Todas las acciones</option>${[["crear","Creación"],["modificar","Modificación"],["eliminar","Eliminación"]].map(o => `<option value="${o[0]}" ${S.af.accion === o[0] ? "selected" : ""}>${o[1]}</option>`).join("")}</select>
      <select data-af="actor" id="actorSel" aria-label="Usuario"><option value="">Todos los usuarios</option>${ids.map(i => `<option value="${esc(i)}" ${S.af.actor === i ? "selected" : ""} data-uid="${esc(i)}">${i ? "Usuario" : "Carga inicial"}</option>`).join("")}</select>
      <input type="date" data-af="desde" aria-label="Desde" value="${esc(S.af.desde||"")}" style="width:auto"><input type="date" data-af="hasta" aria-label="Hasta" value="${esc(S.af.hasta||"")}" style="width:auto">
    </div><div class="card"><div class="tablewrap" id="arows"></div></div>`;
}
async function labelActorOptions(){
  const sel = $("#actorSel"); if(!sel) return;
  const ids = $$("option[data-uid]", sel).map(o => o.dataset.uid).filter(Boolean);
  let ps = {}; if(S.user && ids.length){ try { ps = await S.user.profiles(ids); } catch(e){} }
  $$("option[data-uid]", sel).forEach(o => { const id = o.dataset.uid; o.textContent = !id ? "Carga inicial" : (ps[id] && ps[id].name) || (id === S.meId ? "Usted" : "Usuario del gestor"); });
}
function auditFiltered(){
  let rows = S.data.auditoria.slice();
  const f = S.af;
  if(f.modulo) rows = rows.filter(a => a.modulo === f.modulo);
  if(f.accion) rows = rows.filter(a => a.accion === f.accion);
  if(f.actor !== undefined && f.actor !== "") rows = rows.filter(a => (a.actorId || "") === f.actor);
  if(f.desde) rows = rows.filter(a => a.fecha.slice(0,10) >= f.desde);
  if(f.hasta) rows = rows.filter(a => a.fecha.slice(0,10) <= f.hasta);
  if(f.q){ const q = f.q.toLowerCase(); rows = rows.filter(a => (a.registroNombre + " " + (a.nota||"") + " " + (a.cambios||[]).map(c => c.etiqueta + " " + c.antes + " " + c.despues).join(" ")).toLowerCase().includes(q)); }
  return rows;
}
function renderAuditRows(){
  const box = $("#arows"); if(!box) return;
  if(!S.loaded.auditoria){ box.innerHTML = `<div class="empty">Cargando auditoría…</div>`; return; }
  const sel = $("#actorSel");
  if(sel){ const ids = new Set(S.data.auditoria.map(a => a.actorId || "")); const have = new Set($$("option[data-uid]", sel).map(o => o.dataset.uid)); if([...ids].some(i => !have.has(i))){ $("#view").innerHTML = viewAuditShell(); return renderAuditRows(); } }
  labelActorOptions();
  let rows = auditFiltered();
  if(!rows.length){ box.innerHTML = `<div class="empty"><h3>No hay movimientos</h3><p>${S.data.auditoria.length ? "Ajuste los filtros para ver otros movimientos." : "Los cambios que se hagan en el gestor aparecerán aquí."}</p></div>`; return; }
  const ap = {crear:["Creación","ok"], modificar:["Modificación","warn"], eliminar:["Eliminación","err"]};
  box.innerHTML = `<table class="grid"><thead><tr><th>Fecha y hora</th><th>Usuario</th><th>Acción</th><th>Módulo</th><th>Registro</th><th>Campos</th></tr></thead><tbody>
    ${rows.slice(0, 500).map(a => `<tr data-arow="${esc(a.id)}"><td class="mono">${fmtDate(a.fecha, true)}</td><td>${who(a.actorId)}</td><td>${pill(ap[a.accion] || [a.accion,""])}</td><td>${esc((MODS[a.modulo]||{}).title || a.modulo)}</td>
      <td><div class="t1">${esc(a.registroNombre || "—")}</div>${a.nota ? `<div class="sub">${esc(a.nota)}</div>` : ""}</td><td class="mono">${(a.cambios||[]).length}</td></tr>`).join("")}
  </tbody></table>${rows.length > 500 ? `<div class="empty" style="padding:16px">Se muestran los 500 movimientos más recientes de ${rows.length}. Use los filtros o exporte el registro completo.</div>` : ""}`;
  resolveWho(box);
}
function toggleAuditRow(tr){
  const nx = tr.nextElementSibling;
  if(nx && nx.classList.contains("expand")){ nx.remove(); return; }
  const a = S.data.auditoria.find(x => x.id === tr.dataset.arow); if(!a) return;
  const ex = document.createElement("tr"); ex.className = "expand";
  ex.innerHTML = `<td colspan="6">${diffTable(a.cambios)}</td>`; tr.after(ex);
}
async function exportAudit(){
  try { await S.downloads.save({ filename:`app-cfia-auditoria-${new Date().toISOString().slice(0,10)}.json`, data:JSON.stringify(S.data.auditoria, null, 2) }); }
  catch(e){ if(e && e.code && e.code !== "declined" && e.code !== "cancelled") toast("No fue posible exportar el archivo.", true); }
}

/* ---------- Exportación a Excel ---------- */
let xlsxPromise = null;
function loadXLSX(){
  if(window.XLSX) return Promise.resolve(window.XLSX);
  if(!xlsxPromise) xlsxPromise = new Promise((ok, ko) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => window.XLSX ? ok(window.XLSX) : ko(new Error("xlsx"));
    s.onerror = () => { xlsxPromise = null; ko(new Error("xlsx")); };
    document.head.appendChild(s);
  });
  return xlsxPromise;
}
async function saveFile(filename, blob){
  if(S.downloads){
    try { await S.downloads.save({ filename, data:blob }); return true; }
    catch(e){ if(e && (e.code === "declined" || e.code === "cancelled")) return false; throw e; }
  }
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000); return true;
}
async function writeXLSX(nombreHoja, filas, anchos, filename){
  const XLSX = await loadXLSX();
  const ws = XLSX.utils.json_to_sheet(filas);
  ws["!cols"] = anchos.map(w => ({ wch:w }));
  if(ws["!ref"]) ws["!autofilter"] = { ref:ws["!ref"] };
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  const out = XLSX.write(wb, { bookType:"xlsx", type:"array" });
  return saveFile(filename, new Blob([out], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
}
const hoy = () => new Date().toISOString().slice(0,10);
async function exportReservasXLSX(){
  const lista = filtered("reservas");
  if(!lista.length){ toast("No hay reservas para exportar con los filtros actuales.", true); return; }
  const lab = (arr, v) => (arr.find(x => x[0] === v) || [v, v || ""])[1];
  const filas = lista.map(r => {
    const g = byId("regalias", r.regalia) || {}; const env = r.modalidad === "correos";
    return {
      "N.º de reserva": r.numero || "", "Fecha de registro": fmtDate(r.creadoEn, true), "Canal": r.canal === "app" ? "App CFIA" : "Gestor",
      "Estado": lab(ESTADOS_RES, r.estado), "Colegio": colName(g.colegio), "Regalía": g.nombre || "", "Campaña": g.campana || "", "Cantidad": Number(r.cantidad) || 0, "Opciones elegidas": Object.entries(r.opcionesElegidas || {}).filter(([k, v]) => v).map(([k, v]) => k + ": " + v).join("; "),
      "Profesional": r.profesional || "", "Carné CFIA": r.carne || "", "Correo": r.correo || "", "Teléfono": r.telefono || "",
      "Modalidad de entrega": env ? "Envío por Correos de Costa Rica" : "Retiro en sede",
      "Sede": env ? "" : ((byId("sedes", r.sede) || {}).nombre || ""), "Persona que retira": env ? "" : (r.personaRetira || ""),
      "Nombre de quien recibe": env ? (r.envioNombre || "") : "", "Teléfono de envío": env ? (r.envioTelefono || "") : "", "Cédula": env ? (r.envioCedula || "") : "",
      "Provincia": env ? (r.envioProvincia || "") : "", "Cantón": env ? (r.envioCanton || "") : "", "Distrito": env ? (r.envioDistrito || "") : "",
      "Dirección exacta (señas o API / Locker)": env ? (r.envioTipoDestino === "api" ? "API / Locker " + (r.envioApi || "") : (r.envioDireccion || "")) : "",
      "Comprobante": env ? ((r.comprobante && (r.comprobante.nombre || "Adjunto")) || "Sin comprobante") : "", "Revisión del comprobante": env ? lab(ESTADOS_PAGO, r.estadoPago || "pendiente") : "",
      "Fecha de entrega": r.fechaEntrega ? fmtDate(r.fechaEntrega, true) : "", "Observaciones": r.observaciones || ""
    };
  });
  try {
    const ok = await writeXLSX("Reservas", filas, [16,17,10,22,32,24,9,9,20,26,12,28,12,28,24,24,26,14,14,12,14,14,40,26,20,17,30], `app-cfia-reservas-${hoy()}.xlsx`);
    if(ok) toast(`Se exportaron ${filas.length} reserva(s).`);
  } catch(e){ toast("No fue posible generar el Excel. Revise su conexión e intente de nuevo.", true); }
}
async function exportTramitesXLSX(){
  const lista = filtered("tramites");
  if(!lista.length){ toast("No hay trámites para exportar con los filtros actuales.", true); return; }
  const filas = lista.map(r => ({
    "Orden": Number(r.orden) || "", "Trámite": r.nombre || "", "Descripción corta": r.descripcion || "",
    "Trámite para": (DIRIGIDO.find(d => d[0] === r.dirigido) || [0, ""])[1], "URL del sitio": r.url || "",
    "Se abre en": r.apertura === "externo" ? "Navegador del dispositivo" : "WebView dentro del App", "Título en la cabecera del WebView": r.tituloAppBar || "",
    "Ícono": (APP_ICONS[r.icono] || [""])[0], "Visible en Trámites": r.visibleTramites !== false ? "Sí" : "No", "Visible en Onboarding": r.visibleOnboarding !== false ? "Sí" : "No",
    "Estado": r.activo === false ? "Inactivo" : "Activo", "Última modificación": fmtDate(r.actualizadoEn || r.creadoEn, true)
  }));
  try {
    const ok = await writeXLSX("Trámites y servicios", filas, [7,36,44,22,52,24,28,16,12,14,10,18], `app-cfia-tramites-${hoy()}.xlsx`);
    if(ok) toast(`Se exportaron ${filas.length} trámite(s).`);
  } catch(e){ toast("No fue posible generar el Excel. Revise su conexión e intente de nuevo.", true); }
}
async function exportAuditXLSX(){
  const lista = auditFiltered();
  if(!lista.length){ toast("No hay movimientos para exportar con los filtros actuales.", true); return; }
  const ids = [...new Set(lista.map(a => a.actorId).filter(Boolean))]; let ps = {};
  if(S.user && ids.length){ try { ps = await S.user.profiles(ids); } catch(e){} }
  const quien = id => !id ? (S.mode === "memoria" ? "Usted (demostración)" : "Carga inicial") : ((ps[id] && ps[id].name) || (id === S.meId ? "Usted" : "Usuario del gestor"));
  const acc = { crear:"Creación", modificar:"Modificación", eliminar:"Eliminación" };
  const filas = [];
  lista.forEach(a => {
    const base = { "Fecha y hora": fmtDate(a.fecha, true), "Usuario": quien(a.actorId), "Acción": acc[a.accion] || a.accion, "Módulo": (MODS[a.modulo] || {}).title || a.modulo, "Registro": a.registroNombre || "", "Nota": a.nota || "" };
    const cs = a.cambios || [];
    if(!cs.length) filas.push(Object.assign({}, base, { "Campo": "", "Antes": "", "Después": "" }));
    cs.forEach(c => filas.push(Object.assign({}, base, { "Campo": c.etiqueta || c.campo, "Antes": c.antes || "", "Después": c.despues || "" })));
  });
  try {
    const ok = await writeXLSX("Auditoría", filas, [17,24,14,22,34,40,28,36,36], `app-cfia-auditoria-${hoy()}.xlsx`);
    if(ok) toast(`Se exportaron ${lista.length} movimiento(s).`);
  } catch(e){ toast("No fue posible generar el Excel. Revise su conexión e intente de nuevo.", true); }
}

boot();
})();
