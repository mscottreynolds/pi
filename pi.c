#include <stdio.h>
/*
  This program computes PI by the formula:
  pi / 4 = 4 * ArcTan(1/5) - ArcTan(1/239)

  Adapted from some program I found on the internet a long time
  ago that computed PI by:
  pi / 4 = ArcTan(1/2) + ArcTan(1/3)

  I have no idea who wrote the original program nor remember where
  I found it--there wasn't any credits in the original C source.  This
  one also no longer looks like the original as I've completely rewritten
  it.  I got a lot of my information from
  http://www.boo.net/~jasonp/pipage.html when I rewrote the program.  This
  program will reliably compute upto 1,000,000 digits, that I've verified.

  There are faster ways of computing PI, and this program probably
  could be optimized further, but it is sufficiently fast for computing
  PI using relativly portable and understandable routines that can
  be easily converted into other languages.

  Computing PI using FFTs are much much faster, but also much much more
  complicated.  Using the ArcTan methods are fairly simple to implement,
  but not nearly as fast as the FFT methods.  Also, the
  pi / 4 = 4 * ArcTan(1/5) - ArcTan(1/239) formula is one of the faster
  of the various ArcTan formulas for computing PI.

  Author: M. Scott Reynolds
  Date: 16 August 2018
*/

// Change TOTAL_DIGITS to compute more digits of pi.
#define TOTAL_DIGITS 20000
#define SIZE 1000
#define true 1
#define false 0

  int main(int argc, char* argv[])
  {
    int remainder1, remainder2, remainder3, remainder4;
    int b, n, n2, carry;
    int i, l;
    int isZero;
    int PRECISION = TOTAL_DIGITS / 3 + 2;
    int p[PRECISION+1];
    int t[PRECISION+1];
    char text[TOTAL_DIGITS+4];    // need to have the extra space for a buffer.

    // Initialize t.
    for (i = 0; i <= PRECISION; i++)
      t[i] = 0;

    // Note, borrows and carries from the addition and subtraction
    // are postponed till last.  See: http://www.boo.net/~jasonp/ord

    // Compute arctan(1/5)

    // t = t / 5, p = t
    t[0] = 1;
    remainder1 = 0;
    for (i = 0; i <= PRECISION; i++)
    {
      b = SIZE * remainder1 + t[i];
      p[i] = t[i] = b / 5;
      remainder1 = b % 5;
    }

    // While t is not zero.
    n = -1;
    n2 = 1;
    do
    {
      // t = t / 25, p = p - t / n, t = t / 25, p = p + t / (n+2)
      remainder1 = remainder2 = remainder3 = remainder4 = 0;
      isZero = true;
      n += 4;
      n2 += 4;
      for (i = 0; i <= PRECISION; i++)
      {
        b = SIZE * remainder1 + t[i];
        t[i] = b / 25;
        remainder1 = b % 25;

        b = SIZE * remainder2 + t[i];
        p[i] -= b / n;
        remainder2 = b % n;

        b = SIZE * remainder3 + t[i];
        t[i] = b / 25;
        remainder3 = b % 25;

        b = SIZE * remainder4 + t[i];
        p[i] += b / n2;
        remainder4 = b % n2;

        if (isZero && t[i] != 0)    // is t zero?
          isZero = false;
      }
    } while (!isZero);

    // p = p * 4
    carry = 0;
    for (i = PRECISION; i >= 0; i--)
    {
      b = p[i] * 4 + carry;
      p[i] = b % SIZE;
      carry = b / SIZE;
    }

    // Compute arctan(1/239)

    // t = t / 239, p = p - t
    t[0] = 1;
    remainder1 = 0;
    for (i = 0; i <= PRECISION; i++)
    {
      b = SIZE * remainder1 + t[i];
      p[i] -= t[i] = b / 239;
      remainder1 = b % 239;
    }

    // While t is not zero.
    n = -1;
    n2 = 1;
    do
    {
      // t = t / 57121, p = p + t / n, t = t / 57121, p = p - t / (n+2)
      remainder1 = remainder2 = remainder3 = remainder4 = 0;
      isZero = true;
      n += 4;
      n2 += 4;
      for (i = 0; i <= PRECISION; i++)
      {
        b = SIZE * remainder1 + t[i];
        t[i] = b / 57121;
        remainder1 = b % 57121;

        b = SIZE * remainder2 + t[i];
        p[i] += b / n;
        remainder2 = b % n;

        b = SIZE * remainder3 + t[i];
        t[i] = b / 57121;
        remainder3 = b % 57121;

        b = SIZE * remainder4 + t[i];
        p[i] -= b / n2;
        remainder4 = b % n2;

        if (isZero && t[i] != 0)    // is t zero?
          isZero = false;
      }
    } while (!isZero);

    // p = p * 4
    carry = 0;
    for (i = PRECISION; i >= 0; i--)
    {
      b = p[i] * 4 + carry;
      p[i] = b % SIZE;
      carry = b / SIZE;
    }

    // Borrow and carry.
    for (i = PRECISION; i > 0; i--)
    {
      if (p[i] < 0)
      {
        b = p[i] / SIZE;
        p[i] -= (b - 1) * SIZE;
        p[i-1] += b - 1;
      }
      if (p[i] >= SIZE)
      {
        b = p[i] / SIZE;
        p[i] -= b * SIZE;
        p[i-1] += b;
      }
    }

    // Store results in string buffer.
    text[0] = p[0] + '0';
        l = 1;
    for (i = 1; i < PRECISION; i++)
        {
                sprintf(text + l, "%.3d", p[i]);
                l += 3;
        }
    text[TOTAL_DIGITS+1] = '\0';

    // Print formated results.
    printf("pi = %c.\n\n", text[0]);
    for (i = 1; i <= TOTAL_DIGITS; i++)
    {
        printf("%c", text[i]);

      if (i % 1000 == 0)
      {
            printf("\n\n");
      }
      else if (i % 50 == 0)
                printf("\n");
      else if (i % 10 == 0)
                printf(" ");
    }
    printf("\n");
  }