export function deepMerge(source, other) {
  const out = { ...source }
  for (const key in other) {
    const value = other[key]
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = deepMerge(out[key], value)
    } else {
      out[key] = value
    }
  }
  return out
}
