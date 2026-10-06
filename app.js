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
