(*
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
  Date: 09 September 2006
*)

program Pi;

uses
    SysUtils;


const
    // Change TOTAL_DIGITS to compute more digits of pi.
    TOTAL_DIGITS : LongInt = 20000;
    SIZE = 1000;

var
    remainder1, remainder2, remainder3, remainder4: LongInt;
    b, n, n2, carry: LongInt;
    i, l: LongInt;
    isZero: Boolean;
    p: array of LongInt;
    t: array of LongInt;
    start, finish: Comp;
    text: array of Char;
    PRECISION: LongInt;

begin
    PRECISION := (TOTAL_DIGITS div 3) + 2;

    SetLength(p, PRECISION+1);
    SetLength(t, PRECISION+1);
    SetLength(text, TOTAL_DIGITS + 1);

    // Initialize t.
    for i := 0 to PRECISION do
    begin
        t[i] := 0;
    end;

    // Note, borrows and carries from the addition and subtraction
    // are postponed till last.  See: http://www.boo.net/~jasonp/ord
    //start := TimeStampToMSecs(DateTimeToTimeStamp(Now));

    // Compute arctan(1/5)
    // t = t / 5, p = t
    t[0] := 1;
    remainder1 := 0;
    for i := 0 to PRECISION do
    begin
        b := SIZE * remainder1 + t[i];
        t[i] := b div 5;
        p[i] := t[i];
        remainder1 := b mod 5;
    end;

    // While t is not zero.
    n := -1;
    n2 := 1;
    repeat
        // t = t / 25, p = p - t / n, t = t / 25, p = p + t / (n+2)
        remainder1 := 0;
        remainder2 := 0;
        remainder3 := 0;
        remainder4 := 0;

        isZero := True;
        Inc(n, 4);
        Inc(n2, 4);
        for i := 0 to PRECISION do
        begin
            b := SIZE * remainder1 + t[i];
            t[i] := b div 25;
            remainder1 := b mod 25;

            b := SIZE * remainder2 + t[i];
            p[i] := p[i] - b div n;
            remainder2 := b mod n;

            b := SIZE * remainder3 + t[i];
            t[i] := b div 25;
            remainder3 := b mod 25;

            b := SIZE * remainder4 + t[i];
            p[i] := p[i] + b div n2;
            remainder4 := b mod n2;

            if isZero and (t[i] <> 0) then    // is t zero?
                isZero := false;
        end;
    until isZero;

    // p = p * 4
    carry := 0;
    for i := PRECISION downto 0 do
    begin
        b := p[i] * 4 + carry;
        p[i] := b mod SIZE;
        carry := b div SIZE;
    end;

    // Compute arctan(1/239)

    // t = t / 239, p = p - t
    t[0] := 1;
    remainder1 := 0;
    for i := 0 to PRECISION do
    begin
        b := SIZE * remainder1 + t[i];
        t[i] := b div 239;
        p[i] := p[i] - t[i];
        remainder1 := b mod 239;
    end;

    // While t is not zero.
    n := -1;
    n2 := 1;
    repeat
        // t = t / 57121, p = p + t / n, t = t / 57121, p = p - t / (n+2)
        remainder1 := 0;
        remainder2 := 0;
        remainder3 := 0;
        remainder4 := 0;

        isZero := True;
        Inc(n, 4);
        Inc(n2, 4);
        for i := 0 to PRECISION do
        begin
            b := SIZE * remainder1 + t[i];
            t[i] := b div 57121;
            remainder1 := b mod 57121;

            b := SIZE * remainder2 + t[i];
            p[i] := p[i] + b div n;
            remainder2 := b mod n;

            b := SIZE * remainder3 + t[i];
            t[i] := b div 57121;
            remainder3 := b mod 57121;

            b := SIZE * remainder4 + t[i];
            p[i] := p[i] - b div n2;
            remainder4 := b mod n2;

            if isZero and (t[i] <> 0) then    // is t zero?
                isZero := false;
        end;
    until isZero;

    // p = p * 4
    carry := 0;
    for i := PRECISION downto 0 do
    begin
        b := p[i] * 4 + carry;
        p[i] := b mod SIZE;
        carry := b div SIZE;
    end;

    // Borrow and carry.
    for i := PRECISION downto 1 do
    begin
        if p[i] < 0 then
        begin
            b := p[i] div SIZE;
            p[i] := p[i] - (b - 1) * SIZE;
            p[i-1] := p[i-1] + b - 1;
        end;
        if p[i] >= SIZE then
        begin
            b := p[i] div SIZE;
            p[i] := p[i] - b * SIZE;
            p[i-1] := p[i-1] + b;
        end;
    end;

    //finish := TimeStampToMSecs(DateTimeToTimeStamp(Now));

    // Store results in string buffer.
    StrFmt(@text[0], '%d', [p[0]]);
    l := 1;
    for i := 1 to PRECISION-1 do
    begin
        StrFmt(@text[l], '%.3d', [p[i]]);
        Inc(l, 3);
    end;

    // Print formated results.
    WriteLn('pi = ', text[0], '.');
    for i := 1 to TOTAL_DIGITS do
    begin
        Write(text[i]);

        if (i mod 1000) = 0 then
        begin
            WriteLn;
            WriteLn;
        end
        else if (i mod 50) = 0 then
            WriteLn
        else if (i mod 10) = 0 then
            Write(' ');
    end;
    WriteLn;
    //WriteLn(finish - start, ' ms to compute ', TOTAL_DIGITS, ' digits of PI.');
end.
