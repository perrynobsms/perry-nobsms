'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const PRICES: any = { signal: 600, whatsapp: 1600, tiktok: 1000, telegram: 1800, default: 1500 }
const EXTRA = 25
const SERVICES = [
  {id:'whatsapp',name:'WhatsApp',code:'whatsapp'},
  {id:'telegram',name:'Telegram',code:'telegram'},
  {id:'signal',name:'Signal',code:'signal'},
  {id:'tiktok',name:'TikTok',code:'tiktok'},
  {id:'facebook',name:'Facebook',code:'facebook'},
  {id:'google',name:'Google',code:'google'},
  {id:'instagram',name:'Instagram',code:'instagram'},
  {id:'twitter',name:'Twitter',code:'twitter'},
]
export default function Home(){
  const [bal,setBal]=useState(0)
  const [email,setEmail]=useState('')
  const [search,setSearch]=useState('')
  const [load,setLoad]=useState('')
  const [active,setActive]=useState<any>(null)
  const [otp,setOtp]=useState('')
  useEffect(()=>{ const s=localStorage.getItem('perry_email'); if(s){ setEmail(s); getBal(s)}},[])
  async function getBal(em:string){ const {data}=await supabase.from('wallets').select('balance').eq('email',em).single(); if(data) setBal(data.balance) }
  async function buy(svc:string){
    if(!email){alert('Enter email');return}
    const price=PRICES[svc]||PRICES.default
    if(bal<price){alert(`Need ₦${price}, you have ₦${bal}`);return}
    setLoad(svc)
    try{
      const r=await fetch('/api/buy',{method:'POST',body:JSON.stringify({service:svc,country:'any'})})
      const d=await r.json()
      if(!d.phone){alert(JSON.stringify(d));setLoad('');return}
      const nb=bal-price
      await supabase.from('wallets').upsert({email,balance:nb})
      setBal(nb)
      await supabase.from('orders').insert({user_id:email,service:svc,number:d.phone,price,status:'waiting'})
      setActive(d)
    }catch(e){alert('fail')}
    setLoad('')
  }
  async function check(){
    if(!active) return
    const r=await fetch(`/api/buy?id=${active.id}`)
    const d=await r.json()
    if(d.sms?.[0]){ setOtp(d.sms[0].code); const nb=bal-EXTRA; await supabase.from('wallets').update({balance:nb}).eq('email',email); setBal(nb) }
    else alert('No OTP yet')
  }
  async function login(){
    if(!email) return
    localStorage.setItem('perry_email',email)
    const {data}=await supabase.from('wallets').select('*').eq('email',email).single()
    if(!data){ await supabase.from('wallets').insert({email,balance:0}); setBal(0) } else setBal(data.balance)
  }
  const list=SERVICES.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()))
  return(
    <div className="min-h-screen bg-black text-white p-4">
      <div className="sticky top-0 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between mb-4">
        <div><div className="text-xs text-zinc-400">WALLET</div><div className="text-2xl font-bold text-green-400">₦{bal}</div></div>
        <div className="text-right text-xs">Extra OTP ₦{EXTRA}<br/>PerryNoSMS</div>
      </div>
      <div className="flex gap-2 mb-4"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email to login wallet" className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2"/><button onClick={login} className="bg-white text-black px-4 rounded-lg font-bold">Login</button></div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search service..." className="w-full bg-zinc-900 border rounded-xl px-4 py-3 mb-4"/>
      {active && <div className="bg-green-900/20 border border-green-700 rounded-xl p-4 mb-4"><div>Number: <b>{active.phone}</b></div><div className="flex gap-2 mt-2"><button onClick={check} className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold">Check OTP</button><span className="font-mono">{otp?`OTP: ${otp}`:'Waiting...'}</span></div></div>}
      <div className="grid gap-3">{list.map(s=><div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center"><div><div className="font-bold">{s.name}</div><div className="text-xs text-zinc-400">₦{PRICES[s.id]||PRICES.default} + ₦{EXTRA} per extra</div></div><button disabled={!!load} onClick={()=>buy(s.code)} className="bg-white text-black px-5 py-2 rounded-full font-bold">{load===s.code?'Buying...':'BUY'}</button></div>)}</div>
    </div>
  )
}
