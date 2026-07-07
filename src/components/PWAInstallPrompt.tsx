import { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show the install button
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already installed, don't show
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      console.log('PWA was installed successfully');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the native Android install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto z-50 max-w-sm bg-indigo-600 text-white rounded-2xl shadow-xl p-4 border border-indigo-500/30 flex flex-col gap-3 animate-bounce-subtle">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/25 p-2 rounded-xl text-white shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">Usa l'App sul tuo Smartphone!</h4>
            <p className="text-xs text-indigo-100 mt-0.5 leading-snug">
              Installa "Che cucino oggi?" sul tuo smartphone Android per un accesso rapido a 0 stress.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="Chiudi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setIsVisible(false)}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-100 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          Non ora
        </button>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-indigo-600 hover:bg-indigo-50 text-xs font-extrabold rounded-xl shadow-md active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Installa Ora</span>
        </button>
      </div>
    </div>
  );
}
