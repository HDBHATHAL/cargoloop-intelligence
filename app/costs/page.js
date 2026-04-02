'use client'
import { useState, useEffect, useRef } from "react";

/*  Source data computed from:
    - Fuel Purchase tab (WPL_Operations_Management-2.xlsx)
    - EZPass tab (WPL_Operations_Management-2.xlsx)
    - FleetUp Trip Data Q1 2026 (telematics — blended with fuel purchase)
    - WPL Asset Tracker + Insurance tabs
    - LoadConnex delivered loads (lane revenue/miles)
    All pre-populated values are fleet averages from Feb 2026 (cleanest reporting month).
    5% aggressive cushion applied to variable cost estimates.                        */

const DEFAULTS = {
  fuel_ppg:3.34, mpg:6.6, toll:0.15, def:0.02, reefer:0.02, maint:0.15, driver:0,
  truck_pmt:2666, trailer_pmt:1608, truck_ins:2282, trailer_ins:439, miles_mo:10000
};
const LANES = [
  {lane:"Berea KY → Frederick MD → Rochester NY",rev:3289,mi:839,ct:24,type:"SG",trend:"UP"},
  {lane:"AppHarvest (Richmond KY) → Rochester NY",rev:2262,mi:638,ct:46,type:"SG",trend:"FLAT"},
  {lane:"AppHarvest → Wegmans Govna (Rochester NY)",rev:2342,mi:638,ct:20,type:"SG",trend:"FLAT"},
  {lane:"Green Empire (Oneida NY) → BJ's (Elkton MD)",rev:2067,mi:496,ct:38,type:"SG",trend:"UP"},
  {lane:"Mastronardi (Berea KY) → Stop & Shop (MA)",rev:3723,mi:1020,ct:17,type:"SG",trend:"FLAT"},
  {lane:"Bosch Berries (Somerset KY) → Meijer / MI",rev:2447,mi:709,ct:17,type:"SG",trend:"UP"},
  {lane:"AppHarvest (Richmond KY) → Pottsville PA",rev:2321,mi:625,ct:9,type:"SG",trend:"UP"},
  {lane:"Wapakoneta / Somerset → CT/NJ (Berries)",rev:3097,mi:680,ct:9,type:"SG",trend:"UP"},
  {lane:"Ontario NY → Johnstown / Schodack NY",rev:1279,mi:192,ct:10,type:"SG",trend:"UP"},
  {lane:"Ontario / Oneida NY → Jonestown PA",rev:1300,mi:265,ct:7,type:"SG",trend:"FLAT"},
  {lane:"Saputo (Friendship NY) → Walmart (London KY)",rev:1525,mi:610,ct:24,type:"BR",trend:"UP"},
  {lane:"Eastern Propak → Walmart (London KY)",rev:1702,mi:610,ct:16,type:"BR",trend:"UP"},
  {lane:"HP Hood → Walmart DC (London KY)",rev:1483,mi:610,ct:12,type:"BR",trend:"UP"},
];

const $k = v => "$" + Math.round(v).toLocaleString();
const CUSHION = 1.05;

export default function CostIntelligence() {
  const [tab, setTab] = useState("profit");
  const [targetMargin, setTargetMargin] = useState(25);

  // Variable costs — single fleet-level inputs
  const [fuelPPG, setFuelPPG] = useState(DEFAULTS.fuel_ppg);
  const [mpg, setMPG] = useState(DEFAULTS.mpg);
  const [toll, setToll] = useState(DEFAULTS.toll);
  const [def_, setDef] = useState(DEFAULTS.def);
  const [reefer, setReefer] = useState(DEFAULTS.reefer);
  const [maint, setMaint] = useState(DEFAULTS.maint);
  const [driver, setDriver] = useState(DEFAULTS.driver);

  // Fixed costs — single fleet-level inputs
  const [truckPmt, setTruckPmt] = useState(DEFAULTS.truck_pmt);
  const [trailerPmt, setTrailerPmt] = useState(DEFAULTS.trailer_pmt);
  const [truckIns, setTruckIns] = useState(DEFAULTS.truck_ins);
  const [trailerIns, setTrailerIns] = useState(DEFAULTS.trailer_ins);
  const [milesMo, setMilesMo] = useState(DEFAULTS.miles_mo);

  const profitRef = useRef(null);
  const profitInst = useRef(null);

  // Computed CPMs
  const fuelCPM = mpg > 0 ? (fuelPPG / mpg) * CUSHION : 0;
  const tollCPM = toll * CUSHION;
  const defCPM = def_ * CUSHION;
  const reeferCPM = reefer * CUSHION;
  const maintCPM = maint * CUSHION;
  const driverCPM = driver;
  const varCPM = fuelCPM + tollCPM + defCPM + reeferCPM + maintCPM + driverCPM;
  const fixedMo = truckPmt + trailerPmt + truckIns + trailerIns;
  const fixedCPM = milesMo > 0 ? fixedMo / milesMo : 0;
  const allInCPM = varCPM + fixedCPM;

  function calcLane(l) {
    const cost = allInCPM * l.mi;
    const margin = l.rev > 0 ? (l.rev - cost) / l.rev * 100 : 0;
    const profit = l.rev - cost;
    const tgtCost = l.rev * (1 - targetMargin / 100);
    const tgtCPM = l.mi > 0 ? tgtCost / l.mi : 0;
    const equipCost = (allInCPM - driverCPM) * l.mi;
    const drvBudget = tgtCost - equipCost;
    return { cost:Math.round(cost), margin:Math.round(margin*10)/10, profit:Math.round(profit),
      tgtCPM:Math.round(tgtCPM*100)/100, tgtCost:Math.round(tgtCost),
      drvBudget:Math.round(drvBudget), drvCPM:l.mi>0?Math.round(drvBudget/l.mi*100)/100:0,
      fuelEst:Math.round(fuelCPM*l.mi), tollEst:Math.round(tollCPM*l.mi), fixEst:Math.round(fixedCPM*l.mi),
      drvEst:Math.round(driverCPM*l.mi), maintEst:Math.round(maintCPM*l.mi) };
  }

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => buildProfitChart();
    document.head.appendChild(s);
    return () => profitInst.current?.destroy();
  }, []);

  useEffect(() => { if (window.Chart) setTimeout(buildProfitChart, 60); },
    [fuelPPG, mpg, toll, def_, reefer, maint, driver, truckPmt, trailerPmt, truckIns, trailerIns, milesMo, targetMargin, tab]);

  function buildProfitChart() {
    const C = window.Chart; if (!C || !profitRef.current) return;
    profitInst.current?.destroy();
    const sorted = [...LANES].sort((a,b) => calcLane(b).margin - calcLane(a).margin);
    profitInst.current = new C(profitRef.current, {
      type:"bar", data:{ labels:sorted.map(l => l.lane.length > 32 ? l.lane.slice(0,30)+"…" : l.lane),
        datasets:[{ data:sorted.map(l => calcLane(l).margin),
          backgroundColor:sorted.map(l => { const m=calcLane(l).margin; return m>=targetMargin?"rgba(0,255,204,0.7)":m>=10?"rgba(255,184,77,0.6)":"rgba(255,107,107,0.6)"; }),
          borderRadius:3 }] },
      options:{ responsive:true, maintainAspectRatio:false, indexAxis:"y",
        plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>c.raw+"%"}} },
        scales:{ x:{grid:{color:"rgba(255,255,255,0.06)"},ticks:{color:"rgba(255,255,255,0.35)",font:{size:10},callback:v=>v+"%"}},
          y:{grid:{color:"rgba(255,255,255,0.03)"},ticks:{color:"rgba(255,255,255,0.35)",font:{size:9}}} } }
    });
  }

  function resetAll() {
    Object.entries(DEFAULTS).forEach(([k,v]) => {
      const setters = {fuel_ppg:setFuelPPG,mpg:setMPG,toll:setToll,def:setDef,reefer:setReefer,maint:setMaint,driver:setDriver,
        truck_pmt:setTruckPmt,trailer_pmt:setTrailerPmt,truck_ins:setTruckIns,trailer_ins:setTrailerIns,miles_mo:setMilesMo};
      if (setters[k]) setters[k](v);
    });
    setTargetMargin(25);
  }

  const mc = m => m >= targetMargin ? "#00FFCC" : m >= 10 ? "#FFB84D" : "#FF6B6B";
  const S = {
    shell:{minHeight:"100vh",background:"#000",color:"rgba(220,220,220,0.85)",fontFamily:"system-ui,-apple-system,sans-serif",padding:"16px 20px"},
    hdr:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"0.5px solid rgba(255,255,255,0.07)",paddingBottom:12,marginBottom:6},
    h1:{fontSize:17,fontWeight:800,color:"rgba(220,220,220,0.9)",margin:"0 0 3px"},
    sub:{fontSize:11,color:"rgba(255,255,255,0.3)"},
    tabs:{display:"flex",gap:4,margin:"12px 0 16px"},
    tab:{padding:"7px 14px",borderRadius:6,border:"0.5px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
    tabA:{background:"rgba(0,255,204,0.1)",borderColor:"rgba(0,255,204,0.3)",color:"#00FFCC"},
    card:{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:8,padding:14,marginBottom:12},
    cardT:{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.35)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"},
    sec:{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",margin:"14px 0 6px"},
    tw:{overflowX:"auto",background:"rgba(255,255,255,0.015)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:8},
    tbl:{width:"100%",borderCollapse:"collapse",fontSize:11},
    th:{fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.35)",padding:"6px 8px",borderBottom:"0.5px solid rgba(255,255,255,0.07)",whiteSpace:"nowrap",textTransform:"uppercase",background:"rgba(255,255,255,0.02)",textAlign:"right"},
    thL:{textAlign:"left"},
    td:{padding:"6px 8px",borderBottom:"0.5px solid rgba(255,255,255,0.04)",color:"rgba(220,220,220,0.8)",textAlign:"right",fontVariantNumeric:"tabular-nums",fontSize:11},
    tdL:{textAlign:"left"},
    inp:{padding:"5px 8px",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:4,color:"#fff",fontSize:13,fontFamily:"inherit",textAlign:"right",fontVariantNumeric:"tabular-nums",width:80},
    kpi:{textAlign:"center"},
    kpiV:{fontSize:22,fontWeight:800,color:"#00FFCC"},
    kpiL:{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:2},
    slider:{width:"100%",accentColor:"#00FFCC",cursor:"pointer"},
    reset:{padding:"5px 14px",borderRadius:5,border:"0.5px solid rgba(255,255,255,0.12)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:10,cursor:"pointer",fontFamily:"inherit"},
    row:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"0.5px solid rgba(255,255,255,0.04)"},
    rowLabel:{fontSize:12,color:"rgba(255,255,255,0.5)"},
    rowVal:{fontSize:13,fontWeight:600,color:"rgba(220,220,220,0.9)"},
    computed:{fontSize:13,fontWeight:700,color:"#00FFCC"},
    backLink:{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,color:"rgba(255,255,255,0.35)",textDecoration:"none",padding:"6px 12px",borderRadius:6,border:"0.5px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)",cursor:"pointer",marginBottom:12,fontFamily:"inherit",fontWeight:600,transition:"all 0.15s"},
  };

  function Inp({value, onChange, step=0.01, min=0, style={}}) {
    return <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value)||0)} step={step} min={min} style={{...S.inp,...style}} />;
  }

  return (
    <div style={S.shell}>
      {/* Back navigation */}
      <a href="/" style={S.backLink}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Lane Intelligence
      </a>

      <div style={S.hdr}>
        <div>
          <h1 style={S.h1}>Cost Intelligence</h1>
          <div style={S.sub}>WPL fleet averages · Feb 2026 basis · 5% aggressive cushion on variable costs</div>
        </div>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>ALL-IN CPM</div>
            <div style={{fontSize:20,fontWeight:800,color:allInCPM>2?"#FF6B6B":allInCPM>1.3?"#FFB84D":"#00FFCC"}}>${allInCPM.toFixed(2)}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>TARGET</div>
            <div style={{fontSize:20,fontWeight:800,color:"#00FFCC"}}>{targetMargin}%</div>
          </div>
        </div>
      </div>

      <div style={S.tabs}>
        {[["profit","Lane Profitability"],["targets","Cost Targets"],["sim","Simulation"]].map(([id,label]) =>
          <button key={id} style={{...S.tab,...(tab===id?S.tabA:{})}} onClick={()=>setTab(id)}>{label}</button>
        )}
      </div>

      {/* ═══════════ LANE PROFITABILITY ═══════════ */}
      {tab==="profit" && (<>
        <div style={S.card}>
          <div style={S.cardT}>Operating margin by lane {driver>0?`(incl driver $${driver.toFixed(2)}/mi)`:"(equipment only — excl driver pay)"}</div>
          <div style={{height:310,position:"relative"}}><canvas ref={profitRef}/></div>
          <div style={{display:"flex",gap:14,marginTop:8,fontSize:10,color:"rgba(255,255,255,0.35)"}}>
            <span><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:"rgba(0,255,204,0.7)",marginRight:3}}/>≥ {targetMargin}% target</span>
            <span><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:"rgba(255,184,77,0.6)",marginRight:3}}/>10–{targetMargin}%</span>
            <span><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:"rgba(255,107,107,0.6)",marginRight:3}}/>&lt; 10%</span>
          </div>
        </div>
        <div style={S.sec}>Lane P&L</div>
        <div style={S.tw}>
          <table style={S.tbl}>
            <thead><tr>
              <th style={{...S.th,...S.thL,minWidth:190}}>Lane</th><th style={S.th}>Type</th><th style={S.th}>Loads</th>
              <th style={S.th}>Revenue</th><th style={S.th}>Miles</th><th style={S.th}>RPM</th>
              <th style={S.th}>Est. Cost</th><th style={S.th}>Profit</th><th style={S.th}>Margin</th>
            </tr></thead>
            <tbody>
              {LANES.map((l,i) => { const c=calcLane(l); return (
                <tr key={i} style={i%2===0?{background:"rgba(255,255,255,0.015)"}:{}}>
                  <td style={{...S.td,...S.tdL,fontWeight:500,fontSize:10}}>{l.lane}</td>
                  <td style={S.td}><span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:l.type==="SG"?"rgba(0,255,204,0.08)":"rgba(77,158,255,0.08)",color:l.type==="SG"?"#00FFCC":"#4D9EFF"}}>{l.type==="SG"?"Direct":"Broker"}</span></td>
                  <td style={S.td}>{l.ct}</td>
                  <td style={{...S.td,fontWeight:600}}>{$k(l.rev)}</td>
                  <td style={S.td}>{l.mi}</td>
                  <td style={S.td}>${(l.rev/l.mi).toFixed(2)}</td>
                  <td style={S.td}>{$k(c.cost)}</td>
                  <td style={{...S.td,fontWeight:700,color:c.profit>0?"#00FFCC":"#FF6B6B"}}>{c.profit>0?$k(c.profit):`(${$k(Math.abs(c.profit))})`}</td>
                  <td style={{...S.td,fontWeight:800,color:mc(c.margin)}}>{c.margin}%</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </>)}

      {/* ═══════════ COST TARGETS ═══════════ */}
      {tab==="targets" && (<>
        <div style={{...S.card,display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.5)",whiteSpace:"nowrap"}}>Target margin</span>
          <input type="range" min={15} max={35} value={targetMargin} onChange={e=>setTargetMargin(Number(e.target.value))} style={{...S.slider,flex:1}} />
          <span style={{fontSize:22,fontWeight:800,color:"#00FFCC",minWidth:50,textAlign:"right"}}>{targetMargin}%</span>
        </div>
        <div style={S.sec}>Max all-in CPM and driver pay budget per lane to hit {targetMargin}%</div>
        <div style={S.tw}>
          <table style={S.tbl}>
            <thead><tr>
              <th style={{...S.th,...S.thL,minWidth:190}}>Lane</th><th style={S.th}>Revenue</th><th style={S.th}>Miles</th>
              <th style={S.th}>Max Total Cost</th><th style={S.th}>Max All-In CPM</th>
              <th style={S.th}>Equip Cost (current)</th><th style={S.th}>Driver Budget/Load</th><th style={S.th}>Max Driver $/mi</th><th style={S.th}>Status</th>
            </tr></thead>
            <tbody>
              {LANES.map((l,i) => { const c=calcLane(l); const viable=c.drvBudget>0; return (
                <tr key={i} style={i%2===0?{background:"rgba(255,255,255,0.015)"}:{}}>
                  <td style={{...S.td,...S.tdL,fontWeight:500,fontSize:10}}>{l.lane}</td>
                  <td style={{...S.td,fontWeight:600}}>{$k(l.rev)}</td>
                  <td style={S.td}>{l.mi}</td>
                  <td style={S.td}>{$k(c.tgtCost)}</td>
                  <td style={{...S.td,fontWeight:700,color:"#00FFCC"}}>${c.tgtCPM.toFixed(2)}</td>
                  <td style={S.td}>{$k((allInCPM-driverCPM)*l.mi)}</td>
                  <td style={{...S.td,fontWeight:600,color:viable?"#00FFCC":"#FF6B6B"}}>{viable?$k(c.drvBudget):`(${$k(Math.abs(c.drvBudget))})`}</td>
                  <td style={{...S.td,fontWeight:600,color:viable?"#00FFCC":"#FF6B6B"}}>{viable?`$${c.drvCPM.toFixed(2)}/mi`:"—"}</td>
                  <td style={S.td}><span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,
                    background:c.drvBudget>500?"rgba(0,255,204,0.1)":viable?"rgba(255,184,77,0.1)":"rgba(255,107,107,0.1)",
                    color:c.drvBudget>500?"#00FFCC":viable?"#FFB84D":"#FF6B6B"}}>{c.drvBudget>500?"STRONG":viable?"TIGHT":"OVER"}</span></td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
        <div style={{...S.card,marginTop:14}}>
          <div style={S.cardT}>Reading this table</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.7}}>
            <strong style={{color:"rgba(220,220,220,0.8)"}}>Max All-In CPM</strong> is the ceiling — if total cost per mile exceeds this, the lane drops below {targetMargin}% margin.
            <strong style={{color:"rgba(220,220,220,0.8)"}}> Driver Budget</strong> is what's left after equipment, fuel, toll, insurance, and maintenance for driver compensation per load.
            Direct shipper lanes carry strong driver budgets ($400–$1,500). Broker backhauls are tighter — they're valued for fleet utilization on the return leg, not standalone margin.
          </div>
        </div>
      </>)}

      {/* ═══════════ SIMULATION ═══════════ */}
      {tab==="sim" && (<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {/* VARIABLE */}
          <div style={S.card}>
            <div style={S.cardT}>Variable Costs</div>
            {[
              ["Fuel price", fuelPPG, setFuelPPG, "/gal", 0.01, `→ $${fuelCPM.toFixed(2)}/mi`],
              ["Fuel efficiency", mpg, setMPG, "MPG", 0.1, null],
              ["Tolls", toll, setToll, "/mi", 0.01, null],
              ["DEF fluid", def_, setDef, "/mi", 0.001, null],
              ["Reefer fuel", reefer, setReefer, "/mi", 0.001, null],
              ["Maintenance", maint, setMaint, "/mi", 0.01, "estimate — no fleet data"],
              ["Driver pay", driver, setDriver, "/mi", 0.01, null],
            ].map(([label, val, setter, unit, step, note]) => (
              <div key={label} style={S.row}>
                <div>
                  <div style={S.rowLabel}>{label}</div>
                  {note && <div style={{fontSize:9,color:"rgba(255,255,255,0.2)",marginTop:1}}>{note}</div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>$</span>
                  <Inp value={val} onChange={setter} step={step} style={{width:70}} />
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",minWidth:30}}>{unit}</span>
                </div>
              </div>
            ))}
            <div style={{...S.row,borderBottom:"none",paddingTop:12}}>
              <span style={{fontSize:13,fontWeight:700,color:"rgba(220,220,220,0.8)"}}>Total Variable CPM</span>
              <span style={S.computed}>${varCPM.toFixed(2)}/mi</span>
            </div>
          </div>

          {/* FIXED */}
          <div style={S.card}>
            <div style={S.cardT}>Fixed Costs (monthly)</div>
            {[
              ["Truck payment", truckPmt, setTruckPmt, "/mo", 1],
              ["Trailer payment", trailerPmt, setTrailerPmt, "/mo", 1],
              ["Truck insurance", truckIns, setTruckIns, "/mo", 1],
              ["Trailer insurance", trailerIns, setTrailerIns, "/mo", 1],
            ].map(([label, val, setter, unit, step]) => (
              <div key={label} style={S.row}>
                <span style={S.rowLabel}>{label}</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>$</span>
                  <Inp value={val} onChange={setter} step={step} style={{width:80}} />
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",minWidth:24}}>{unit}</span>
                </div>
              </div>
            ))}
            <div style={{...S.row,borderBottom:"0.5px solid rgba(255,255,255,0.08)",paddingTop:10}}>
              <span style={{fontSize:12,fontWeight:600,color:"rgba(220,220,220,0.7)"}}>Total fixed/mo</span>
              <span style={{fontSize:14,fontWeight:700,color:"#FFB84D"}}>{$k(fixedMo)}</span>
            </div>
            <div style={{...S.row,borderBottom:"none",marginTop:4}}>
              <div>
                <span style={S.rowLabel}>Miles / month</span>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.2)",marginTop:1}}>controls fixed cost spread</div>
              </div>
              <Inp value={milesMo} onChange={setMilesMo} step={500} style={{width:80}} />
            </div>
            <div style={{...S.row,borderBottom:"none"}}>
              <span style={{fontSize:13,fontWeight:700,color:"rgba(220,220,220,0.8)"}}>Fixed CPM</span>
              <span style={{...S.computed,color:"#FFB84D"}}>${fixedCPM.toFixed(2)}/mi</span>
            </div>

            <div style={{background:"rgba(0,255,204,0.04)",border:"0.5px solid rgba(0,255,204,0.15)",borderRadius:6,padding:"12px 14px",marginTop:14}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:6,letterSpacing:"0.06em",fontWeight:700}}>ALL-IN COST PER MILE</div>
              <div style={{fontSize:28,fontWeight:800,color:allInCPM>2?"#FF6B6B":allInCPM>1.3?"#FFB84D":"#00FFCC"}}>${allInCPM.toFixed(2)}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:4}}>Variable ${varCPM.toFixed(2)} + Fixed ${fixedCPM.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"6px 0 8px"}}>
          <div style={S.sec}>Lane impact at ${allInCPM.toFixed(2)}/mi all-in</div>
          <button style={S.reset} onClick={resetAll}>Reset to WPL Defaults</button>
        </div>
        <div style={S.tw}>
          <table style={S.tbl}>
            <thead><tr>
              <th style={{...S.th,...S.thL,minWidth:180}}>Lane</th><th style={S.th}>Revenue</th><th style={S.th}>Miles</th>
              <th style={S.th}>Fuel</th><th style={S.th}>Toll</th><th style={S.th}>Maint</th><th style={S.th}>Fixed</th>
              {driver>0&&<th style={S.th}>Driver</th>}
              <th style={S.th}>Total Cost</th><th style={S.th}>Profit</th><th style={S.th}>Margin</th>
            </tr></thead>
            <tbody>
              {LANES.map((l,i) => { const c=calcLane(l); return (
                <tr key={i} style={i%2===0?{background:"rgba(255,255,255,0.015)"}:{}}>
                  <td style={{...S.td,...S.tdL,fontWeight:500,fontSize:10}}>{l.lane}</td>
                  <td style={{...S.td,fontWeight:600}}>{$k(l.rev)}</td>
                  <td style={S.td}>{l.mi}</td>
                  <td style={S.td}>{$k(c.fuelEst)}</td>
                  <td style={S.td}>{$k(c.tollEst)}</td>
                  <td style={S.td}>{$k(c.maintEst)}</td>
                  <td style={S.td}>{$k(c.fixEst)}</td>
                  {driver>0&&<td style={S.td}>{$k(c.drvEst)}</td>}
                  <td style={{...S.td,fontWeight:600}}>{$k(c.cost)}</td>
                  <td style={{...S.td,fontWeight:700,color:c.profit>0?"#00FFCC":"#FF6B6B"}}>{c.profit>0?$k(c.profit):`(${$k(Math.abs(c.profit))})`}</td>
                  <td style={{...S.td,fontWeight:800,color:mc(c.margin)}}>{c.margin}%</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",marginTop:6}}>
          Variable costs include 5% aggressive cushion. Maintenance is industry estimate (no fleet data). All other figures derived from WPL operational data: Fuel Purchase, EZPass, FleetUp telematics, Asset Tracker, Insurance.
        </div>
      </>)}
    </div>
  );
}
