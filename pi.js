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
  Date: 18 August 2018

  28 April 2018: Updated to run under nodejs.
*/

/* (n >> 0) is faster than Math.trunc(n) */
function trunc(n)
{
  return n >> 0;
}

/* Compute pi and return result as a string. */
function computePi(maxDigits)
{
  var SIZE = 1000;
  var precision = trunc(maxDigits/3) + 2;
  var remainder1, remainder2, remainder3, remainder4;
  var b, n, n2, carry;
  var i, l;
  var isZero;
  var p = new Array(precision+1);
  var t = new Array(precision+1);
  var text;

  // Initialize t.
  for (i = 0; i <= precision; i++)
    t[i] = 0;

  // Note, borrows and carries from the addition and subtraction
  // are postponed till last.  See: http://www.boo.net/~jasonp/ord

  // Compute arctan(1/5)

  // t = t / 5, p = t
  t[0] = 1;
  remainder1 = 0;
  for (i = 0; i <= precision; i++) {
    b = SIZE * remainder1 + t[i];
    p[i] = t[i] = (b / 5 >> 0);
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
      t[i] = (b / 25 >> 0);
      remainder1 = b % 25;

      b = SIZE * remainder2 + t[i];
      p[i] -= (b / n >> 0);
      remainder2 = b % n;

      b = SIZE * remainder3 + t[i];
      t[i] = (b / 25 >> 0);
      remainder3 = b % 25;

      b = SIZE * remainder4 + t[i];
      p[i] += (b / n2 >> 0);
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
    carry = (b / SIZE >> 0);
  }

  // Compute arctan(1/239)

  // t = t / 239, p = p - t
  t[0] = 1;
  remainder1 = 0;
  for (i = 0; i <= precision; i++) {
    b = SIZE * remainder1 + t[i];
    p[i] -= t[i] = (b / 239 >> 0);
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
      t[i] = (b / 57121 >> 0);
      remainder1 = b % 57121;

      b = SIZE * remainder2 + t[i];
      p[i] += (b / n >> 0);
      remainder2 = b % n;

      b = SIZE * remainder3 + t[i];
      t[i] = (b / 57121 >> 0);
      remainder3 = b % 57121;

      b = SIZE * remainder4 + t[i];
      p[i] -= (b / n2 >> 0);
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
    carry = (b / SIZE >> 0);
  }

  // Borrow and carry.
  for (i = precision; i > 0; i--) {
    if (p[i] < 0) {
      b = (p[i] / SIZE >> 0);
      p[i] -= (b - 1) * SIZE;
      p[i-1] += b - 1;
    }
    if (p[i] >= SIZE) {
      b = (p[i] / SIZE >> 0);
      p[i] -= b * SIZE;
      p[i-1] += b;
    }
  }

  // Return results as a string.
  text = p[0] + ".";
  for (i = 1; i < precision; i++) {
    if (p[i] < 10)
      text += "00";
    else if (p[i] < 100)
      text += "0";
    text += p[i];
  }
  return text.substring(0, maxDigits+2);
}

/* Get the remote address from the http request object. */
function getRemoteAddress(request)
{
  var ip = request.headers['x-forwarded-for'] ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress ||
    request.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1)[0];	//in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
    return ip;
}

/* Return formatted date and time. */
function getDateTime()
{
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

/* start http server. */
function startServer(pi)
{
  var http = require('http');
  http.createServer(function (req, res) {
    console.log(
      "[" + getDateTime() + "] " +
      getRemoteAddress(req) + " " +
      req.method + " " + req.url);
    res.writeHead(200, {'Content-Type': 'text/plain'});

    res.end(pi);
  }).listen(31415);

  console.log("Ready to serve requests.  Listening on port 31415.");
}

var numberDigits = 10000;
var argv = require('minimist')(process.argv.slice(2));
if (argv._.length == 0) {
  console.log("usage: pi number_of_digits [--server] [--format]");
}
else {
  numberDigits = argv._[0];

  console.log('Computing pi to ' + numberDigits + ' places.');
  var timeStart = new Date().getTime();
  var pi = computePi(numberDigits);
  var timeEnd = new Date().getTime();
  if (argv.format) {
    // format the output.
    var s = "pi = 3.\n";
    for (var n = 1; n < pi.length; n++) {
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
  console.log("" + (timeEnd - timeStart) + "ms to compute " + numberDigits + " digits of pi.");
  if (argv.server) {
    startServer(pi);
  }
}
