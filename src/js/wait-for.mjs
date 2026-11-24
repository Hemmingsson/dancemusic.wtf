// Bound polling so blocked embeds and unavailable videos can fail cleanly.
export function waitFor(predicate, { timeout = 15000, interval = 100 } = {}) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout
    const poll = () => {
      try {
        const value = predicate()
        if (value) return resolve(value)
        if (Date.now() >= deadline) throw new Error('YouTube did not become ready in time')
        setTimeout(poll, interval)
      } catch (error) { reject(error) }
    }
    poll()
  })
}
