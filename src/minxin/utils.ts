const obj = {
  i: 0
}
export const createId = function() {
  const e = 12
  const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const a = t.length
  let n = ''
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a))
  return `$${n}_${++obj.i}`
}


export const fnBindThis = (obj: any,  key: string, ctx: any, argCtx?: boolean) => {
  const fn = obj?.[key]
  if(typeof fn === 'function') {{
    if(argCtx){
      obj[key] = fn.bind(ctx, argCtx)
    } else {
      obj[key] = fn.bind(ctx)
    }
  }}
  return obj
}
