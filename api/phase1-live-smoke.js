const TOKEN='lha-phase1-live-smoke-8abb4b';

export default async function handler(req,res){
  res.setHeader('cache-control','no-store');
  if(process.env.VERCEL_ENV!=='preview') return res.status(404).json({ok:false,error:'not_found'});
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'method_not_allowed'});
  if(String(req.query?.token||'')!==TOKEN) return res.status(403).json({ok:false,error:'forbidden'});

  const response=await fetch('https://libyahoopsacademy.com/api/order-notification',{
    method:'POST',
    headers:{'content-type':'application/json','accept':'application/json'},
    body:JSON.stringify({
      orderNumber:'LHA00000000',
      message:'Phase 1 integration smoke test - invalid SKU - do not fulfill',
      customerName:'Phase One Smoke',
      customerEmail:'phase1-smoke@example.com',
      canonicalCurrency:'USD',
      canonicalShippingTotal:'0',
      syncPayload:{
        idempotencyKey:'123e4567-e89b-42d3-a456-426614174000',
        email:'phase1-smoke@example.com',
        currency:'USD',
        paymentMethod:'cash_on_delivery',
        shipping:{firstName:'Phase',lastName:'Smoke',line1:'1 Test Street',city:'Tripoli',country:'LY',locale:'en'},
        items:[{productId:'smoke-test',variantId:'smoke-test:DOES-NOT-EXIST',sku:'DOES-NOT-EXIST',quantity:1}]
      }
    }),
    signal:AbortSignal.timeout(20000)
  });
  const text=await response.text();
  let body=null;
  try{body=text?JSON.parse(text):null}catch{body={raw:text.slice(0,1000)}}
  return res.status(200).json({upstreamStatus:response.status,upstreamBody:body});
}
