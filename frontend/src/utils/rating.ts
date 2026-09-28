// O banco guarda notas de 0 a 10. A interface mostra de 1 a 5 estrelas.

export function toFiveScale(nota: number) {
  return nota / 2;
}

export function toTenScale(estrelas: number) {
  return estrelas * 2;
}

// Arredonda para o meio ponto mais próximo: 3.7 -> 3.5, 3.8 -> 4
export function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

export function formatRating(nota: number) {
  return toFiveScale(nota).toFixed(1).replace(".", ",");
}

// Conta quantas avaliações existem para cada quantidade de estrelas (1 a 5)
export function ratingDistribution(notas: number[]) {
  const counts = [0, 0, 0, 0, 0];

  for (const nota of notas) {
    const estrelas = Math.min(5, Math.max(1, Math.round(toFiveScale(nota))));
    counts[estrelas - 1] += 1;
  }

  return counts;
}
