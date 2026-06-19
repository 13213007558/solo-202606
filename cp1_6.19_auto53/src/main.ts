import { ThreeScene, DisplayMode } from './threeScene';
import { parseFormula } from './parser';
import { UIController } from './controls';

function main(): void {
  const threeScene = new ThreeScene('canvas-container');

  const uiController = new UIController({
    onGenerate: (formula: string) => {
      try {
        const data = parseFormula(formula);
        threeScene.loadMolecule(data);
        const stats = threeScene.getStats();
        uiController.updateStats(stats.atomCount, stats.bondCount);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        uiController.showError(message);
      }
    },
    onModeChange: (mode: DisplayMode) => {
      threeScene.setDisplayMode(mode);
    },
    onReset: () => {
      threeScene.resetCamera();
    },
    onScreenshot: () => {
      threeScene.takeScreenshot();
    },
    onStatsUpdate: (_atoms: number, _bonds: number) => {
    },
  });

  uiController.setActiveMode('ball-stick');
  const defaultData = parseFormula('H2O');
  threeScene.loadMolecule(defaultData);
  const stats = threeScene.getStats();
  uiController.updateStats(stats.atomCount, stats.bondCount);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
