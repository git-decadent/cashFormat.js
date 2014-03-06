/**
* jquery.cashFormat.js
* @author: Egor Skorobogatov
* @version: 1.3.3 - 2014-26-02
*
* Created by Egor Skorobogatov on 2013-10-08. Please report any bugs to https://github.com/git-decadent/cashFormat.js.git
*
* The MIT License (http://www.opensource.org/licenses/mit-license.php)
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
*/
(function ($) {

  var cache = {},
    commandCodes = {
      // tab
      9: true,
      // ctrl
      17: true,
      // cmd
      91: true
    },
    subCommandCodes = {
      65: true,
      67: true,
      86: true,
      88: true
    },
    acceptCodesArrows = {
      // arrows
      37: true,
      38: true,
      39: true,
      40: true
    },
    acceptCodes = {
      // backspace
      8: true,
      // numbers
      48: true,
      49: true,
      50: true,
      51: true,
      52: true,
      53: true,
      54: true,
      55: true,
      56: true,
      57: true,
      58: true,
      // numpad numbers
      96: true,
      97: true,
      98: true,
      99: true,
      100: true,
      101: true,
      102: true,
      103: true,
      104: true,
      105: true,
      // comma and point
      188: true,
      190: true,
      // comma and point
      44: true,
      46: true
    },

    splitNumber = function splitNumber(num) {

      if (num === '' || num === undefined) {
        return '';
      }

      var numResult = '',
        dettach = function (numStr) {
          var i = numStr.length - 1,
            numArr = numStr.split('').reverse(),
            result = '';

          do {
            result += numArr[i];
            if (i % 3 === 0 && i !== 0) {
              result += ' ';
            }
            i -= 1;
          } while (i >= 0);

          return $.trim(result);
        };

      numResult += dettach(num);

      return numResult;
    },

    doGetCaretPosition = function (oField) {
      var iCaretPos = {
        start: 0,
        end: 0
      };

      if (document.selection) {
        oField.focus();
        var oSel = document.selection.createRange();
        oSel.moveStart('character', -oField.value.length);
        iCaretPos = {
          start: oSel.text.length,
          end: oSel.text.length
        };
      } else if (oField.selectionStart || oField.selectionStart == '0') {
        iCaretPos = {
          start: oField.selectionStart,
          end: oField.selectionEnd
        };
      }

      return iCaretPos;
    },

    setSelectionRange =  function (elem, position) {
      if (elem.setSelectionRange) {
        elem.setSelectionRange(position, position);
      } else {
        var range = elem.createTextRange();
        range.collapse(true);
        range.moveStart('character', position);
        range.moveEnd('character', 0);
        range.select();
      }
    },

    trim = function (val) {
      return val.replace(/\s/gi, '');
    },

    countSpaces = function (val) {
      var spaces = val.match(/\s/gi);
      return (spaces !== null ? spaces.length : 0);
    },

    defaultOptions = {
      separator: '.'
    };

  var Cash = function (jElem, options) {
    this.$el = $(jElem);
    this.options = $.extend(defaultOptions, options);

    this.oFieldSelected = false;

    this.$el.addClass('cash-input');

    this.init();
  };

  Cash.prototype.init = function () {
    var self = this,
      val = trim(this.$el.val());

    if (val === '' || val === null || val === undefined) {
      val = '0' + this.options.separator + '00';
    } else {
      val = val.replace('.', this.options.separator);
      if (val.search(this.options.separator) < 0) {
        val = splitNumber(val) + this.options.separator + '00';
      } else {
        val = splitNumber(val.split(this.options.separator)[0]) + this.options.separator + val.split(this.options.separator)[1];
      }
    }

    this.$el.val(val);
    this.cacheVal = val;
    this.prevVal = val;

    this.timeout = undefined;

    this.$el.on({
      keyup: function (e) {
        clearTimeout(self.timeout);
        self.timeout = setTimeout(function () {
          self.handleKeyUp.call(self, e);
        }, 150);
      },
      keydown: function (e) {
        clearTimeout(self.timeout);
        self.handleKeyDown.call(self, e);
      },
      blur: function () {
        self.handleChange.call(self);
        self.oFieldSelected = false;
      },
      mouseup: function (e) {
        self.handleMouseEvent.call(self, e);
      }
    });
  };
  Cash.prototype.handleMouseEvent = function (e) {
    var caret = doGetCaretPosition(e.currentTarget);

    if (caret.start !== caret.end) {
      this.oFieldSelected = true;
    }

  };
  Cash.prototype.handleChange = function () {
    var parts,
      val = this.$el.val(),
      test = /(((^0(?=,|\.)|^[123456789])[\d]*)|^)[,\.]{1}([\d]{0,2})|[,\.]$/gi.test(trim(val));

    if (this.cacheVal !== null && test === false) {
      val = this.cacheVal;
    }

    parts = val.split(this.options.separator);

    if (parts.length === 1) {
      val += this.options.separator + '00';
    } else if (parts[1].length <= 1) {
      val += parts[1].length === 0 ? '00' : '0';
    }

    if (parts[0] === '') {
      val = '0' + val;
    }

    this.$el.val(val);

    if (this.prevVal !== val) {
      this.$el.change();
      this.prevVal = val;
    }
  };
  Cash.prototype.checkCommand = function (keyCode) {
    if (commandCodes[keyCode]) {
      this.commandPressed = true;
      return true;
    }

    if (subCommandCodes[keyCode] && this.commandPressed) {
      return true;
    }
  };
  Cash.prototype.handleKeyDown = function (e) {
    if (!acceptCodes[e.keyCode] && !acceptCodesArrows[e.keyCode]) {
      if (!this.checkCommand(e.keyCode)) {
        e.preventDefault();
        return;
      }
    }
    if (this.cacheVal === null) {
      this.cacheVal = this.$el.val();
    }

    this.spaces = this.preCountSpaces(e.currentTarget);
  };
  Cash.prototype.preCountSpaces = function (oField) {
    var val = oField.value,
      caret = doGetCaretPosition(oField);

    if (this.oFieldSelected) {
      this.oFieldSelected = false;
      return 0;
    } else if (caret.start === caret.end) {
      return countSpaces(val);
    } else {
      return countSpaces(val.substr(caret.start, caret.end));
    }
  },
  Cash.prototype.handleKeyUp = function (e) {
    if (!this.commandPressed || e.keyCode != 86) {
      if (!acceptCodes[e.keyCode]) {
        return;
      }
    }

    if (commandCodes[e.keyCode]) {
      this.commandPressed = false;
    }

    var val, matches, caret, currentSpaces, fisrtSymbol;

    val = trim(this.$el.val());
    fisrtSymbol = val.substr(0, 1);
    matches = /(((^0(?=,|\.)|^[123456789])[\d]*)|^)[,\.]{1}([\d]{0,2})|[,\.]$/gi.exec(val);
    caret = doGetCaretPosition(this.$el[0]).start;

    if (matches === null && /^[\d]+$/gi.exec(val) === null && /^\B$/gi.exec(val) === null) {
      this.$el.val(this.cacheVal);
      currentSpaces = -1;
    } else if (matches === null && /^[\d]+$/gi.exec(val) !== null) {
      if (fisrtSymbol === '0' && /^[0]$/gi.exec(val) === null) {
        val = '0';
      }
      this.$el.val(splitNumber(val));
      this.cacheVal = null;
      currentSpaces = countSpaces(this.$el.val()) - this.spaces;
    } else if (matches === null && /^\B$/gi.exec(val) !== null) {
      currentSpaces = 0;
    } else {
      if (matches[0] !== this.options.separator) {
        this.$el.val(splitNumber(matches[1]) + this.options.separator + matches[4]);
      } else {
        this.$el.val(this.options.separator);
      }

      this.cacheVal = null;
      currentSpaces = countSpaces(this.$el.val()) - this.spaces;
    }

    setSelectionRange(this.$el[0], caret + currentSpaces);
  };
  Cash.prototype.getValue = function () {
    return parseFloat(trim(this.$el.val().replace(this.options.separator, '.')), 10);
  };

  $.fn.cashFormat = function () {
    var self = this,
      result = [],
      arrgs = arguments;

    if (arguments.length === 0 || typeof arguments[0] !== 'string') {
      $.each(this, function (key) {
        cache['cache_' + key] = new Cash(self[key], arrgs.length === 0 ? {} : arrgs[0]);
        self[key].cid = 'cache_' + key;
      });
    } else if (typeof arguments[0] === 'string') {
      $.each(this, function (key) {
        result.push(cache[self[key].cid][arrgs[0]]());
      });

      return result.length === 1 ? result[0] : result;
    }

    return this;
  };

})(jQuery);