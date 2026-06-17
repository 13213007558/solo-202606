import moleculesData from './data/molecules.json';

export interface AtomData {
  index: number;
  element: string;
  x: number;
  y: number;
  z: number;
}

export interface BondData {
  from: number;
  to: number;
}

export interface MoleculeData {
  name: string;
  id: string;
  atoms: AtomData[];
  bonds: BondData[];
}

const molecules: MoleculeData[] = moleculesData as MoleculeData[];

export function loadMolecule(id: string): MoleculeData | undefined {
  return molecules.find((m) => m.id === id);
}

export function getAllMolecules(): MoleculeData[] {
  return molecules;
}
