// based on
// https://gist.github.com/steveruizok/6da65c97e4f9caf8a4bde5d475da1387
// https://gist.github.com/steveruizok/9f02b0be4f852cebf699bb9d9bd4c833

/**
 * Get the intersection points between a line segment and a rectangle with rounded corners.
 * @param x0 The x-axis coordinate of the segment's starting point.
 * @param y0 The y-axis coordinate of ththe segment's ending point.
 * @param x1 The delta-x of the ray.
 * @param y1 The delta-y of the ray.
 * @param x The x-axis coordinate of the rectangle.
 * @param y The y-axis coordinate of the rectangle.
 * @param w The width of the rectangle.
 * @param h The height of the rectangle.
 * @param r The corner radius of the rectangle.
 */
export function getLineRoundedRectangleIntersection(x0, y0, x1, y1, x, y, w, h, r) {
  const mx = x + w,
    my = y + h,
    rx = x + r,
    ry = y + r,
    mrx = x + w - r,
    mry = y + h - r

  const segments = [
    [x, mry, x, ry, x, y],
    [rx, y, mrx, y, mx, y],
    [mx, ry, mx, mry, mx, my],
    [mrx, my, rx, my, x, my]
  ]

  const corners = [
    [rx, ry, Math.PI, Math.PI * 1.5],
    [mrx, ry, Math.PI * 1.5, Math.PI * 2],
    [mrx, mry, 0, Math.PI * 0.5],
    [rx, mry, Math.PI * 0.5, Math.PI]
  ]

  let points = []

  segments.forEach((segment, i) => {
    const [px0, py0, px1, py1] = segment
    const [cx, cy, as, ae] = corners[i]

    getSegmentCircleIntersections(cx, cy, r, x0, y0, x1, y1)
      .filter((pt) => {
        const pointAngle = normalizeAngle(getAngle(cx, cy, pt[0], pt[1]))
        return pointAngle > as && pointAngle < ae
      })
      .forEach((point) => points.push({ point, anchor: i * 2 + 1 }))

    const segmentInt = getSegmentSegmentIntersection(x0, y0, x1, y1, px0, py0, px1, py1)

    if (segmentInt) {
      points.push({ point: segmentInt, anchor: i * 2 })
    }
  })

  return points
}

// Helpers ----------------------------------------------------------

export function getSegmentSegmentIntersection(x0, y0, x1, y1, x2, y2, x3, y3) {
  const denom = (y3 - y2) * (x1 - x0) - (x3 - x2) * (y1 - y0)
  const numeA = (x3 - x2) * (y0 - y2) - (y3 - y2) * (x0 - x2)
  const numeB = (x1 - x0) * (y0 - y2) - (y1 - y0) * (x0 - x2)

  if (denom === 0) {
    if (numeA === 0 && numeB === 0) {
      return undefined // Colinear
    }
    return undefined // Parallel
  }

  const uA = numeA / denom
  const uB = numeB / denom

  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return [x0 + uA * (x1 - x0), y0 + uA * (y1 - y0)]
  }

  return undefined // No intersection
}

export function normalizeAngle(radians) {
  return radians - Math.PI * 2 * Math.floor(radians / (Math.PI * 2))
}

export function getAngle(x0, y0, x1, y1) {
  return Math.atan2(y1 - y0, x1 - x0)
}

export function getSegmentCircleIntersections(cx, cy, r, x0, y0, x1, y1) {
  var b,
    c,
    d,
    u1,
    u2,
    ret,
    retP1,
    retP2,
    v1 = [x1 - x0, y1 - y0],
    v2 = [x0 - cx, y0 - cy]

  b = v1[0] * v2[0] + v1[1] * v2[1]
  c = 2 * (v1[0] * v1[0] + v1[1] * v1[1])
  b *= -2
  d = Math.sqrt(b * b - 2 * c * (v2[0] * v2[0] + v2[1] * v2[1] - r * r))
  if (isNaN(d)) {
    // no intercept
    return []
  }
  u1 = (b - d) / c // these represent the unit distance of point one and two on the line
  u2 = (b + d) / c
  retP1 = [] // return points
  retP2 = []
  ret = [] // return array

  if (u1 <= 1 && u1 >= 0) {
    // add point if on the line segment
    retP1[0] = x0 + v1[0] * u1
    retP1[1] = y0 + v1[1] * u1
    ret[0] = retP1
  }

  if (u2 <= 1 && u2 >= 0) {
    // second add point if on the line segment
    retP2[0] = x0 + v1[0] * u2
    retP2[1] = y0 + v1[1] * u2
    ret[ret.length] = retP2
  }

  return ret
}
