/**
* jquery.cashFormat.js
* @author: Egor Skorobogatov
* @version: 1.0.0 - 2013-10-08
*
* Created by Egor Skorobogatov on 2013-10-08. Please report any bugs to https://github.com/git-decadent/cashFormat.js.git
*
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
    acceprtCodes = {
      8: true,
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
      58: true
    },
    splitNumber = function splitNumber(num) {
      
      if (num === '') {
        return num;
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
      
          return result.trim();
        };
  
      numResult += dettach(num);
      return numResult;
    },
    doGetCaretPosition = function (oField) {
      var iCaretPos = 0;

      if (document.selection) {
        oField.focus ();
        var oSel = document.selection.createRange();
        oSel.moveStart ('character', -oField.value.length);
        iCaretPos = oSel.text.length;
      } else if (oField.selectionStart || oField.selectionStart == '0') {
        iCaretPos = oField.selectionStart;
      }
      
      return (iCaretPos);
    },
    trim = function (val) {
      return val.replace(/\s/gi, '');
    },
    defaultOptions = {
      separator: '.'
    };
  
  var Cash = function (jElem, options) {
    this.$el = $(jElem);
    console.log(options)
    this.options = $.extend(defaultOptions, options);
    
    this.$el.addClass('cash-input');
    
    this.init();
  };
  
  Cash.prototype.init = function () {
    var self = this,
      val = this.$el.val();
      
    if (val === '' || val === null || val === undefined) {
      val = '0' + this.options.separator + '00';
    } else {  
      val = val.replace('.', this.options.separator);
      if (val.search(this.options.separator) < 0) {
        val += this.options.separator + '00';
      }
    }
    
    this.$el.val(val);  
    this.cacheVal = val;
    
    this.$el.on({
      keyup: function (e) {
        self.handleKeyUp.call(self, e);
      },
      keydown: function (e) {
        self.handleKeyDown.call(self, e);
      },
      blur: function () {
        self.handleChange.call(self);
      }
    });
  }
  Cash.prototype.handleChange = function () {
    var parts,
      val;
      
    if (this.cacheVal !== null) {
      val = this.cacheVal;
    } else {
      val = this.$el.val();
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
  }
  Cash.prototype.handleKeyDown = function (e) {
    if (!acceprtCodes[e.keyCode]) {
      return;
    }
    this.cacheVal = this.cacheVal === null ? this.$el.val() : this.cacheVal;
  }
  Cash.prototype.handleKeyUp = function (e) {
    if (!acceprtCodes[e.keyCode]) {
      return;
    }

    var val = trim(this.$el.val()),
      matches = /((^0(?=,|\.)|^[123456789]){0,1}[\d]*)[,\.]{1}([\d]{0,2})$/gi.exec(val),
      caret = doGetCaretPosition(this.$el[0]);

    if (matches === null && val.split(this.options.separator)[0] !== '') {
      this.$el.val(this.cacheVal);
    } else {
      if (matches !== null) {
        this.$el.val(splitNumber(matches[1]) + this.options.separator + matches[3]);
      }
      this.cacheVal = null;

      this.$el[0].setSelectionRange(caret, caret);
    }
  }
  Cash.prototype.getValue = function () {
    return parseFloat(trim(this.$el.val().replace(this.options.separator, '.')), 10);
  }
  
  $.fn.cashFormat = function () {
    var self = this,
      arrgs = arguments;
    
    if (arguments.length === 0 || typeof arguments[0] !== 'string') {
      $.each(this, function (key, value) {
        cache['cache_' + key] = new Cash(self[key], arrgs.length === 0 ? {} : arrgs[0]);
        self[key].cid = 'cache_' + key;
      });
    } else if (typeof arguments[0] === 'string') {
      $.each(this, function (key, value) {
        cache[self[key].cid][arrgs[0]]();
      });
    }

    return this;
  }
  
})(jQuery);