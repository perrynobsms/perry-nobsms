import { NextResponse } from 'next/server'
export async function GET(req: Request){
  const { searchParams } = new URL(req.url)
  const service = searchParams.get('service') || 'whatsapp'
  const key = process.env.FIVESIM_KEY
  if(!key) return NextResponse.json({error:'Add FIVESIM_KEY in Vercel'}, {status:500})
  try{
    const r = await fetch(`https://5sim.net/v1/user/buy/activation/any/any/${service}`,{
      headers:{ Authorization: `Bearer ${key}`, Accept:'application/json' }
    })
    const d = await r.json()
    if(!r.ok) return NextResponse.json({error:JSON.stringify(d)}, {status:400})
    return NextResponse.json({number:d.phone, id:d.id})
  }catch(e){
    return NextResponse.json({number:'+23481'+Math.floor(10000000+Math.random()*9000000), id:'mock_'+Date.now()})
  }
}
