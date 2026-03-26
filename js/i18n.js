/* ========================================
   I18N.JS – Internationalization Module
   Deutsch (default, hardcoded in HTML)
   English (loaded via JSON)
   ======================================== */

var I18N = {
  currentLang: 'de',
  translations: {},

  init: function () {
    var stored = localStorage.getItem('ll-lang');
    if (!stored && navigator.language && navigator.language.slice(0, 2) === 'en') {
      stored = 'en';
    }
    this.currentLang = stored || 'de';
    document.documentElement.lang = this.currentLang;
    if (this.currentLang !== 'de') {
      this.loadTranslations(this.currentLang);
    }
    this.initSwitcher();
  },

  loadTranslations: function (lang) {
    var basePath = document.querySelector('script[src*="i18n.js"]').src;
    var jsonPath = basePath.replace('js/i18n.js', 'i18n/' + lang + '.json');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', jsonPath, false); // sync for simplicity
    xhr.send();
    if (xhr.status === 200) {
      this.translations = JSON.parse(xhr.responseText);
      this.translateDOM();
    }
  },

  t: function (key, fallback) {
    if (this.currentLang === 'de') return fallback || key;
    return this.translations[key] || fallback || key;
  },

  translateDOM: function () {
    var self = this;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = self.translations[key];
      if (!val) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    });
    // Translate data-tooltip attributes
    document.querySelectorAll('[data-i18n-tooltip]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-tooltip');
      var val = self.translations[key];
      if (val) el.setAttribute('data-tooltip', val);
    });
    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      var val = self.translations[key];
      if (val) el.setAttribute('title', val);
    });
    document.documentElement.lang = this.currentLang;
    // Update page title if translation exists
    var titleKey = document.querySelector('title') && document.querySelector('title').getAttribute('data-i18n');
    if (titleKey && this.translations[titleKey]) {
      document.title = this.translations[titleKey];
    }
  },

  setLang: function (lang) {
    localStorage.setItem('ll-lang', lang);
    location.reload();
  },

  initSwitcher: function () {
    var self = this;
    var label = this.currentLang === 'de' ? 'EN' : 'DE';
    var btns = document.querySelectorAll('#lang-switcher, #lang-switcher-landing');
    btns.forEach(function (btn) {
      btn.textContent = label;
      btn.addEventListener('click', function () {
        self.setLang(self.currentLang === 'de' ? 'en' : 'de');
      });
    });
  }
};
