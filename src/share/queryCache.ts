import { QueryCache as QC } from '../core/index'
import { cloneDeepUnref } from './utils'
import type {
  DefaultError,
  Query,
  QueryFilters,
  WithRequired,
} from '../core/index'
import type { MaybeRefDeep } from './types'

export class QueryCache extends QC {
  find<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData>(
    filters: MaybeRefDeep<WithRequired<QueryFilters, 'queryKey'>>,
  ): Query<TQueryFnData, TError, TData> | undefined {
    return super.find(cloneDeepUnref(filters))
  }

  findAll(filters: MaybeRefDeep<QueryFilters> = {}): Array<Query> {
    return super.findAll(cloneDeepUnref(filters))
  }
}
