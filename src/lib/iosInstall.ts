/**
 * Su iPhone e iPad non esiste il pulsante "Installa": si spiega come aggiungere l'app alla schermata Home.
 * Si mostra solo se si è su iPhone/iPad, nel browser (non già installata, non nell'app Android) e in Safari
 * (Chrome e gli altri browser su iPhone non permettono l'installazione).
 */
export function shouldShowIosInstallHint(env: { userAgent: string; maxTouchPoints?: number; standalone?: boolean; native?: boolean }): boolean {
  const { userAgent: ua, maxTouchPoints = 0, standalone = false, native = false } = env;
  if (standalone || native) return false;
  // iPad con iPadOS recente si presenta come Mac, ma ha lo schermo tattile
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1);
  if (!ios) return false;
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|GSA|FBAN|FBAV|Instagram|Line\//.test(ua);
  return /Safari/.test(ua) && !otherBrowser;
}
