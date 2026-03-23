/* ========================================
   PROFANITY FILTER – DE + EN Wortliste
   Client-side Filter für Namenseingabe
   ======================================== */

var PROFANITY_LIST = [
  // Deutsche Schimpfwörter
  'arschloch', 'arsch', 'wichser', 'hurensohn', 'hure', 'fotze', 'fick',
  'ficken', 'gefickt', 'schlampe', 'nutte', 'missgeburt', 'bastard',
  'drecksau', 'scheisse', 'scheiss', 'kacke', 'pisser', 'pisse',
  'schwuchtel', 'tunte', 'spast', 'spasti', 'behindert', 'mongo',
  'depp', 'idiot', 'vollidiot', 'trottel', 'dummschwätzer',
  'penner', 'assi', 'assozial', 'dreckschwein', 'schwein',
  'miststück', 'dreckstück', 'blödmann', 'blödian',
  'wixer', 'wixxer', 'opfer',

  // Rassistische / diskriminierende Begriffe (DE)
  'neger', 'nigger', 'kanake', 'kanack', 'kümmeltürke', 'kameltreiber',
  'schlitzauge', 'zigeuner', 'zigo', 'polacke', 'spaghettifresser',
  'kartoffel', 'nazi', 'heil', 'sieg heil', 'judenschwein',
  'judensau', 'vergasen', 'rassenschande',

  // Sexistische Begriffe (DE)
  'schlampe', 'flittchen', 'tussi', 'miststück', 'zicke',
  'emanze', 'mannweib',

  // Englische Schimpfwörter
  'fuck', 'fucker', 'fucking', 'shit', 'shitty', 'asshole', 'ass',
  'bitch', 'bastard', 'damn', 'dick', 'dickhead', 'cock', 'cunt',
  'pussy', 'whore', 'slut', 'motherfucker', 'bullshit', 'dumbass',
  'jackass', 'prick', 'twat', 'wanker', 'tosser', 'bollocks',
  'bloody', 'bugger', 'arse',

  // Rassistische Begriffe (EN)
  'nigga', 'nigger', 'chink', 'gook', 'spic', 'wetback',
  'kike', 'cracker', 'honky', 'coon', 'darkie', 'paki',
  'raghead', 'towelhead', 'beaner', 'redskin',

  // Sexistische / homophobe Begriffe (EN)
  'fag', 'faggot', 'dyke', 'tranny', 'retard', 'retarded',
  'homo', 'lesbo',

  // Weitere / Kombinationen
  'penis', 'vagina', 'anal', 'dildo', 'porn', 'porno',
  'sex', 'rape', 'vergewaltigung', 'tits', 'boobs', 'titten',
  'schwanz', 'möse'
];

// Leetspeak-Ersetzungen
var LEET_MAP = {
  '@': 'a',
  '4': 'a',
  '0': 'o',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '5': 's',
  '$': 's',
  '7': 't',
  '+': 't',
  '8': 'b'
};

/**
 * Prüft ob ein Name ein Fluchwort enthält.
 * Normalisiert den Input (lowercase, Leetspeak, Sonderzeichen entfernen).
 * @param {string} name - Der zu prüfende Name
 * @returns {boolean} true wenn ein verbotenes Wort gefunden wurde
 */
function containsProfanity(text) {
  if (!text) return false;

  // Normalize: lowercase
  var normalized = text.toLowerCase();

  // Leetspeak-Ersetzungen
  var chars = normalized.split('');
  for (var i = 0; i < chars.length; i++) {
    if (LEET_MAP[chars[i]]) {
      chars[i] = LEET_MAP[chars[i]];
    }
  }
  normalized = chars.join('');

  // Sonderzeichen entfernen (ausser Buchstaben und Leerzeichen)
  var cleaned = normalized.replace(/[^a-zäöüß\s]/g, '');

  // Zeichenwiederholungen normalisieren: fuuuck → fuck, scheeeiisse → scheisse
  cleaned = cleaned.replace(/(.)\1+/g, '$1');

  // Trennzeichen zwischen einzelnen Buchstaben entfernen: f u c k → fuck
  var noSpaces = cleaned.replace(/\s+/g, '');

  // Umlaut-Varianten: oe→ö, ae→ä, ue→ü
  var withUmlauts = cleaned.replace(/oe/g, 'ö').replace(/ae/g, 'ä').replace(/ue/g, 'ü');
  var noSpacesWithUmlauts = noSpaces.replace(/oe/g, 'ö').replace(/ae/g, 'ä').replace(/ue/g, 'ü');

  // Alle Varianten prüfen
  // Short words (<=3 chars) only match as whole words to avoid false positives
  // (e.g. "ass" matching in "etwasstunden" from leetspeak 5→s)
  var substringVariants = [cleaned, noSpaces, withUmlauts, noSpacesWithUmlauts];
  var wordBoundaryVariants = [cleaned, withUmlauts];

  for (var j = 0; j < PROFANITY_LIST.length; j++) {
    var word = PROFANITY_LIST[j];
    if (word.length <= 3) {
      // Short words: whole-word match only (with space-separated variants)
      var wordRegex = new RegExp('\\b' + word + '\\b');
      for (var v = 0; v < wordBoundaryVariants.length; v++) {
        if (wordRegex.test(wordBoundaryVariants[v])) {
          return true;
        }
      }
    } else {
      // Longer words: substring match across all variants
      for (var v = 0; v < substringVariants.length; v++) {
        if (substringVariants[v].indexOf(word) !== -1) {
          return true;
        }
      }
    }
  }

  return false;
}
