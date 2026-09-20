import { describe, it, expect } from "vitest";
import { parseMolFile } from "./moleculeParser";

describe("moleculeParser", () => {
  it("should parse a standard V2000 .mol file accurately", () => {
    // Water molecule H2O
    const molData = `Water
  Mrv1561 09202622222D          

  3  2  0  0  0  0            999 V2000
    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000   -1.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.8660    0.5000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
M  END
`;

    const ast = parseMolFile(molData);

    // Assert atoms coordinates
    expect(ast.atoms.length).toBe(3);
    expect(ast.atoms[0].element).toBe("O");
    expect(ast.atoms[0].x).toBe(0.0);
    expect(ast.atoms[0].y).toBe(0.0);

    expect(ast.atoms[1].element).toBe("H");
    expect(ast.atoms[1].x).toBe(0.0);
    expect(ast.atoms[1].y).toBe(-1.0);

    expect(ast.atoms[2].element).toBe("H");
    expect(ast.atoms[2].x).toBe(0.8660);
    expect(ast.atoms[2].y).toBe(0.5);

    // Assert bonds
    expect(ast.bonds.length).toBe(2);
    expect(ast.bonds[0].atom1Index).toBe(0); // O
    expect(ast.bonds[0].atom2Index).toBe(1); // H
    expect(ast.bonds[0].type).toBe(1);       // Single bond

    expect(ast.bonds[1].atom1Index).toBe(0); // O
    expect(ast.bonds[1].atom2Index).toBe(2); // H
    expect(ast.bonds[1].type).toBe(1);
  });
});

