#=
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

Computing Pi using FFTs are much much faster, but also much more
complicated.  Using the ArcTan methods are fairly simple to implement,
but not nearly as fast as the FFT methods.  Also, the
pi / 4 = 4 * ArcTan(1/5) - ArcTan(1/239) formula is one of the faster
of the various ArcTan formulas for computing PI.

Author: M. Scott Reynolds
Date: 13 August 2016
=#

const SIZE = 1000

# Compute pi up to maxDigits long.
# Return result as a string. 
function computePi(maxDigits)
    precision = div(maxDigits, 3) + 2
    p = zeros(Int, precision+1)
    t = zeros(Int, precision+1)

    # Note, borrows and carries from the addition and subtraction
    # are postponed till last.  See: http://www.boo.net/~jasonp/ord

    start = time();

    # Compute arctan(1/5)

    # t = t / 5, p = t
    t[1] = 1
    remainder1 = 0
    for i = 1 : precision+1
        b = SIZE * remainder1 + t[i]
        t[i] = Base.unsafe_trunc(Int, b/5)
        p[i] = t[i]
        remainder1 = mod(b, 5)
    end

    # While t is not zero.
    n = -1
    n2 = 1
    isZero = false
    while !isZero
        # t = t / 25, p = p - t / n, t = t / 25, p = p + t / (n+2)
        remainder1 = 0
        remainder2 = 0
        remainder3 = 0
        remainder4 = 0
        isZero = true
        n = n + 4
        n2 = n2 + 4
        for i = 1 : precision+1
            b = SIZE * remainder1 + t[i]
            t[i] = Base.unsafe_trunc(Int, b/25)
            remainder1 = b % 25

            b = SIZE * remainder2 + t[i]
            p[i] = p[i] - Base.unsafe_trunc(Int, b/n)
            remainder2 = b % n

            b = SIZE * remainder3 + t[i]
            t[i] = Base.unsafe_trunc(Int, b/25)
            remainder3 = b % 25

            b = SIZE * remainder4 + t[i]
            p[i] = p[i] + Base.unsafe_trunc(Int, b/n2)
            remainder4 = b % n2

            if isZero && t[i] != 0
                isZero = false
            end
        end
    end

    # p = p * 4
    carry = 0
    for i = precision+1 : -1 : 1
        b = p[i] * 4 + carry
        p[i] = b % SIZE
        carry = Base.unsafe_trunc(Int, b/SIZE)
    end

    # Compute arctan(1/239)

    # t = t / 239, p = p - t
    t[1] = 1
    remainder1 = 0
    for i = 1 : precision+1
        b = SIZE * remainder1 + t[i]
        t[i] = Base.unsafe_trunc(Int, b/239)
        p[i] = p[i] - t[i]
        remainder1 = b % 239
    end

    # While t is not zero.
    n = -1
    n2 = 1
    isZero = false
    while !isZero
        # t = t / 57121, p = p + t / n, t = t / 57121, p = p - t / (n+2)
        remainder1 = 0
        remainder2 = 0
        remainder3 = 0
        remainder4 = 0
        isZero = true
        n = n + 4
        n2 = n2 + 4
        for i = 1 : precision+1
            b = SIZE * remainder1 + t[i]
            t[i] = Base.unsafe_trunc(Int, b/57121)
            remainder1 = b % 57121

            b = SIZE * remainder2 + t[i]
            p[i] = p[i] + Base.unsafe_trunc(Int, b/n)
            remainder2 = b % n

            b = SIZE * remainder3 + t[i]
            t[i] = Base.unsafe_trunc(Int, b/57121)
            remainder3 = b % 57121

            b = SIZE * remainder4 + t[i]
            p[i] = p[i] - Base.unsafe_trunc(Int, b/n2)
            remainder4 = b % n2

            if isZero && t[i] != 0     # is t zero?
                isZero = false
            end
        end
    end

    # p = p * 4
    carry = 0
    for i = precision+1 : -1 : 1
        b = p[i] * 4 + carry
        p[i] = b % SIZE
        carry = Base.unsafe_trunc(Int, b/SIZE)
    end

    # Borrow and carry.
    for i = precision+1 : -1 : 2
        if p[i] < 0
            b = Base.unsafe_trunc(Int, p[i]/SIZE)
            p[i] = p[i] - (b - 1) * SIZE
            p[i-1] = p[i-1] + b - 1
        end
        if p[i] >= SIZE
            b = Base.unsafe_trunc(Int, p[i]/SIZE)
            p[i] = p[i] - b * SIZE
            p[i-1] = p[i-1] + b
        end
    end

    println(time() - start, " seconds to compute ", maxDigits, " digits of Pi.")

    # Store results in string buffer.
    text = string(p[1])
    for i = 2 : precision
        if p[i] < 10 
            text *= "00"
        elseif p[i] < 100 
            text *= "0"
        end
        text *= string(p[i])
    end
    return text[1:maxDigits+1]
end

let
    totalDigits = 10000
    s = computePi(totalDigits)
    #println(s)

    # Print formated results.

    println("pi = ", s[1], ".")
    for n = 2 : totalDigits+1
        print(s[n])
        if (n-1) % 1000 == 0
            println("\n")
        elseif (n-1) % 50 == 0
            println("")
        elseif (n-1) % 10 == 0
            print(" ")
        end
    end
    println("")
end
