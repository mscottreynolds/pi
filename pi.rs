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

    Computing Pi using FFTs are much faster, but also much more
    complicated.  Using the ArcTan methods are fairly simple to implement,
    but not nearly as fast as the FFT methods.  Also, the
    pi / 4 = 4 * ArcTan(1/5) - ArcTan(1/239) formula is one of the faster
    of the various ArcTan formulas for computing PI.

    Author: M. Scott Reynolds
    Date: 18 August 2018

    5 June 2021: Rust version.
*/

use std::env;

const MAX_DIGITS: usize = 1_000_000;
const DEFAULT_DIGITS: usize = 50;

fn print_usage(args: &Vec<String>) {
    println!("USAGE: {} number_of_digits\n", args[0]);
    println!("\tnumber_of_digits = 1 through 1000000 (default = {}).\n", DEFAULT_DIGITS);
}

/* Return formatted date and time. */
fn main() {
    let mut number_digits = DEFAULT_DIGITS;
    let args: Vec<String> = env::args().collect();
    if args.len() > 1 {
        let arg = &args[1];
        match arg.parse::<usize>() {
            Ok(n) => number_digits = n,
            Err(_) => print_usage(&args),
        }
        if number_digits > MAX_DIGITS {
            number_digits = MAX_DIGITS;
        }
        println!("Computing pi to {} places.", number_digits);
    }

    let pi = compute_pi(&number_digits);

    // Format the output
    let mut n = 1;
    let mut chars = pi.chars();
    let mut s = format!("{}{}\n", chars.next().unwrap(), chars.next().unwrap());
    for c in chars {
        s.push(c);
        if n % 1000 == 0 {
            s.push_str("\n\n");
        } else if n % 50 == 0 {
            s.push_str("\n");
        } else if n % 10 == 0 {
            s.push_str(" ");
        }
        n += 1;
    }
    println!("{}", s);
}

/* Compute pi and return result as a string. */
fn compute_pi(max_digits: &usize) -> String {
    const SIZE: i32 = 1000;

    let precision = max_digits / 3 + 2;
    let mut p: Vec<i32> = Vec::with_capacity(precision+1);
    let mut t: Vec<i32> = Vec::with_capacity(precision+1);

    // initialize vectors.
    p.resize(precision+1, 0);
    t.resize(precision+1, 0);


    // Note, borrows and carries from the addition and subtraction
    // are postponed till last.  See: http://www.boo.net/~jasonp/ord

    // Compute arctan(1/5)

    // t = t / 5, p = t
    t[0] = 1;
    let mut remainder1 = 0;
    let mut i = 0;
    while i <= precision {
        let b = SIZE * remainder1 + t[i];
        t[i] = b / 5;
        p[i] = t[i];
        remainder1 = b % 5;
        i += 1;
    }


    // While t is not zero.
    let mut n = -1;
    let mut n2 = 1;
    loop {
        // t = t / 25, p = p - t / n, t = t / 25, p = p + t / (n+2)
        let mut remainder1 = 0;
        let mut remainder2 = 0;
        let mut remainder3 = 0;
        let mut remainder4 = 0;
        let mut is_zero = true;
        n += 4;
        n2 += 4;
        let mut i = 0;
        while i <= precision {
            let mut b = SIZE * remainder1 + t[i];
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

            if is_zero && t[i] != 0 {    // is t zero?
                is_zero = false;
            }
            i += 1;
        }
        if is_zero {break}
    }

    // p = p * 4
    let mut carry = 0;
    let mut i = precision;
    loop {
        let b = p[i] * 4 + carry;
        p[i] = b % SIZE;
        carry = b / SIZE;
        if i == 0 {break} else {i-=1}
    }

    // Compute arctan(1/239)

    // t = t / 239, p = p - t
    t[0] = 1;
    let mut remainder1 = 0;
    let mut i = 0;
    while i <= precision {
        let b = SIZE * remainder1 + t[i];
        t[i] = b / 239;
        p[i] -= t[i];
        remainder1 = b % 239;
        i += 1;
    }

    // While t is not zero.
    let mut n = -1;
    let mut n2 = 1;
    loop {
        // t = t / 57121, p = p + t / n, t = t / 57121, p = p - t / (n+2)
        let mut remainder1 = 0;
        let mut remainder2 = 0;
        let mut remainder3 = 0;
        let mut remainder4 = 0;
        let mut is_zero = true;
        n += 4;
        n2 += 4;
        let mut i = 0;
        while i <= precision {
            let mut b = SIZE * remainder1 + t[i];
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

            if is_zero && t[i] != 0 {   // is t zero?
                is_zero = false;
            }
            i += 1;
        }
        if is_zero {break}
    }

    // p = p * 4
    let mut carry = 0;
    let mut i = precision;
    loop {
        let b = p[i] * 4 + carry;
        p[i] = b % SIZE;
        carry = b / SIZE;
        if i == 0 { break } else { i -= 1 }
    }

    // Borrow and carry.
    let mut i = precision;
    while i > 0 {
        if p[i] < 0 {
            let b = p[i] / SIZE;
            p[i] -= (b - 1) * SIZE;
            p[i-1] += b - 1;
        }

        if p[i] >= SIZE {
            let b = p[i] / SIZE;
            p[i] -= b * SIZE;
            p[i-1] += b;
        }
        i -= 1;
    }

    // Return results as a string.
    let mut text = format!("{}.", p[0]);
    let mut i = 1;
    while i < precision {
        let n = p[i];
        if n < 10 {
            text.push_str(&format!("00{}", n));
        }
        else if n < 100 {
            text.push_str(&format!("0{}", n));
        }
        else {
            text.push_str(&format!("{}", n));
        }
        i += 1;
    }
    text.truncate(max_digits+2);

    return text;
}
