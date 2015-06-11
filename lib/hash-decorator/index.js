import words from './words'

class HashDecorator {
  constructor() {
    this.words = words
    this.glyphs = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    this.distributor = Math.floor(this.words.length / this.glyphs.length)
  }

  decorateHash(hash) {
    var third = Math.floor(hash.length / 3)

    var third1 = hash.substr(0, third)
    var third2 = hash.substr(third, third)
    var third3 = hash.substr(third + third, third)

    var word1 = this._getWord(third1 + third2 + third3)
    var word2 = this._getWord(third2 + third3 + third1)
    var word3 = this._getWord(third3 + third1 + third2)

    return `${hash}-${word1}-${word2}-${word3}`
  }

  // So you can use decor.ate(hash)
  ate(hash) {
    return this.decorateHash(hash)
  }

  // private

  _getWord(hash) {
    var index = 1
    for (let i of Array(this.distributor).keys()) {
      var glyph = hash.substr(i, 1)
      var glyphIndex = this.glyphs.indexOf(glyph)
      index = this._normalizeIndex(index) * glyphIndex
      index = this._normalizeIndex(index)
    }
    return this.words[index]
  }

  _normalizeIndex(index) {
    while (index > this.words.length) {
      index = index - this.words.length
    }
    return index + 1
  }
}

class testHashDecorator {
  constructor() {
    this.decor = new HashDecorator(words)
    this.glyphs = this.decor.glyphs
    this.length = this.glyphs.length

    console.log('\nRandom hash test:')
    for (let i of Array(30).keys()) {
      this.testRandomHashes()
    }

    console.log('\nIPFS hash test:')
    this.testIPFSHashes()
  }

  testRandomHashes() {
    var hash = ''
    while (hash.length < 64) {
      hash = hash + this._randomGlyph()
    }
    console.log(this.decor.ate(hash))
  }

  testIPFSHashes() {
    var hash1 = 'QmSSnxeSoB6mbk2USmWeHSjUkSU1U8pkjxJdUh78pZX5ny'
    var hash2 = 'QmUf2ESFovFbjEJ3QGaWTVVTY4GCi61obZgLre3oWhKHmb'
    var hash3 = 'QmZAhKPWSSqhZUmY4LRnK3RjzzR6qC2fQgjFgo8QBpCRp6'

    console.log(this.decor.ate(hash1))
    console.log(this.decor.ate(hash2))
    console.log(this.decor.ate(hash3))
  }

  // private

  _randomGlyph() {
    return this.glyphs[this._randomInteger(0, this.length - 1)]
  }

  _randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
}

// new testHashDecorator()

export default HashDecorator
