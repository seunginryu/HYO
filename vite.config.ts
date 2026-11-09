import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: https://<id>.github.io/<REPO_NAME>/
// 저장소 이름이 정해지면 여기만 바꾸면 됩니다.
const REPO_NAME = 'HYO'

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
})
