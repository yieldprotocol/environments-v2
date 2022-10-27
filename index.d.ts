export {};

declare global {
    interface Map<K, V> {
        getOrThrow(key: K): V
    }
}
