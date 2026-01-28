import React, { useState } from 'react';
import { SectorModal } from './SectorModal';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Sector {
  id: number;
  name: string;
  isSolved: boolean;
  codeFragment: number;
  questions: Question[];
}

export interface Player {
  username: string;
  avatar: string;
}

export interface GameState {
  player: Player;
  sectors: Sector[];
  topic: string;
}

interface GameInterfaceProps {
  gameState: GameState;
  onSectorSolved: (sectorId: number) => void;
  onMistake: () => void;
  onVictory: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({ 
  gameState, 
  onSectorSolved, 
  onMistake,
  onVictory
}) => {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [vaultCode, setVaultCode] = useState<string[]>(['', '', '', '', '']);

  const handleSectorClick = (sector: Sector) => {
    if (!sector.isSolved) {
      setSelectedSector(sector);
    }
  };

  const handleModalClose = () => {
    setSelectedSector(null);
  };

  const handleModalSubmit = (isCorrect: boolean) => {
    if (isCorrect && selectedSector) {
      onSectorSolved(selectedSector.id);
      setSelectedSector(null);
    } else {
      setSelectedSector(null);
      onMistake();
    }
  };

  const handleVaultInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newCode = [...vaultCode];
    newCode[index] = value.slice(-1); // Keep last digit only
    setVaultCode(newCode);

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`vault-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVaultSubmit = () => {
    // Check if all sectors solved first
    const allSolved = gameState.sectors.every(s => s.isSolved);
    if (!allSolved) {
        alert("ERROR DE PERMISOS: DEBES DESBLOQUEAR TODOS LOS ARCHIVOS PRIMERO");
        return;
    }

    // Check codes
    let correct = true;
    gameState.sectors.forEach((sector, idx) => {
      if (parseInt(vaultCode[idx]) !== sector.codeFragment) {
        correct = false;
      }
    });

    if (correct) {
      onVictory();
    } else {
      onMistake();
    }
  };

  // Extract Category from Topic string "Category - Situation"
  const categoryName = gameState.topic.split(' - ')[0] || "ASIGNATURA";

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 flex flex-col md:flex-row gap-8 relative z-10">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=10')] opacity-10 pointer-events-none bg-cover"></div>

      {/* LEFT PANEL: Sectors */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="border border-[#00ff41] bg-black/80 p-4 mb-4 glow-border flex justify-between items-center">
            <div>
              <h2 className="text-xl text-[#00ff41] font-bold mb-1">USUARIO: {gameState.player?.username}</h2>
              <div className="text-xs text-[#00ff41]/70">AVATAR: {gameState.player?.avatar}</div>
            </div>
            <div className="text-right">
               <div className="text-xs text-[#00f3ff]">OBJETIVO</div>
               <div className="font-bold text-white">CAMBIAR NOTA</div>
            </div>
        </div>

        <h3 className="text-[#00f3ff] text-xl font-bold tracking-widest mb-2 glow-text-blue">ARCHIVOS ENCRIPTADOS</h3>
        
        <div className="flex flex-col gap-4 flex-grow">
          {gameState.sectors.map((sector) => (
            <button
              key={sector.id}
              onClick={() => handleSectorClick(sector)}
              disabled={sector.isSolved}
              className={`
                relative p-6 border-l-4 transition-all duration-300 overflow-hidden group text-left
                ${sector.isSolved 
                  ? 'border-[#00ff41] bg-[#00ff41]/10' 
                  : 'border-[#00f3ff] bg-black hover:bg-[#00f3ff]/10 cursor-pointer'}
              `}
            >
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <div className={`text-xs font-bold mb-1 ${sector.isSolved ? 'text-[#00ff41]' : 'text-[#00f3ff]'}`}>
                    ARCHIVO_0{sector.id + 1}
                  </div>
                  <div className="text-lg text-white font-mono">
                    {sector.name}
                  </div>
                </div>
                
                {sector.isSolved ? (
                  <div className="text-[#00ff41] font-bold text-2xl animate-pulse">
                    [CLAVE: {sector.codeFragment}]
                  </div>
                ) : (
                  <div className="text-[#00f3ff]/50 text-sm group-hover:text-[#00f3ff]">
                    [PROTEGIDO]
                  </div>
                )}
              </div>
              
              {/* Background fill animation */}
              {!sector.isSolved && (
                <div className="absolute inset-0 bg-[#00f3ff]/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Vault */}
      <div className="w-full md:w-1/2 flex flex-col">
        <div className="border-2 border-[#00ff41] bg-black/90 p-8 h-full flex flex-col items-center justify-center relative glow-border shadow-[0_0_20px_rgba(0,255,65,0.1)]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent"></div>
            
            <h2 className="text-3xl md:text-5xl text-white font-bold mb-4 tracking-tighter text-center">
              CONTRASEÑA DE LA <span className="text-[#00ff41] glow-text">BASE DE DATOS</span> DE LAS NOTAS
            </h2>
            
            <p className="mb-12 text-[#00ff41]/60 text-center font-mono text-sm">
              INTRODUZCA LAS 5 CLAVES DE LOS ARCHIVOS PARA AUTORIZAR EL CAMBIO DE NOTA
            </p>

            <div className="flex gap-2 md:gap-4 mb-12">
              {vaultCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`vault-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleVaultInput(idx, e.target.value)}
                  className="w-12 h-16 md:w-16 md:h-20 bg-black border-2 border-[#00ff41] text-[#00ff41] text-center text-3xl md:text-4xl font-bold focus:outline-none focus:shadow-[0_0_15px_#00ff41] focus:bg-[#00ff41]/10 transition-all placeholder-[#00ff41]/20"
                  placeholder="?"
                  autoComplete="off"
                />
              ))}
            </div>

            <button
              onClick={handleVaultSubmit}
              className="group relative px-12 py-4 bg-transparent border-2 border-[#00ff41] text-[#00ff41] font-bold text-xl uppercase tracking-widest overflow-hidden hover:text-black transition-colors duration-300"
            >
              <span className="relative z-10">MODIFICAR NOTA DE {categoryName}</span>
              <div className="absolute inset-0 bg-[#00ff41] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            
            <div className="mt-8 text-center text-xs text-[#00ff41]/40">
              PRECAUCIÓN: EL FALLO BLOQUEARÁ EL ACCESO AL SISTEMA DOCENTE
            </div>
        </div>
      </div>

      <SectorModal 
        isOpen={!!selectedSector} 
        question={null}
        questions={selectedSector?.questions}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};