'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// ── Verified lane data ─────────────────────────────────────────────────────
const MONTHS = ['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03']
const MLBLS  = ['Jan 25','Feb 25','Mar 25','Apr 25','May 25','Jun 25','Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25','Jan 26','Feb 26','Mar 26']
const SG_MO  = {"2025-01":9,"2025-02":10,"2025-03":13,"2025-04":17,"2025-05":14,"2025-06":18,"2025-07":19,"2025-08":10,"2025-09":8,"2025-10":10,"2025-11":22,"2025-12":28,"2026-01":41,"2026-02":27,"2026-03":44}
const BR_MO  = {"2025-01":3,"2025-02":4,"2025-03":8,"2025-04":7,"2025-05":6,"2025-06":6,"2025-07":14,"2025-08":4,"2025-09":6,"2025-10":4,"2025-11":8,"2025-12":8,"2026-01":26,"2026-02":13,"2026-03":31}

const SG_LANES = [
  { lane:"AppHarvest (Richmond, KY) → Wegmans DC (Rochester, NY)", count:46, totalRev:104069, avgRate:2262, minRate:2100, maxRate:2443, avgMiles:638, avgRPM:3.54, firstRun:"2025-01-02", lastRun:"2026-03-05", trend:"FLAT",
    mc:{"2025-01":2,"2025-02":1,"2025-03":2,"2025-04":2,"2025-05":5,"2025-06":8,"2025-07":2,"2025-10":2,"2025-11":8,"2025-12":10,"2026-02":3,"2026-03":1},
    mar:{"2025-01":2442.19,"2025-02":2100.49,"2025-03":2178.19,"2025-04":2259.53,"2025-05":2237.51,"2025-06":2191.58,"2025-07":2335.06,"2025-10":2244.11,"2025-11":2275.97,"2025-12":2258.10,"2026-02":2378.94,"2026-03":2404.47},
    stops:[{name:"AppHarvest",addr:"Richmond, KY",lat:37.748,lng:-84.295,type:"pickup"},{name:"Wegmans DC",addr:"Rochester, NY",lat:43.145,lng:-77.633,type:"delivery"}]},
  { lane:"Berea, KY → Frederick, MD → Wegmans DC (Rochester, NY)", count:24, totalRev:76530, avgRate:3189, minRate:1577, maxRate:3728, avgMiles:839, avgRPM:3.80, firstRun:"2025-09-25", lastRun:"2026-03-29", trend:"UP",
    mc:{"2025-09":1,"2026-01":1,"2026-02":6,"2026-03":16},
    mar:{"2025-09":2330.17,"2026-01":1576.90,"2026-02":3288.92,"2026-03":3158.33},
    stops:[{name:"Mastronardi - Berea",addr:"Berea, KY",lat:37.569,lng:-84.296,type:"pickup"},{name:"District Farms",addr:"Frederick, MD",lat:39.414,lng:-77.411,type:"pickup"},{name:"Wegmans DC",addr:"Rochester, NY",lat:43.145,lng:-77.633,type:"delivery"}]},
  { lane:"Green Empire Farms (Oneida, NY) → BJ's DC (Elkton, MD)", count:38, totalRev:78539, avgRate:2067, minRate:1581, maxRate:2824, avgMiles:496, avgRPM:4.16, firstRun:"2025-04-15", lastRun:"2026-03-21", trend:"UP",
    mc:{"2025-04":2,"2025-05":1,"2025-11":9,"2025-12":7,"2026-01":9,"2026-02":5,"2026-03":5},
    mar:{"2025-04":1928.73,"2025-05":2011.30,"2025-11":1901.27,"2025-12":2150.78,"2026-01":2055.44,"2026-02":2285.87,"2026-03":2116.17},
    stops:[{name:"Green Empire Farms",addr:"Oneida, NY",lat:43.092,lng:-75.651,type:"pickup"},{name:"BJ's Wholesale DC",addr:"Elkton, MD",lat:39.607,lng:-75.831,type:"delivery"}]},
  { lane:"Mastronardi (Berea, KY) → Stop & Shop DC (Freetown, MA)", count:17, totalRev:63293, avgRate:3723, minRate:3541, maxRate:4195, avgMiles:1020, avgRPM:3.65, firstRun:"2025-01-07", lastRun:"2025-05-14", trend:"FLAT",
    mc:{"2025-01":1,"2025-02":1,"2025-03":7,"2025-04":5,"2025-05":3},
    mar:{"2025-01":3540.92,"2025-02":3639.69,"2025-03":3697.45,"2025-04":3702.53,"2025-05":3905.85},
    stops:[{name:"Mastronardi - Berea",addr:"Berea, KY",lat:37.569,lng:-84.296,type:"pickup"},{name:"Stop & Shop DC",addr:"Freetown, MA",lat:41.771,lng:-71.017,type:"delivery"}]},
  { lane:"AppHarvest (Richmond, KY) → Wegmans DC Govna (Rochester, NY)", count:20, totalRev:46841, avgRate:2342, minRate:2122, maxRate:3172, avgMiles:638, avgRPM:3.60, firstRun:"2025-12-02", lastRun:"2026-03-29", trend:"FLAT",
    mc:{"2025-12":3,"2026-01":13,"2026-02":3,"2026-03":1},
    mar:{"2025-12":2588.55,"2026-01":2293.42,"2026-02":2379.52,"2026-03":2121.97},
    stops:[{name:"AppHarvest",addr:"Richmond, KY",lat:37.748,lng:-84.295,type:"pickup"},{name:"Wegmans DC Govna",addr:"Rochester, NY",lat:43.147,lng:-77.640,type:"delivery"}]},
  { lane:"Bosch Berries (Somerset, KY) → Meijer / Michigan DCs", count:17, totalRev:41590, avgRate:2447, minRate:1409, maxRate:3125, avgMiles:709, avgRPM:3.45, firstRun:"2025-01-29", lastRun:"2026-02-13", trend:"UP",
    mc:{"2025-01":2,"2025-02":1,"2025-04":2,"2025-05":2,"2025-10":6,"2025-11":1,"2026-01":1,"2026-02":2},
    mar:{"2025-01":2144.00,"2025-02":2000.00,"2025-04":2350.00,"2025-05":2400.00,"2025-10":2620.00,"2025-11":2794.58,"2026-01":2794.58,"2026-02":2200.00},
    stops:[{name:"Bosch Berries",addr:"Somerset, KY",lat:37.092,lng:-84.603,type:"pickup"},{name:"Meijer DC",addr:"Romulus, MI",lat:42.222,lng:-83.397,type:"delivery"}]},
  { lane:"AppHarvest (Richmond, KY) → Pottsville, PA", count:9, totalRev:20892, avgRate:2321, minRate:2149, maxRate:2829, avgMiles:625, avgRPM:3.71, firstRun:"2025-12-04", lastRun:"2026-02-12", trend:"UP",
    mc:{"2025-12":1,"2026-01":5,"2026-02":3},
    mar:{"2025-12":2276.02,"2026-01":2327.00,"2026-02":2379.67},
    stops:[{name:"AppHarvest",addr:"Richmond, KY",lat:37.748,lng:-84.295,type:"pickup"},{name:"Wegmans DC Pottsville",addr:"Pottsville, PA",lat:40.685,lng:-76.195,type:"delivery"}]},
  { lane:"Somerset, KY → Tipp City, OH", count:8, totalRev:20985, avgRate:2623, minRate:2432, maxRate:2835, avgMiles:752, avgRPM:3.49, firstRun:"2025-10-01", lastRun:"2025-11-10", trend:"UP",
    mc:{"2025-10":4,"2025-11":4},
    mar:{"2025-10":2506.00,"2025-11":2740.00},
    stops:[{name:"Somerset Farm",addr:"Somerset, KY",lat:37.092,lng:-84.603,type:"pickup"},{name:"Tipp City DC",addr:"Tipp City, OH",lat:39.957,lng:-84.174,type:"delivery"}]},
  { lane:"Ontario/Oneida, NY → Jonestown, PA", count:7, totalRev:9100, avgRate:1300, minRate:1300, maxRate:1300, avgMiles:265, avgRPM:4.91, firstRun:"2025-11-26", lastRun:"2026-02-06", trend:"FLAT",
    mc:{"2025-11":2,"2025-12":2,"2026-01":2,"2026-02":1},
    mar:{"2025-11":1300,"2025-12":1300,"2026-01":1300,"2026-02":1300},
    stops:[{name:"Ontario / Oneida Farm",addr:"Oneida, NY",lat:43.092,lng:-75.651,type:"pickup"},{name:"Jonestown DC",addr:"Jonestown, PA",lat:40.412,lng:-76.477,type:"delivery"}]},
  { lane:"Wapakoneta/Somerset → CT/NJ (Berries)", count:9, totalRev:27876, avgRate:3097, minRate:3000, maxRate:3264, avgMiles:680, avgRPM:4.55, firstRun:"2026-01-29", lastRun:"2026-03-08", trend:"UP",
    mc:{"2026-01":1,"2026-02":5,"2026-03":3},
    mar:{"2026-01":3000,"2026-02":3075.00,"2026-03":3155.00},
    stops:[{name:"Wapakoneta Farm",addr:"Wapakoneta, OH",lat:40.565,lng:-84.193,type:"pickup"},{name:"NJ Distribution",addr:"Elizabeth, NJ",lat:40.668,lng:-74.194,type:"delivery"}]},
  { lane:"Ontario, NY → NY Distribution (Johnstown/Schodack)", count:10, totalRev:12786, avgRate:1279, minRate:1160, maxRate:1400, avgMiles:192, avgRPM:6.67, firstRun:"2026-01-05", lastRun:"2026-03-05", trend:"UP",
    mc:{"2026-01":5,"2026-02":3,"2026-03":2},
    mar:{"2026-01":1247.00,"2026-02":1291.00,"2026-03":1300.00},
    stops:[{name:"Ontario Farm",addr:"Ontario, NY",lat:43.227,lng:-77.272,type:"pickup"},{name:"Schodack DC",addr:"Schodack, NY",lat:42.559,lng:-73.672,type:"delivery"}]},
  { lane:"AppHarvest (Richmond, KY) → Michigan", count:5, totalRev:8812, avgRate:1762, minRate:1250, maxRate:2794, avgMiles:393, avgRPM:4.48, firstRun:"2025-06-23", lastRun:"2026-03-29", trend:"DOWN",
    mc:{"2025-06":1,"2025-07":1,"2026-01":1,"2026-03":2},
    mar:{"2025-06":2794.00,"2025-07":1500.00,"2026-01":1500.00,"2026-03":1250.00},
    stops:[{name:"AppHarvest",addr:"Richmond, KY",lat:37.748,lng:-84.295,type:"pickup"},{name:"Michigan DC",addr:"Livonia, MI",lat:42.368,lng:-83.353,type:"delivery"}]},
]

const BR_LANES = [
  { lane:"Saputo (Friendship, NY) → Walmart DC 6097 (London, KY)", count:24, avgRate:1525, firstRate:1300, lastRate:1800, avgMiles:610, trend:"UP",
    mc:{"2025-06":2,"2025-08":2,"2025-09":4,"2025-10":4,"2025-11":2,"2025-12":1,"2026-01":5,"2026-02":4},
    mar:{"2025-06":1300,"2025-08":1600,"2025-09":1500,"2025-10":1500,"2025-11":1500,"2025-12":1700,"2026-01":1750,"2026-02":1800}},
  { lane:"Eastern Propak (Batavia, NY) → Walmart DC 6097 (London, KY)", count:16, avgRate:1702, firstRate:1600, lastRate:1875, avgMiles:610, trend:"UP",
    mc:{"2025-03":2,"2025-04":1,"2025-07":1,"2025-08":2,"2025-09":1,"2025-10":1,"2025-11":1,"2025-12":1,"2026-01":2,"2026-02":2,"2026-03":2},
    mar:{"2025-03":1600,"2025-04":1600,"2025-07":1600,"2025-08":1700,"2025-09":1750,"2025-10":1750,"2025-11":1800,"2025-12":1800,"2026-01":1800,"2026-02":1875,"2026-03":1875}},
  { lane:"HP Hood (Batavia, NY) → Walmart DC 6097 (London, KY)", count:12, avgRate:1483, firstRate:1400, lastRate:1700, avgMiles:610, trend:"UP",
    mc:{"2025-04":1,"2025-05":1,"2025-06":2,"2025-08":1,"2025-09":2,"2025-10":1,"2025-11":2,"2025-12":1,"2026-01":1},
    mar:{"2025-04":1400,"2025-05":1400,"2025-06":1400,"2025-08":1500,"2025-09":1500,"2025-10":1500,"2025-11":1600,"2025-12":1700,"2026-01":1700}},
  { lane:"Lactalis → Delanco DC (NJ)", count:4, avgRate:2463, firstRate:2250, lastRate:2700, avgMiles:480, trend:"UP",
    mc:{"2025-08":1,"2025-10":1,"2026-01":1,"2026-02":1},
    mar:{"2025-08":2250,"2025-10":2400,"2026-01":2700,"2026-02":2700}},
  { lane:"US Beverage Packers → Walmart DC 6097 (London, KY)", count:6, avgRate:1217, firstRate:1200, lastRate:1400, avgMiles:590, trend:"UP",
    mc:{"2025-05":1,"2025-07":1,"2025-08":1,"2025-09":1,"2025-10":1,"2025-11":1},
    mar:{"2025-05":1200,"2025-07":1200,"2025-08":1200,"2025-09":1200,"2025-10":1300,"2025-11":1400}},
  { lane:"REMA Foods/Penske → Performance Foodservice", count:4, avgRate:1813, firstRate:1900, lastRate:1750, avgMiles:390, trend:"DOWN",
    mc:{"2025-08":1,"2025-09":1,"2025-10":1,"2025-11":1},
    mar:{"2025-08":1900,"2025-09":1900,"2025-10":1750,"2025-11":1750}},
]

// ── Cost Intelligence data ─────────────────────────────────────────────────
const COST_DEFAULTS = {
  fuel_ppg:3.34, mpg:6.6, toll:0.15, def:0.02, reefer:0.02, maint:0.15, driver:0,
  truck_pmt:2666, trailer_pmt:1608, truck_ins:2282, trailer_ins:439, miles_mo:10000
};
const COST_LANES = [
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
const COST_CUSHION = 1.05;

// ── Helpers ────────────────────────────────────────────────────────────────
function $k(v) { return '$' + Math.round(v).toLocaleString() }
function qSum(mc, months) { return months.reduce((s,m) => s+(mc[m]||0), 0) }
const Q1=['2025-01','2025-02','2025-03'], Q2=['2025-04','2025-05','2025-06']
const Q3=['2025-07','2025-08','2025-09'], Q4=['2025-10','2025-11','2025-12'], Q126=['2026-01','2026-02','2026-03']

function TrendBadge({ trend }) {
  const map = { UP:['rgba(0,255,204,0.12)','#00FFCC','↑ up'], DOWN:['rgba(255,107,107,0.12)','#FF6B6B','↓ down'], FLAT:['rgba(77,158,255,0.12)','#4D9EFF','→ flat'] }
  const [bg,color,label] = map[trend]||map.FLAT
  return <span style={{ background:bg, color, fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, letterSpacing:'0.04em' }}>{label}</span>
}

function HeatCell({ n }) {
  if (!n) return <span style={{ color:'rgba(255,255,255,0.2)', fontSize:11 }}>—</span>
  const [bg,color] = n>=10?['#00FFCC','#000']:n>=6?['rgba(0,255,204,0.7)','#000']:n>=3?['rgba(0,255,204,0.4)','#fff']:n>=2?['rgba(0,255,204,0.2)','#00FFCC']:['rgba(0,255,204,0.08)','#00FFCC']
  return <span style={{ background:bg, color, fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, minWidth:22, display:'inline-block', textAlign:'center' }}>{n}</span>
}

// ── Map component (Leaflet, loaded client-side) ────────────────────────────
function LaneMap({ stops }) {
  const mapRef    = useRef(null)
  const leafletRef = useRef(null)
  const mapInst   = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!mapRef.current) return

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    async function initMap() {
      if (!leafletRef.current) {
        // Load Leaflet via script tag if not already loaded
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            s.onload = resolve
            s.onerror = reject
            document.head.appendChild(s)
          })
        }
        leafletRef.current = window.L
      }
      const L = leafletRef.current

      if (mapInst.current) {
        mapInst.current.remove()
        mapInst.current = null
      }

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
      mapInst.current = map

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd', maxZoom: 19
      }).addTo(map)

      const bounds = []
      stops.forEach((stop, i) => {
        const isPickup   = stop.type === 'pickup'
        const color      = isPickup ? '#00FFCC' : '#FF6B6B'
        const label      = isPickup ? 'P' : 'D'
        const iconHtml   = `<div style="width:28px;height:28px;background:${color};border-radius:50%;border:2px solid #000;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#000;box-shadow:0 2px 8px rgba(0,0,0,0.8)">${label}</div>`
        const icon       = L.divIcon({ html: iconHtml, className:'', iconSize:[28,28], iconAnchor:[14,14], popupAnchor:[0,-16] })
        const marker     = L.marker([stop.lat, stop.lng], { icon }).addTo(map)
        marker.bindPopup(`<div style="font-family:system-ui;font-size:12px;line-height:1.5"><strong>${stop.name}</strong><br/><span style="color:#666">${stop.addr}</span><br/><span style="color:${color};font-weight:700;font-size:10px;text-transform:uppercase">${stop.type}</span></div>`)
        bounds.push([stop.lat, stop.lng])
      })

      // Draw route line
      if (stops.length > 1) {
        L.polyline(stops.map(s => [s.lat, s.lng]), {
          color: '#00FFCC', weight: 2, opacity: 0.6, dashArray: '6,5'
        }).addTo(map)
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    }

    const timer = setTimeout(initMap, 100)
    return () => {
      clearTimeout(timer)
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null }
    }
  }, [stops])

  return (
    <div style={{ position:'relative' }}>
      <div ref={mapRef} style={{ height:280, borderRadius:8, overflow:'hidden', border:'0.5px solid rgba(255,255,255,0.1)' }}/>
      <div style={{ position:'absolute', bottom:8, right:8, display:'flex', gap:10, background:'rgba(0,0,0,0.75)', padding:'5px 10px', borderRadius:6, zIndex:500 }}>
        <span style={{ fontSize:10, color:'#00FFCC', fontWeight:700 }}>● Pickup</span>
        <span style={{ fontSize:10, color:'#FF6B6B', fontWeight:700 }}>● Delivery</span>
      </div>
    </div>
  )
}

// ── Main dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab]             = useState('volume')
  const [selectedLane, setLane]   = useState(0)
  const [costTab, setCostTab]     = useState('profit')
  const [targetMargin, setTargetMargin] = useState(25)
  const [fuelPPG, setFuelPPG]     = useState(COST_DEFAULTS.fuel_ppg)
  const [mpg, setMPG]             = useState(COST_DEFAULTS.mpg)
  const [toll, setToll]           = useState(COST_DEFAULTS.toll)
  const [def_, setDef]            = useState(COST_DEFAULTS.def)
  const [reefer, setReefer]       = useState(COST_DEFAULTS.reefer)
  const [maint, setMaint]         = useState(COST_DEFAULTS.maint)
  const [driver, setDriver]       = useState(COST_DEFAULTS.driver)
  const [truckPmt, setTruckPmt]   = useState(COST_DEFAULTS.truck_pmt)
  const [trailerPmt, setTrailerPmt] = useState(COST_DEFAULTS.trailer_pmt)
  const [truckIns, setTruckIns]   = useState(COST_DEFAULTS.truck_ins)
  const [trailerIns, setTrailerIns] = useState(COST_DEFAULTS.trailer_ins)
  const [milesMo, setMilesMo]     = useState(COST_DEFAULTS.miles_mo)
  const chartsReady               = useRef(false)
  const chartInst                 = useRef({})
  const refs = {
    vol: useRef(), bar: useRef(), rate: useRef(),
    range: useRef(), rpm: useRef(), brRate: useRef(), brVol: useRef(), cycle: useRef(),
    costProfit: useRef()
  }

  // Cost computed values
  const fuelCPM = mpg > 0 ? (fuelPPG / mpg) * COST_CUSHION : 0
  const tollCPM = toll * COST_CUSHION
  const defCPM = def_ * COST_CUSHION
  const reeferCPM = reefer * COST_CUSHION
  const maintCPM = maint * COST_CUSHION
  const driverCPM = driver
  const varCPM = fuelCPM + tollCPM + defCPM + reeferCPM + maintCPM + driverCPM
  const fixedMo = truckPmt + trailerPmt + truckIns + trailerIns
  const fixedCPM = milesMo > 0 ? fixedMo / milesMo : 0
  const allInCPM = varCPM + fixedCPM
  const mc = m => m >= targetMargin ? '#00FFCC' : m >= 10 ? '#FFB84D' : '#FF6B6B'

  function calcLane(l) {
    const cost = allInCPM * l.mi
    const margin = l.rev > 0 ? (l.rev - cost) / l.rev * 100 : 0
    const profit = l.rev - cost
    const tgtCost = l.rev * (1 - targetMargin / 100)
    const tgtCPM = l.mi > 0 ? tgtCost / l.mi : 0
    const equipCost = (allInCPM - driverCPM) * l.mi
    const drvBudget = tgtCost - equipCost
    return { cost:Math.round(cost), margin:Math.round(margin*10)/10, profit:Math.round(profit),
      tgtCPM:Math.round(tgtCPM*100)/100, tgtCost:Math.round(tgtCost),
      drvBudget:Math.round(drvBudget), drvCPM:l.mi>0?Math.round(drvBudget/l.mi*100)/100:0,
      fuelEst:Math.round(fuelCPM*l.mi), tollEst:Math.round(tollCPM*l.mi), fixEst:Math.round(fixedCPM*l.mi),
      drvEst:Math.round(driverCPM*l.mi), maintEst:Math.round(maintCPM*l.mi) }
  }

  function resetCosts() {
    setFuelPPG(COST_DEFAULTS.fuel_ppg); setMPG(COST_DEFAULTS.mpg); setToll(COST_DEFAULTS.toll)
    setDef(COST_DEFAULTS.def); setReefer(COST_DEFAULTS.reefer); setMaint(COST_DEFAULTS.maint)
    setDriver(COST_DEFAULTS.driver); setTruckPmt(COST_DEFAULTS.truck_pmt); setTrailerPmt(COST_DEFAULTS.trailer_pmt)
    setTruckIns(COST_DEFAULTS.truck_ins); setTrailerIns(COST_DEFAULTS.trailer_ins); setMilesMo(COST_DEFAULTS.miles_mo)
    setTargetMargin(25)
  }

  // Load Chart.js once
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    s.onload = () => { chartsReady.current = true; renderChartsForTab('volume') }
    document.head.appendChild(s)
    return () => { Object.values(chartInst.current).forEach(c => c?.destroy?.()) }
  }, [])

  // Re-render charts whenever tab changes (fixes timing issue)
  useEffect(() => {
    if (!chartsReady.current) return
    const timer = setTimeout(() => renderChartsForTab(tab), 80)
    return () => clearTimeout(timer)
  }, [tab])

  // Re-render rate chart when selected lane changes
  useEffect(() => {
    if (!chartsReady.current || tab !== 'rates') return
    const timer = setTimeout(() => buildRateChart(), 80)
    return () => clearTimeout(timer)
  }, [selectedLane])

  // Re-render cost chart when cost inputs change
  useEffect(() => {
    if (!chartsReady.current || tab !== 'costs') return
    const timer = setTimeout(() => buildCostProfitChart(), 80)
    return () => clearTimeout(timer)
  }, [fuelPPG, mpg, toll, def_, reefer, maint, driver, truckPmt, trailerPmt, truckIns, trailerIns, milesMo, targetMargin, costTab])

  function destroy(key) { chartInst.current[key]?.destroy(); chartInst.current[key] = null }

  const COLORS = { teal:'#00FFCC', blue:'#4D9EFF', amber:'#FFB84D', red:'#FF6B6B', muted:'rgba(255,255,255,0.15)' }
  const GRID   = { color:'rgba(255,255,255,0.06)', drawBorder:false }
  const TICK   = { color:'rgba(255,255,255,0.35)', font:{ size:10, family:'system-ui' } }
  const baseOpts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{ grid:GRID, ticks:TICK }, y:{ grid:GRID, ticks:TICK } } }

  function renderChartsForTab(t) {
    const C = window.Chart
    if (!C) return
    if (t === 'volume') { buildVolChart(C); buildBarChart(C) }
    if (t === 'rates')  { buildRateChart(C); buildRangeChart(C); buildRpmChart(C) }
    if (t === 'broker') { buildBrRateChart(C); buildBrVolChart(C) }
    if (t === 'cycle')  { buildCycleChart(C) }
    if (t === 'costs')  { buildCostProfitChart(C) }
  }

  function buildVolChart(C = window.Chart) {
    if (!refs.vol.current) return
    destroy('vol')
    chartInst.current.vol = new C(refs.vol.current, {
      type:'bar',
      data:{ labels:MLBLS, datasets:[
        { label:'Direct', data:MONTHS.map(m=>SG_MO[m]||0), backgroundColor:'rgba(0,255,204,0.7)', borderColor:'#00FFCC', borderWidth:1, borderRadius:3 },
        { label:'Broker', data:MONTHS.map(m=>BR_MO[m]||0), backgroundColor:'rgba(77,158,255,0.6)', borderColor:'#4D9EFF', borderWidth:1, borderRadius:3 },
      ]},
      options:{ ...baseOpts, scales:{ x:{ ...baseOpts.scales.x, ticks:{ ...TICK, maxRotation:40, autoSkip:false } }, y:{ ...baseOpts.scales.y } } }
    })
  }

  function buildBarChart(C = window.Chart) {
    if (!refs.bar.current) return
    destroy('bar')
    const top8 = SG_LANES.slice(0,8)
    chartInst.current.bar = new C(refs.bar.current, {
      type:'bar',
      data:{ labels:top8.map(l=>l.lane.split('→')[0].trim().replace('AppHarvest ','').replace('Mastronardi ','').replace('Green Empire Farms ','GEF ').replace('Berea, KY','Berea→MD').replace('(Richmond, KY)','Richmond').replace('(Oneida, NY)','Oneida').replace('Bosch Berries ','Bosch ').replace('(Somerset, KY)','Somerset')),
        datasets:[{ data:top8.map(l=>l.count), backgroundColor:'rgba(0,255,204,0.7)', borderRadius:3 }] },
      options:{ ...baseOpts, indexAxis:'y', plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:c=>c.raw+' loads' } } }, scales:{ x:{ grid:GRID, ticks:TICK }, y:{ grid:GRID, ticks:TICK } } }
    })
  }

  function buildRateChart(C = window.Chart) {
    if (!refs.rate.current) return
    destroy('rate')
    const l      = SG_LANES[selectedLane]
    const months = Object.keys(l.mar).sort()
    const labels = months.map(m=>MLBLS[MONTHS.indexOf(m)]).filter(Boolean)
    const vals   = months.map(m=>l.mar[m])
    const counts = months.map(m=>l.mc[m]||0)
    chartInst.current.rate = new C(refs.rate.current, {
      type:'line',
      data:{ labels, datasets:[{ data:vals, borderColor:'#00FFCC', backgroundColor:'rgba(0,255,204,0.08)', fill:true, tension:0.3, pointRadius:5, borderWidth:2,
        pointBackgroundColor:vals.map(v=>v>=l.avgRate?'#00FFCC':'#4D9EFF') }] },
      options:{ ...baseOpts, plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:c=>'Avg: $'+c.raw.toLocaleString()+' ('+counts[c.dataIndex]+' load'+(counts[c.dataIndex]>1?'s':'')+')'} } },
        scales:{ x:{ grid:GRID, ticks:{ ...TICK, maxRotation:40, autoSkip:false } }, y:{ grid:GRID, ticks:{ ...TICK, callback:v=>'$'+v.toLocaleString() }, beginAtZero:false } } }
    })
  }

  function buildRangeChart(C = window.Chart) {
    if (!refs.range.current) return
    destroy('range')
    const top7   = SG_LANES.slice(0,7)
    const labels = top7.map(l=>l.lane.split('→')[0].trim().replace('AppHarvest ','').replace('Mastronardi ','').replace('Green Empire Farms ','GEF ').replace('Berea, KY','Berea→MD').replace('(Richmond, KY)','Richmond').replace('Bosch Berries ','Bosch '))
    chartInst.current.range = new C(refs.range.current, {
      type:'bar',
      data:{ labels, datasets:[
        { label:'Min', data:top7.map(l=>l.minRate), backgroundColor:'rgba(77,158,255,0.5)', borderRadius:2 },
        { label:'Avg', data:top7.map(l=>l.avgRate), backgroundColor:'rgba(0,255,204,0.7)', borderRadius:2 },
        { label:'Max', data:top7.map(l=>l.maxRate), backgroundColor:'rgba(0,255,204,0.35)', borderRadius:2 },
      ]},
      options:{ ...baseOpts, indexAxis:'y', plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:c=>c.dataset.label+': $'+c.raw.toLocaleString() } } },
        scales:{ x:{ grid:GRID, ticks:{ ...TICK, callback:v=>'$'+v.toLocaleString() } }, y:{ grid:GRID, ticks:TICK } } }
    })
  }

  function buildRpmChart(C = window.Chart) {
    if (!refs.rpm.current) return
    destroy('rpm')
    const top7   = SG_LANES.slice(0,7)
    const labels = top7.map(l=>l.lane.split('→')[0].trim().replace('AppHarvest ','').replace('Mastronardi ','').replace('Green Empire Farms ','GEF ').replace('Berea, KY','Berea→MD').replace('(Richmond, KY)','Richmond').replace('Bosch Berries ','Bosch '))
    chartInst.current.rpm = new C(refs.rpm.current, {
      type:'bar',
      data:{ labels, datasets:[{ data:top7.map(l=>l.avgRPM),
        backgroundColor:top7.map(l=>l.avgRPM>=4.5?'#00FFCC':l.avgRPM>=3.5?'rgba(0,255,204,0.6)':'rgba(77,158,255,0.5)'), borderRadius:3 }] },
      options:{ ...baseOpts, indexAxis:'y', plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:c=>'$'+c.raw.toFixed(2)+'/mi' } } },
        scales:{ x:{ grid:GRID, ticks:{ ...TICK, callback:v=>'$'+v.toFixed(2) } }, y:{ grid:GRID, ticks:TICK } } }
    })
  }

  function buildBrRateChart(C = window.Chart) {
    if (!refs.brRate.current) return
    destroy('brRate')
    const brMo   = ['2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03']
    const brLbls = brMo.map(m=>MLBLS[MONTHS.indexOf(m)])
    const colors = ['#00FFCC','#4D9EFF','#FFB84D']
    chartInst.current.brRate = new C(refs.brRate.current, {
      type:'line',
      data:{ labels:brLbls, datasets:BR_LANES.slice(0,3).map((l,i)=>({ label:l.lane, data:brMo.map(m=>l.mar[m]||null), borderColor:colors[i], backgroundColor:'transparent', fill:false, tension:0.3, pointRadius:4, borderWidth:2, spanGaps:false }))},
      options:{ ...baseOpts, plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:c=>c.dataset.label.split('→')[0].trim()+': $'+Math.round(c.raw).toLocaleString() } } },
        scales:{ x:{ grid:GRID, ticks:{ ...TICK, maxRotation:40, autoSkip:false } }, y:{ grid:GRID, ticks:{ ...TICK, callback:v=>'$'+v.toLocaleString() }, beginAtZero:false } } }
    })
  }

  function buildBrVolChart(C = window.Chart) {
    if (!refs.brVol.current) return
    destroy('brVol')
    const colors = ['rgba(0,255,204,0.7)','rgba(77,158,255,0.6)','rgba(255,184,77,0.6)']
    chartInst.current.brVol = new C(refs.brVol.current, {
      type:'bar',
      data:{ labels:MLBLS, datasets:BR_LANES.slice(0,3).map((l,i)=>({ label:l.lane.split('→')[0].trim(), data:MONTHS.map(m=>l.mc[m]||0), backgroundColor:colors[i], borderRadius:2 }))},
      options:{ ...baseOpts, scales:{ x:{ ...baseOpts.scales.x, stacked:true, ticks:{ ...TICK, maxRotation:40, autoSkip:false } }, y:{ ...baseOpts.scales.y, stacked:true } } }
    })
  }

  function buildCycleChart(C = window.Chart) {
    if (!refs.cycle.current) return
    destroy('cycle')
    chartInst.current.cycle = new C(refs.cycle.current, {
      type:'bar',
      data:{ labels:['AppHarvest direct (638 mi)','Berea → MD → Rochester (858 mi)','Broker return (610 mi)'],
        datasets:[{ data:[2262,3289,1700], backgroundColor:['rgba(0,255,204,0.8)','rgba(0,255,204,0.5)','rgba(77,158,255,0.7)'], borderRadius:4 }] },
      options:{ ...baseOpts, indexAxis:'y', plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:c=>'$'+c.raw.toLocaleString() } } },
        scales:{ x:{ grid:GRID, ticks:{ ...TICK, callback:v=>'$'+v.toLocaleString() } }, y:{ grid:GRID, ticks:TICK } } }
    })
  }

  function buildCostProfitChart(C = window.Chart) {
    if (!refs.costProfit.current) return
    destroy('costProfit')
    const sorted = [...COST_LANES].sort((a,b) => calcLane(b).margin - calcLane(a).margin)
    chartInst.current.costProfit = new C(refs.costProfit.current, {
      type:'bar', data:{ labels:sorted.map(l => l.lane.length > 32 ? l.lane.slice(0,30)+'…' : l.lane),
        datasets:[{ data:sorted.map(l => calcLane(l).margin),
          backgroundColor:sorted.map(l => { const m=calcLane(l).margin; return m>=targetMargin?'rgba(0,255,204,0.7)':m>=10?'rgba(255,184,77,0.6)':'rgba(255,107,107,0.6)' }),
          borderRadius:3 }] },
      options:{ ...baseOpts, indexAxis:'y',
        plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>c.raw+'%'}} },
        scales:{ x:{grid:GRID,ticks:{...TICK,callback:v=>v+'%'}}, y:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{...TICK,font:{size:9}}} } }
    })
  }

  function changeTab(t) { setTab(t) }

  async function logout() { await fetch('/api/verify',{ method:'POST' }); window.location.href='/login' }

  const laneShortName = l => l.split('→')[0].trim()
    .replace('AppHarvest ','').replace('Mastronardi ','').replace('Green Empire Farms ','GEF ')
    .replace('Berea, KY','Berea→MD').replace('(Richmond, KY)','Richmond').replace('Bosch Berries ','Bosch ')
    .replace('(Oneida, NY)','Oneida').replace('(Somerset, KY)','Somerset').replace('Wapakoneta/Somerset','Wap/Som')

  return (
    <>
      <style>{`
        @keyframes shine { 0%{background-position:100% center} 100%{background-position:-100% center} }
        * { box-sizing: border-box; }
        body { margin:0; background:#000; color:rgba(220,220,220,0.85); font-family:system-ui,-apple-system,sans-serif; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
        .nav-btn:hover { background:rgba(255,255,255,0.06) !important; }
        .nav-btn.active { background:rgba(0,255,204,0.1) !important; color:#00FFCC !important; }
        .tbl tr:hover td { background:rgba(255,255,255,0.03) !important; }
        select option { background:#111; color:#fff; }
        .wpl-select:focus { outline:none; border-color:rgba(0,255,204,0.4) !important; }
        .cost-stepper { display:flex; align-items:center; gap:0; }
        .cost-stepper input[type=number] { -moz-appearance:textfield; }
        .cost-stepper input[type=number]::-webkit-inner-spin-button,
        .cost-stepper input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        .stepper-btn { width:28px; height:28px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.06); border:0.5px solid rgba(255,255,255,0.15); color:rgba(255,255,255,0.7); font-size:16px; font-weight:700; cursor:pointer; transition:all 0.15s; user-select:none; line-height:1; }
        .stepper-btn:hover { background:rgba(0,255,204,0.15); color:#00FFCC; border-color:rgba(0,255,204,0.3); }
        .stepper-btn:active { background:rgba(0,255,204,0.25); }
        .stepper-btn.minus { border-radius:5px 0 0 5px; border-right:none; }
        .stepper-btn.plus { border-radius:0 5px 5px 0; border-left:none; }
        .cost-sub-tab { padding:6px 12px; border-radius:5px; border:0.5px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.4); font-size:11px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }
        .cost-sub-tab:hover { background:rgba(255,255,255,0.04); }
        .cost-sub-tab.active { background:rgba(0,255,204,0.1); border-color:rgba(0,255,204,0.3); color:#00FFCC; }
      `}</style>

      <div style={S.shell}>
        {/* ── Sidebar ── */}
        <aside style={S.sidebar}>
          <div style={S.logoWrap}>
            <svg width="22" height="22" viewBox="0 0 36 36" fill="none" style={{ flexShrink:0 }}>
              <rect width="36" height="36" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              <path d="M8 18C8 12.477 12.477 8 18 8s10 4.477 10 10-4.477 10-10 10S8 23.523 8 18z" stroke="#00FFCC" strokeWidth="1.5" fill="none"/>
              <path d="M13 18h10M18 13l5 5-5 5" stroke="#00FFCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="13" cy="18" r="1.8" fill="#00FFCC"/>
            </svg>
            <div>
              <div style={S.brandName}>CargoLoop</div>
              <div style={S.brandSub}>Intelligence</div>
            </div>
          </div>

          <nav style={S.nav}>
            {[['volume','Volume',<VolumeIcon/>],['rates','Rate Trends',<RateIcon/>],['lanes','All Lanes',<LaneIcon/>],['broker','Broker',<BrokerIcon/>],['cycle','Truck Cycle',<CycleIcon/>],['costs','Cost Breakdown',<CostIcon/>]].map(([id,label,icon])=>(
              <button key={id} className={`nav-btn${tab===id?' active':''}`}
                style={{ ...S.navBtn, ...(tab===id?S.navActive:{}) }}
                onClick={()=>changeTab(id)}>
                <span style={{ color:'inherit', display:'flex', alignItems:'center' }}>{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          <div style={S.sideFooter}>
            <div style={S.dataTag}>Jan 2025 – Mar 2026</div>
            <div style={S.dataTag}>WPL Tracker + LoadConnex</div>
            <button style={S.logoutBtn} onClick={logout}>Sign out</button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={S.main}>
          <header style={S.header}>
            <div>
              <div style={S.headerTitle}>
                {tab==='volume'&&'Volume Trends'}{tab==='rates'&&'Rate Trends'}{tab==='lanes'&&'All Lanes'}{tab==='broker'&&'Broker Corridor'}{tab==='cycle'&&'Truck Cycle'}{tab==='costs'&&'Cost Breakdown'}
              </div>
              <div style={S.headerSub}>Sunset Grown — Fleet partnership analysis</div>
            </div>
            <div style={S.kpiRow}>
              {[['271','Direct loads'],['$502K','SG revenue'],['44/mo','Mar 2026']].map(([v,l])=>(
                <div key={l} style={S.miniKpi}>
                  <div style={S.miniKpiVal}>{v}</div>
                  <div style={S.miniKpiLbl}>{l}</div>
                </div>
              ))}
            </div>
          </header>

          <div style={S.content}>

            {/* VOLUME */}
            {tab==='volume'&&(
              <>
                <div style={S.grid2}>
                  <div style={S.card}>
                    <div style={S.cardTitle}>Monthly load volume — direct vs broker</div>
                    <div style={{ height:210, position:'relative' }}><canvas ref={refs.vol}/></div>
                    <div style={S.legend}>
                      <span style={S.legItem}><span style={{ ...S.legSw, background:'#00FFCC' }}/> Direct shipper</span>
                      <span style={S.legItem}><span style={{ ...S.legSw, background:'#4D9EFF' }}/> Broker</span>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={S.cardTitle}>Top lanes by load count</div>
                    <div style={{ height:210, position:'relative' }}><canvas ref={refs.bar}/></div>
                  </div>
                </div>
                <div style={S.secLabel}>Quarterly frequency — direct shipper lanes</div>
                <div style={S.tableWrap}>
                  <table style={S.tbl} className="tbl">
                    <thead><tr>
                      <th style={{ ...S.th, textAlign:'left', minWidth:240 }}>Lane</th>
                      <th style={{ ...S.th, ...S.thr }}>Total</th>
                      {['Q1 \'25','Q2 \'25','Q3 \'25','Q4 \'25','Q1 \'26'].map(q=><th key={q} style={{ ...S.th, ...S.thr }}>{q}</th>)}
                      <th style={{ ...S.th, ...S.thr }}>Avg rate</th>
                      <th style={{ ...S.th, ...S.thr }}>Avg mi</th>
                      <th style={S.th}>Trend</th>
                    </tr></thead>
                    <tbody>
                      {SG_LANES.map((l,i)=>(
                        <tr key={i} style={i%2===0?{ background:'rgba(255,255,255,0.015)' }:{}}>
                          <td style={{ ...S.td, fontSize:12, fontWeight:500 }}>{l.lane}</td>
                          <td style={{ ...S.td, ...S.tdr, fontWeight:700 }}>{l.count}</td>
                          <td style={{ ...S.td, ...S.tdr }}><HeatCell n={qSum(l.mc,Q1)}/></td>
                          <td style={{ ...S.td, ...S.tdr }}><HeatCell n={qSum(l.mc,Q2)}/></td>
                          <td style={{ ...S.td, ...S.tdr }}><HeatCell n={qSum(l.mc,Q3)}/></td>
                          <td style={{ ...S.td, ...S.tdr }}><HeatCell n={qSum(l.mc,Q4)}/></td>
                          <td style={{ ...S.td, ...S.tdr }}><HeatCell n={qSum(l.mc,Q126)}/></td>
                          <td style={{ ...S.td, ...S.tdr }}>{$k(l.avgRate)}</td>
                          <td style={{ ...S.td, ...S.tdr }}>{Math.round(l.avgMiles)}</td>
                          <td style={S.td}><TrendBadge trend={l.trend}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* RATES */}
            {tab==='rates'&&(
              <>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Lane:</label>
                  <select className="wpl-select" value={selectedLane} onChange={e=>setLane(Number(e.target.value))}
                    style={{ fontSize:12, padding:'6px 10px', background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:6, color:'rgba(220,220,220,0.85)', cursor:'pointer', maxWidth:500, fontFamily:'inherit' }}>
                    {SG_LANES.map((l,i)=><option key={i} value={i}>{l.lane}</option>)}
                  </select>
                </div>

                {/* Rate chart */}
                <div style={S.card}>
                  <div style={S.cardTitle}>{SG_LANES[selectedLane].lane} — monthly avg rate</div>
                  <div style={{ height:200, position:'relative' }}><canvas ref={refs.rate}/></div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:8 }}>
                    {SG_LANES[selectedLane].count} loads · {$k(SG_LANES[selectedLane].minRate)} min · {$k(SG_LANES[selectedLane].maxRate)} max · {$k(SG_LANES[selectedLane].avgRate)} avg · Teal dots = above avg
                  </div>
                </div>

                {/* Lane map */}
                <div style={{ ...S.card, marginTop:14 }}>
                  <div style={S.cardTitle}>Lane route map — {SG_LANES[selectedLane].lane.split('→').length} stop{SG_LANES[selectedLane].stops.length>2?'s':''}</div>
                  <LaneMap key={selectedLane} stops={SG_LANES[selectedLane].stops}/>
                  <div style={{ display:'flex', gap:16, marginTop:10, flexWrap:'wrap' }}>
                    {SG_LANES[selectedLane].stops.map((s,i)=>(
                      <div key={i} style={{ fontSize:11, color:'rgba(255,255,255,0.45)', display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ color:s.type==='pickup'?'#00FFCC':'#FF6B6B', fontWeight:700, fontSize:10, textTransform:'uppercase' }}>{s.type}</span>
                        <span>{s.name}</span>
                        <span style={{ color:'rgba(255,255,255,0.25)' }}>{s.addr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={S.grid2}>
                  <div style={S.card}>
                    <div style={S.cardTitle}>Rate range — min / avg / max</div>
                    <div style={{ height:200, position:'relative' }}><canvas ref={refs.range}/></div>
                  </div>
                  <div style={S.card}>
                    <div style={S.cardTitle}>Avg $/mile by lane</div>
                    <div style={{ height:200, position:'relative' }}><canvas ref={refs.rpm}/></div>
                  </div>
                </div>
              </>
            )}

            {/* LANES */}
            {tab==='lanes'&&(
              <>
                <div style={S.secLabel}>All direct shipper lanes — verified load-by-load data</div>
                <div style={S.tableWrap}>
                  <table style={S.tbl} className="tbl">
                    <thead><tr>
                      <th style={{ ...S.th, textAlign:'left', minWidth:250 }}>Lane</th>
                      {['Loads','Revenue','Avg rate','Min','Max','Avg mi','$/mi','First run','Last run','Trend'].map(h=>(
                        <th key={h} style={{ ...S.th, textAlign:['First run','Last run','Trend'].includes(h)?'left':'right' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {SG_LANES.map((l,i)=>(
                        <tr key={i} style={i%2===0?{ background:'rgba(255,255,255,0.015)' }:{}}>
                          <td style={{ ...S.td, fontSize:12, fontWeight:500 }}>{l.lane}</td>
                          <td style={{ ...S.td, ...S.tdr, fontWeight:700 }}>{l.count}</td>
                          <td style={{ ...S.td, ...S.tdr }}>{$k(l.totalRev)}</td>
                          <td style={{ ...S.td, ...S.tdr }}>{$k(l.avgRate)}</td>
                          <td style={{ ...S.td, ...S.tdr }}>{$k(l.minRate)}</td>
                          <td style={{ ...S.td, ...S.tdr }}>{$k(l.maxRate)}</td>
                          <td style={{ ...S.td, ...S.tdr }}>{Math.round(l.avgMiles)}</td>
                          <td style={{ ...S.td, ...S.tdr }}>{l.avgRPM.toFixed(2)}</td>
                          <td style={{ ...S.td, fontSize:11, color:'rgba(255,255,255,0.4)' }}>{l.firstRun}</td>
                          <td style={{ ...S.td, fontSize:11, color:'rgba(255,255,255,0.4)' }}>{l.lastRun}</td>
                          <td style={S.td}><TrendBadge trend={l.trend}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* BROKER */}
            {tab==='broker'&&(
              <>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.7, marginBottom:14, maxWidth:720 }}>
                  Broker loads cover return legs after Sunset Grown deliveries. The Batavia / Friendship, NY cluster delivers to Walmart DC 6097 in London, KY — adjacent to SG pickup origins. Rates up <strong style={{ color:'#00FFCC' }}>16–38%</strong> in 12 months.
                </div>
                <div style={S.grid2}>
                  <div style={S.card}>
                    <div style={S.cardTitle}>Rate trend — NY → London, KY corridor</div>
                    <div style={{ height:210, position:'relative' }}><canvas ref={refs.brRate}/></div>
                    <div style={S.legend}>
                      {[['#00FFCC','Saputo'],['#4D9EFF','Eastern Propak'],['#FFB84D','HP Hood']].map(([c,l])=>(
                        <span key={l} style={S.legItem}><span style={{ ...S.legSw, background:c }}/>{l} → Walmart DC 6097</span>
                      ))}
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={S.cardTitle}>Broker volume by month</div>
                    <div style={{ height:210, position:'relative' }}><canvas ref={refs.brVol}/></div>
                  </div>
                </div>
                <div style={S.secLabel}>Broker lanes — repeated runs (3+)</div>
                <div style={S.tableWrap}>
                  <table style={S.tbl} className="tbl">
                    <thead><tr>
                      <th style={{ ...S.th, textAlign:'left', minWidth:260 }}>Lane</th>
                      {['Runs','Avg rate','First rate','Latest rate','Change','Avg mi','Trend'].map(h=>(
                        <th key={h} style={{ ...S.th, textAlign:h==='Trend'?'left':'right' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {BR_LANES.map((l,i)=>{
                        const ch=l.lastRate-l.firstRate
                        return (
                          <tr key={i} style={i%2===0?{ background:'rgba(255,255,255,0.015)' }:{}}>
                            <td style={{ ...S.td, fontSize:12, fontWeight:500 }}>{l.lane}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:700 }}>{l.count}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{$k(l.avgRate)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{$k(l.firstRate)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{$k(l.lastRate)}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:700, color:ch>0?'#00FFCC':'#FF6B6B' }}>{(ch>0?'+':'')+$k(ch)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{Math.round(l.avgMiles)}</td>
                            <td style={S.td}><TrendBadge trend={l.trend}/></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* CYCLE */}
            {tab==='cycle'&&(
              <>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.7, marginBottom:16, maxWidth:720 }}>
                  A truck on Sunset Grown lanes runs a continuous two-revenue-leg cycle. Both the outbound SG load and the return broker load generate revenue — no empty miles between Kentucky origins and NY/MD/MA delivery markets.
                </div>
                {[{
                  boxes:[{bg:'rgba(0,255,204,0.05)',label:'Pickup 1',val:'AppHarvest / Mastronardi, Berea KY',sub:'Fresh produce loaded'},{bg:'rgba(255,255,255,0.03)',label:'Pickup 2 (2-pickup lane)',val:'District Farms, Frederick MD',sub:'Second shipper fills trailer'},{bg:'rgba(0,255,204,0.03)',label:'Delivery',val:'Wegmans DC, Rochester NY',sub:'2 drops · ~858–885 mi'}]
                },{
                  boxes:[{bg:'rgba(0,255,204,0.03)',label:'Return pickup',val:'Saputo / E. Propak / HP Hood, Batavia NY',sub:'Dairy / packaged goods'},{bg:'rgba(255,255,255,0.03)',label:'Broker freight',val:'$1,600–$1,875 / load (rising)',sub:'610 miles southbound'},{bg:'rgba(77,158,255,0.05)',label:'Return delivery',val:'Walmart DC 6097, London KY',sub:'Repositions near SG origins'}]
                }].map((route,ri)=>(
                  <div key={ri} style={{ display:'flex', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:10, overflow:'hidden', marginBottom:10 }}>
                    {route.boxes.map((box,bi)=>(
                      <div key={bi} style={{ display:'flex', flex:1 }}>
                        <div style={{ background:box.bg, padding:'12px 14px', flex:1 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{box.label}</div>
                          <div style={{ fontSize:12, fontWeight:600, color:'rgba(220,220,220,0.9)' }}>{box.val}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{box.sub}</div>
                        </div>
                        {bi<2&&<div style={{ display:'flex', alignItems:'center', padding:'0 6px', color:'rgba(255,255,255,0.2)', fontSize:16 }}>→</div>}
                      </div>
                    ))}
                  </div>
                ))}
                <div style={S.secLabel}>Round-trip economics</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
                  {[['AppHarvest direct','$2,262','avg, 638 mi'],['Berea→MD→Rochester','$3,289','avg Q1 2026, 858 mi'],['Broker return','$1,700','avg, Batavia→London KY'],['Combined / round trip','~$3,900','direct + backhaul']].map(([lbl,val,sub],i)=>(
                    <div key={i} style={{ background:i===3?'rgba(0,255,204,0.05)':'rgba(255,255,255,0.02)', border:`0.5px solid ${i===3?'rgba(0,255,204,0.2)':'rgba(255,255,255,0.06)'}`, borderRadius:8, padding:'12px 14px' }}>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>{lbl}</div>
                      <div style={{ fontSize:18, fontWeight:700, color:i===3?'#00FFCC':'rgba(220,220,220,0.9)' }}>{val}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:3 }}>{sub}</div>
                    </div>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Revenue by leg — per round trip</div>
                  <div style={{ height:140, position:'relative' }}><canvas ref={refs.cycle}/></div>
                </div>
                <div style={S.secLabel}>WPL vs CH Robinson OTR</div>
                <div style={S.tableWrap}>
                  <table style={S.tbl} className="tbl">
                    <thead><tr>
                      <th style={{ ...S.th, textAlign:'left' }}>Factor</th>
                      <th style={{ ...S.th, textAlign:'left' }}>WPL partnership</th>
                      <th style={{ ...S.th, textAlign:'left' }}>CH Robinson OTR</th>
                    </tr></thead>
                    <tbody>
                      {[['Direct shipper relationship','Contracted direct — full lane visibility','No — broker is the customer'],['Rate control','Direct negotiation with shipper','Broker margin on every load'],['Backhaul coordination','Actively managed — same corridor','Self-sourced'],['Load visibility','Full TMS access, all stop data','Limited — broker controls'],['Weekly runs now','2–3 / week confirmed volume','Market-dependent'],['Management fee','15% off gross, transparent','Varies']].map(([f,wpl,chr],i)=>(
                        <tr key={i} style={i%2===0?{ background:'rgba(255,255,255,0.015)' }:{}}>
                          <td style={{ ...S.td, fontWeight:500 }}>{f}</td>
                          <td style={{ ...S.td, color:'#00FFCC', fontWeight:500 }}>{wpl}</td>
                          <td style={{ ...S.td, color:'rgba(255,107,107,0.8)' }}>{chr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* COSTS */}
            {tab==='costs'&&(
              <>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ display:'flex', gap:4 }}>
                    {[['profit','Lane Profitability'],['targets','Cost Targets'],['sim','Simulation']].map(([id,label])=>(
                      <button key={id} className={`cost-sub-tab${costTab===id?' active':''}`} onClick={()=>setCostTab(id)}>{label}</button>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>ALL-IN CPM</div>
                      <div style={{ fontSize:18, fontWeight:800, color:allInCPM>2?'#FF6B6B':allInCPM>1.3?'#FFB84D':'#00FFCC' }}>${allInCPM.toFixed(2)}</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>TARGET</div>
                      <div style={{ fontSize:18, fontWeight:800, color:'#00FFCC' }}>{targetMargin}%</div>
                    </div>
                  </div>
                </div>

                {/* PROFIT SUB-TAB */}
                {costTab==='profit'&&(<>
                  <div style={S.card}>
                    <div style={S.cardTitle}>Operating margin by lane {driver>0?`(incl driver $${driver.toFixed(2)}/mi)`:'(equipment only — excl driver pay)'}</div>
                    <div style={{ height:310, position:'relative' }}><canvas ref={refs.costProfit}/></div>
                    <div style={{ display:'flex', gap:14, marginTop:8, fontSize:10, color:'rgba(255,255,255,0.35)' }}>
                      <span><span style={{ display:'inline-block', width:8, height:8, borderRadius:2, background:'rgba(0,255,204,0.7)', marginRight:3 }}/>≥ {targetMargin}% target</span>
                      <span><span style={{ display:'inline-block', width:8, height:8, borderRadius:2, background:'rgba(255,184,77,0.6)', marginRight:3 }}/>10–{targetMargin}%</span>
                      <span><span style={{ display:'inline-block', width:8, height:8, borderRadius:2, background:'rgba(255,107,107,0.6)', marginRight:3 }}/>&lt; 10%</span>
                    </div>
                  </div>
                  <div style={S.secLabel}>Lane P&L</div>
                  <div style={S.tableWrap}>
                    <table style={S.tbl} className="tbl">
                      <thead><tr>
                        <th style={{ ...S.th, textAlign:'left', minWidth:190 }}>Lane</th><th style={S.th}>Type</th><th style={S.th}>Loads</th>
                        <th style={S.th}>Revenue</th><th style={S.th}>Miles</th><th style={S.th}>RPM</th>
                        <th style={S.th}>Est. Cost</th><th style={S.th}>Profit</th><th style={S.th}>Margin</th>
                      </tr></thead>
                      <tbody>
                        {COST_LANES.map((l,i) => { const c=calcLane(l); return (
                          <tr key={i} style={i%2===0?{ background:'rgba(255,255,255,0.015)' }:{}}>
                            <td style={{ ...S.td, textAlign:'left', fontWeight:500, fontSize:10 }}>{l.lane}</td>
                            <td style={S.td}><span style={{ fontSize:9, padding:'1px 5px', borderRadius:3, background:l.type==='SG'?'rgba(0,255,204,0.08)':'rgba(77,158,255,0.08)', color:l.type==='SG'?'#00FFCC':'#4D9EFF' }}>{l.type==='SG'?'Direct':'Broker'}</span></td>
                            <td style={{ ...S.td, ...S.tdr }}>{l.ct}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:600 }}>{$k(l.rev)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{l.mi}</td>
                            <td style={{ ...S.td, ...S.tdr }}>${(l.rev/l.mi).toFixed(2)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{$k(c.cost)}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:700, color:c.profit>0?'#00FFCC':'#FF6B6B' }}>{c.profit>0?$k(c.profit):`(${$k(Math.abs(c.profit))})`}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:800, color:mc(c.margin) }}>{c.margin}%</td>
                          </tr>);
                        })}
                      </tbody>
                    </table>
                  </div>
                </>)}

                {/* TARGETS SUB-TAB */}
                {costTab==='targets'&&(<>
                  <div style={{ ...S.card, display:'flex', alignItems:'center', gap:14 }}>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap' }}>Target margin</span>
                    <input type="range" min={15} max={35} value={targetMargin} onChange={e=>setTargetMargin(Number(e.target.value))} style={{ flex:1, accentColor:'#00FFCC', cursor:'pointer' }} />
                    <span style={{ fontSize:22, fontWeight:800, color:'#00FFCC', minWidth:50, textAlign:'right' }}>{targetMargin}%</span>
                  </div>
                  <div style={S.secLabel}>Max all-in CPM and driver pay budget per lane to hit {targetMargin}%</div>
                  <div style={S.tableWrap}>
                    <table style={S.tbl} className="tbl">
                      <thead><tr>
                        <th style={{ ...S.th, textAlign:'left', minWidth:190 }}>Lane</th><th style={S.th}>Revenue</th><th style={S.th}>Miles</th>
                        <th style={S.th}>Max Total Cost</th><th style={S.th}>Max All-In CPM</th>
                        <th style={S.th}>Equip Cost</th><th style={S.th}>Driver Budget</th><th style={S.th}>Max $/mi</th><th style={S.th}>Status</th>
                      </tr></thead>
                      <tbody>
                        {COST_LANES.map((l,i) => { const c=calcLane(l); const viable=c.drvBudget>0; return (
                          <tr key={i} style={i%2===0?{ background:'rgba(255,255,255,0.015)' }:{}}>
                            <td style={{ ...S.td, textAlign:'left', fontWeight:500, fontSize:10 }}>{l.lane}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:600 }}>{$k(l.rev)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{l.mi}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{$k(c.tgtCost)}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:700, color:'#00FFCC' }}>${c.tgtCPM.toFixed(2)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{$k((allInCPM-driverCPM)*l.mi)}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:600, color:viable?'#00FFCC':'#FF6B6B' }}>{viable?$k(c.drvBudget):`(${$k(Math.abs(c.drvBudget))})`}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:600, color:viable?'#00FFCC':'#FF6B6B' }}>{viable?`$${c.drvCPM.toFixed(2)}/mi`:'—'}</td>
                            <td style={S.td}><span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3,
                              background:c.drvBudget>500?'rgba(0,255,204,0.1)':viable?'rgba(255,184,77,0.1)':'rgba(255,107,107,0.1)',
                              color:c.drvBudget>500?'#00FFCC':viable?'#FFB84D':'#FF6B6B' }}>{c.drvBudget>500?'STRONG':viable?'TIGHT':'OVER'}</span></td>
                          </tr>);
                        })}
                      </tbody>
                    </table>
                  </div>
                </>)}

                {/* SIMULATION SUB-TAB */}
                {costTab==='sim'&&(<>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div style={S.card}>
                      <div style={S.cardTitle}>Variable Costs</div>
                      {[
                        ['Fuel price', fuelPPG, setFuelPPG, '/gal', 0.01],
                        ['Fuel efficiency', mpg, setMPG, 'MPG', 0.1],
                        ['Tolls', toll, setToll, '/mi', 0.01],
                        ['DEF fluid', def_, setDef, '/mi', 0.001],
                        ['Reefer fuel', reefer, setReefer, '/mi', 0.001],
                        ['Maintenance', maint, setMaint, '/mi', 0.01],
                        ['Driver pay', driver, setDriver, '/mi', 0.01],
                      ].map(([label, val, setter, unit, step]) => (
                        <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{label}</span>
                          <div className="cost-stepper">
                            <button className="stepper-btn minus" onClick={()=>setter(v=>Math.max(0,Math.round((v-step)*1000)/1000))}>−</button>
                            <input type="number" value={val} onChange={e=>setter(parseFloat(e.target.value)||0)} step={step} min={0}
                              style={{ width:64, padding:'5px 6px', background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:0, color:'#fff', fontSize:13, fontFamily:'inherit', textAlign:'center', fontVariantNumeric:'tabular-nums' }} />
                            <button className="stepper-btn plus" onClick={()=>setter(v=>Math.round((v+step)*1000)/1000)}>+</button>
                            <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginLeft:6, minWidth:28 }}>{unit}</span>
                          </div>
                        </div>
                      ))}
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'rgba(220,220,220,0.8)' }}>Total Variable CPM</span>
                        <span style={{ fontSize:13, fontWeight:700, color:'#00FFCC' }}>${varCPM.toFixed(2)}/mi</span>
                      </div>
                    </div>
                    <div style={S.card}>
                      <div style={S.cardTitle}>Fixed Costs (monthly)</div>
                      {[
                        ['Truck payment', truckPmt, setTruckPmt, '/mo', 1],
                        ['Trailer payment', trailerPmt, setTrailerPmt, '/mo', 1],
                        ['Truck insurance', truckIns, setTruckIns, '/mo', 1],
                        ['Trailer insurance', trailerIns, setTrailerIns, '/mo', 1],
                      ].map(([label, val, setter, unit, step]) => (
                        <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{label}</span>
                          <div className="cost-stepper">
                            <button className="stepper-btn minus" onClick={()=>setter(v=>Math.max(0,v-step*50))}>−</button>
                            <input type="number" value={val} onChange={e=>setter(parseFloat(e.target.value)||0)} step={step} min={0}
                              style={{ width:72, padding:'5px 6px', background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:0, color:'#fff', fontSize:13, fontFamily:'inherit', textAlign:'center', fontVariantNumeric:'tabular-nums' }} />
                            <button className="stepper-btn plus" onClick={()=>setter(v=>v+step*50)}>+</button>
                            <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginLeft:6, minWidth:24 }}>{unit}</span>
                          </div>
                        </div>
                      ))}
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize:12, fontWeight:600, color:'rgba(220,220,220,0.7)' }}>Total fixed/mo</span>
                        <span style={{ fontSize:14, fontWeight:700, color:'#FFB84D' }}>{$k(fixedMo)}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0' }}>
                        <div>
                          <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Miles / month</span>
                          <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)', marginTop:1 }}>controls fixed cost spread</div>
                        </div>
                        <div className="cost-stepper">
                          <button className="stepper-btn minus" onClick={()=>setMilesMo(v=>Math.max(1000,v-500))}>−</button>
                          <input type="number" value={milesMo} onChange={e=>setMilesMo(parseFloat(e.target.value)||0)} step={500} min={0}
                            style={{ width:72, padding:'5px 6px', background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:0, color:'#fff', fontSize:13, fontFamily:'inherit', textAlign:'center', fontVariantNumeric:'tabular-nums' }} />
                          <button className="stepper-btn plus" onClick={()=>setMilesMo(v=>v+500)}>+</button>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0' }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'rgba(220,220,220,0.8)' }}>Fixed CPM</span>
                        <span style={{ fontSize:13, fontWeight:700, color:'#FFB84D' }}>${fixedCPM.toFixed(2)}/mi</span>
                      </div>
                      <div style={{ background:'rgba(0,255,204,0.04)', border:'0.5px solid rgba(0,255,204,0.15)', borderRadius:6, padding:'12px 14px', marginTop:10 }}>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:4, letterSpacing:'0.06em', fontWeight:700 }}>ALL-IN COST PER MILE</div>
                        <div style={{ fontSize:26, fontWeight:800, color:allInCPM>2?'#FF6B6B':allInCPM>1.3?'#FFB84D':'#00FFCC' }}>${allInCPM.toFixed(2)}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:3 }}>Variable ${varCPM.toFixed(2)} + Fixed ${fixedCPM.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'6px 0 8px' }}>
                    <div style={S.secLabel}>Lane impact at ${allInCPM.toFixed(2)}/mi all-in</div>
                    <button style={{ padding:'5px 14px', borderRadius:5, border:'0.5px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:10, cursor:'pointer', fontFamily:'inherit' }} onClick={resetCosts}>Reset to WPL Defaults</button>
                  </div>
                  <div style={S.tableWrap}>
                    <table style={S.tbl} className="tbl">
                      <thead><tr>
                        <th style={{ ...S.th, textAlign:'left', minWidth:180 }}>Lane</th><th style={S.th}>Revenue</th><th style={S.th}>Miles</th>
                        <th style={S.th}>Fuel</th><th style={S.th}>Toll</th><th style={S.th}>Maint</th><th style={S.th}>Fixed</th>
                        {driver>0&&<th style={S.th}>Driver</th>}
                        <th style={S.th}>Total Cost</th><th style={S.th}>Profit</th><th style={S.th}>Margin</th>
                      </tr></thead>
                      <tbody>
                        {COST_LANES.map((l,i) => { const c=calcLane(l); return (
                          <tr key={i} style={i%2===0?{ background:'rgba(255,255,255,0.015)' }:{}}>
                            <td style={{ ...S.td, textAlign:'left', fontWeight:500, fontSize:10 }}>{l.lane}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:600 }}>{$k(l.rev)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{l.mi}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{$k(c.fuelEst)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{$k(c.tollEst)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{$k(c.maintEst)}</td>
                            <td style={{ ...S.td, ...S.tdr }}>{$k(c.fixEst)}</td>
                            {driver>0&&<td style={{ ...S.td, ...S.tdr }}>{$k(c.drvEst)}</td>}
                            <td style={{ ...S.td, ...S.tdr, fontWeight:600 }}>{$k(c.cost)}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:700, color:c.profit>0?'#00FFCC':'#FF6B6B' }}>{c.profit>0?$k(c.profit):`(${$k(Math.abs(c.profit))})`}</td>
                            <td style={{ ...S.td, ...S.tdr, fontWeight:800, color:mc(c.margin) }}>{c.margin}%</td>
                          </tr>);
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:6 }}>
                    Variable costs include 5% aggressive cushion. All figures derived from WPL operational data: Fuel Purchase, EZPass, FleetUp telematics, Asset Tracker, Insurance.
                  </div>
                </>)}
              </>
            )}

          </div>
        </main>
      </div>
    </>
  )
}

const VolumeIcon = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="10" width="3" height="8" rx="1"/><rect x="8" y="6" width="3" height="12" rx="1"/><rect x="14" y="2" width="3" height="16" rx="1"/></svg>
const RateIcon   = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3,15 8,9 12,12 17,5"/></svg>
const LaneIcon   = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h12M4 10h12M4 16h12"/></svg>
const BrokerIcon = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg>
const CycleIcon  = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 8A7 7 0 0 0 5.3 5.3L3 8"/><path d="M3 12a7 7 0 0 0 11.7 2.7L17 12"/><polyline points="3,8 3,3 8,3"/><polyline points="17,12 17,17 12,17"/></svg>
const CostIcon   = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="10" r="7"/><path d="M10 6v8"/><path d="M12 8.5c0-1-0.9-1.5-2-1.5s-2 .5-2 1.5 .9 1.3 2 1.5 2 .5 2 1.5-.9 1.5-2 1.5-2-.5-2-1.5"/></svg>

const S = {
  shell:      { display:'flex', height:'100vh', overflow:'hidden', background:'#000' },
  sidebar:    { width:216, background:'rgba(255,255,255,0.02)', borderRight:'0.5px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', flexShrink:0 },
  logoWrap:   { display:'flex', alignItems:'center', gap:10, padding:'18px 14px 14px', borderBottom:'0.5px solid rgba(255,255,255,0.06)' },
  brandName:  { fontSize:14, fontWeight:700, color:'rgba(220,220,220,0.9)', letterSpacing:'-0.2px' },
  brandSub:   { fontSize:10, color:'#00FFCC', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' },
  nav:        { flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2 },
  navBtn:     { display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:7, border:'none', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:13, cursor:'pointer', textAlign:'left', width:'100%', fontFamily:'inherit', transition:'all 0.15s' },
  navActive:  { background:'rgba(0,255,204,0.08) !important', color:'#00FFCC' },
  sideFooter: { padding:'10px 12px 14px', borderTop:'0.5px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', gap:4 },
  dataTag:    { fontSize:10, color:'rgba(255,255,255,0.2)', lineHeight:1.5 },
  logoutBtn:  { marginTop:6, padding:'6px 10px', background:'transparent', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:6, color:'rgba(255,255,255,0.3)', fontSize:11, cursor:'pointer', textAlign:'left', fontFamily:'inherit' },
  main:       { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#000' },
  header:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', background:'rgba(255,255,255,0.015)', borderBottom:'0.5px solid rgba(255,255,255,0.07)', flexShrink:0 },
  headerTitle:{ fontSize:15, fontWeight:700, color:'rgba(220,220,220,0.9)' },
  headerSub:  { fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 },
  kpiRow:     { display:'flex', gap:20 },
  miniKpi:    { textAlign:'right' },
  miniKpiVal: { fontSize:15, fontWeight:700, color:'rgba(220,220,220,0.9)' },
  miniKpiLbl: { fontSize:10, color:'rgba(255,255,255,0.3)' },
  content:    { flex:1, overflowY:'auto', padding:20 },
  grid2:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 },
  card:       { background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:8, padding:14 },
  cardTitle:  { fontSize:12, fontWeight:500, color:'rgba(220,220,220,0.7)', marginBottom:10 },
  secLabel:   { fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'14px 0 8px' },
  tableWrap:  { overflowX:'auto', background:'rgba(255,255,255,0.015)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:8 },
  tbl:        { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:         { fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', padding:'7px 10px', borderBottom:'0.5px solid rgba(255,255,255,0.07)', whiteSpace:'nowrap', letterSpacing:'0.04em', textTransform:'uppercase', background:'rgba(255,255,255,0.02)' },
  thr:        { textAlign:'right' },
  td:         { padding:'6px 10px', borderBottom:'0.5px solid rgba(255,255,255,0.04)', verticalAlign:'middle', color:'rgba(220,220,220,0.8)' },
  tdr:        { textAlign:'right', fontVariantNumeric:'tabular-nums' },
  legend:     { display:'flex', flexWrap:'wrap', gap:12, marginTop:8, fontSize:11, color:'rgba(255,255,255,0.4)' },
  legItem:    { display:'flex', alignItems:'center', gap:5 },
  legSw:      { width:10, height:10, borderRadius:2, flexShrink:0 },
}
