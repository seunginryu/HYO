/** public/ 아래 파일 경로 → 배포 base(/hyo/)를 붙인 URL */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
