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
  console.log(readData.length);
  readData = readData.replace(/^.*'s$/gm, '');
  console.log(readData.length);

  for (let step = 10; step > 2; step--) {
    let replaceList = [];

    readData.split(/\n/).forEach((chars) => {
      if (chars.length  > step) {
        for (var i = 0; i < chars.length; i = i + step) {
          let testChars = chars.slice(i, i + step);
          let reg = new RegExp(testChars, 'gi');

          if (tried.indexOf(testChars) === -1 && testChars.length >= step) {
            let matchLength = readData.match(reg).length
            
            tried.push(testChars);
            
            if (matchLength > 200) {
              console.log(readData.match(reg).length, testChars);
              largestMatch = testChars;
              largestMatchCount = readData.match(reg).length;

              replaceList.push(testChars);            
            } 
          }

        }
      }
    });

    replaceList.forEach((toReplace) => {
      const matcher = new RegExp(toReplace, 'gi');

      if (readData.match(matcher).length > 0) {
        const nextReplace = String.fromCharCode(160 + iter++);
        
        subs[nextReplace] = largestMatch;
        readData = readData.replace(new RegExp(toReplace, 'gi'), nextReplace);
        console.log(readData.length, subs);
      }
    });

  }
});

process.on('beforeEnd', () => {
  console.log('done-ish');
  console.log('compress.json', JSON.stringify(subs));
  // fs.writeFile('compress.json', JSON.stringify(subs));
});