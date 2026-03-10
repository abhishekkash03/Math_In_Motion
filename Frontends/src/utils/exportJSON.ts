export function exportJSON(formulaId: string, points: {x: number, y: number, z: number}[]) {
  const data = {
    formulaId,
    points
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${formulaId}-points.json`;
  a.click();
  URL.revokeObjectURL(url);
}
