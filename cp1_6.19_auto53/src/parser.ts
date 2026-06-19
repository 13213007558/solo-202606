export interface AtomData {
  symbol: string;
  atomicNumber: number;
  radius: number;
  bonds: number[];
}

export interface BondData {
  from: number;
  to: number;
  length: number;
}

export interface MoleculeData {
  atoms: AtomData[];
  bonds: BondData[];
}

export interface ElementInfo {
  symbol: string;
  atomicNumber: number;
  radius: number;
  cpkColor: number;
  maxBonds: number;
}

export const ELEMENT_DATA: Record<string, ElementInfo> = {
  H: { symbol: 'H', atomicNumber: 1, radius: 0.31, cpkColor: 0xffffff, maxBonds: 1 },
  C: { symbol: 'C', atomicNumber: 6, radius: 0.76, cpkColor: 0x404040, maxBonds: 4 },
  N: { symbol: 'N', atomicNumber: 7, radius: 0.71, cpkColor: 0x3050f8, maxBonds: 3 },
  O: { symbol: 'O', atomicNumber: 8, radius: 0.66, cpkColor: 0xff0d0d, maxBonds: 2 },
  F: { symbol: 'F', atomicNumber: 9, radius: 0.57, cpkColor: 0x90e050, maxBonds: 1 },
  P: { symbol: 'P', atomicNumber: 15, radius: 1.07, cpkColor: 0xff8000, maxBonds: 5 },
  S: { symbol: 'S', atomicNumber: 16, radius: 1.05, cpkColor: 0xffff30, maxBonds: 6 },
  Cl: { symbol: 'Cl', atomicNumber: 17, radius: 1.02, cpkColor: 0x1ff01f, maxBonds: 1 },
  Br: { symbol: 'Br', atomicNumber: 35, radius: 1.20, cpkColor: 0xa62929, maxBonds: 1 },
  I: { symbol: 'I', atomicNumber: 53, radius: 1.39, cpkColor: 0x940094, maxBonds: 1 },
};

const DEFAULT_BOND_LENGTHS: Record<string, number> = {
  'C-C': 1.54,
  'C=C': 1.34,
  'C-H': 1.09,
  'C-N': 1.47,
  'C-O': 1.43,
  'C-F': 1.35,
  'C-Cl': 1.77,
  'C-Br': 1.94,
  'C-I': 2.14,
  'N-H': 1.01,
  'N-N': 1.45,
  'N-O': 1.40,
  'O-H': 0.96,
  'O-O': 1.48,
  'H-H': 0.74,
  'P-O': 1.63,
  'P-C': 1.84,
  'S-O': 1.58,
  'S-C': 1.82,
  'S-H': 1.35,
};

export function getBondLength(sym1: string, sym2: string): number {
  const key1 = `${sym1}-${sym2}`;
  const key2 = `${sym2}-${sym1}`;
  if (DEFAULT_BOND_LENGTHS[key1]) return DEFAULT_BOND_LENGTHS[key1];
  if (DEFAULT_BOND_LENGTHS[key2]) return DEFAULT_BOND_LENGTHS[key2];
  const r1 = ELEMENT_DATA[sym1]?.radius ?? 0.75;
  const r2 = ELEMENT_DATA[sym2]?.radius ?? 0.75;
  return r1 + r2;
}

export function parseFormula(formula: string): MoleculeData {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  const atoms: AtomData[] = [];
  const bonds: BondData[] = [];
  let match;
  let totalAtoms = 0;

  while ((match = regex.exec(formula)) !== null) {
    const symbol = match[1];
    const count = parseInt(match[2] || '1', 10);

    if (!ELEMENT_DATA[symbol]) {
      throw new Error(`Unknown element: ${symbol}`);
    }

    for (let i = 0; i < count; i++) {
      if (totalAtoms >= 10) {
        throw new Error('Maximum 10 atoms allowed');
      }
      const info = ELEMENT_DATA[symbol];
      atoms.push({
        symbol: info.symbol,
        atomicNumber: info.atomicNumber,
        radius: info.radius,
        bonds: [],
      });
      totalAtoms++;
    }
  }

  if (atoms.length === 0) {
    throw new Error('No atoms parsed from formula');
  }

  const heavyAtomIndices: number[] = [];
  const hydrogenIndices: number[] = [];

  atoms.forEach((atom, idx) => {
    if (atom.symbol === 'H') {
      hydrogenIndices.push(idx);
    } else {
      heavyAtomIndices.push(idx);
    }
  });

  for (let i = 0; i < heavyAtomIndices.length - 1; i++) {
    const from = heavyAtomIndices[i];
    const to = heavyAtomIndices[i + 1];
    const length = getBondLength(atoms[from].symbol, atoms[to].symbol);
    bonds.push({ from, to, length });
    atoms[from].bonds.push(to);
    atoms[to].bonds.push(from);
  }

  let hIdx = 0;
  for (const heavyIdx of heavyAtomIndices) {
    const heavyAtom = atoms[heavyIdx];
    const currentBonds = heavyAtom.bonds.length;
    const maxBonds = ELEMENT_DATA[heavyAtom.symbol].maxBonds;
    const hToAdd = Math.min(maxBonds - currentBonds, hydrogenIndices.length - hIdx);

    for (let j = 0; j < hToAdd; j++) {
      const hAtomIdx = hydrogenIndices[hIdx];
      const length = getBondLength(heavyAtom.symbol, 'H');
      bonds.push({ from: heavyIdx, to: hAtomIdx, length });
      heavyAtom.bonds.push(hAtomIdx);
      atoms[hAtomIdx].bonds.push(heavyIdx);
      hIdx++;
    }
  }

  return { atoms, bonds };
}

export function computeForceDirectedPositions(
  data: MoleculeData,
  iterations: number = 200
): Float32Array {
  const { atoms, bonds } = data;
  const n = atoms.length;
  const positions = new Float32Array(n * 3);

  for (let i = 0; i < n; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
  }

  const repulsionStrength = 2.0;
  const springStrength = 0.5;
  const damping = 0.85;
  const velocities = new Float32Array(n * 3);

  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Float32Array(n * 3);
    const temperature = 1.0 - iter / iterations;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq) + 0.001;
        const force = repulsionStrength / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        const fz = (dz / dist) * force;
        forces[i * 3] += fx;
        forces[i * 3 + 1] += fy;
        forces[i * 3 + 2] += fz;
        forces[j * 3] -= fx;
        forces[j * 3 + 1] -= fy;
        forces[j * 3 + 2] -= fz;
      }
    }

    for (const bond of bonds) {
      const { from, to, length } = bond;
      const dx = positions[to * 3] - positions[from * 3];
      const dy = positions[to * 3 + 1] - positions[from * 3 + 1];
      const dz = positions[to * 3 + 2] - positions[from * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;
      const displacement = dist - length;
      const force = springStrength * displacement;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      const fz = (dz / dist) * force;
      forces[from * 3] += fx;
      forces[from * 3 + 1] += fy;
      forces[from * 3 + 2] += fz;
      forces[to * 3] -= fx;
      forces[to * 3 + 1] -= fy;
      forces[to * 3 + 2] -= fz;
    }

    for (let i = 0; i < n; i++) {
      velocities[i * 3] = (velocities[i * 3] + forces[i * 3] * temperature) * damping;
      velocities[i * 3 + 1] = (velocities[i * 3 + 1] + forces[i * 3 + 1] * temperature) * damping;
      velocities[i * 3 + 2] = (velocities[i * 3 + 2] + forces[i * 3 + 2] * temperature) * damping;
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];
    }
  }

  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < n; i++) {
    cx += positions[i * 3];
    cy += positions[i * 3 + 1];
    cz += positions[i * 3 + 2];
  }
  cx /= n;
  cy /= n;
  cz /= n;
  for (let i = 0; i < n; i++) {
    positions[i * 3] -= cx;
    positions[i * 3 + 1] -= cy;
    positions[i * 3 + 2] -= cz;
  }

  return positions;
}
