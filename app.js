const prices = [
  {o:100,h:104,l:98,c:103},{o:103,h:106,l:101,c:105},{o:105,h:107,l:100,c:101},{o:101,h:103,l:97,c:99},
  {o:99,h:102,l:96,c:101},{o:101,h:106,l:100,c:105},{o:105,h:109,l:103,c:108},{o:108,h:110,l:104,c:106},
  {o:106,h:111,l:105,c:110},{o:110,h:114,l:108,c:113},{o:113,h:115,l:108,c:109},{o:109,h:110,l:104,c:105},
  {o:105,h:108,l:102,c:107},{o:107,h:112,l:106,c:111},{o:111,h:115,l:109,c:114},{o:114,h:117,l:111,c:112}
];

const lessons = [
  {title:'量化到底是什么？',small:'把想法写成规则',intro:'量化不是一台会预测未来的机器。它是把“我觉得”变成“如果发生 A，就做 B”的具体规则，再用数据检查这个规则。',analogy:'出门前看天气预报。你可以定一条规则：“下雨概率超过 60%，就带伞。” 量化做的事类似：先写条件，再按条件行动。',points:['先定义你观察什么数据','再定义什么条件触发行动','最后检查结果，发现规则的问题'],quiz:'下面哪一句更像量化规则？',options:['感觉今天会涨，所以买','收盘价连续 3 天高于 5 日均线，下一天才考虑买入'],correct:1,answer:'对！这句话有可计算的条件和明确的时间点。'},
  {title:'K 线：一天四个价格',small:'学会读图',intro:'一根 K 线由开盘价、最高价、最低价、收盘价组成。图上的实体连接开盘与收盘，影线指出当天到过的最高与最低。',analogy:'想象一家店的一天：开门时标价 100，打烊时 105；营业中一度卖到 108，也曾降到 98。这四个数字就能画成一根 K 线。',points:['看实体：开盘到收盘变化多少','看影线：全天波动过多大范围','不要只凭一根 K 线猜明天'],quiz:'开盘 100、收盘 105，这一天的实体表示什么？',options:['从 100 涨到 105','全天最高价是 105'],correct:0,answer:'正确。最高价可能比 105 还高，要另看上影线。'},
  {title:'均线：把起伏看平一些',small:'理解平均值',intro:'5 日均线就是把最近 5 天的收盘价加起来，再除以 5。每天往前移动一天，就连成一条线。',analogy:'体重每天会因喝水或吃饭而波动。看最近 5 天的平均体重，更容易了解大概趋势；但它不能保证明天的体重。',points:['均线只使用已经发生的价格','短均线更灵敏，也更容易摇摆','均线是概括过去，不是预测未来'],quiz:'5 日均线需要几个收盘价？',options:['最近 5 天','未来 5 天'],correct:0,answer:'答对了。计算时只能使用已经知道的价格。'},
  {title:'策略：把规则说清楚',small:'写出买卖条件',intro:'策略至少要说明：什么时候观察、什么时候行动、买多少、什么时候退出。含糊的规则无法认真检验。',analogy:'菜谱如果只写“火候差不多就出锅”，每个人做出的菜都不同；写明“中火 5 分钟”，才有办法复现。',points:['条件要明确：例如 3 日均线高于 7 日均线','执行要明确：例如次日开盘才操作','退出和仓位同样需要规则'],quiz:'如果用“今天收盘价”决定交易，最早应在何时执行？',options:['今天开盘','今天收盘后或下一交易时点'],correct:1,answer:'正确。今天开盘时还不知道今天的收盘价。'},
  {title:'回测：用旧数据做模拟考',small:'检查规则',intro:'回测是让同一套规则在过去的数据上运行，记录每次决定以及资金变化。它能帮助发现问题，但好成绩不保证未来也好。',analogy:'你用去年的试卷做模拟考，能发现哪里不会；但不能保证今年试卷完全相同。',points:['不能偷看未来的数据','要把交易成本算进去','多看不同时间段和不顺利的时期'],quiz:'模拟回测赚了钱，说明什么？',options:['未来一定赚钱','只说明规则在该模拟数据和假设下曾表现如此'],correct:1,answer:'完全正确。回测是检查工具，不是收益保证。'},
  {title:'风险：先保护自己',small:'理解不确定性',intro:'规则即使在过去有效，也可能遇到市场变化。学习量化时，先习惯问：最差会怎样？这个结果有没有忽略成本或选错样本？',analogy:'出门带伞不等于保证不被淋湿。风向、雨势和伞的质量都会影响结果；交易也有许多模型没有覆盖的情况。',points:['记录亏损与最大回撤','留意手续费和滑点','先用模拟环境练习，别把示例当建议'],quiz:'下面哪件事最能帮助你更谨慎地看回测？',options:['只展示最赚钱的一段','检查费用、回撤和不同时间段'],correct:1,answer:'对。完整地看成绩，才能看见规则的局限。'}
];

const $ = id => document.getElementById(id);
let selected = 8;
let activeLesson = 0;
let done = new Set();
try { done = new Set(JSON.parse(localStorage.getItem('quant-lessons-done') || '[]')); } catch (_) {}

function svg(tag, attrs, inner='') { return `<${tag} ${Object.entries(attrs).map(([k,v])=>`${k}="${v}"`).join(' ')}>${inner}</${tag}>`; }
function yPrice(v){ return 262 - (v-90)/30*238; }
function average(i,n){ if(i<n-1) return null; return prices.slice(i-n+1,i+1).reduce((s,p)=>s+p.c,0)/n; }
function renderCandles(){
  const chart=$('candlestick-chart');
  let out='<title>教学模拟 K 线图</title><desc>十六个模拟交易日，点击或按回车选择一根 K 线。红色上涨，绿色下跌；黄色线表示 5 日均线。</desc>';
  [90,100,110,120].forEach(v=>{let y=yPrice(v);out+=svg('line',{x1:36,y1:y,x2:781,y2:y,stroke:'#e9eeee','stroke-width':1})+svg('text',{x:4,y:y+3,fill:'#98a7ad','font-size':10},v);});
  out+=svg('rect',{x:66+selected*45-18,y:15,width:36,height:250,fill:'#edf7ec',rx:6});
  prices.forEach((p,i)=>{
    const x=66+i*45, rising=p.c>=p.o, color=rising?'#e27068':'#17a874';
    out+=`<g class="candle" data-index="${i}" tabindex="0" role="button" aria-label="第 ${i+1} 天，开盘 ${p.o}，最高 ${p.h}，最低 ${p.l}，收盘 ${p.c}" style="cursor:pointer">`;
    out+=svg('rect',{x:x-18,y:15,width:36,height:250,fill:'transparent'});
    out+=svg('line',{x1:x,y1:yPrice(p.h),x2:x,y2:yPrice(p.l),stroke:color,'stroke-width':2});
    out+=svg('rect',{x:x-10,y:Math.min(yPrice(p.o),yPrice(p.c)),width:20,height:Math.max(3,Math.abs(yPrice(p.o)-yPrice(p.c))),fill:color,rx:2});
    out+=svg('text',{x:x,y:292,fill:i===selected?'#243c48':'#9ba8ad','font-size':10,'text-anchor':'middle','font-weight':i===selected?700:400},String(i+1).padStart(2,'0'))+'</g>';
  });
  if($('ma-toggle').checked){ const pts=prices.map((_,i)=>{let a=average(i,5);return a===null?null:`${66+i*45},${yPrice(a)}`}).filter(Boolean).join(' ');out+=svg('polyline',{points:pts,fill:'none',stroke:'#e9b748','stroke-width':2.5,'stroke-linejoin':'round','stroke-linecap':'round'}); }
  out+=svg('text',{x:66,y:315,fill:'#a4b0b3','font-size':9},'模拟交易日')+svg('text',{x:781,y:315,fill:'#a4b0b3','font-size':9,'text-anchor':'end'},'价格（示意）');
  chart.innerHTML=out;
  const p=prices[selected], rise=p.c>=p.o;
  $('selected-day').textContent=`第 ${selected+1} 天`;
  $('day-counter').textContent=`第 ${selected+1} / ${prices.length} 天`;
  $('selected-direction').textContent=rise?'上涨的一天 ↗':'下跌的一天 ↘';
  $('selected-direction').className=rise?'up-text':'down-text';
  $('selected-explain').textContent=rise?`收盘价比开盘价高 ${p.c-p.o}，但期间也到过 ${p.l} 的低点。`:`收盘价比开盘价低 ${p.o-p.c}，但期间也到过 ${p.h} 的高点。`;
  $('open-value').textContent=p.o.toFixed(2);$('high-value').textContent=p.h.toFixed(2);$('low-value').textContent=p.l.toFixed(2);$('close-value').textContent=p.c.toFixed(2);
}
$('candlestick-chart').addEventListener('click',e=>{const g=e.target.closest('[data-index]');if(g){selected=Number(g.dataset.index);renderCandles();}});
$('candlestick-chart').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const g=e.target.closest('[data-index]');if(g){e.preventDefault();selected=Number(g.dataset.index);renderCandles();}}});
$('prev-day').addEventListener('click',()=>{selected=(selected-1+prices.length)%prices.length;renderCandles();});
$('next-day').addEventListener('click',()=>{selected=(selected+1)%prices.length;renderCandles();});
$('ma-toggle').addEventListener('change',renderCandles);

function renderLessons(){
  $('lesson-nav').innerHTML=lessons.map((l,i)=>`<button class="nav-lesson ${i===activeLesson?'active':''}" type="button" data-lesson="${i}" ${i===activeLesson?'aria-current="step"':''}><span class="nav-num">${String(i+1).padStart(2,'0')}</span><span>${l.title}</span>${done.has(i)?'<span class="nav-check">✓</span>':''}</button>`).join('');
  $('course-list').innerHTML=lessons.map((l,i)=>`<button class="course-item ${i===activeLesson?'active':''}" type="button" data-lesson="${i}" ${i===activeLesson?'aria-current="step"':''}><span class="course-item-num">${String(i+1).padStart(2,'0')}</span><span class="course-item-main"><strong>${l.title}</strong><span>${l.small}</span></span>${done.has(i)?'<span class="course-done">✓</span>':''}</button>`).join('');
  const l=lessons[activeLesson];
  $('lesson-panel').innerHTML=`<div class="lesson-eyebrow">LESSON ${String(activeLesson+1).padStart(2,'0')} / 06</div><h3>${l.title}</h3><p class="lesson-intro">${l.intro}</p><div class="analogy"><span class="analogy-icon">✦</span><div><strong>换成生活里的例子</strong><p>${l.analogy}</p></div></div><ul class="lesson-bullets">${l.points.map(p=>`<li>${p}</li>`).join('')}</ul><div class="quiz"><span class="quiz-label">一分钟小练习</span><h4>${l.quiz}</h4><div class="quiz-options">${l.options.map((o,i)=>`<button class="quiz-option" data-option="${i}" type="button">${o}</button>`).join('')}</div><p class="quiz-feedback" id="quiz-feedback" aria-live="polite">选一个答案，马上得到解释。</p></div><div class="lesson-bottom"><button class="mark-done ${done.has(activeLesson)?'done':''}" type="button">${done.has(activeLesson)?'✓ 已完成这节':'标记为已学完'}</button><button class="next-lesson" type="button">${activeLesson===5?'回到第一节 ↗':'下一节 →'}</button></div>`;
  $('progress-copy').textContent=`已完成 ${done.size} / 6 节`;
  $('progress-fill').style.width=`${done.size/6*100}%`;
  const side=document.querySelector('.side-label span');if(side)side.textContent=`${String(activeLesson+1).padStart(2,'0')} / 06`;
}
function selectLesson(i,scroll=false){activeLesson=i;renderLessons();if(scroll)$('course').scrollIntoView({behavior:'smooth'});}
document.addEventListener('click',e=>{
  const lessonBtn=e.target.closest('[data-lesson]');if(lessonBtn){selectLesson(Number(lessonBtn.dataset.lesson),lessonBtn.classList.contains('nav-lesson'));return;}
  const quizBtn=e.target.closest('[data-option]');if(quizBtn){const l=lessons[activeLesson],correct=Number(quizBtn.dataset.option)===l.correct;document.querySelectorAll('.quiz-option').forEach(b=>b.classList.remove('correct','wrong'));quizBtn.classList.add(correct?'correct':'wrong');$('quiz-feedback').textContent=correct?l.answer:`再想想：${l.answer}`;return;}
  if(e.target.closest('.mark-done')){done.add(activeLesson);try{localStorage.setItem('quant-lessons-done',JSON.stringify([...done]));}catch(_){}renderLessons();return;}
  if(e.target.closest('.next-lesson')){selectLesson((activeLesson+1)%lessons.length);return;}
});

function drawEquity(strategy,hold){
  const chart=$('equity-chart');const all=[...strategy,...hold,100],lo=Math.floor(Math.min(...all)-3),hi=Math.ceil(Math.max(...all)+3),y=v=>190-(v-lo)/(hi-lo)*160,x=i=>35+i/(prices.length-1)*490;
  let out='<title>模拟资金曲线</title><desc>绿色为规则策略，金色为一直持有；数据仅供教学。</desc>';
  [0,.5,1].forEach(t=>{let yy=30+t*160;out+=svg('line',{x1:35,y1:yy,x2:525,y2:yy,stroke:'#e9eeee'})+svg('text',{x:2,y:yy+3,fill:'#a4b0b5','font-size':9},(hi-(hi-lo)*t).toFixed(0));});
  out+=svg('line',{x1:35,y1:y(100),x2:525,y2:y(100),stroke:'#c4d0d0','stroke-dasharray':'4 4'});
  const path=a=>a.map((v,i)=>`${i?'L':'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  out+=svg('path',{d:path(hold),fill:'none',stroke:'#c5b56e','stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round'});
  out+=svg('path',{d:path(strategy),fill:'none',stroke:'#1ca676','stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'});
  out+=svg('text',{x:35,y:213,fill:'#a4b0b5','font-size':9},'第 1 天')+svg('text',{x:525,y:213,fill:'#a4b0b5','font-size':9,'text-anchor':'end'},'第 16 天');
  chart.innerHTML=out;
}
function runBacktest(){
  const fee=Number($('fee-range').value)/100;
  let equity=100,hold=100,position=0,trades=0,series=[],holdSeries=[];
  prices.forEach((p,i)=>{
    if(i>0 && position===1)equity*=p.o/prices[i-1].c;
    const short=i>0?meanAt(i-1,3):null,long=i>0?meanAt(i-1,7):null;
    const nextPosition=short!==null&&long!==null&&short>long?1:0;
    if(nextPosition!==position){equity*=1-fee;trades++;}
    position=nextPosition;
    if(position===1)equity*=p.c/p.o;
    if(i===0)hold*=p.c/p.o;else hold*=p.c/prices[i-1].c;
    series.push(equity);holdSeries.push(hold);
  });
  drawEquity(series,holdSeries);
  $('strategy-final').textContent=`${equity.toFixed(2)} 元`;
  $('hold-final').textContent=`${hold.toFixed(2)} 元`;
  $('trade-count').textContent=String(trades);
  $('backtest-note').textContent=`假设起始资金 100 元；共 ${prices.length} 个模拟交易日；每次改变仓位扣除 ${$('fee-range').value}% 成本。均线只用前一日及更早的收盘价，次日开盘执行。`;
}
function meanAt(i,n){if(i<n-1)return null;let s=0;for(let j=i-n+1;j<=i;j++)s+=prices[j].c;return s/n;}
$('fee-range').addEventListener('input',e=>{$('fee-value').textContent=`${Number(e.target.value).toFixed(1)}%`;});
$('run-backtest').addEventListener('click',runBacktest);

renderCandles();renderLessons();

const stages = [
  {name:'读懂市场的语言',time:'第 1–2 周',goal:'能解释 K 线、成交时点与一笔交易的完整过程。',analogy:'先学会看地图，再决定走哪条路。',tasks:['用上方 K 线图任选 3 天，手写开高低收和涨跌方向。','完成六节入门课的测验，并用一句话解释“量化”。','画一张交易流程图：观察 → 发信号 → 下一时点下单 → 退出。'],practice:'模拟练习：用 1,000 元虚拟资金，记录 5 笔“如果……就……”的交易想法，不看结果先写规则。',shortcut:'只背 OHLC、信号、执行时点三个词；其他词遇到再查。',pass:'能说明为什么今天收盘生成的信号，不能在今天开盘成交。',resources:[['SEC 投资入门','https://www.investor.gov/introduction-investing'],['本站 K 线实验室','#chart-lab']]},
  {name:'数据与 Python',time:'第 3–4 周',goal:'把 CSV 价格表读进程序，并检查数据质量。',analogy:'做菜先检查食材；脏数据会把规则煮坏。',tasks:['下载 sample_prices.csv，找出任意两天的开高低收。','运行 quant_lab.py，并看懂它如何逐行读取 CSV。','故意把一行的最高价改得低于收盘价，观察程序如何报错。'],practice:'真实数据练习：从你信任的数据提供方导出一只股票的日线 CSV，只做读取与数据检查，记录来源及是否复权。',shortcut:'先用标准库 csv 跑通流程，再学 pandas；不要一开始就装复杂框架。',pass:'能解释缺失日期、拆股与复权价格为什么会影响回测。',resources:[['Python 官方教程','https://docs.python.org/3/tutorial/'],['pandas 入门','https://pandas.pydata.org/docs/getting_started/']]},
  {name:'把想法写成规则',time:'第 5–6 周',goal:'写出别人也能复现的入场、出场和仓位规则。',analogy:'菜谱要写“中火 5 分钟”，不能写“差不多”。',tasks:['写出 3 日与 7 日均线规则的入场和退出条件。','指出信号在哪一天收盘产生，订单在哪一天开盘执行。','写下至少一个可能让规则失败的市场情景。'],practice:'模拟练习：先锁定规则，再在未看过的后半段数据上测试；不许看到亏损才改参数。',shortcut:'一句话模板：如果 [已知数据满足条件]，就在 [下一可执行时点] 买/卖 [计划数量]。',pass:'规则里同时有数据、时间、行动、退出与仓位。',resources:[['本站均线回测','#strategy'],['练习手册','./EXERCISES.md']]},
  {name:'回测与识别陷阱',time:'第 7–9 周',goal:'比较基准、费用、回撤与不同时间段，而非只看收益。',analogy:'旧试卷能查漏补缺，但不是新考试的答案。',tasks:['在页面把成本从 0% 调到 0.5%，写下结果变化。','运行 Python 脚本，比较策略和一直持有的最终资金及最大回撤。','把一段数据分成训练段与检验段，检验段只运行一次。'],practice:'真实历史数据练习：换用自己导出的 CSV，写一页报告，列出数据来源、费用假设、基准和至少 3 个缺陷。',shortcut:'先问“如果加入费用和坏年份，结论还成立吗？”；不要只追最漂亮的曲线。',pass:'能指出未来函数、参数过拟合、幸存者偏差三类风险。',resources:[['SEC 关于回测表现','https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-47'],['本站回测实验室','#strategy']]},
  {name:'仓位与组合风险',time:'第 10–11 周',goal:'把每笔计划风险、单只股票资金上限与账户总风险写成约束。',analogy:'旅行前决定每件行李占多少空间，还要留出应急余量。',tasks:['用下方计算器算 10,000 美元账户、1% 风险、100/95 买入/止损的股数。','把止损价改成 90，再解释股数为什么变化。','为两个同时持有的仓位写出总资金占比与合计计划风险。'],practice:'模拟练习：连续记录 10 笔纸面交易；每笔先填股数、计划风险和单股上限，再记录结果。',shortcut:'先用固定风险预算和资金上限双重约束；复杂优化模型以后再学。',pass:'能解释止损价不保证成交价，以及多个相关股票可能一起亏损。',resources:[['本站仓位计算器','#position-lab'],['SEC 分散投资','https://www.investor.gov/introduction-investing/getting-started/asset-allocation']]},
  {name:'独立研究与纸面交易',time:'第 12 周起',goal:'建立可复现的研究记录，先验证执行纪律。',analogy:'飞行员先在模拟舱反复练习，再讨论真正起飞。',tasks:['冻结一个策略版本，保存参数、数据来源、代码和运行结果。','纸面跟踪至少 20 个交易日，记录理论信号与实际可执行价格差异。','写一页复盘：支持、反对、何时停止使用这条规则。'],practice:'毕业作品：提交规则卡、数据说明、回测报告、仓位方案、纸面交易日志和失败案例。',shortcut:'每次只改一个假设，保存旧版本；如果没有日志，就无法知道进步来自哪里。',pass:'能独立复现结果，并清楚说明不确定性、成本、止损和策略停用条件。',resources:[['练习手册','./EXERCISES.md'],['SEC 关于历史表现','https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-47']]}
];

let completedTasks = new Set();
try { completedTasks = new Set(JSON.parse(localStorage.getItem('quant-stage-tasks') || '[]')); } catch (_) {}
function renderStages(){
  $('stage-list').innerHTML=stages.map((s,i)=>`<article class="stage-card"><div class="stage-number">${String(i+1).padStart(2,'0')}</div><div class="stage-main"><div class="stage-top"><div><span class="mini-label">阶段 ${i+1} · ${s.time}</span><h3>${s.name}</h3></div><span class="stage-count">${s.tasks.filter((_,j)=>completedTasks.has(`${i}-${j}`)).length} / 3</span></div><p class="stage-goal">${s.goal}</p><p class="stage-analogy">生活例子：${s.analogy}</p><div class="stage-columns"><div><b>三个行动任务</b><div class="stage-tasks">${s.tasks.map((t,j)=>`<label><input type="checkbox" data-stage-task="${i}-${j}" ${completedTasks.has(`${i}-${j}`)?'checked':''}><span>${t}</span></label>`).join('')}</div></div><div class="stage-sidebar"><b>实战练习</b><p>${s.practice}</p><b>捷径</b><p>${s.shortcut}</p></div></div><div class="stage-footer"><span><b>过关标准：</b>${s.pass}</span><div>${s.resources.map(([label,url])=>`<a href="${url}" ${url.startsWith('http')?'target="_blank" rel="noopener noreferrer"':''}>${label} ↗</a>`).join('')}</div></div></div></article>`).join('');
  const count=[...completedTasks].filter(k=>/^\d+-[0-2]$/.test(k)).length;
  $('stage-progress').textContent=`已完成 ${count} / 18 项任务`;
  $('stage-progress-fill').style.width=`${count/18*100}%`;
}
document.addEventListener('change',e=>{
  if(!e.target.matches('[data-stage-task]'))return;
  const key=e.target.dataset.stageTask;
  if(e.target.checked)completedTasks.add(key);else completedTasks.delete(key);
  try{localStorage.setItem('quant-stage-tasks',JSON.stringify([...completedTasks]));}catch(_){}
  renderStages();
});

function positionSize(account,riskPct,entry,stop,allocationPct){
  if(![account,riskPct,entry,stop,allocationPct].every(Number.isFinite) || account<=0 || entry<=0 || stop<=0 || stop>=entry || riskPct<=0 || riskPct>100 || allocationPct<=0 || allocationPct>100) throw new Error('请输入有效的正数；多头案例的止损价须低于买入价，百分比须在 0 到 100 之间。');
  const budget=account*riskPct/100;
  const perShare=entry-stop;
  const riskShares=Math.floor(budget/perShare);
  const allocationShares=Math.floor(account*allocationPct/100/entry);
  const cashShares=Math.floor(account/entry);
  const shares=Math.max(0,Math.min(riskShares,allocationShares,cashShares));
  const binding=shares===riskShares?'风险预算':shares===allocationShares?'单股资金上限':'可用资金';
  return {shares,budget,plannedLoss:shares*perShare,cost:shares*entry,allocation:shares*entry/account*100,binding};
}
const money=v=>`$${v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
function updatePosition(e){
  if(e)e.preventDefault();
  try{
    const result=positionSize(Number($('account-input').value),Number($('risk-input').value),Number($('entry-input').value),Number($('stop-input').value),Number($('allocation-input').value));
    $('position-error').hidden=true;
    $('shares-output').textContent=String(result.shares);
    $('budget-output').textContent=money(result.budget);
    $('loss-output').textContent=money(result.plannedLoss);
    $('cost-output').textContent=money(result.cost);
    $('allocation-output').textContent=`${result.allocation.toFixed(2)}%`;
    $('allocation-fill').style.width=`${result.allocation}%`;
    $('position-explain').textContent=result.shares?`这次由「${result.binding}」决定最多股数。按止损价估算的亏损是计划值，实际成交可能更差。`:'在当前风险或资金上限下，买不到 1 股；可调整案例数字再试。';
  }catch(err){$('position-error').textContent=err.message;$('position-error').hidden=false;}
}
$('position-form').addEventListener('submit',updatePosition);
['account-input','risk-input','entry-input','stop-input','allocation-input'].forEach(id=>$(id).addEventListener('input',updatePosition));
renderStages();updatePosition();
