/**
 * 첨부 사진을 저장하기 좋게 줄임: 긴 변 1280px, JPEG 82%.
 * 휴대폰 원본(수 MB)을 그대로 넣으면 브라우저 저장소(약 5MB)를 넘겨 저장이 안 되기 때문.
 * 비율은 그대로 유지.
 */
export function shrinkImage(file: File, maxSide = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
      const w = Math.round(img.naturalWidth * s)
      const h = Math.round(img.naturalHeight * s)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', quality))
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}
