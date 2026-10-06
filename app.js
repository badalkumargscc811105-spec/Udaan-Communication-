const nav=document.getElementById("nav"),menu=document.getElementById("menu"),modal=document.getElementById("modal"),modalTitle=document.getElementById("modalTitle"),modalText=document.getElementById("modalText"),modalAction=document.getElementById("modalAction");
menu?.addEventListener("click",()=>nav.classList.toggle("open"));
const links=[...document.querySelectorAll(".nav-link")];
function sync(){const id=location.hash||"#home";links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")===id));nav.classList.remove("open")}window.addEventListener("hashchange",sync);sync();

const copy={
"PDF to JPG":"Convert a PDF into JPG images directly in your browser. Files are processed locally and are not uploaded by this public tool.",
"PDF Workspace":"Merge, compress, reorder and edit PDFs in the protected workspace after secure sign-in.",
"Image Tools":"Image conversion, compression and enhancement tools are available in the workspace.",
"Aadhaar Card Size":"This protected document workflow should only be used after secure authentication."
};
function openTool(name){
  modalTitle.textContent=name;
  if(name==="PDF to JPG"){
    modalText.innerHTML="";
    const wrap=document.createElement("div");wrap.className="tool-workspace";
    wrap.innerHTML='<div class="dropzone"><label><b>Select a PDF</b><small>Files stay in your browser for this conversion</small><input id="pdfInput" type="file" accept="application/pdf"></label></div><div class="progress-bar"><i id="pdfProgress"></i></div><div class="tool-result" id="pdfResult"></div>';
    modalText.appendChild(wrap);
    wrap.querySelector("#pdfInput").addEventListener("change",e=>convertPdf(e.target.files[0]));
    modalAction.classList.add("hidden");
  }else{
    modalText.textContent=copy[name]||"Open this tool from your UDAAN workspace.";
    modalAction.classList.remove("hidden");
  }
  modal.classList.remove("hidden");
}
async function convertPdf(file){
  const result=document.getElementById("pdfResult"),bar=document.getElementById("pdfProgress");
  if(!file){return}
  if(file.type!=="application/pdf"){result.textContent="Please select a PDF file.";return}
  result.textContent="Reading PDF…";
  try{
    const pdfjs=await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
    const data=new Uint8Array(await file.arrayBuffer());const pdf=await pdfjs.getDocument({data}).promise;result.textContent="";
    for(let n=1;n<=pdf.numPages;n++){
      const page=await pdf.getPage(n),viewport=page.getViewport({scale:1.7});
      const canvas=document.createElement("canvas");canvas.width=viewport.width;canvas.height=viewport.height;
      await page.render({canvasContext:canvas.getContext("2d"),viewport}).promise;
      const blob=await new Promise(res=>canvas.toBlob(res,"image/jpeg",.9));
      const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=file.name.replace(/\.pdf$/i,"")+"-page-"+n+".jpg";a.textContent="Download page "+n;a.target="_blank";result.appendChild(a);
      bar.style.width=Math.round(n/pdf.numPages*100)+"%";
    }
    const note=document.createElement("div");note.textContent=pdf.numPages+" page(s) converted.";result.prepend(note);
  }catch(err){console.error(err);result.textContent="Conversion failed in this browser. Try a smaller PDF."}
}
document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>openTool(b.dataset.tool)));
document.getElementById("close")?.addEventListener("click",()=>modal.classList.add("hidden"));
modal?.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden")});
modalAction?.addEventListener("click",()=>modal.classList.add("hidden"));

document.getElementById("loginForm")?.addEventListener("submit",e=>{e.preventDefault();document.getElementById("loginMessage").textContent="Secure authentication backend is not connected to this static GitHub build yet."});
document.getElementById("forgot")?.addEventListener("click",()=>{document.getElementById("loginMessage").textContent="Password reset requires the production authentication provider to be connected."});

// Optional production Supabase client configuration. Safe publishable key only.
window.UDAAN_SUPABASE_CONFIG=window.UDAAN_SUPABASE_CONFIG||{url:"https://hvuwnkqwjkllnmxvbhlm.supabase.co",publishableKey:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dXdua3F3amtsbG5teHZiaGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDQxMjEsImV4cCI6MjA3NzQ4MDEyMX0.irhKUIe9iKGr7-0qcWlRavdNDeDPLAnfsOBLAeO9yB8"};
async function loadSupabase(){if(window.supabase)return window.supabase;await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});window.supabase=window.supabase.createClient(window.UDAAN_SUPABASE_CONFIG.url,window.UDAAN_SUPABASE_CONFIG.publishableKey);return window.supabase}
async function doLogin(id,password){const sb=await loadSupabase();let email=id.trim();if(!email.includes("@")){const r=await sb.from("profiles").select("id").eq("user_id",email).maybeSingle();if(r.error)throw r.error;if(!r.data)throw new Error("User ID not found");const u=await sb.auth.getUser();void u;throw new Error("Username login needs the secure server-side username bridge; use the account email for now.")}const {data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;return data}
const loginForm=document.getElementById("loginForm");
loginForm?.addEventListener("submit",async e=>{e.preventDefault();const msg=document.getElementById("loginMessage");msg.textContent="Signing in securely…";try{const data=await doLogin(document.getElementById("loginId").value,document.getElementById("loginPassword").value);sessionStorage.setItem("udaan_session","1");location.href="dashboard.html";return data}catch(err){console.error(err);msg.textContent=err.message||"Login failed. Check your login details."}});
document.getElementById("forgot")?.addEventListener("click",async()=>{const msg=document.getElementById("loginMessage");const id=document.getElementById("loginId").value.trim();if(!id||!id.includes("@")){msg.textContent="Enter your account email first.";return}try{const sb=await loadSupabase();const {error}=await sb.auth.resetPasswordForEmail(id,{redirectTo:location.origin+location.pathname+"#login"});msg.textContent=error?error.message:"Password reset email requested. Check your inbox."}catch(err){msg.textContent=err.message||"Password reset is unavailable."}});
document.getElementById("bootstrapAdmin")?.addEventListener("click",async()=>{const msg=document.getElementById("loginMessage");const email=document.getElementById("loginId").value.trim();const password=document.getElementById("loginPassword").value;if(!email.includes("@")){msg.textContent="Enter the admin account email first.";return}if(password.length<8){msg.textContent="Enter the admin password first (minimum 8 characters).";return}msg.textContent="Creating secure account…";try{const sb=await loadSupabase();const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:"UDAAN Administrator"}}});if(error)throw error;if(data.session)location.href="dashboard.html";else msg.textContent="Account created. If email confirmation is enabled, confirm the email and then sign in with User ID Udaan."}catch(err){msg.textContent=err.message||"Setup failed."}});
if(window.UDAAN_DASHBOARD){
 document.querySelectorAll(".side-link,[data-panel]").forEach(el=>el.addEventListener("click",()=>{const p=el.dataset.panel;if(!p)return;document.querySelectorAll(".dash-panel").forEach(x=>x.classList.remove("active"));document.getElementById("panel-"+p)?.classList.add("active");document.querySelectorAll(".side-link").forEach(x=>x.classList.toggle("active",x.dataset.panel===p))}));
 document.getElementById("logoutBtn")?.addEventListener("click",async()=>{try{const sb=await loadSupabase();await sb.auth.signOut()}catch{}sessionStorage.removeItem("udaan_session");location.href="index.html#login"});
 document.getElementById("docUpload")?.addEventListener("change",e=>{document.getElementById("uploadStatus").textContent=e.target.files.length+" file(s) selected. Secure upload will use the private udaan-documents bucket."});
 document.getElementById("noticePreview")?.addEventListener("click",()=>{const box=document.getElementById("noticePreviewBox");box.className="notice-preview";box.innerHTML="<h3>"+(document.getElementById("noticeTitle").value||"Notice")+"</h3><p>"+(document.getElementById("noticeBody").value||"Preview message")+"</p>"});
 (async()=>{try{const sb=await loadSupabase();const {data}=await sb.auth.getSession();if(!data.session){location.href="index.html#login";return}const {data:profile}=await sb.from("profiles").select("full_name,role").eq("id",data.session.user.id).maybeSingle();if(profile){document.getElementById("userName").textContent=profile.full_name||data.session.user.email;document.getElementById("roleBadge").textContent=profile.role||"Workspace";document.getElementById("welcomeTitle").textContent="Welcome, "+(profile.full_name||"User")+".";if(profile.role!=="admin")document.querySelectorAll(".admin-only").forEach(x=>x.style.display="none")}}catch(err){console.error(err)}})();
}

if(window.UDAAN_DASHBOARD){(async()=>{try{const sb=await loadSupabase();const {data:sessionData}=await sb.auth.getSession();if(!sessionData.session)return;const [{data:services},{data:franchises},{data:profiles}]=await Promise.all([sb.from("services").select("name,category,price,is_free,active").order("sort_order"),sb.from("franchises").select("franchise_id,shop_name,owner_name,mobile,active").order("created_at",{ascending:false}),sb.from("profiles").select("user_id,full_name,role,active,email").order("created_at",{ascending:false})]);const sl=document.getElementById("serviceList");if(sl)sl.innerHTML=(services||[]).map(x=>'<div class="data-row"><b>'+x.name+'</b><span>'+x.category+' · '+(x.is_free?'Free':'₹'+x.price)+' · '+(x.active?'Active':'Disabled')+'</span></div>').join("")||'<div class="empty-state">No services.</div>';const fl=document.getElementById("franchiseList");if(fl)fl.innerHTML=(franchises||[]).map(x=>'<div class="data-row"><b>'+x.franchise_id+' · '+x.shop_name+'</b><span>'+x.owner_name+' · '+(x.mobile||'No mobile')+' · '+(x.active?'Active':'Disabled')+'</span></div>').join("")||'<div class="empty-state">No franchise records.</div>';const ul=document.getElementById("userList");if(ul)ul.innerHTML=(profiles||[]).map(x=>'<div class="data-row"><b>'+((x.user_id||x.full_name||'User'))+'</b><span>'+x.role+' · '+(x.email||'')+' · '+(x.active?'Active':'Disabled')+'</span></div>').join("")||'<div class="empty-state">No users.</div>'}catch(e){console.error(e)}})()}

if(window.UDAAN_DASHBOARD){document.getElementById("docUpload")?.addEventListener("change",async e=>{const files=[...e.target.files];const status=document.getElementById("uploadStatus");if(!files.length)return;try{const sb=await loadSupabase();const {data}=await sb.auth.getSession();if(!data.session){status.textContent="Session expired. Please sign in again.";return}for(const file of files){status.textContent="Uploading "+file.name+"…";const form=new FormData();form.append("file",file);const res=await fetch("https://hvuwnkqwjkllnmxvbhlm.supabase.co/functions/v1/upload-udaan-document",{method:"POST",headers:{Authorization:"Bearer "+data.session.access_token},body:form});if(!res.ok)throw new Error(await res.text());}status.textContent=files.length+" document(s) uploaded securely.";e.target.value=""}catch(err){status.textContent=err.message||"Upload failed."}})}

if(window.UDAAN_DASHBOARD){async function adminAction(payload){const sb=await loadSupabase();const {data}=await sb.auth.getSession();if(!data.session)throw new Error("Session expired.");const res=await fetch("https://hvuwnkqwjkllnmxvbhlm.supabase.co/functions/v1/udaan-admin-actions",{method:"POST",headers:{"Authorization":"Bearer "+data.session.access_token,"Content-Type":"application/json"},body:JSON.stringify(payload)});if(!res.ok)throw new Error(await res.text());return res.json()}function formData(form){return Object.fromEntries(new FormData(form).entries())}document.getElementById("serviceForm")?.addEventListener("submit",async e=>{e.preventDefault();const m=document.getElementById("serviceFormMsg");try{const d=formData(e.target);await adminAction({action:"create_service",...d,is_free:e.target.is_free.checked});m.textContent="Service added.";e.target.reset()}catch(x){m.textContent=x.message}});document.getElementById("franchiseForm")?.addEventListener("submit",async e=>{e.preventDefault();const m=document.getElementById("franchiseFormMsg");try{await adminAction({action:"create_franchise",...formData(e.target)});m.textContent="Franchise added.";e.target.reset()}catch(x){m.textContent=x.message}});document.getElementById("userForm")?.addEventListener("submit",async e=>{e.preventDefault();const m=document.getElementById("userFormMsg");try{await adminAction({action:"create_user",...formData(e.target)});m.textContent="User created.";e.target.reset()}catch(x){m.textContent=x.message}});document.getElementById("noticePublish")?.addEventListener("click",async()=>{const m=document.getElementById("noticePreviewBox");try{await adminAction({action:"create_notice",title:document.getElementById("noticeTitle").value,message:document.getElementById("noticeBody").value});m.className="notice-preview";m.textContent="Notice published.";document.getElementById("noticeTitle").value="";document.getElementById("noticeBody").value=""}catch(x){m.textContent=x.message}})}
