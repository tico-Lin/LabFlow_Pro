import React, { useEffect, useRef } from 'react';
import { parseSmiles } from './moleculeParser';

interface ChemicalRendererProps {
  smiles: string;
}

export const ChemicalRenderer: React.FC<ChemicalRendererProps> = ({ smiles }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.fillText(`Molecule: ${smiles}`, 10, 20);
            
            try {
                // Try to use the parser to get atoms and bonds, then render them
                const molecule = parseSmiles(smiles);
                ctx.fillText(`Atoms: ${molecule.atoms.length}`, 10, 40);
                ctx.fillText(`Bonds: ${molecule.bonds.length}`, 10, 60);
                canvasRef.current.dataset.atoms = String(molecule.atoms.length);
            } catch (e) {
                ctx.fillStyle = 'red';
                ctx.fillText(`Error parsing SMILES`, 10, 40);
            }
        }
    }
  }, [smiles]);

  return (
    <div className="chemical-renderer">
      <canvas ref={canvasRef} width={200} height={100} style={{ border: '1px solid #333' }} />
    </div>
  );
};

