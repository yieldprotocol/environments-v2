Map.prototype.getOrThrow = function <K, V>(key: K): V {
  const val = this.get(key)
  if (!val) {
    throw new Error(`key ${key} doesn't exist in the map`)
  }
  return val
}
