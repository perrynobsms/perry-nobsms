import { NextResponse } from "next/server"
export async function POST(req: Request){
  const { service, country } = await req.json()
  const KEY = process.env.FIVESIM_API_KEY!
  const r = await fetch(`https://5sim.net/v1/user/buy/activation/${country||'any'}/any/${service}`,{headers:{Authorization:`Bearer ${KEY}`,Accept:'application/json'}})
  const d = await r.json()
  return NextResponse.json(d,{status:r.status})
}
export async function GET(req: Request){
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const KEY = process.env.FIVESIM_API_KEY!
  const r = await fetch(`https://5sim.net/v1/user/check/${id}`,{headers:{Authorization:`Bearer ${KEY}`}})
  const d = await r.json()
  return NextResponse.json(d,{status:r.status})
}
