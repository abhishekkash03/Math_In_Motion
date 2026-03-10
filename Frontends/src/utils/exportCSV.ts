export function exportCSV(formulaId: string, points: {x: number, y: number, z: number}[]) {
  let csv = 'x,y,z\\n';
  points.forEach(p => {
    csv += `${p.x},${p.y},${p.z}\\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${formulaId}-points.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
