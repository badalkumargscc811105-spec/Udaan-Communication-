const nav=document.getElementById("nav"),menu=document.getElementById("menu"),modal=document.getElementById("modal"),modalTitle=document.getElementById("modalTitle"),modalText=document.getElementById("modalText"),modalAction=document.getElementById("modalAction");
menu?.addEventListener("click",()=>nav.classList.toggle("open"));
const links=[...document.querySelectorAll(".nav-link")];
function sync(){const id=location.hash||"#home";links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")===id));nav.classList.remove("open")}
window.addEventListener("hashchange",sync);sync();

const copy={
"PDF to JPG":"The public PDF-to-JPG workspace is selected. Connect the production document processor here without changing the visual experience.",
"PDF Workspace":"This protected workspace is designed for merge, compress, reorder, delete and image insertion after secure sign-in.",
"Image Tools":"Image conversion, compression and enhancement tools are ready for the authenticated workspace.",
"Aadhaar Card Size":"This is a protected document workflow. Access should remain behind authentication and secure document storage."
};
function openTool(name){modalTitle.textContent=name;modalText.textContent=copy[name]||"Open this tool from your UDAAN workspace.";modal.classList.remove("hidden")}
document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>openTool(b.dataset.tool)));
document.getElementById("close")?.addEventListener("click",()=>modal.classList.add("hidden"));
modal?.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden")});
modalAction?.addEventListener("click",()=>modal.classList.add("hidden"));

document.getElementById("loginForm")?.addEventListener("submit",e=>{e.preventDefault();document.getElementById("loginMessage").textContent="Production authentication is not connected to this GitHub static build yet. The login UI is ready for the secure backend connection."});
document.getElementById("forgot")?.addEventListener("click",()=>{document.getElementById("loginMessage").textContent="Password reset will use the configured email authentication provider."});
