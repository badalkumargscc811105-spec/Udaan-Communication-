/* UDAAN Communication Supabase client.
 * Only the public publishable/anon key belongs in browser code.
 * Never place service_role keys, Razorpay secrets, or database passwords here.
 */
(function(){
  const SUPABASE_URL = "https://jjjaeuorsfjnxqeyvxnf.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JwX_0F8j7YsUA4oIAFNW7w_xp144LhV";
  function setStatus(message, ok){
    document.querySelectorAll("[data-backend-status]").forEach(el=>{
      el.textContent=message;
      el.dataset.state=ok?"connected":"unavailable";
    });
  }
  const ready = () => {
    if(!window.supabase || typeof window.supabase.createClient!=="function"){
      setStatus("Backend library unavailable",false); return;
    }
    window.udaanSupabase = window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    window.udaanBackendReady = true;
    setStatus("Backend connected",true);
    window.dispatchEvent(new CustomEvent("udaan-backend-ready"));
    window.udaanSupabase.auth.getSession().then(({data,error})=>{
      if(error) setStatus("Backend reachable; session check failed",false);
      else {
        document.querySelectorAll("[data-auth-status]").forEach(el=>{
          el.textContent=data.session ? "Signed in" : "Not signed in";
        });
      }
    });
  };
  const script=document.createElement("script");
  script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.async=true;
  script.onload=ready;
  script.onerror=()=>setStatus("Could not load backend library",false);
  document.head.appendChild(script);
})();
