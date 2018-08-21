# This program computes Pi by the formula:
# pi / 4 = 4 * ArcTan(1/5) - ArcTan(1/239)

# Adapted from some program I found on the Internet a long time
# ago that computed Pi by:
# pi / 4 = ArcTan(1/2) + ArcTan(1/3)

# I have no idea who wrote the original program nor remember where
# I found it--there wasn't any credits in the original C source.  This
# one also no longer looks like the original as I've completely rewritten
# it.  I got a lot of my information from
# http://www.boo.net/~jasonp/pipage.html when I rewrote the program.  This
# program will reliably compute upto 1,000,000 digits, that I've verified.

# There are faster ways of computing Pi, and this program probably
# could be optimized further, but it is sufficiently fast for computing
# Pi using relatively portable and understandable routines that can
# be easily converted into other languages.

# Computing Pi using FFTs are much much faster, but also much more
# complicated.  Using the ArcTan methods are fairly simple to implement,
# but not nearly as fast as the FFT methods.  Also, the
# pi / 4 = 4 * ArcTan(1/5) - ArcTan(1/239) formula is one of the faster
# of the various ArcTan formulas for computing PI.

# Author: M. Scott Reynolds
# Date: 12 September 2016

# Compute pi up to maxDigits long.
# Return result as a string.
def pi(maxDigits):
        SIZE = 1000

        # Initialize
        precision = maxDigits / 3 + 2
        p = [0 for i in range(precision+1)]
        t = [0 for i in range(precision+1)]

        # Note, borrows and carries from the addition and subtraction
        # are postponed till last.  

        # Compute arctan(1/5)

        # t = t / 5, p = t
        t[0] = 1
        remainder1 = 0
        i = 0
        while i <= precision:
                b = SIZE * remainder1 + t[i]
                t[i] = b / 5
                p[i] = t[i]
                remainder1 = b % 5
                i += 1

        # While t is not zero.
        n = -1
        n2 = 1
        isZero = False
        while not isZero:
                remainder1 = 0
                remainder2 = 0
                remainder3 = 0
                remainder4 = 0
                isZero = True
                n = n + 4
                n2 = n2 + 4
                i = 0
                while i <= precision:
                        b = SIZE * remainder1 + t[i]
                        t[i] = b / 25
                        remainder1 = b % 25

                        b = SIZE * remainder2 + t[i]
                        p[i] = p[i] - b / n
                        remainder2 = b % n

                        b = SIZE * remainder3 + t[i]
                        t[i] = b / 25
                        remainder3 = b % 25

                        b = SIZE * remainder4 + t[i]
                        p[i] = p[i] + b / n2
                        remainder4 = b % n2

                        if isZero and t[i] != 0:
                                isZero = False
                        i += 1

        # p = p * 4
        carry = 0
        i = precision
        while i >= 0:
                b = p[i] * 4 + carry
                p[i] = b % SIZE
                carry = b / SIZE
                i -= 1

        # Compute arctan(1/239)

        # t = t / 239, p = p - t
        t[0] = 1
        remainder1 = 0
        i = 0
        while i <= precision:
                b = SIZE * remainder1 + t[i]
                t[i] = b / 239
                p[i] = p[i] - t[i]
                remainder1 = b % 239
                i += 1

        # While t is not zero.
        n = -1
        n2 = 1
        isZero = False
        while not isZero:
                # t = t / 57121, p = p + t / n, t = t / 57121, p = p - t / (n+2)
                remainder1 = 0
                remainder2 = 0
                remainder3 = 0
                remainder4 = 0
                isZero = True
                n = n + 4
                n2 = n2 + 4
                i = 0
                while i <= precision:
                        b = SIZE * remainder1 + t[i]
                        t[i] = b / 57121
                        remainder1 = b % 57121

                        b = SIZE * remainder2 + t[i]
                        p[i] = p[i] + b / n
                        remainder2 = b % n

                        b = SIZE * remainder3 + t[i]
                        t[i] = b / 57121
                        remainder3 = b % 57121

                        b = SIZE * remainder4 + t[i]
                        p[i] = p[i] - b / n2
                        remainder4 = b % n2

                        if isZero and t[i] != 0:
                                isZero = False
                        i += 1

        # p = p * 4
        carry = 0
        i = precision
        while i >= 0:
                b = p[i] * 4 + carry
                p[i] = b % SIZE
                carry = b / SIZE
                i -= 1

        # Borrow and carry.
        i = precision
        while i >= 1:
                if p[i] < 0:
                        b = p[i] / SIZE
                        p[i] = p[i] - (b - 1) * SIZE
                        p[i-1] = p[i-1] + b - 1

                if p[i] >= SIZE:
                        b = p[i] / SIZE
                        p[i] = p[i] - b * SIZE
                        p[i-1] = p[i-1] + b
                i -= 1

        # Store results as a string.
        text = str(p[0]) + "."
        i = 1
        while i < precision:
                if p[i] < 10:
                        text = text + "00"
                elif p[i] < 100:
                        text = text + "0"
                text = text + str(p[i])
                i += 1

        return text

text = pi(10000)
print text