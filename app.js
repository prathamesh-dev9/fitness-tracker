const GOAL_CAL = 1500;
const GOAL_P = 120, GOAL_C = 150, GOAL_F = 45;
const FOODS = [
  {n:"3 eggs",cal:210,p:18,c:2,f:15},{n:"Poha (1 bowl)",cal:250,p:5,c:45,f:5},
  {n:"Oats with milk",cal:300,p:12,c:50,f:6},{n:"Sprouts chaat",cal:180,p:10,c:30,f:2},
  {n:"2 rotis",cal:200,p:6,c:40,f:3},{n:"Dal (1 bowl)",cal:150,p:10,c:22,f:3},
  {n:"Sabzi (1 bowl)",cal:100,p:3,c:15,f:4},{n:"Rice (1 cup)",cal:200,p:4,c:44,f:1},
  {n:"Chicken breast",cal:165,p:31,c:0,f:4},{n:"Fish (100g)",cal:130,p:22,c:0,f:5},
  {n:"Paneer (100g)",cal:265,p:18,c:4,f:20},{n:"Tofu (100g)",cal:76,p:8,c:2,f:4},
  {n:"Apple",cal:80,p:0,c:21,f:0},{n:"Banana",cal:90,p:1,c:23,f:0},
  {n:"Roasted chana",cal:120,p:7,c:18,f:3},{n:"Buttermilk",cal:60,p:3,c:8,f:1},
  {n:"Curd (1 bowl)",cal:100,p:6,c:8,f:4},{n:"Salad",cal:40,p:2,c:8,f:0},
  {n:"Dahi rice",cal:280,p:7,c:50,f:6},{n:"Khichdi",cal:220,p:8,c:38,f:5},
  {n:"Upma",cal:200,p:5,c:35,f:5},{n:"Idli (2 pcs)",cal:130,p:4,c:26,f:1},
  {n:"Dosa (1)",cal:170,p:4,c:30,f:4},{n:"Sambar (1 bowl)",cal:90,p:5,c:15,f:2},
  {n:"Rajma (1 bowl)",cal:180,p:12,c:30,f:2},{n:"Chana masala",cal:200,p:12,c:32,f:4},
  {n:"Boiled egg",cal:78,p:6,c:1,f:5},{n:"Milk (1 glass)",cal:120,p:6,c:12,f:5},
  {n:"Guava",cal:68,p:3,c:14,f:1},{n:"Orange",cal:62,p:1,c:15,f:0},
];
const MEALS = ["Breakfast","Lunch","Snack","Dinner"];
const MEAL_ICONS = ["ti-sun","ti-sun-high","ti-coffee","ti-moon"];
const TASKS = {
  meals:[
    {id:"tm1",l:"Ate breakfast with protein"},
    {id:"tm2",l:"Ate balanced lunch"},
    {id:"tm3",l:"Had healthy snack"},
    {id:"tm4",l:"Ate light dinner"},
    {id:"tm5",l:"No soft drinks / sugary juice"},
    {id:"tm6",l:"No deep-fried / junk food"},
  ],
  water:[
    {id:"tw1",l:"Drank 1st litre of water"},
    {id:"tw2",l:"Drank 2nd litre of water"},
    {id:"tw3",l:"Reached 2.5–3 litres total"},
  ],
  exercise:[
    {id:"te1",l:"Walked 30–45 min (or 8k steps)"},
    {id:"te2",l:"Did bodyweight exercises"},
  ],
  recovery:[
    {id:"tr1",l:"Slept 7–8 hours last night"},
    {id:"tr2",l:"No calories in drinks today"},
  ]
};

function todayKey(){const n=new Date();return`${n.getFullYear()}-${n.getMonth()}-${n.getDate()}`}
function load(k,def){try{const v=localStorage.getItem(k);return v?JSON.parse(v):def}catch{return def}}
function save(k,v){
  try{
    localStorage.setItem(k,JSON.stringify(v));
  }catch{}
}


// Option B: JSON Backup Compilation
function compileAllData() {
  const data = {
    weights: load('hl2_weights', []),
    history: load('hl2_hist', {}),
    meals: {},
    checks: {}
  };
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('hl2_meals_')) {
      const date = key.replace('hl2_meals_', '');
      data.meals[date] = load(key, [[],[],[],[]]);
    } else if (key.startsWith('hl2_checks_')) {
      const date = key.replace('hl2_checks_', '');
      data.checks[date] = load(key, {});
    }
  }
  return data;
}

function importAllData(data) {
  if (!data) return;
  
  try {
    // Save to local storage directly to prevent sync loops
    if (data.weights) localStorage.setItem('hl2_weights', JSON.stringify(data.weights));
    if (data.history) localStorage.setItem('hl2_hist', JSON.stringify(data.history));
    
    if (data.meals) {
      for (const date in data.meals) {
        localStorage.setItem('hl2_meals_' + date, JSON.stringify(data.meals[date]));
      }
    }
    
    if (data.checks) {
      for (const date in data.checks) {
        localStorage.setItem('hl2_checks_' + date, JSON.stringify(data.checks[date]));
      }
    }
  } catch (err) {
    console.error("Local storage error during import:", err);
  }
  
  // Reload local state variables
  mealLogs = load('hl2_meals_'+todayKey(), [[],[],[],[]]);
  checks = load('hl2_checks_'+todayKey(), {});
  weights = load('hl2_weights', []);
  history = load('hl2_hist', {});
  
  // Refresh views
  renderCalories();
  if (document.getElementById('pg-checklist').classList.contains('active')) renderChecklist();
  if (document.getElementById('pg-weight').classList.contains('active')) renderWeight();
  if (document.getElementById('pg-insights').classList.contains('active')) renderInsights();
}

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  modal.classList.add('open');
}

function closeSettingsModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('settings-modal');
  modal.classList.remove('open');
}

function exportToJSON() {
  const data = compileAllData();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute("download", `health_tracker_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importFromJSON(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      importAllData(data);
      alert("Data successfully imported!");
      closeSettingsModal();
    } catch (err) {
      alert("Error parsing JSON backup file. Please ensure it's a valid backup.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

let mealLogs = load('hl2_meals_'+todayKey(), [[],[],[],[]]);
let checks = load('hl2_checks_'+todayKey(), {});
let weights = load('hl2_weights', []);
let history = load('hl2_hist', {});

function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('pg-'+name).classList.add('active');
  document.getElementById('nb-'+name).classList.add('active');
  if(name==='calories')renderCalories();
  if(name==='checklist')renderChecklist();
  if(name==='weight')renderWeight();
  if(name==='insights')renderInsights();
}

function calcTotals(){
  let cal=0,p=0,c=0,f=0;
  mealLogs.forEach(m=>m.forEach(item=>{cal+=item.cal;p+=item.p;c+=item.c;f+=item.f}));
  return{cal,p,c,f};
}

function renderCalories(){
  const t=calcTotals();
  const pct=Math.min(100,Math.round(t.cal/GOAL_CAL*100));
  const offset=Math.round(377-(377*pct/100));
  const arc=document.getElementById('ring-arc');
  arc.style.strokeDashoffset=offset;
  arc.style.stroke=t.cal>GOAL_CAL?'var(--color-accent-red)':'var(--color-accent-teal)';
  document.getElementById('ring-cal').textContent=t.cal;
  const rem=GOAL_CAL-t.cal;
  document.getElementById('ring-rem').textContent=rem>0?rem+' left':Math.abs(rem)+' over';
  document.getElementById('mc-p').textContent=t.p+'g';
  document.getElementById('mc-c').textContent=t.c+'g';
  document.getElementById('mc-f').textContent=t.f+'g';
  document.getElementById('mb-p').style.width=Math.min(100,Math.round(t.p/GOAL_P*100))+'%';
  document.getElementById('mb-c').style.width=Math.min(100,Math.round(t.c/GOAL_C*100))+'%';
  document.getElementById('mb-f').style.width=Math.min(100,Math.round(t.f/GOAL_F*100))+'%';

  const mc=document.getElementById('meals-container');
  mc.innerHTML='';
  MEALS.forEach((name,i)=>{
    const mCal=mealLogs[i].reduce((s,x)=>s+x.cal,0);
    const div=document.createElement('div');div.className='meal-block';
    const hd=document.createElement('div');hd.className='meal-hd';
    hd.innerHTML=`<div class="meal-hd-left"><i class="ti ${MEAL_ICONS[i]}" aria-hidden="true" style="font-size:16px;color:var(--color-text-secondary)"></i><span class="meal-name">${name}</span></div><div style="display:flex;align-items:center;gap:8px"><span class="meal-cal">${mCal} kcal</span><button class="add-btn" onclick="openAddFoodModal(${i})" aria-label="Add food to ${name}"><i class="ti ti-plus" aria-hidden="true"></i></button></div>`;
    div.appendChild(hd);
    mealLogs[i].forEach((item,j)=>{
      const row=document.createElement('div');row.className='food-item';
      row.innerHTML=`<div><div class="food-name">${item.n}</div><div class="food-cals">${item.cal} kcal · P${item.p}g C${item.c}g F${item.f}g</div></div><button class="del-btn" onclick="removeFood(${i},${j})" aria-label="Remove ${item.n}"><i class="ti ti-x" aria-hidden="true"></i></button>`;
      div.appendChild(row);
    });
    mc.appendChild(div);
  });
  filterFoods();
  saveHistory();
}

function selectMeal(i){document.getElementById('meal-target').value=i;}

function openAddFoodModal(mealIndex) {
  document.getElementById('meal-target').value = mealIndex;
  document.getElementById('modal-meal-name').textContent = MEALS[mealIndex];
  const modal = document.getElementById('add-food-modal');
  modal.classList.add('open');
  document.getElementById('food-search').value = '';
  filterFoods();
  setTimeout(() => {
    document.getElementById('food-search').focus();
  }, 150);
}

function closeAddFoodModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('add-food-modal');
  modal.classList.remove('open');
}

function filterFoods(){
  const q=(document.getElementById('food-search').value||'').toLowerCase();
  const shown=q?FOODS.filter(f=>f.n.toLowerCase().includes(q)):FOODS.slice(0,16);
  const el=document.getElementById('food-options');
  el.innerHTML='';
  shown.forEach(f=>{
    const d=document.createElement('div');d.className='food-opt';
    d.innerHTML=`${f.n}<span class="food-opt-cal">${f.cal} kcal</span>`;
    d.onclick=()=>addFood(f);
    el.appendChild(d);
  });
}

function addFood(f){
  const mi=parseInt(document.getElementById('meal-target').value);
  mealLogs[mi].push({...f});
  save('hl2_meals_'+todayKey(),mealLogs);
  renderCalories();
  closeAddFoodModal();
}

function addCustom(){
  const n=document.getElementById('custom-name').value.trim();
  const cal=parseInt(document.getElementById('custom-cal').value)||0;
  if(!n||!cal)return;
  addFood({n,cal,p:0,c:0,f:0});
  document.getElementById('custom-name').value='';
  document.getElementById('custom-cal').value='';
}

function removeFood(mi,ji){
  mealLogs[mi].splice(ji,1);
  save('hl2_meals_'+todayKey(),mealLogs);
  renderCalories();
}

function renderChecklist(){
  ['meals','water','exercise','recovery'].forEach(sec=>{
    const el=document.getElementById('cl-'+sec);
    el.innerHTML='';
    TASKS[sec].forEach(t=>{
      const done=!!checks[t.id];
      const div=document.createElement('div');
      div.className='task-item'+(done?' done':'');
      div.onclick=()=>toggleCheck(t.id);
      div.innerHTML=`<div class="chk${done?' on':''}">${done?'<i class="ti ti-check"></i>':''}</div><span class="task-lbl">${t.l}</span>`;
      el.appendChild(div);
    });
  });
}

function toggleCheck(id){
  checks[id]=!checks[id];
  save('hl2_checks_'+todayKey(),checks);
  renderChecklist();
}

function resetChecklist(){
  checks={};
  save('hl2_checks_'+todayKey(),checks);
  renderChecklist();
}

function logWeight(){
  const v=parseFloat(document.getElementById('wt-input').value);
  if(!v||v<30||v>300)return;
  const n=new Date();
  const label=`${n.getDate()}/${n.getMonth()+1}/${String(n.getFullYear()).slice(2)}`;
  weights.unshift({d:label,v,ts:Date.now()});
  if(weights.length>20)weights=weights.slice(0,20);
  save('hl2_weights',weights);
  document.getElementById('wt-input').value='';
  renderWeight();
}

function renderWeight(){
  const start=80,goal=60;
  const cur=weights.length?weights[0].v:null;
  const lost=cur?Math.round((start-cur)*10)/10:null;
  const pct=cur?Math.max(0,Math.min(100,Math.round((start-cur)/(start-goal)*100))):0;
  document.getElementById('goal-bar').style.width=pct+'%';
  document.getElementById('wt-pct-lbl').textContent=pct+'% to goal';
  document.getElementById('wt-current').textContent=cur?cur+' kg':'— kg';
  document.getElementById('wt-lost').textContent=lost!==null?(lost>0?'-'+lost:'+'+Math.abs(lost))+' kg':'— kg';
  const hist=document.getElementById('wt-history');
  hist.innerHTML='';
  if(!weights.length){hist.innerHTML='<div style="font-size:13px;color:var(--color-text-secondary);padding:8px 0;text-align:center">No entries yet</div>';return;}
  weights.slice(0,8).forEach((w,i)=>{
    const diff=i<weights.length-1?Math.round((w.v-weights[i+1].v)*10)/10:null;
    const div=document.createElement('div');div.className='wt-entry';
    const badge=diff!==null?(diff<0?`<span class="badge badge-g">${diff} kg</span>`:(diff>0?`<span class="badge badge-r">+${diff} kg</span>`:`<span class="badge badge-a">0 kg</span>`)): '';
    div.innerHTML=`<span style="color:var(--color-text-muted);font-size:12px;font-weight:500">${w.d}</span><span style="font-weight:600;font-size:14px">${w.v} kg</span>${badge}`;
    hist.appendChild(div);
  });
}

function saveHistory(){
  const t=calcTotals();
  history[todayKey()]={cal:t.cal,p:t.p,c:t.c,f:t.f,ts:Date.now()};
  save('hl2_hist',history);
}

function calcStreak(){
  let streak=0,d=new Date();
  while(true){
    const k=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if(!history[k]&&k!==todayKey())break;
    if(history[k]||k===todayKey())streak++;
    else break;
    d.setDate(d.getDate()-1);
    if(streak>365)break;
  }
  return streak;
}

function renderInsights(){
  const keys=Object.keys(history).sort();
  document.getElementById('ins-streak').textContent=calcStreak();
  document.getElementById('ins-days').textContent=keys.length;
  const cals=keys.map(k=>history[k].cal).filter(c=>c>0);
  const avg=cals.length?Math.round(cals.reduce((a,b)=>a+b,0)/cals.length):0;
  document.getElementById('ins-avg').textContent=avg||'—';
  const deficit=avg?GOAL_CAL-avg:null;
  document.getElementById('ins-deficit').textContent=deficit!==null?(deficit>=0?'-'+deficit:'+'+Math.abs(deficit)):' —';

  const chart=document.getElementById('weekly-chart');
  const last7=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;last7.push({k,cal:history[k]?history[k].cal:0,label:['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()]});}
  const maxC=Math.max(...last7.map(d=>d.cal),GOAL_CAL);
  chart.innerHTML='<div style="display:flex;align-items:flex-end;gap:12px;height:90px;padding:8px 4px 4px;background:rgba(15,23,42,0.3);border-radius:12px;border:1px solid var(--color-border-tertiary)">'+
    last7.map(d=>{
      const h=d.cal?Math.max(4,Math.round(d.cal/maxC*76)):4;
      const over=d.cal>GOAL_CAL;
      const today=d.k===todayKey();
      return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">
        <div style="font-size:9px;color:${today?'var(--color-accent-teal)':'var(--color-text-secondary)'};font-weight:600">${d.cal||'0'}</div>
        <div style="width:100%;height:${h}px;background:${over?'var(--color-accent-red)':today?'var(--color-accent-teal)':'rgba(16, 185, 129, 0.3)'};border-radius:4px 4px 0 0;box-shadow:${today?'0 0 8px rgba(16, 185, 129, 0.2)':''};transition:all 0.3s"></div>
        <div style="font-size:10px;color:${today?'var(--color-text-primary)':'var(--color-text-muted)'};font-weight:${today?600:500}">${d.label}</div>
      </div>`;
    }).join('')+'</div>'+
    `<div style="font-size:11px;color:var(--color-text-muted);margin-top:6px;display:flex;justify-content:center;gap:12px">`+
    `<span>Goal: ${GOAL_CAL} kcal/day</span>` +
    `<span><span style="color:var(--color-accent-teal)">●</span> today</span>` +
    `<span><span style="color:var(--color-accent-red)">●</span> over goal</span></div>`;

  const tips=document.getElementById('tips-container');
  const tipList=[];
  if(avg>GOAL_CAL+100)tipList.push({icon:'ti-alert-circle',t:'You are averaging above your 1,500 kcal target. Try swapping rice for more veggies at dinner.'});
  else if(avg>0&&avg<1200)tipList.push({icon:'ti-alert-circle',t:'Your average is quite low. Eating too little can slow metabolism — aim for at least 1,200–1,500 kcal.'});
  else if(avg>0)tipList.push({icon:'ti-circle-check',t:'Calorie intake looks on track! Keep logging daily to stay consistent.'});
  if(weights.length>=2){const diff=weights[0].v-weights[weights.length-1].v;if(diff<0)tipList.push({icon:'ti-trending-down',t:`You've lost ${Math.abs(Math.round(diff*10)/10)} kg so far. At this pace you'll reach 60 kg well within your timeline.`});}
  tipList.push({icon:'ti-droplet',t:'Drink a glass of water before each meal — it reduces hunger and helps hit your 2.5L goal.'});
  tipList.push({icon:'ti-barbell',t:'Strength training 3×/week preserves muscle while losing fat, keeping metabolism high.'});
  tips.innerHTML=tipList.map(t=>`<div class="tip-card"><i class="ti ${t.icon}" aria-hidden="true"></i><div>${t.t}</div></div>`).join('');
}

// Display today's date in header
const options = { weekday: 'short', month: 'short', day: 'numeric' };
document.getElementById('header-date').textContent = new Date().toLocaleDateString('en-US', options);

renderCalories();
filterFoods();

// Trigger initial load (already done by renderCalories/filterFoods above)
