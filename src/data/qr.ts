/*
 * QR payload codec for setup sharing.
 * A setup JSON compresses ~4× with deflate, comfortably fitting a scannable
 * QR code. Payload format:
 *   NNG1:<base64(deflate-raw(utf8 json))>   — compressed (preferred)
 *   NNG0:<base64(utf8 json)>                — fallback when CompressionStream
 *                                             is unavailable
 */

export const QR_PREFIX_DEFLATE = 'NNG1:'
export const QR_PREFIX_PLAIN = 'NNG0:'

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function fromBase64(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function pipe(
  bytes: Uint8Array<ArrayBuffer>,
  stream: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
  const source = new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
  return new Uint8Array(await new Response(source.pipeThrough(stream)).arrayBuffer())
}

export async function encodeSetupPayload(json: string): Promise<string> {
  const bytes = new TextEncoder().encode(json)
  if (typeof CompressionStream !== 'undefined') {
    const deflated = await pipe(bytes, new CompressionStream('deflate-raw'))
    return QR_PREFIX_DEFLATE + toBase64(deflated)
  }
  return QR_PREFIX_PLAIN + toBase64(bytes)
}

/** Decodes a scanned payload back to the setup JSON string.
 *  Throws 'not-nomnom' for anything that is not a Nom Nom Gacha QR code. */
export async function decodeSetupPayload(payload: string): Promise<string> {
  try {
    if (payload.startsWith(QR_PREFIX_DEFLATE)) {
      const bytes = fromBase64(payload.slice(QR_PREFIX_DEFLATE.length))
      const inflated = await pipe(bytes, new DecompressionStream('deflate-raw'))
      return new TextDecoder().decode(inflated)
    }
    if (payload.startsWith(QR_PREFIX_PLAIN)) {
      return new TextDecoder().decode(fromBase64(payload.slice(QR_PREFIX_PLAIN.length)))
    }
  } catch {
    throw new Error('not-nomnom')
  }
  throw new Error('not-nomnom')
}

export function looksLikeSetupPayload(text: string): boolean {
  return text.startsWith(QR_PREFIX_DEFLATE) || text.startsWith(QR_PREFIX_PLAIN)
}
