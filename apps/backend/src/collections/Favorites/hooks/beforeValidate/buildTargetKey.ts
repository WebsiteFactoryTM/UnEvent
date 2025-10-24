import { CollectionBeforeValidateHook } from 'payload'
import { Kind } from '../..'

export const buildTargetKeyHook: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data?.kind || !data?.target) return
  const rel = data.target as { relationTo: Kind; value: number | string }
  const kind = (data.kind as Kind) || (rel?.relationTo as Kind)
  const id = typeof rel === 'object' && rel?.value != null ? rel.value : rel
  data.kind = kind
  data.targetKey = buildTargetKey(kind, id as number | string)
}

function buildTargetKey(kind: Kind, id: number | string) {
  return `${kind}:${Number(id)}`
}
