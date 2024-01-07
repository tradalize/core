export function add(accumulator: number, a: number) {
  return accumulator + a;
}

export function toPercent(number: number): string {
  return (number * 100).toFixed(2) + "%";
}

export function average(numbers: number[]) {
  return numbers.reduce(add) / numbers.length;
}
