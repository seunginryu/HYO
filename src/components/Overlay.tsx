import { useEffect, useState, type ReactNode } from 'react'
import { CloseButton } from './Card'
import './Overlay.css'

/** 가운데 모달 (C-2-1) */
export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="ovl ovl--modal" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <CloseButton className="modal__close" onClick={onClose} />
        {children}
      </div>
    </div>
  )
}

/** 바텀시트: 아래에서 올라옴. 키보드가 뜨면 키보드 위로 올라감 (C-3-3) */
export function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const [kb, setKb] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!open || !vv) return
    const update = () => setKb(Math.max(0, window.innerHeight - vv.height - vv.offsetTop))
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [open])
  if (!open) return null
  return (
    <div className="ovl ovl--sheet" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal style={{ bottom: kb }} onClick={(e) => e.stopPropagation()}>
        <CloseButton className="sheet__close" onClick={onClose} />
        {children}
      </div>
    </div>
  )
}
