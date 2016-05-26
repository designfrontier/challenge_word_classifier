'use strict';
const fs= require('fs');
const reader = fs.createReadStream('words.txt');
//dont need to store the dictionary... just the list of transforms
// in order? maybe? then see if it has a specific number of matches?
// ideas...
const tried = [];

let subs = {};
let readData = '';
let iter = 0;

reader.on('data', (chunk) => {
  const chunkString = chunk.toString('utf8');

  readData += chunkString;
}).on('end', () => {
  //remove all the 's because we can guess those for cheaper
  console.log('Original: ', readData.length);
  readData = readData.replace(/^.*'s$/gm, '');
  console.log('Remove posessives: ', readData.length);
  readData = readData.replace(/^.{0,3}$/gm, '');
  console.log('Remove small words: ', readData.length);
  readData = readData.replace(/^.*[B,C,D,F,G,H,J,K,L,M,N,P,Q,R,T,V,X,Z,W,Y]s$/gim, '');
  console.log('Remove plurals: ', readData.length);
  readData = readData.replace(/^[A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,X,Z,W,Y].*$/gm, '');
  readData = readData.replace(/^\n$/gm, '');
  console.log('Remove abbrevs and proper nouns (all caps): ', readData.length);

  for (let step = 4; step <= 10; step++) {
    let replaceList = [];

    console.log(`looking for ${step} size matches`);
    console.log(readData.split(/\n/).length);
    readData.split(/\n/).forEach((chars) => {
      if (chars.length  > step) {
        process.stdout.write(chars + '|');

        for (var i = 0; i + step <= chars.length; i++) {
          let testChars = chars.slice(i, i + step);
          let reg = new RegExp(testChars, 'gi');

          process.stdout.write(testChars + '|');

          if (tried.indexOf(testChars) === -1 && testChars.length >= step) {
            let matchLength = readData.match(reg).length

            tried.push(testChars);

            if (matchLength > 5000) {
              console.log(readData.match(reg).length, testChars);

              replaceList.push({chars: testChars, count: readData.match(reg).length});
            }
          }
        }

        process.stdout.write('\n');
      }
    });

    replaceList.sort((a, b) => {
       return a.count - b.count;
    }).forEach((toReplace) => {
      const matcher = new RegExp(toReplace.chars, 'gi');

      if (readData.match(matcher) !== null) {
        const nextReplace = String.fromCharCode(160 + iter++);

        subs[nextReplace] = toReplace.chars;
        readData = readData.replace(new RegExp(toReplace.chars, 'gi'), nextReplace);
        console.log(readData.length, subs, Object.keys(subs).length);
      }
    });

  }
});

module.exports = {
  init: (dataIn) => {
    return dataIn;
  },

  test: (word) => {
    //remove 's and trailing s since meh
    let testWord = word.replace(/(.*[B,C,D,F,G,H,J,K,L,M,N,P,Q,R,T,V,X,Z,W,Y])(s)$/gim, '$1').replace(/(^.*)('s)$/gm, '$1');

    if (word.length > 58) {
      return false;
    }

    if (word.length <= 3 || testWord[0].toUpperCase() === testWord[0]) {
      //asssume this is either a abbrev, proper noun or word... probably true
      return true;
    } else {

      return 'maybe';
    }
  }
}

process.on('beforeEnd', () => {
  console.log('done-ish');
  console.log('compress.json', JSON.stringify(subs));
  // fs.writeFile('compress.json', JSON.stringify(subs));
});
