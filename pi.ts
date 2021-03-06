#!/usr/bin/env node
/*
  This program computes Pi by the formula:
  pi / 4 = 4 * ArcTan(1/5) - ArcTan(1/239)

  Adapted from some program I found on the Internet a long time
  ago that computed Pi by:
  pi / 4 = ArcTan(1/2) + ArcTan(1/3)

  I have no idea who wrote the original program nor remember where
  I found it--there wasn't any credits in the original C source.  This
  one also no longer looks like the original as I've completely rewritten
  it.  I got a lot of my information from
  http://www.boo.net/~jasonp/pipage.html when I rewrote the program.  This
  program will reliably compute upto 1,000,000 digits, that I've verified.

  There are faster ways of computing Pi, and this program probably
  could be optimized further, but it is sufficiently fast for computing
  Pi using relatively portable and understandable routines that can
  be easily converted into other languages.

  Computing Pi using FFTs are much much faster, but also much much more
  complicated.  Using the ArcTan methods are fairly simple to implement,
  but not nearly as fast as the FFT methods.  Also, the
  pi / 4 = 4 * ArcTan(1/5) - ArcTan(1/239) formula is one of the faster
  of the various ArcTan formulas for computing PI.

  Author: M. Scott Reynolds
  Date: 09 September 2006

  6 October 2018: TypeScript version.  
  28 April 2018: Updated to run under nodejs.
*/

function trunc(n: number): number {
  return n | 0;
}

/* Compute pi and return result as a string. */
function computePi(maxDigits: number): string
{
  const SIZE = 1000;
  let precision: number = trunc(maxDigits/3) + 2;
  let remainder1: number, remainder2: number, remainder3: number, remainder4: number;
  let b: number, n: number, n2: number, carry: number;
  let i: number;
  let isZero: boolean;
  let p = new Array<number>(precision+1);
  let t = new Array<number>(precision+1);
  let text: string;

  // Initialize.
  for (i = 0; i <= precision; i++)
  {
    t[i] = 0;
    p[i] = 0;
  }

  // Note, borrows and carries from the addition and subtraction
  // are postponed till last.  See: http://www.boo.net/~jasonp/ord

  // Compute arctan(1/5)

  // t = t / 5, p = t
  t[0] = 1;
  remainder1 = 0;
  for (i = 0; i <= precision; i++) {
    b = SIZE * remainder1 + t[i];
    p[i] = t[i] = trunc(b / 5);
    remainder1 = b % 5;
  }

  // While t is not zero.
  n = -1;
  n2 = 1;
  do {
    // t = t / 25, p = p - t / n, t = t / 25, p = p + t / (n+2)
    remainder1 = remainder2 = remainder3 = remainder4 = 0;
    isZero = true;
    n += 4;
    n2 += 4;
    for (i = 0; i <= precision; i++) {
      b = SIZE * remainder1 + t[i];
      t[i] = trunc(b / 25);
      remainder1 = b % 25;

      b = SIZE * remainder2 + t[i];
      p[i] -= trunc(b / n);
      remainder2 = b % n;

      b = SIZE * remainder3 + t[i];
      t[i] = trunc(b / 25);
      remainder3 = b % 25;

      b = SIZE * remainder4 + t[i];
      p[i] += trunc(b / n2);
      remainder4 = b % n2;

      if (isZero && t[i] != 0)    // is t zero?
        isZero = false;
    }
  } while (! isZero);

  // p = p * 4
  carry = 0;
  for (i = precision; i >= 0; i--) {
    b = p[i] * 4 + carry;
    p[i] = b % SIZE;
    carry = trunc(b / SIZE);
  }

  // Compute arctan(1/239)

  // t = t / 239, p = p - t
  t[0] = 1;
  remainder1 = 0;
  for (i = 0; i <= precision; i++) {
    b = SIZE * remainder1 + t[i];
    p[i] -= t[i] = trunc(b / 239);
    remainder1 = b % 239;
  }

  // While t is not zero.
  n = -1;
  n2 = 1;
  do {
    // t = t / 57121, p = p + t / n, t = t / 57121, p = p - t / (n+2)
    remainder1 = remainder2 = remainder3 = remainder4 = 0;
    isZero = true;
    n += 4;
    n2 += 4;
    for (i = 0; i <= precision; i++) {
      b = SIZE * remainder1 + t[i];
      t[i] = trunc(b / 57121);
      remainder1 = b % 57121;

      b = SIZE * remainder2 + t[i];
      p[i] += trunc(b / n);
      remainder2 = b % n;

      b = SIZE * remainder3 + t[i];
      t[i] = trunc(b / 57121);
      remainder3 = b % 57121;

      b = SIZE * remainder4 + t[i];
      p[i] -= trunc(b / n2);
      remainder4 = b % n2;

      if (isZero && t[i] != 0)    // is t zero?
        isZero = false;
    }
  } while (! isZero);

  // p = p * 4
  carry = 0;
  for (i = precision; i >= 0; i--) {
    b = p[i] * 4 + carry;
    p[i] = b % SIZE;
    carry = trunc(b / SIZE);
  }

  // Borrow and carry.
  for (i = precision; i > 0; i--) {
    if (p[i] < 0) {
      b = trunc(p[i] / SIZE);
      p[i] -= (b - 1) * SIZE;
      p[i-1] += b - 1;
    }
    if (p[i] >= SIZE) {
      b = trunc(p[i] / SIZE);
      p[i] -= b * SIZE;
      p[i-1] += b;
    }
  }

  // Return results as a string.
  text = String(p[0]) + ".";
  for (i = 1; i < precision; i++) {
    if (p[i] < 10)
      text += "00";
    else if (p[i] < 100)
      text += "0";
    text += String(p[i]);
  }
  return text.substring(0, maxDigits+2);
}

declare var process;

let numberDigits = 10000;
let formatOutput = false;
let argv = process.argv.slice(2);
if (argv.length == 0) {
  console.log("usage: pi number_of_digits [--format]");
}
else {
  for (let l = 0; l < argv.length; l++) {
    if (argv[l] == '--format') {
      formatOutput = true;
    }
    else {
      numberDigits = parseInt(argv[l]);
    }
  }

  console.log('Computing pi to ' + numberDigits + ' places.');
  let timeStart = new Date().getTime();
  let pi = computePi(numberDigits);
  let timeEnd = new Date().getTime();
  if (formatOutput) {
    // format the output.
    let s = "pi = 3.\n";
    for (let n = 1; n < pi.length; n++) {
      s += pi.charAt(n+1);
      if (n % 1000 == 0) {
        s += "\n\n";
      }
      else if (n % 50 == 0) {
        s += "\n";
      }
      else if (n % 10 == 0) {
        s += " ";
      }
    }
    pi = s;
  }
  console.log(pi);
  console.log("" + (timeEnd - timeStart) + " ms to compute " + numberDigits + " digits of pi.");
}
