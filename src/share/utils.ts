import type { MaybeRefDeep } from './types';
import { isRef, unref } from '@vue/composition-api';

export const VUE_QUERY_CLIENT = 'VUE_QUERY_CLIENT'

export function getClientKey(key?: string) {
  const suffix = key ? `:${key}` : ''
  return `${VUE_QUERY_CLIENT}${suffix}`
}

export function updateState(
  state: Record<string, any>,
  update: Record<string, any>,
): void {
  Object.keys(state).forEach((key) => {
    state[key] = update[key]
  })
}

// Helper function for cloning deep objects where
// the level and key is provided to the callback function.
function _cloneDeep<T>(
  value: MaybeRefDeep<T>,
  customize?: (
    val: MaybeRefDeep<T>,
    key: string,
    level: number,
  ) => T | undefined,
  currentKey: string = '',
  currentLevel: number = 0,
): T {
  if (customize) {
    const result = customize(value, currentKey, currentLevel)
    if (result === undefined && isRef(value)) {
      return result as T
    }
    if (result !== undefined) {
      return result
    }
  }

  if (Array.isArray(value)) {
    return value.map((val, index) =>
      _cloneDeep(val, customize, String(index), currentLevel + 1),
    ) as unknown as T
  }

  if (typeof value === 'object' && isPlainObject(value)) {
    const entries = Object.entries(value).map(([key, val]) => [
      key,
      _cloneDeep(val, customize, key, currentLevel + 1),
    ])
    return Object.fromEntries(entries)
  }

  return value as T
}

export function cloneDeep<T>(
  value: MaybeRefDeep<T>,
  customize?: (
    val: MaybeRefDeep<T>,
    key: string,
    level: number,
  ) => T | undefined,
): T {
  return _cloneDeep(value, customize)
}

export function cloneDeepUnref<T>(
  obj: MaybeRefDeep<T>,
  unrefGetters = false,
): T {
  return cloneDeep(obj, (val, key, level) => {
    // Check if we're at the top level and the key is 'queryKey'
    //
    // If so, take the recursive descent where we resolve
    // getters to values as well as refs.
    if (level === 1 && key === 'queryKey') {
      return cloneDeepUnref(val, true)
    }

    // Resolve getters to values if specified.
    if (unrefGetters && isFunction(val)) {
      // Cast due to older TS versions not allowing calling
      // on certain intersection types.
      return cloneDeepUnref((val as Function)(), unrefGetters)
    }

    // Unref refs and continue to recurse into the value.
    if (isRef(val)) {
      return cloneDeepUnref(unref(val), unrefGetters)
    }

    return undefined
  })
}

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
function isPlainObject(value: unknown): value is Object {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === null || prototype === Object.prototype
}

function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

export function shouldThrowError<T extends (...args: Array<any>) => boolean>(
  throwOnError: boolean | T | undefined,
  params: Parameters<T>,
): boolean {
  // Allow throwOnError function to override throwing behavior on a per-error basis
  if (typeof throwOnError === 'function') {
    return throwOnError(...params)
  }

  return !!throwOnError
}
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
