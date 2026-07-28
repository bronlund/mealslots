import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { encodeSetupPayload, looksLikeSetupPayload } from '../../data/qr'

interface QrShowModalProps {
  open: boolean
  /** Setup JSON to encode; regenerated each time the modal opens. */
  getJson: () => string
  onClose: () => void
}

export function QrShowModal({ open, getJson, onClose }: QrShowModalProps) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setError(false)
    async function render() {
      try {
        const payload = await encodeSetupPayload(getJson())
        // Loaded on demand — QR sharing shouldn't weigh down app startup.
        const QRCode = (await import('qrcode')).default
        if (cancelled || canvasRef.current == null) return
        await QRCode.toCanvas(canvasRef.current, payload, {
          errorCorrectionLevel: 'L',
          margin: 2,
          width: 288,
          color: { dark: '#3e3527', light: '#fbf7ec' },
        })
      } catch {
        if (!cancelled) setError(true)
      }
    }
    void render()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Modal open={open} onClose={onClose} label={t('settings.showQr')}>
      <div className="flex flex-col items-center gap-3">
        <h3 className="font-display text-lg font-bold text-gold-deep">{t('settings.showQr')}</h3>
        {error ? (
          <p role="alert" className="text-center font-body text-sm text-danger">
            {t('settings.qrError')}
          </p>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              data-testid="qr-canvas"
              className="rounded-xl border-2 border-gold"
              aria-label={t('settings.showQr')}
            />
            <p className="text-center font-body text-sm text-ink-soft">
              {t('settings.showQrHint')}
            </p>
          </>
        )}
        <Button className="w-full" onClick={onClose}>
          {t('settings.close')}
        </Button>
      </div>
    </Modal>
  )
}

interface QrScanModalProps {
  open: boolean
  onDecoded: (payload: string) => void
  onClose: () => void
}

export function QrScanModal({ open, onDecoded, onClose }: QrScanModalProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    let stream: MediaStream | null = null
    let raf = 0
    setError(false)

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        const video = videoRef.current
        if (cancelled || video == null) return
        video.srcObject = stream
        await video.play()

        const jsQR = (await import('jsqr')).default
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })

        function scanFrame() {
          if (cancelled || video == null || ctx == null) return
          if (video.readyState >= video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(image.data, image.width, image.height, {
              inversionAttempts: 'dontInvert',
            })
            if (code != null && looksLikeSetupPayload(code.data)) {
              onDecoded(code.data)
              return
            }
          }
          raf = requestAnimationFrame(scanFrame)
        }
        raf = requestAnimationFrame(scanFrame)
      } catch {
        if (!cancelled) setError(true)
      }
    }
    void start()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((track) => track.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Modal open={open} onClose={onClose} label={t('settings.scanQr')}>
      <div className="flex flex-col items-center gap-3">
        <h3 className="font-display text-lg font-bold text-gold-deep">{t('settings.scanQr')}</h3>
        {error ? (
          <p role="alert" className="text-center font-body text-sm text-danger">
            {t('settings.cameraError')}
          </p>
        ) : (
          <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live camera feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              data-testid="qr-video"
              className="aspect-square w-full max-w-72 rounded-xl border-2 border-gold object-cover"
            />
            <p className="text-center font-body text-sm text-ink-soft">
              {t('settings.scanQrHint')}
            </p>
          </>
        )}
        <Button className="w-full" onClick={onClose}>
          {t('settings.close')}
        </Button>
      </div>
    </Modal>
  )
}
