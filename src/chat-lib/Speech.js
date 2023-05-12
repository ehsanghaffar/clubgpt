// bypass Google Translate

function shiftLeftOrRightThenSumOrXor(num, opArray) {
  return opArray.reduce((acc, opString) => {
    let op1 = opString[1]; // '+' | '-' ~ SUM | XOR
    let op2 = opString[0]; // '+' | '^' ~ SLL | SRL
    let xd = opString[2]; // [0-9a-f]

    let shiftAmount = xd >= 'a' ? xd.charCodeAt(0) - 87 : Number(xd);
    let mask = op1 == '+' ? acc >>> shiftAmount : acc << shiftAmount;
    return op2 == '+' ? (acc + mask & 0xffffffff) : (acc ^ mask);
  }, num);
}

function transformQuery(query) {
  const e = [];
  let f = 0;
  
  for (let g = 0; g < query.length; g++) {
    let l = query.charCodeAt(g);
    if (l < 128) {
      e[f++] = l;    
    } else if (l < 2048) {
      e[f++] = l >> 6 | 0xC0;
      e[f++] = l & 0x3F | 0x80;
    } else if ((0xD800 == (l & 0xFC00)) && (g + 1 < query.length) && (0xDC00 == (query.charCodeAt(g + 1) & 0xFC00))) {
      l = ((1 << 16) + ((l & 0x03FF) << 10) + (query.charCodeAt(++g) & 0x03FF));
      e[f++] = l >> 18 | 0xF0;
      e[f++] = l >> 12 & 0x3F | 0x80;
      e[f++] = l & 0x3F | 0x80;
    } else {
      e[f++] = l >> 12 | 0xE0;
      e[f++] = l >> 6 & 0x3F | 0x80;
      e[f++] = l & 0x3F | 0x80;
    }
  }
  return e;
}

function normalizeHash(encondindRound2) {
  if (encondindRound2 < 0) {
    encondindRound2 = (encondindRound2 & 0x7fffffff) + 0x80000000;
  }
  return encondindRound2 % 1E6;
}

function calcHash(query, windowTkk) {
  const bytesArray = transformQuery(query);
  
  let d = windowTkk.split('.');
  let tkkIndex = Number(d[0]) || 0;
  let tkkKey = Number(d[1]) || 0;
  
  let encondingRound1 = bytesArray.reduce((acc, current) => {
    acc += current;
    return shiftLeftOrRightThenSumOrXor(acc, ['+-a', '^+6'])
  }, tkkIndex);
  
  let encondingRound2 = shiftLeftOrRightThenSumOrXor(encondingRound1, ['+-3', '^+b', '+-f']) ^ tkkKey;
  let normalizedResult = normalizeHash(encondingRound2);
  
  return normalizedResult.toString() + "." + (normalizedResult ^ tkkIndex);
}

var qs = require('querystring');

class Speech {

  constructor(lang = 'vi') {
    this.voices = [];
    this.lang = lang;
    this.transKey = `410957.${Date.now()}`;
  }

  calcHash(query) {
    return calcHash(query, this.transKey);
  }

  /**
   * Make text to voices
   * @param {string} text 
   * @returns Array list string of voices
   */
  makeVoices(text) {
    this.processLineText(text);
    return this.voices;
  }

  /**
  * Make text to voice
  * @param {string} text 
  * @returns Url voice
  */
  makeVoice(text) {
    return this.transText2Voice(text);
  }

  processLineText(text) {
    let index = 0;
    let length = text.length;

    while (index < length) {
      let indexSplit = text.substring(index, index + 200).search(/\,|;|:|\.|\(|\)|\"|\'/);
      let line = '';
      let lastIndex = index;

      if (indexSplit >= 0) {
        line = text.substring(index, index + indexSplit).trim();
        lastIndex = index + indexSplit + 1;
      } else {
        let indexSpace = text.substring(index, index + 200).lastIndexOf(" ");
        if (indexSpace >= 0) {
          line = text.substring(index, index + indexSpace).trim();
          lastIndex = index + indexSpace + 1;
        } else {
          line = text.substring(index).trim();
          lastIndex = length;
        }
      }

      if (line.length > 0)
        this.voices.push(this.transText2Voice(line));

      index = lastIndex;
    }
  }

  transText2Voice(query, params = {}) {
    params = {
      ...params,
      "ie": "UTF-8",
      "tl": this.lang,
      "client": "t",
      "q": query,
      "tk": this.calcHash(query)
    };
    const googleTransUrl = `https://translate.google.com/translate_tts`;
    let googleTransUrlVoice = `${googleTransUrl}?${qs.stringify(params)}`;
    return googleTransUrlVoice.replace(/\'/gi, "\\\'");
  }

}

module.exports = Speech;