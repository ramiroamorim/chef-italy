
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui-essentials/card";
import { Button } from "@/components/ui-essentials/button";
import { ChefImages } from "@/assets/imageExports";

// Player de áudio definitivo que funciona
const SimpleAudioPlayer = () => {
  return (
    <div className="flex flex-col items-center w-full mb-5">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">🎧 Messaggio della Chef Amélie</h3>
          <p className="text-sm text-gray-600">Ascolta il messaggio speciale sulle tue ricette</p>
        </div>
        

      </div>
    </div>
  );
};

export default function ThankYou() {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [progressPosition, setProgressPosition] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressTimerRef = useRef<number | null>(null);
  
  // Timer para mostrar o botão após exatamente 2 minutos (120000ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 120000); // 2 minutos exatos
    
    return () => clearTimeout(timer);
  }, []);
  
  // Inicialização e autoplay do player
  useEffect(() => {
    // Estados iniciais
    setAudioLoaded(false);
    setProgressPosition(0);
    
    // Tentar reprodução automática após um breve delay
    const autoplayTimer = setTimeout(() => {
      const audio = audioRef.current;
      if (audio) {
        audio.play().then(() => {
          console.log("Autoplay iniciado com sucesso!");
          setAudioPlaying(true);
        }).catch((error) => {
          console.log("Autoplay foi bloqueado, aguardando interação do usuário");
        });
      }
    }, 500);
    
    return () => clearTimeout(autoplayTimer);
  }, []);
  
  // Função simplificada para reproduzir o áudio
  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (audioPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error("Erro ao reproduzir:", error);
      });
    }
  };
  
  // Função para navegar no áudio
  const seekAudio = (position: number) => {
    const audio = audioRef.current;
    if (!audio || !audioLoaded || !audio.duration) return;

    try {
      const newTime = (position / 100) * audio.duration;
      const minutes = Math.floor(newTime / 60);
      const seconds = Math.floor(newTime % 60);
      
      audio.currentTime = newTime;
      setProgressPosition(position);
      
      console.log(`Navegando para ${minutes}:${seconds.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error("Erro ao navegar no áudio:", error);
    }
  };
  


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Título principal com ícone de presente */}
        <h1 className="text-4xl font-bold text-[#B34431] text-center mb-8">
          <span className="inline-block mr-2">🎁</span> Grazie infinite per la tua fiducia!
        </h1>
        
        {/* Texto introdutório */}
        <p className="text-lg text-center mb-8 max-w-lg">
          Prima di andare a scoprire le tue ricette nella tua casella di posta...
          <br />ho preparato un messaggio molto speciale solo per te.
        </p>
        
        {/* Botão de reprodução de áudio */}
        <div className="text-center mb-4">
          <p className="mb-2">
            <span className="bg-[#E9F6FF] text-[#2E7BC2] px-3 py-1 rounded-md">
              ▶️ Premi play per ascoltare l'audio 👇🏻
            </span>
          </p>
          <p className="text-sm text-gray-600 mb-8">
            Ti spiego tutto in meno di 3 minuti.
          </p>
        </div>
        
        {/* Player de áudio - design moderno similar à referência */}
        <Card className="w-full mb-10 overflow-hidden bg-[#f8f9fa] border border-[#e9ecef] shadow-sm">
          <CardContent className="p-6">
            {/* Elemento de áudio oculto para controles customizados */}
            {/* Elemento de áudio com eventos completos */}
            <audio 
              ref={audioRef}
              preload="auto"
              autoPlay
              src="/audio/Segundos.mp4"
              onLoadedMetadata={() => {
                const audio = audioRef.current;
                if (audio && audio.duration) {
                  setAudioDuration(audio.duration);
                  setAudioLoaded(true);
                  console.log("Áudio carregado, duração:", audio.duration);
                }
              }}
              onTimeUpdate={(e) => {
                const audio = e.currentTarget;
                if (audio && audio.duration > 0) {
                  const progress = (audio.currentTime / audio.duration) * 100;
                  setProgressPosition(progress);
                  console.log(`Progresso: ${Math.floor(progress)}%`);
                }
              }}
              onPlay={() => {
                setAudioPlaying(true);
                console.log("Reprodução iniciada");
              }}
              onPause={() => {
                setAudioPlaying(false);
                console.log("Reprodução pausada");
              }}
              onEnded={() => {
                setAudioPlaying(false);
                setProgressPosition(100);
                console.log("Reprodução finalizada");
              }}
              onError={(e) => {
                console.error("Erro no áudio:", e);
                setAudioLoaded(false);
              }}
              onCanPlay={() => {
                setAudioLoaded(true);
                console.log("Áudio pronto para reprodução");
                // Iniciar reprodução automaticamente
                const audio = audioRef.current;
                if (audio) {
                  audio.play().then(() => {
                    console.log("Reprodução automática iniciada");
                  }).catch(error => {
                    console.log("Reprodução automática bloqueada pelo navegador:", error);
                  });
                }
              }}
              style={{ display: 'none' }}
            />
            
            <div className="flex justify-between items-center mb-4">
              <p className="font-medium text-[#B34431] text-lg">Chef Amélie Dupont</p>
              {ChefImages && ChefImages.amelie ? (
                <img 
                  src={ChefImages.amelie} 
                  alt="Chef Amélie Dupont" 
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div 
                  className="h-12 w-12 rounded-full bg-white border border-[#e9ecef] overflow-hidden shadow-md"
                >
                  <img 
                    src="/images/chef-amelie.jpg" 
                    alt="Chef Amélie Dupont"
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = "h-full w-full flex items-center justify-center bg-[#B34431] text-white text-sm font-bold";
                      fallbackDiv.textContent = "AD";
                      target.parentElement?.appendChild(fallbackDiv);
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              {/* Botão de play/pause estilizado */}
              <button 
                onClick={toggleAudio}
                disabled={!audioLoaded}
                className={`h-12 w-12 rounded-full transition-colors flex items-center justify-center text-white mr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  audioLoaded 
                    ? 'bg-[#2476c7] hover:bg-[#1c64a9] cursor-pointer focus:ring-[#2476c7]' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                aria-label={audioPlaying ? "Pausa" : "Riproduci"}
              >
                {!audioLoaded ? (
                  // Spinner de carregamento
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : audioPlaying ? (
                  // Ícone de pause
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor" />
                  </svg>
                ) : (
                  // Ícone de play
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                  </svg>
                )}
              </button>
              
              {/* Container para visualização de onda e progresso */}
              <div className="flex-1 h-10 relative">
                {/* Visualização de onda de áudio (estático, decorativo) */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-between">
                  {/* Linhas verticais que simulam uma forma de onda de áudio */}
                  {Array.from({ length: 50 }).map((_, index) => {
                    // Altura variada para simular forma de onda de áudio, com padrão mais realista
                    const height = Math.abs(Math.sin((index * 0.3) % Math.PI) * 70 + 
                                    Math.cos((index * 0.2) % Math.PI) * 20) + 5;
                    
                    // Determina se este segmento está na parte "reproduzida" do áudio
                    const isPlayed = index < (progressPosition / 100 * 50);
                    
                    return (
                      <div 
                        key={index}
                        className={`mx-[1px] ${isPlayed ? 'bg-[#2476c7]' : 'bg-[#e9ecef]'}`}
                        style={{ 
                          height: `${height}%`, 
                          width: '2px',
                          opacity: isPlayed ? 0.7 : 0.5,
                          transition: 'background-color 0.3s, opacity 0.3s'
                        }}
                      ></div>
                    );
                  })}
                </div>
                
                {/* Área clicável para controle de progresso */}
                <div 
                  className="absolute inset-0 cursor-pointer hover:bg-black hover:bg-opacity-5 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!audioLoaded) return;
                    
                    const container = e.currentTarget;
                    const rect = container.getBoundingClientRect();
                    const clickPosition = (e.clientX - rect.left) / rect.width;
                    
                    // Garantir que a posição está entre 0 e 100
                    const newPositionPercent = Math.max(0, Math.min(100, clickPosition * 100));
                    
                    console.log(`Clique na posição: ${Math.floor(newPositionPercent)}%`);
                    seekAudio(newPositionPercent);
                  }}
                  title="Clicca per navigare nell'audio"
                ></div>
              </div>
              
              {/* Informações de duração */}
              {audioLoaded && audioDuration > 0 && (
                <div className="ml-4 text-sm text-gray-600 min-w-[70px] text-right font-mono">
                  <span className="text-[#2476c7] font-medium">
                    {Math.floor(progressPosition * audioDuration / 100 / 60)}:
                    {String(Math.floor((progressPosition * audioDuration / 100) % 60)).padStart(2, '0')}
                  </span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span>
                    {Math.floor(audioDuration / 60)}:
                    {String(Math.floor(audioDuration % 60)).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Botão de ação (visível após tempo definido) */}
        {showButton && (
          <div className="w-full flex flex-col items-center mt-4">
            <Button 
              onClick={() => window.location.href = "https://pay.hotmart.com/V99272097O?checkoutMode=10"}
              style={{
                backgroundColor: "#57C084",
                color: "white",
                fontWeight: "bold",
                padding: "1rem 2rem",
                borderRadius: "9999px",
                fontSize: "1.125rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                marginBottom: "1rem",
                transition: "all 0.3s ease",
                transform: "scale(1)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#45A26C";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#57C084";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              VOGLIO UN PIANO OGNI DOMENICA!
            </Button>
            <a 
              href="https://www.notion.so/Chef-Am-lie-Dupont-1d529766d17b80128475e56e60b5fbe8" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B34431] text-sm hover:underline"
            >
              No, grazie!
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
