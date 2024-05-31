export function add(accumulator: number, a: number) {
  return accumulator + a;
}

export function toPercent(number: number): string {
  return (number * 100).toFixed(2) + "%";
}

export function average(numbers: number[]) {
  const result = numbers.reduce(add, 0) / numbers.length;

  return toFinite(result);
}

export function toFinite(number: number) {
  return isFinite(number) ? number : 0;
}
