function idgen() {
  return `n${(Math.random() + 1).toString(36).substring(2)}`
}

export { idgen }
