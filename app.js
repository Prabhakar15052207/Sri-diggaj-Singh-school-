// SCHOOL PORTAL FRONTEND
// Demo mode uses fictional data only. Live mode requires Supabase configuration and the SQL setup.
const SUPABASE_URL = ""; // Add your project's Project URL after setup.
const SUPABASE_ANON_KEY = ""; // Add the publishable/anon key only. NEVER put a service_role key here.
const liveConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
const db = liveConfigured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = (id) => document.getElementById(id);
$("year").textContent = new Date().getFullYear();
$("menuToggle").addEventListener("click", () => $("mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(a => a.addEventListener("click", () => $("mainNav").classList.remove("open")));

const modal = $("loginModal");
$("loginOpen").onclick = () => { modal.classList.add("show"); modal.setAttribute("aria-hidden","false"); };
$("loginClose").onclick = () => { modal.classList.remove("show"); modal.setAttribute("aria-hidden","true"); };
modal.addEventListener("click", e => { if(e.target === modal) $("loginClose").click(); });

const demoData = {
  students: [
    {name:"Aarav Sharma", roll:"D-001", class_name:"Class 9", section:"A"},
    {name:"Anaya Verma", roll:"D-002", class_name:"Class 9", section:"A"},
    {name:"Kabir Singh", roll:"D-003", class_name:"Class 8", section:"B"},
    {name:"Meera Gupta", roll:"D-004", class_name:"Class 8", section:"A"}
  ],
  teachers: [
    {name:"Demo Teacher One", subject:"Mathematics", email:"teacher1@example.test"},
    {name:"Demo Teacher Two", subject:"Science", email:"teacher2@example.test"}
  ],
  notices: ["Exhibition demo notice: add the confirmed date after school approval.","Reminder: sample portal data is fictional."]
};
let sessionUser = null;
let currentView = "overview";
let demoMode = false;

$("demoOpen").onclick = () => {
  demoMode = true; sessionUser = {role:"management", display_name:"Exhibition Demo User"};
  $("loginClose").click(); showPortal();
};
$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  $("loginMessage").textContent = "";
  if(!liveConfigured){ $("loginMessage").textContent = "Live login is not configured yet. Use the exhibition demo or complete the setup guide."; return; }
  const {data,error} = await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  if(error){ $("loginMessage").textContent = "Sign-in failed. Check your school-issued account details."; return; }
  const {data:profile,error:profileError} = await db.from("profiles").select("role,display_name,active").eq("id",data.user.id).single();
  if(profileError || !profile || !profile.active){ await db.auth.signOut(); $("loginMessage").textContent = "This account is not enabled for the school portal."; return; }
  sessionUser = {...profile,id:data.user.id}; demoMode = false; $("loginClose").click(); showPortal();
});

function showPortal(){
  $("portal").classList.remove("hidden");
  $("portalTitle").textContent = "Welcome, " + (sessionUser.display_name || "Staff");
  $("portalRole").textContent = "Signed in as: " + sessionUser.role;
  $("demoWarning").classList.toggle("hidden",!demoMode);
  document.querySelectorAll(".portal-nav button").forEach(b=>b.classList.toggle("hidden", !canSee(b.dataset.view)));
  renderView("overview");
  $("portal").scrollIntoView({behavior:"smooth"});
}
function canSee(view){
  const role = sessionUser?.role;
  if(demoMode) return true;
  if(role === "principal" || role === "management") return true;
  if(role === "teacher") return ["overview","attendance","students","notices","eventsAdmin"].includes(view);
  return false;
}
document.querySelectorAll(".portal-nav button").forEach(b=>b.onclick=()=>renderView(b.dataset.view));
$("logoutBtn").onclick=async()=>{
  if(!demoMode && db) await db.auth.signOut();
  sessionUser=null; demoMode=false; $("portal").classList.add("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
};
function renderView(view){
  currentView=view;
  document.querySelectorAll(".portal-nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const c=$("portalContent");
  if(view==="overview") c.innerHTML = `<h3>School overview</h3><p class="muted">A quick view of school administration tools.</p><div class="dashboard-cards"><div class="dash-card"><span>Sample student records</span><strong>${demoMode?demoData.students.length:"—"}</strong></div><div class="dash-card"><span>Attendance</span><strong>Daily</strong></div><div class="dash-card"><span>Access role</span><strong>${escapeHtml(sessionUser.role)}</strong></div></div><div class="notice">Use the menu to open attendance, student, teacher, notice and exhibition tools. Live records become available after connecting the secure database.</div>`;
  if(view==="attendance") renderAttendance(c);
  if(view==="students") renderStudents(c);
  if(view==="teachers") renderTeachers(c);
  if(view==="notices") renderNotices(c);
  if(view==="eventsAdmin") c.innerHTML=`<h3>Exhibition & events</h3><p class="muted">Manage exhibition announcements and school events. Publish only school-approved information.</p><div class="notice">Demo: Annual School Exhibition — sample event. Live event publishing can be enabled after database setup.</div>`;
}
function renderAttendance(c){
  c.innerHTML=`<h3>Class-wise attendance</h3><p class="muted">Choose a class and date. Demo entries are fictional; live saving requires the configured database.</p><form class="portal-form" id="attendanceForm"><label>Class<select id="attClass"><option>Class 6</option><option>Class 7</option><option>Class 8</option><option selected>Class 9</option><option>Class 10</option></select></label><label>Date<input type="date" id="attDate" required></label><div class="wide"><button class="btn" type="submit">Load attendance list</button></div></form><div id="attendanceRows"></div>`;
  $("attDate").value=new Date().toISOString().slice(0,10);
  $("attendanceForm").onsubmit=e=>{e.preventDefault();loadAttendanceRows($("attClass").value);};
}
function loadAttendanceRows(className){
  const rows=demoMode?demoData.students.filter(s=>s.class_name===className):[];
  const target=$("attendanceRows");
  if(!demoMode){target.innerHTML='<p class="notice">Connect and configure the live database to load enrolled students. Attendance records are protected by database permissions.</p>';return;}
  if(!rows.length){target.innerHTML='<p class="notice">No fictional demo students are assigned to this class.</p>';return;}
  target.innerHTML=`<form id="markForm"><div class="table-wrap"><table><thead><tr><th>Student (demo)</th><th>Roll no.</th><th>Status</th></tr></thead><tbody>${rows.map((s,i)=>`<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.roll)}</td><td><select name="status${i}"><option>Present</option><option>Absent</option><option>Late</option></select></td></tr>`).join("")}</tbody></table></div><button class="btn" type="submit">Preview attendance</button></form><p id="attResult" class="muted"></p>`;
  $("markForm").onsubmit=e=>{e.preventDefault();$("attResult").textContent="Demo preview only — no real attendance has been saved.";};
}
function renderStudents(c){
  c.innerHTML=`<h3>Student directory</h3><p class="muted">Student information is private and visible only to permitted signed-in staff.</p>`;
  if(demoMode){c.innerHTML+=`<div class="table-wrap"><table><thead><tr><th>Student (fictional)</th><th>Roll</th><th>Class</th><th>Section</th></tr></thead><tbody>${demoData.students.map(s=>`<tr><td>${escapeHtml(s.name)}</td><td>${s.roll}</td><td>${s.class_name}</td><td>${s.section}</td></tr>`).join("")}</tbody></table></div>`;}
  else c.innerHTML+=`<div class="notice">Live student records will appear here after the school database and permissions are configured.</div>`;
}
function renderTeachers(c){
  c.innerHTML=`<h3>Teacher directory</h3><p class="muted">Private staff details — not displayed on the public website.</p>`;
  if(demoMode){c.innerHTML+=`<div class="table-wrap"><table><thead><tr><th>Teacher (fictional)</th><th>Subject</th><th>Email</th></tr></thead><tbody>${demoData.teachers.map(t=>`<tr><td>${escapeHtml(t.name)}</td><td>${t.subject}</td><td>${t.email}</td></tr>`).join("")}</tbody></table></div>`;}
  else c.innerHTML+=`<div class="notice">Live staff records will appear here for authorized roles after database setup.</div>`;
}
function renderNotices(c){
  c.innerHTML=`<h3>Notices</h3><p class="muted">Internal and public notices must be reviewed before publishing.</p>${(demoMode?demoData.notices:["Live notices are available after database setup."]).map(n=>`<div class="notice">${escapeHtml(n)}</div>`).join("")}`;
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}

// Restore an existing live session after page refresh.
(async()=>{if(liveConfigured){const {data:{session}}=await db.auth.getSession();if(session){const {data:p}=await db.from("profiles").select("role,display_name,active").eq("id",session.user.id).single();if(p?.active){sessionUser={...p,id:session.user.id};showPortal();}}}})();
