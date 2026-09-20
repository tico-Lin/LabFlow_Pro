export interface Atom {
  x: number;
  y: number;
  z: number;
  element: string;
}

export interface Bond {
  atom1Index: number;
  atom2Index: number;
  type: number;
}

export interface MoleculeAst {
  atoms: Atom[];
  bonds: Bond[];
}

/**
 * Parses a standard .mol (V2000) file format into a Molecule AST.
 */
export function parseMolFile(molData: string): MoleculeAst {
  const lines = molData.split(/\r?\n/);
  if (lines.length < 4) {
    throw new Error("Invalid .mol file: too short");
  }

  // Line 4 is the counts line
  const countsLine = lines[3];
  const numAtoms = parseInt(countsLine.substring(0, 3).trim(), 10);
  const numBonds = parseInt(countsLine.substring(3, 6).trim(), 10);

  if (isNaN(numAtoms) || isNaN(numBonds)) {
    throw new Error("Invalid .mol file: could not parse counts line");
  }

  const atoms: Atom[] = [];
  const bonds: Bond[] = [];

  // Parse atoms
  let lineIdx = 4;
  for (let i = 0; i < numAtoms; i++) {
    const line = lines[lineIdx++];
    const x = parseFloat(line.substring(0, 10).trim());
    const y = parseFloat(line.substring(10, 20).trim());
    const z = parseFloat(line.substring(20, 30).trim());
    const element = line.substring(31, 34).trim();
    atoms.push({ x, y, z, element });
  }

  // Parse bonds
  for (let i = 0; i < numBonds; i++) {
    const line = lines[lineIdx++];
    const a1 = parseInt(line.substring(0, 3).trim(), 10) - 1; // 0-indexed
    const a2 = parseInt(line.substring(3, 6).trim(), 10) - 1;
    const type = parseInt(line.substring(6, 9).trim(), 10);
    bonds.push({ atom1Index: a1, atom2Index: a2, type });
  }

  return { atoms, bonds };
}

