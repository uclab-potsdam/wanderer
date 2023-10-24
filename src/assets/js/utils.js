function idgen() {
  return `n${(Math.random() + 1).toString(36).substring(2)}`
}

function lineIntersect(line1, line2) {
  const denom =
    (line2[1].y - line2[0].y) * (line1[1].x - line1[0].x) -
    (line2[1].x - line2[0].x) * (line1[1].y - line1[0].y)
  const numeA =
    (line2[1].x - line2[0].x) * (line1[0].y - line2[0].y) -
    (line2[1].y - line2[0].y) * (line1[0].x - line2[0].x)
  const numeB =
    (line1[1].x - line1[0].x) * (line1[0].y - line2[0].y) -
    (line1[1].y - line1[0].y) * (line1[0].x - line2[0].x)

  if (denom === 0) return false

  const uA = numeA / denom
  const uB = numeB / denom

  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    const x = line1[0].x + uA * (line1[1].x - line1[0].x)
    const y = line1[0].y + uA * (line1[1].y - line1[0].y)
    return { x, y }
  }
  return false
}

export { idgen, lineIntersect }
