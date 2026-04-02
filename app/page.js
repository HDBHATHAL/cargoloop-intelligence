'use client'
import { useState, useEffect, useRef } from 'react'

// ── Verified lane data (computed load-by-load from WPL Shipment Tracker + LoadConnex) ──
const MONTHS = ['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06',
                '2025-07','2025-08','2025-09','2025-10','2025-11','2025-12',
                '2026-01','2026-02','2026-03']
const MLBLS  = ['Jan 25','Feb 25','Mar 25','Apr 25','May 25','Jun 25',
                'Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25',
                'Jan 26','Feb 26','Mar 26']

const SG_MO = {"2025-01":9,"2025-02":10,"2025-03":13,"2025-04":17,"2025-05":14,"2025-06":18,"2025-07":19,"2025-08":10,"2025-09":8,"2025-10":10,"2025-11":22,"2025-12":28,"2026-01":41,"2026-02":27,"2026-03":44}
const BR_MO = {"2025-01":3,"2025-02":4,"2025-03":8,"2025-04":7,"2025-05":6,"2025-06":6,"2025-07":14,"2025-08":4,"2025-09":6,"2025-10":4,"2025-11":8,"2025-12":8,"2026-01":26,"2026-02":13,"2026-03":31}

const SG_LANES = [
  {lane:"AppHarvest (Richmond, KY) → Wegmans DC (Rochester, NY)",count:46,totalRev:104069,avgRate:2262,minRate:2100,maxRate:2443,avgMiles:638,avgRPM:3.54,firstRun:"2025-01-02",lastRun:"2026-03-05",trend:"FLAT",
   mc:{"2025-01":2,"2025-02":1,"2025-03":2,"2025-04":2,"2025-05":5,"2025-06":8,"2025-07":2,"2025-10":2,"2025-11":8,"2025-12":10,"2026-02":3,"2026-03":1},
   mar:{"2025-01":2442.19,"2025-02":2100.49,"2025-03":2178.19,"2025-04":2259.53,"2025-05":2237.51,"2025-06":2191.58,"2025-07":2335.06,"2025-10":2244.11,"2025-11":2275.97,"2025-12":2258.10,"2026-02":2378.94,"2026-03":2404.47}},
  {lane:"Berea, KY → Frederick, MD → Wegmans DC (Rochester, NY)",count:24,totalRev:76530,avgRate:3189,minRate:1577,maxRate:3728,avgMiles:839,avgRPM:3.80,firstRun:"2025-09-25",lastRun:"2026-03-29",trend:"UP",
   mc:{"2025-09":1,"2026-01":1,"2026-02":6,"2026-03":16},
   mar:{"2025-09":2330.17,"2026-01":1576.90,"2026-02":3288.92,"2026-03":3158.33}},
  {lane:"Green Empire Farms (Oneida, NY) → BJ's DC (Elkton, MD)",count:38,totalRev:78539,avgRate:2067,minRate:1581,maxRate:2824,avgMiles:496,avgRPM:4.16,firstRun:"2025-04-15",lastRun:"2026-03-21",trend:"UP",
   mc:{"2025-04":2,"2025-05":1,"2025-11":9,"2025-12":7,"2026-01":9,"2026-02":5,"2026-03":5},
   mar:{"2025-04":1928.73,"2025-05":2011.30,"2025-11":1901.27,"2025-12":2150.78,"2026-01":2055.44,"2026-02":2285.87,"2026-03":2116.17}},
  {lane:"Mastronardi (Berea, KY) → Stop & Shop DC (Freetown, MA)",count:17,totalRev:63293,avgRate:3723,minRate:3541,maxRate:4195,avgMiles:1020,avgRPM:3.65,firstRun:"2025-01-07",lastRun:"2025-05-14",trend:"FLAT",
   mc:{"2025-01":1,"2025-02":1,"2025-03":7,"2025-04":5,"2025-05":3},
   mar:{"2025-01":3540.92,"2025-02":3639.69,"2025-03":3697.45,"2025-04":3702.53,"2025-05":3905.85}},
  {lane:"AppHarvest (Richmond, KY) → Wegmans DC Govna (Rochester, NY)",count:20,totalRev:46841,avgRate:2342,minRate:2122,maxRate:3172,avgMiles:638,avgRPM:3.60,firstRun:"2025-12-02",lastRun:"2026-03-29",trend:"FLAT",
   mc:{"2025-12":3,"2026-01":13,"2026-02":3,"2026-03":1},
   mar:{"2025-12":2588.55,"2026-01":2293.42,"2026-02":2379.52,"2026-03":2121.97}},
  {lane:"Bosch Berries (Somerset, KY) → Meijer / Michigan DCs",count:17,totalRev:41590,avgRate:2447,minRate:1409,maxRate:3125,avgMiles:709,avgRPM:3.45,firstRun:"2025-01-29",lastRun:"2026-02-13",trend:"UP",
   mc:{"2025-01":2,"2025-02":1,"2025-04":2,"2025-05":2,"2025-10":6,"2025-11":1,"2026-01":1,"2026-02":2},
   mar:{"2025-01":2144.00,"2025-02":2000.00,"2025-04":2350.00,"2025-05":2400.00,"2025-10":2620.00,"2025-11":2794.58,"2026-01":2794.58,"2026-02":2200.00}},
  {lane:"AppHarvest (Richmond, KY) → Pottsville, PA",count:9,totalRev:20892,avgRate:2321,minRate:2149,maxRate:2829,avgMiles:625,avgRPM:3.71,firstRun:"2025-12-04",lastRun:"2026-02-12",trend:"UP",
   mc:{"2025-12":1,"2026-01":5,"2026-02":3},
   mar:{"2025-12":2276.02,"2026-01":2327.00,"2026-02":2379.67}},
  {lane:"Somerset, KY → Tipp City, OH",count:8,totalRev:20985,avgRate:2623,minRate:2432,maxRate:2835,avgMiles:752,avgRPM:3.49,firstRun:"2025-10-01",lastRun:"2025-11-10",trend:"UP",
   mc:{"2025-10":4,"2025-11":4},
   mar:{"2025-10":2506.00,"2025-11":2740.00}},
  {lane:"Ontario/Oneida, NY → Jonestown, PA",count:7,totalRev:9100,avgRate:1300,minRate:1300,maxRate:1300,avgMiles:265,avgRPM:4.91,firstRun:"2025-11-26",lastRun:"2026-02-06",trend:"FLAT",
   mc:{"2025-11":2,"2025-12":2,"2026-01":2,"2026-02":1},
   mar:{"2025-11":1300,"2025-12":1300,"2026-01":1300,"2026-02":1300}},
  {lane:"Wapakoneta/Somerset → CT/NJ (Berries)",count:9,totalRev:27876,avgRate:3097,minRate:3000,maxRate:3264,avgMiles:680,avgRPM:4.55,firstRun:"2026-01-29",lastRun:"2026-03-08",trend:"UP",
   mc:{"2026-01":1,"2026-02":5,"2026-03":3},
   mar:{"2026-01":3000,"2026-02":3075.00,"2026-03":3155.00}},
  {lane:"Ontario, NY → NY Distribution (Johnstown/Schodack)",count:10,totalRev:12786,avgRate:1279,minRate:1160,maxRate:1400,avgMiles:192,avgRPM:6.67,firstRun:"2026-01-05",lastRun:"2026-03-05",trend:"UP",
   mc:{"2026-01":5,"2026-02":3,"2026-03":2},
   mar:{"2026-01":1247.00,"2026-02":1291.00,"2026-03":1300.00}},
  {lane:"AppHarvest (Richmond, KY) → Michigan",count:5,totalRev:8812,avgRate:1762,minRate:1250,maxRate:2794,avgMiles:393,avgRPM:4.48,firstRun:"2025-06-23",lastRun:"2026-03-29",trend:"DOWN",
   mc:{"2025-06":1,"2025-07":1,"2026-01":1,"2026-03":2},
   mar:{"2025-06":2794.00,"2025-07":1500.00,"2026-01":1500.00,"2026-03":1250.00}},
]

const BR_LANES = [
  {lane:"Saputo (Friendship, NY) → Walmart DC 6097 (London, KY)",count:24,totalRev:36600,avgRate:1525,firstRate:1300,lastRate:1800,avgMiles:610,trend:"UP",
   mc:{"2025-06":2,"2025-08":2,"2025-09":4,"2025-10":4,"2025-11":2,"2025-12":1,"2026-01":5,"2026-02":4},
   mar:{"2025-06":1300,"2025-08":1600,"2025-09":1500,"2025-10":1500,"2025-11":1500,"2025-12":1700,"2026-01":1750,"2026-02":1800}},
  {lane:"Eastern Propak (Batavia, NY) → Walmart DC 6097 (London, KY)",count:16,totalRev:27232,avgRate:1702,firstRate:1600,lastRate:1875,avgMiles:610,trend:"UP",
   mc:{"2025-03":2,"2025-04":1,"2025-07":1,"2025-08":2,"2025-09":1,"2025-10":1,"2025-11":1,"2025-12":1,"2026-01":2,"2026-02":2,"2026-03":2},
   mar:{"2025-03":1600,"2025-04":1600,"2025-07":1600,"2025-08":1700,"2025-09":1750,"2025-10":1750,"2025-11":1800,"2025-12":1800,"2026-01":1800,"2026-02":1875,"2026-03":1875}},
  {lane:"HP Hood (Batavia, NY) → Walmart DC 6097 (London, KY)",count:12,totalRev:17796,avgRate:1483,firstRate:1400,lastRate:1700,avgMiles:610,trend:"UP",
   mc:{"2025-04":1,"2025-05":1,"2025-06":2,"2025-08":1,"2025-09":2,"2025-10":1,"2025-11":2,"2025-12":1,"2026-01":1},
   mar:{"2025-04":1400,"2025-05":1400,"2025-06":1400,"2025-08":1500,"2025-09":1500,"2025-10":1500,"2025-11":1600,"2025-12":1700,"2026-01":1700}},
  {lane:"Lactalis → Delanco DC (NJ)",count:4,totalRev:9852,avgRate:2463,firstRate:2250,lastRate:2700,avgMiles:480,trend:"UP",
   mc:{"2025-08":1,"2025-10":1,"2026-01":1,"2026-02":1},
   mar:{"2025-08":2250,"2025-10":2400,"2026-01":2700,"2026-02":2700}},
  {lane:"US Beverage Packers → Walmart DC 6097 (London, KY)",count:6,totalRev:7302,avgRate:1217,firstRate:1200,lastRate:1400,avgMiles:590,trend:"UP",
   mc:{"2025-05":1,"2025-07":1,"2025-08":1,"2025-09":1,"2025-10":1,"2025-11":1},
   mar:{"2025-05":1200,"2025-07":1200,"2025-08":1200,"2025-09":1200,"2025-10":1300,"2025-11":1400}},
  {lane:"REMA Foods/Penske → Performance Foodservice",count:4,totalRev:7252,avgRate:1813,firstRate:1900,lastRate:1750,avgMiles:390,trend:"DOWN",
   mc:{"2025-08":1,"2025-09":1,"2025-10":1,"2025-11":1},
   mar:{"2025-08":1900,"2025-09":1900,"2025-10":1750,"2025-11":1750}},
]

function $k(v) { return '$' + Math.round(v).toLocaleString() }
function qSum(mc, months) { return months.reduce((s,m) => s + (mc[m]||0), 0) }
const Q1=['2025-01','2025-02','2025-03'], Q2=['2025-04','2025-05','2025-06']
const Q3=['2025-07','2025-08','2025-09'], Q4=['2025-10','2025-11','2025-12']
const Q126=['2026-01','2026-02','2026-03']

function TrendBadge({ trend }) {
  const map = { UP: ['#EAF3DE','#3B6D11','↑ up'], DOWN: ['#FCEBEB','#A32D2D','↓ down'], FLAT: ['#E6F1FB','#185FA5','→ flat'] }
  const [bg, color, label] = map[trend] || map.FLAT
  return <span style={{ background: bg, color, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4 }}>{label}</span>
}

function HeatCell({ n }) {
  if (!n) return <span style={{ color: '#94A3B8', fontSize: 11 }}>—</span>
  const [bg, color] =
    n >= 10 ? ['#0C447C','#fff'] :
    n >= 6  ? ['#185FA5','#fff'] :
    n >= 3  ? ['#378ADD','#fff'] :
    n >= 2  ? ['#B5D4F4','#0C447C'] :
              ['#E6F1FB','#185FA5']
  return <span style={{ background: bg, color, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 3, minWidth: 22, display: 'inline-block', textAlign: 'center' }}>{n}</span>
}

export default function Dashboard() {
  const [tab, setTab] = useState('volume')
  const [selectedLane, setSelectedLane] = useState(0)
  const chartRefs = { vol: useRef(), bar: useRef(), rate: useRef(), range: useRef(), rpm: useRef(), brRate: useRef(), brVol: useRef(), cycle: useRef() }
  const chartInstances = useRef({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    script.onload = () => {
      setTimeout(() => initCharts(), 100)
    }
    document.head.appendChild(script)
    return () => { Object.values(chartInstances.current).forEach(c => c?.destroy?.()) }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Chart) {
      setTimeout(() => initRateChart(), 50)
    }
  }, [selectedLane])

  function destroyChart(key) {
    if (chartInstances.current[key]) {
      chartInstances.current[key].destroy()
      chartInstances.current[key] = null
    }
  }

  function initCharts() {
    const C = window.Chart
    if (!C) return

    // Vol
    if (chartRefs.vol.current) {
      destroyChart('vol')
      chartInstances.current.vol = new C(chartRefs.vol.current, {
        type: 'bar',
        data: { labels: MLBLS, datasets: [
          { label: 'Direct shipper', data: MONTHS.map(m => SG_MO[m]||0), backgroundColor: '#2563EBcc', borderColor: '#2563EB', borderWidth: 1, borderRadius: 3 },
          { label: 'Broker', data: MONTHS.map(m => BR_MO[m]||0), backgroundColor: '#D97706cc', borderColor: '#D97706', borderWidth: 1, borderRadius: 3 },
        ]},
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { x: { ticks: { font: { size: 10 }, maxRotation: 40, autoSkip: false } }, y: { beginAtZero: true, ticks: { font: { size: 10 } } } } }
      })
    }

    // Lane bar
    const top8 = SG_LANES.slice(0, 8)
    if (chartRefs.bar.current) {
      destroyChart('bar')
      chartInstances.current.bar = new C(chartRefs.bar.current, {
        type: 'bar',
        data: { labels: top8.map(l => l.lane.split('→')[0].trim().replace('AppHarvest ','').replace('Mastronardi ','').replace('Green Empire Farms ','GEF ').replace('Berea, KY','Berea→MD').replace('(Richmond, KY)','Richmond').replace('(Oneida, NY)','Oneida').replace('(Somerset, KY)','Somerset').replace('Bosch Berries ','Bosch ').replace('Wapakoneta/Somerset','Wap/Som')),
          datasets: [{ data: top8.map(l => l.count), backgroundColor: '#2563EB', borderRadius: 3 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.raw + ' loads' } } },
          scales: { x: { beginAtZero: true, ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } } }
      })
    }

    // Range
    const top7 = SG_LANES.slice(0, 7)
    const rLabels = top7.map(l => l.lane.split('→')[0].trim().replace('AppHarvest ','').replace('Mastronardi ','').replace('Green Empire Farms ','GEF ').replace('Berea, KY','Berea→MD').replace('(Richmond, KY)','Richmond').replace('Bosch Berries ','Bosch '))
    if (chartRefs.range.current) {
      destroyChart('range')
      chartInstances.current.range = new C(chartRefs.range.current, {
        type: 'bar',
        data: { labels: rLabels, datasets: [
          { label: 'Min', data: top7.map(l => l.minRate), backgroundColor: '#B5D4F4', borderRadius: 2 },
          { label: 'Avg', data: top7.map(l => l.avgRate), backgroundColor: '#2563EB', borderRadius: 2 },
          { label: 'Max', data: top7.map(l => l.maxRate), backgroundColor: '#1B3A6B', borderRadius: 2 },
        ]},
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.dataset.label + ': $' + c.raw.toLocaleString() } } },
          scales: { x: { beginAtZero: true, ticks: { callback: v => '$' + v.toLocaleString(), font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } } }
      })
    }

    // RPM
    if (chartRefs.rpm.current) {
      destroyChart('rpm')
      chartInstances.current.rpm = new C(chartRefs.rpm.current, {
        type: 'bar',
        data: { labels: rLabels,
          datasets: [{ data: top7.map(l => l.avgRPM),
            backgroundColor: top7.map(l => l.avgRPM >= 4.5 ? '#0D9488' : l.avgRPM >= 3.5 ? '#2563EB' : '#B5D4F4'),
            borderRadius: 3 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => '$' + c.raw.toFixed(2) + '/mi' } } },
          scales: { x: { beginAtZero: true, ticks: { callback: v => '$' + v.toFixed(2), font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } } }
      })
    }

    // Broker rate
    const brMo = ['2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03']
    const brLbls = brMo.map(m => MLBLS[MONTHS.indexOf(m)])
    const brColors = ['#2563EB','#0D9488','#D97706']
    if (chartRefs.brRate.current) {
      destroyChart('brRate')
      chartInstances.current.brRate = new C(chartRefs.brRate.current, {
        type: 'line',
        data: { labels: brLbls, datasets: BR_LANES.slice(0,3).map((l, i) => ({
          label: l.lane, data: brMo.map(m => l.mar[m] || null),
          borderColor: brColors[i], backgroundColor: 'transparent',
          fill: false, tension: 0.3, pointRadius: 4, borderWidth: 2, spanGaps: false
        }))},
        options: { responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.dataset.label.split('→')[0].trim() + ': $' + Math.round(c.raw).toLocaleString() } } },
          scales: { x: { ticks: { font: { size: 10 }, maxRotation: 40, autoSkip: false } }, y: { beginAtZero: false, ticks: { callback: v => '$' + v.toLocaleString(), font: { size: 10 } } } } }
      })
    }

    // Broker vol
    if (chartRefs.brVol.current) {
      destroyChart('brVol')
      chartInstances.current.brVol = new C(chartRefs.brVol.current, {
        type: 'bar',
        data: { labels: MLBLS, datasets: BR_LANES.slice(0,3).map((l,i) => ({
          label: l.lane.split('→')[0].trim(),
          data: MONTHS.map(m => l.mc[m]||0),
          backgroundColor: brColors[i]+'cc', borderColor: brColors[i], borderWidth: 1, borderRadius: 2
        }))},
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { x: { stacked: true, ticks: { font: { size: 10 }, maxRotation: 40, autoSkip: false } }, y: { stacked: true, beginAtZero: true, ticks: { font: { size: 10 } } } } }
      })
    }

    // Cycle
    if (chartRefs.cycle.current) {
      destroyChart('cycle')
      chartInstances.current.cycle = new C(chartRefs.cycle.current, {
        type: 'bar',
        data: { labels: ['AppHarvest direct (638 mi)', 'Berea → MD → Rochester (858 mi)', 'Broker return leg (610 mi)'],
          datasets: [{ data: [2262, 3289, 1700], backgroundColor: ['#2563EB','#1B3A6B','#0D9488'], borderRadius: 4 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => '$' + c.raw.toLocaleString() } } },
          scales: { x: { beginAtZero: true, ticks: { callback: v => '$' + v.toLocaleString(), font: { size: 10 } } }, y: { ticks: { font: { size: 11 } } } } }
      })
    }

    initRateChart()
  }

  function initRateChart() {
    const C = window.Chart
    if (!C || !chartRefs.rate.current) return
    const l = SG_LANES[selectedLane]
    const months = Object.keys(l.mar).sort()
    const labels = months.map(m => MLBLS[MONTHS.indexOf(m)]).filter(Boolean)
    const vals = months.map(m => l.mar[m])
    const counts = months.map(m => l.mc[m]||0)
    destroyChart('rate')
    chartInstances.current.rate = new C(chartRefs.rate.current, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Avg rate', data: vals, borderColor: '#2563EB', backgroundColor: '#2563EB15', fill: true, tension: 0.3, pointRadius: 5, borderWidth: 2,
        pointBackgroundColor: vals.map(v => v >= l.avgRate ? '#0D9488' : '#2563EB') }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => 'Avg: $' + c.raw.toLocaleString() + ' (' + counts[c.dataIndex] + ' load' + (counts[c.dataIndex] > 1 ? 's' : '') + ')' } } },
        scales: { x: { ticks: { font: { size: 10 }, maxRotation: 40, autoSkip: false } }, y: { beginAtZero: false, ticks: { callback: v => '$' + v.toLocaleString(), font: { size: 10 } } } } }
    })
  }

  async function logout() {
    await fetch('/api/verify', { method: 'POST' })
    window.location.href = '/login'
  }

  const S = styles

  return (
    <div style={S.shell}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.logoWrap}>
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
            <rect width="36" height="36" rx="8" fill="#1B3A6B"/>
            <path d="M8 18C8 12.477 12.477 8 18 8s10 4.477 10 10-4.477 10-10 10S8 23.523 8 18z" stroke="#2563EB" strokeWidth="2" fill="none"/>
            <path d="M13 18h10M18 13l5 5-5 5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="13" cy="18" r="2" fill="#0D9488"/>
          </svg>
          <div>
            <div style={S.brandName}>CargoLoop</div>
            <div style={S.brandSub}>Intelligence</div>
          </div>
        </div>

        <nav style={S.nav}>
          {[
            ['volume', 'Volume', <VolumeIcon/>],
            ['rates',  'Rate Trends', <RateIcon/>],
            ['lanes',  'All Lanes', <LaneIcon/>],
            ['broker', 'Broker Corridor', <BrokerIcon/>],
            ['cycle',  'Truck Cycle', <CycleIcon/>],
          ].map(([id, label, icon]) => (
            <button key={id} style={{ ...S.navBtn, ...(tab === id ? S.navBtnActive : {}) }} onClick={() => setTab(id)}>
              <span style={S.navIcon}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div style={S.sideFooter}>
          <div style={S.dataTag}>Data: Jan 2025 – Mar 2026</div>
          <div style={S.dataTag}>Source: WPL Tracker + LoadConnex</div>
          <button style={S.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={S.main}>
        {/* Header */}
        <header style={S.header}>
          <div>
            <div style={S.headerTitle}>
              {tab === 'volume' && 'Volume trends'}
              {tab === 'rates' && 'Rate trends'}
              {tab === 'lanes' && 'All lanes'}
              {tab === 'broker' && 'Broker corridor'}
              {tab === 'cycle' && 'Truck cycle'}
            </div>
            <div style={S.headerSub}>Sunset Grown — Fleet partnership analysis</div>
          </div>
          <div style={S.kpiRow}>
            {[['271', 'Direct loads'], ['$502K', 'SG revenue'], ['44/mo', 'Mar 2026 rate']].map(([v,l]) => (
              <div key={l} style={S.miniKpi}><div style={S.miniKpiVal}>{v}</div><div style={S.miniKpiLbl}>{l}</div></div>
            ))}
          </div>
        </header>

        <div style={S.content}>

          {/* VOLUME TAB */}
          {tab === 'volume' && (
            <>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Monthly load volume</div>
                  <div style={{ height: 210, position: 'relative' }}><canvas ref={chartRefs.vol}/></div>
                  <div style={S.legend}>
                    <span style={S.legItem}><span style={{ ...S.legSwatch, background: '#2563EB' }}/> Direct shipper</span>
                    <span style={S.legItem}><span style={{ ...S.legSwatch, background: '#D97706' }}/> Broker</span>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Top lanes by load count</div>
                  <div style={{ height: 210, position: 'relative' }}><canvas ref={chartRefs.bar}/></div>
                </div>
              </div>

              <div style={S.secLabel}>Quarterly frequency heat map — direct shipper lanes</div>
              <div style={S.tableWrap}>
                <table style={S.tbl}>
                  <thead>
                    <tr>
                      <th style={{...S.th, textAlign:'left', minWidth:240}}>Lane</th>
                      <th style={{...S.th,...S.thr}}>Total</th>
                      <th style={{...S.th,...S.thr}}>Q1 '25</th><th style={{...S.th,...S.thr}}>Q2 '25</th>
                      <th style={{...S.th,...S.thr}}>Q3 '25</th><th style={{...S.th,...S.thr}}>Q4 '25</th>
                      <th style={{...S.th,...S.thr}}>Q1 '26</th>
                      <th style={{...S.th,...S.thr}}>Avg rate</th><th style={{...S.th,...S.thr}}>Avg mi</th>
                      <th style={S.th}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SG_LANES.map((l,i) => (
                      <tr key={i} style={i%2===0?{background:'#F8FAFC'}:{}}>
                        <td style={{...S.td,fontSize:12,fontWeight:500}}>{l.lane}</td>
                        <td style={{...S.td,...S.tdr,fontWeight:600}}>{l.count}</td>
                        <td style={{...S.td,...S.tdr}}><HeatCell n={qSum(l.mc,Q1)}/></td>
                        <td style={{...S.td,...S.tdr}}><HeatCell n={qSum(l.mc,Q2)}/></td>
                        <td style={{...S.td,...S.tdr}}><HeatCell n={qSum(l.mc,Q3)}/></td>
                        <td style={{...S.td,...S.tdr}}><HeatCell n={qSum(l.mc,Q4)}/></td>
                        <td style={{...S.td,...S.tdr}}><HeatCell n={qSum(l.mc,Q126)}/></td>
                        <td style={{...S.td,...S.tdr}}>{$k(l.avgRate)}</td>
                        <td style={{...S.td,...S.tdr}}>{Math.round(l.avgMiles)}</td>
                        <td style={S.td}><TrendBadge trend={l.trend}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* RATES TAB */}
          {tab === 'rates' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#64748B' }}>Select lane:</label>
                <select value={selectedLane} onChange={e => setSelectedLane(Number(e.target.value))} style={S.sel}>
                  {SG_LANES.map((l,i) => <option key={i} value={i}>{l.lane}</option>)}
                </select>
              </div>
              <div style={S.card}>
                <div style={S.cardTitle}>{SG_LANES[selectedLane].lane} — monthly avg rate per load</div>
                <div style={{ height: 220, position: 'relative' }}><canvas ref={chartRefs.rate}/></div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
                  {SG_LANES[selectedLane].count} total loads · {$k(SG_LANES[selectedLane].minRate)} min · {$k(SG_LANES[selectedLane].maxRate)} max · {$k(SG_LANES[selectedLane].avgRate)} avg · Only months with actual loads plotted
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Rate range — min / avg / max per lane</div>
                  <div style={{ height: 200, position: 'relative' }}><canvas ref={chartRefs.range}/></div>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Avg $/mile by lane</div>
                  <div style={{ height: 200, position: 'relative' }}><canvas ref={chartRefs.rpm}/></div>
                </div>
              </div>
            </>
          )}

          {/* LANES TAB */}
          {tab === 'lanes' && (
            <>
              <div style={S.secLabel}>All direct shipper lanes — verified load-by-load data</div>
              <div style={S.tableWrap}>
                <table style={S.tbl}>
                  <thead>
                    <tr>
                      <th style={{...S.th,textAlign:'left',minWidth:250}}>Lane</th>
                      <th style={{...S.th,...S.thr}}>Loads</th><th style={{...S.th,...S.thr}}>Revenue</th>
                      <th style={{...S.th,...S.thr}}>Avg rate</th><th style={{...S.th,...S.thr}}>Min</th>
                      <th style={{...S.th,...S.thr}}>Max</th><th style={{...S.th,...S.thr}}>Avg mi</th>
                      <th style={{...S.th,...S.thr}}>$/mi</th>
                      <th style={S.th}>First run</th><th style={S.th}>Last run</th><th style={S.th}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SG_LANES.map((l,i) => (
                      <tr key={i} style={i%2===0?{background:'#F8FAFC'}:{}}>
                        <td style={{...S.td,fontSize:12,fontWeight:500}}>{l.lane}</td>
                        <td style={{...S.td,...S.tdr,fontWeight:600}}>{l.count}</td>
                        <td style={{...S.td,...S.tdr}}>{$k(l.totalRev)}</td>
                        <td style={{...S.td,...S.tdr}}>{$k(l.avgRate)}</td>
                        <td style={{...S.td,...S.tdr}}>{$k(l.minRate)}</td>
                        <td style={{...S.td,...S.tdr}}>{$k(l.maxRate)}</td>
                        <td style={{...S.td,...S.tdr}}>{Math.round(l.avgMiles)}</td>
                        <td style={{...S.td,...S.tdr}}>{l.avgRPM.toFixed(2)}</td>
                        <td style={{...S.td,fontSize:11,color:'#64748B'}}>{l.firstRun}</td>
                        <td style={{...S.td,fontSize:11,color:'#64748B'}}>{l.lastRun}</td>
                        <td style={S.td}><TrendBadge trend={l.trend}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* BROKER TAB */}
          {tab === 'broker' && (
            <>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.7, marginBottom: 14, maxWidth: 720 }}>
                Broker loads cover return legs after Sunset Grown deliveries. The Batavia / Friendship, NY cluster all deliver to Walmart DC 6097 in London, KY — adjacent to SG pickup origins in Richmond and Berea. Rates on this corridor are up <strong>16–38%</strong> in 12 months.
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Broker rate trend — NY → London, KY corridor</div>
                  <div style={{ height: 210, position: 'relative' }}><canvas ref={chartRefs.brRate}/></div>
                  <div style={S.legend}>
                    {[['#2563EB','Saputo → Walmart DC 6097'],['#0D9488','Eastern Propak → Walmart DC 6097'],['#D97706','HP Hood → Walmart DC 6097']].map(([c,l]) => (
                      <span key={l} style={S.legItem}><span style={{...S.legSwatch,background:c}}/>{l}</span>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Broker lane volume by month</div>
                  <div style={{ height: 210, position: 'relative' }}><canvas ref={chartRefs.brVol}/></div>
                </div>
              </div>
              <div style={S.secLabel}>Broker lanes — repeated runs (3+)</div>
              <div style={S.tableWrap}>
                <table style={S.tbl}>
                  <thead>
                    <tr>
                      <th style={{...S.th,textAlign:'left',minWidth:260}}>Lane</th>
                      <th style={{...S.th,...S.thr}}>Runs</th><th style={{...S.th,...S.thr}}>Avg rate</th>
                      <th style={{...S.th,...S.thr}}>First rate</th><th style={{...S.th,...S.thr}}>Latest rate</th>
                      <th style={{...S.th,...S.thr}}>Change</th><th style={{...S.th,...S.thr}}>Avg mi</th>
                      <th style={S.th}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BR_LANES.map((l,i) => {
                      const ch = l.lastRate - l.firstRate
                      return (
                        <tr key={i} style={i%2===0?{background:'#F8FAFC'}:{}}>
                          <td style={{...S.td,fontSize:12,fontWeight:500}}>{l.lane}</td>
                          <td style={{...S.td,...S.tdr,fontWeight:600}}>{l.count}</td>
                          <td style={{...S.td,...S.tdr}}>{$k(l.avgRate)}</td>
                          <td style={{...S.td,...S.tdr}}>{$k(l.firstRate)}</td>
                          <td style={{...S.td,...S.tdr}}>{$k(l.lastRate)}</td>
                          <td style={{...S.td,...S.tdr,fontWeight:600,color:ch>0?'#3B6D11':'#A32D2D'}}>{(ch>0?'+':'')+$k(ch)}</td>
                          <td style={{...S.td,...S.tdr}}>{Math.round(l.avgMiles)}</td>
                          <td style={S.td}><TrendBadge trend={l.trend}/></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* CYCLE TAB */}
          {tab === 'cycle' && (
            <>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.7, marginBottom: 16, maxWidth: 720 }}>
                A truck on Sunset Grown lanes runs a continuous two-revenue-leg cycle. Both the outbound SG load and the return broker load generate revenue — no empty miles between Kentucky origins and NY/MD/MA delivery markets.
              </div>

              {/* Route corridors */}
              {[
                {
                  boxes: [
                    { bg: '#EFF6FF', label: 'Pickup 1', val: 'AppHarvest / Mastronardi, Berea KY', sub: 'Fresh produce loaded' },
                    { bg: '#F8FAFC', label: 'Pickup 2 (2-pickup lane)', val: 'District Farms, Frederick MD', sub: 'Second shipper fills trailer' },
                    { bg: '#F0FDF4', label: 'Delivery', val: 'Wegmans DC, Rochester NY', sub: '2 drops · ~858–885 mi outbound' },
                  ]
                },
                {
                  boxes: [
                    { bg: '#F0FDF4', label: 'Return pickup', val: 'Saputo / E. Propak / HP Hood, Batavia NY', sub: 'Dairy / packaged goods' },
                    { bg: '#F8FAFC', label: 'Broker freight', val: '$1,600–$1,875 / load (rising)', sub: '610 miles southbound' },
                    { bg: '#EFF6FF', label: 'Return delivery', val: 'Walmart DC 6097, London KY', sub: 'Repositions near SG origins' },
                  ]
                }
              ].map((route, ri) => (
                <div key={ri} style={{ display: 'flex', border: '0.5px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                  {route.boxes.map((box, bi) => (
                    <div key={bi} style={{ display: 'flex', flex: 1 }}>
                      <div style={{ background: box.bg, padding: '12px 14px', flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{box.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{box.val}</div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{box.sub}</div>
                      </div>
                      {bi < 2 && <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px', color: '#94A3B8', fontSize: 16 }}>→</div>}
                    </div>
                  ))}
                </div>
              ))}

              <div style={S.secLabel}>Round-trip economics</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  ['AppHarvest direct','$2,262','avg, 638 mi outbound'],
                  ['Berea → MD → Rochester','$3,289','avg Q1 2026, 858–885 mi'],
                  ['Broker return leg','$1,700','avg, Batavia → London KY'],
                  ['Combined / round trip','~$3,900','direct + backhaul'],
                ].map(([lbl,val,sub],i) => (
                  <div key={i} style={{ background: i===3?'#EFF6FF':'#F8FAFC', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{lbl}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: i===3?'#1B3A6B':'#0F172A' }}>{val}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{sub}</div>
                  </div>
                ))}
              </div>

              <div style={S.card}>
                <div style={S.cardTitle}>Revenue by leg — per round trip</div>
                <div style={{ height: 140, position: 'relative' }}><canvas ref={chartRefs.cycle}/></div>
              </div>

              <div style={S.secLabel}>WPL vs CH Robinson OTR</div>
              <div style={S.tableWrap}>
                <table style={S.tbl}>
                  <thead>
                    <tr>
                      <th style={{...S.th,textAlign:'left'}}>Factor</th>
                      <th style={{...S.th,textAlign:'left'}}>WPL fleet partnership</th>
                      <th style={{...S.th,textAlign:'left'}}>CH Robinson OTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Direct shipper relationship','Contracted direct — full lane visibility','No — broker is the customer'],
                      ['Rate control','Direct negotiation with shipper','Broker margin on every load'],
                      ['Backhaul coordination','Actively managed — same corridor','Self-sourced'],
                      ['Load visibility','Full TMS access, all stop data','Limited — broker controls'],
                      ['Weekly runs now','2–3 / week confirmed volume','Market-dependent'],
                      ['Management fee','15% off gross, transparent','Varies'],
                    ].map(([f,wpl,chr],i) => (
                      <tr key={i} style={i%2===0?{background:'#F8FAFC'}:{}}>
                        <td style={{...S.td,fontWeight:500}}>{f}</td>
                        <td style={{...S.td,color:'#3B6D11',fontWeight:500}}>{wpl}</td>
                        <td style={{...S.td,color:'#A32D2D'}}>{chr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// SVG Icons
const VolumeIcon = () => <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="10" width="3" height="8" rx="1"/><rect x="8" y="6" width="3" height="12" rx="1"/><rect x="14" y="2" width="3" height="16" rx="1"/></svg>
const RateIcon   = () => <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3,15 8,9 12,12 17,5"/></svg>
const LaneIcon   = () => <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h12M4 10h12M4 16h12"/></svg>
const BrokerIcon = () => <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg>
const CycleIcon  = () => <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 8A7 7 0 0 0 5.3 5.3L3 8"/><path d="M3 12a7 7 0 0 0 11.7 2.7L17 12"/><polyline points="3,8 3,3 8,3"/><polyline points="17,12 17,17 12,17"/></svg>

const styles = {
  shell:      { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar:    { width: 220, background: '#0D1B2A', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logoWrap:   { display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' },
  brandName:  { fontSize: 15, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.3px' },
  brandSub:   { fontSize: 11, color: '#2563EB', fontWeight: 500, letterSpacing: '0.06em' },
  nav:        { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navBtn:     { display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, border: 'none', background: 'transparent', color: '#94A3B8', fontSize: 13, fontWeight: 400, cursor: 'pointer', textAlign: 'left', width: '100%' },
  navBtnActive:{ background: 'rgba(37,99,235,0.15)', color: '#FFFFFF', fontWeight: 500 },
  navIcon:    { color: 'inherit', display: 'flex', alignItems: 'center' },
  sideFooter: { padding: '12px 12px 16px', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 4 },
  dataTag:    { fontSize: 10, color: '#475569', lineHeight: 1.4 },
  logoutBtn:  { marginTop: 6, padding: '6px 10px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#64748B', fontSize: 12, cursor: 'pointer', textAlign: 'left' },
  main:       { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFC' },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#FFFFFF', borderBottom: '0.5px solid #E2E8F0', flexShrink: 0 },
  headerTitle:{ fontSize: 16, fontWeight: 600, color: '#0F172A' },
  headerSub:  { fontSize: 12, color: '#64748B', marginTop: 1 },
  kpiRow:     { display: 'flex', gap: 16 },
  miniKpi:    { textAlign: 'right' },
  miniKpiVal: { fontSize: 16, fontWeight: 600, color: '#0F172A' },
  miniKpiLbl: { fontSize: 10, color: '#94A3B8' },
  content:    { flex: 1, overflowY: 'auto', padding: 20 },
  grid2:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 },
  card:       { background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 8, padding: 14 },
  cardTitle:  { fontSize: 12, fontWeight: 500, color: '#0F172A', marginBottom: 10 },
  secLabel:   { fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' },
  tableWrap:  { overflowX: 'auto', background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 8 },
  tbl:        { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th:         { fontSize: 11, fontWeight: 500, color: '#64748B', padding: '7px 10px', borderBottom: '0.5px solid #E2E8F0', whiteSpace: 'nowrap', background: '#FAFAFA' },
  thr:        { textAlign: 'right' },
  td:         { padding: '6px 10px', borderBottom: '0.5px solid #F1F5F9', verticalAlign: 'middle' },
  tdr:        { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  legend:     { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, fontSize: 11, color: '#64748B' },
  legItem:    { display: 'flex', alignItems: 'center', gap: 5 },
  legSwatch:  { width: 10, height: 10, borderRadius: 2, flexShrink: 0 },
  sel:        { fontSize: 12, padding: '5px 10px', border: '0.5px solid #E2E8F0', borderRadius: 6, background: '#FFFFFF', color: '#0F172A', cursor: 'pointer', maxWidth: 480 },
}
