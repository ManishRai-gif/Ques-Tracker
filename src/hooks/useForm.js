import { useState, useMemo } from 'react'
import { isValidUrl } from '../utils/helpers'

export function useForm(init, rules) {
  const [vals, setVals]       = useState(init)
  const [touched, setTouched] = useState({})

  const errors = useMemo(() => {
    const e = {}
    Object.keys(rules).forEach(f => {
      const r = rules[f], v = vals[f] || ''
      if      (r.required && !v.trim())                        e[f] = 'This field is required'
      else if (r.email && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) e[f] = 'Enter a valid email'
      else if (r.min && v && v.length < r.min)                 e[f] = `Min ${r.min} characters`
      else if (r.max && v && v.length > r.max)                 e[f] = `Max ${r.max} characters`
      else if (r.url  && v && !isValidUrl(v))                  e[f] = 'Enter a valid URL'
      else if (r.pattern && v && !r.pattern.test(v))           e[f] = r.msg || 'Invalid format'
    })
    return e
  }, [vals, rules])

  const isValid  = Object.keys(errors).length === 0
  const set      = (f, v) => setVals(p => ({ ...p, [f]: v }))
  const touchAll = () =>
    setTouched(Object.keys(rules).reduce((a, k) => ({ ...a, [k]: true }), {}))
  const reset    = () => { setVals(init); setTouched({}) }
  const err      = (f) => touched[f] ? errors[f] : undefined

  return { vals, set, errors, err, isValid, touchAll, reset }
}
