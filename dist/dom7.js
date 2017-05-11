/**
 * Created by common on 2017/4/21.
 */
;(function (window) {
  Array.prototype.contains = function (elem) {
    if (Object.prototype.toString.call(elem) == '[object Array]') {
      for (var i in this) {
        for (var j = 0; j < elem.length; j++) {
          if (this[i] == elem[j]) return true;
        }
      }
    } else {
      for (var i in this) {
        if (this[i] == elem) return true;
      }
    }
    return false;
  };

  Array.prototype.remove = function (elem) {
    for (var i in this) {
      if (this[i] == elem) {
        this.splice(i, 1);
      }
    }
  };

  /**
   * 获取元素
   * @param parentEles
   * @param selectorList
   * @returns {*}
   */
  function getDom(parentEles, selectorList) {
    function splitHTMLCollection(HtmlCollection) {
      var eleCollection = [];
      for (var i = 0; i < HtmlCollection.length; i++) {
        eleCollection.push(HtmlCollection[i]);
      }
      return eleCollection;
    }

    if (selectorList.length === 0) {
      return parentEles;
    }
    var singleSelector = selectorList.shift(),
      searchEles = [];
    for (var x = 0; x < parentEles.length; x++) {
      if (/^\.[A-Za-z][_\-\w]*$/.test(singleSelector)) {
        searchEles = searchEles.concat(splitHTMLCollection(parentEles[x].getElementsByClassName(singleSelector.substring(1))));
      } else if (/^#[A-Za-z][_\-\w]*$/.test(singleSelector)) {
        searchEles.push(document.getElementById(singleSelector.substring(1)));
      } else if (/^[A-Za-z][_\-\w]*$/.test(singleSelector)) {
        searchEles = searchEles.concat(splitHTMLCollection(parentEles[x].getElementsByTagName(singleSelector)));
      } else if (/^[A-Za-z]+\.[A-Za-z][_\-\w]*$/.test(singleSelector)) {
        searchEles = searchEles.concat(splitHTMLCollection(parentEles[x].querySelectorAll(singleSelector)));
      }
    }
    return getDom(searchEles, selectorList);
  }

  function dom7(eleCollection) {
    for (var i = 0; i < eleCollection.length; i++) {
      this[i] = eleCollection[i];
    }
    this.length = eleCollection.length;
  }

  window.$$ = function (selector, context) {
    var eleCollection = [];
    if (typeof selector === 'string') {
      if (selector.indexOf(',') !== -1) {
        var selectorArray = selector.split(',');
      } else {
        var selectorArray = [selector];
      }
      for (var i = 0; i < selectorArray.length; i++) {
        eleCollection = eleCollection.concat(getDom([context || document], selectorArray[i].split(' ')));
      }
    } else if (Object.prototype.toString.call(selector) == '[object Array]') {
      eleCollection = selector;
    } else if (typeof selector === 'object') {
      eleCollection = [selector];
    }
    return new dom7(eleCollection);
  };

  var prototype = dom7.prototype;

  /**
   * 遍历选择器元素
   * @param done
   */
  prototype.each = function (done) {
    var eles = this;
    if (done && typeof done === 'function') {
      for (var x = 0; x < eles.length; x++) {
        (function (ele, index) {
          done.call(ele, index);
        })(eles[x], x);
      }
    }
    return this;
  };

  prototype.siblings = function (selector) {
    var eles = this,
      siblingEles = [];
    for (var x = 0; x < eles.length; x++) {
      var children = eles[x].parentNode.children;
      for (var i = 0; i < children.length; i++) {
        if (selector) {
          if (children[i] !== eles[x] && hasClass([children[i]], selector)) {
            siblingEles.push(children[i]);
          }
        } else {
          if (children[i] !== eles[x]) {
            siblingEles.push(children[i]);
          }
        }
      }
    }
    return $$(siblingEles);
  };

  prototype.find = function (selector) {
    var foundElements = [];
    var found = getDom(this, selector.split(' '));
    for (var j = 0; j < found.length; j++) {
      foundElements.push(found[j]);
    }
    return new $$(foundElements);
  };

  prototype.parent = function () {
    var parentNodes = [];
    this.each(function () {
      parentNodes.push(this.parentNode);
    });
    return $$(parentNodes);
  };

  prototype.is = function (selector) {
    if (!this[0]) return false;
    var compareWith, i;
    if (typeof selector === 'string') {
      var el = this[0];
      if (el === document) return selector === document;
      if (el === window) return selector === window;

      if (el.matches) return el.matches(selector);
      else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
      else if (el.mozMatchesSelector) return el.mozMatchesSelector(selector);
      else if (el.msMatchesSelector) return el.msMatchesSelector(selector);
      else {
        compareWith = $$(selector);
        for (i = 0; i < compareWith.length; i++) {
          if (compareWith[i] === this[0]) return true;
        }
        return false;
      }
    }
    else if (selector === document) return this[0] === document;
    else if (selector === window) return this[0] === window;
    else {
      if (selector.nodeType || selector instanceof dom7Ele) {
        compareWith = selector.nodeType ? [selector] : selector;
        for (i = 0; i < compareWith.length; i++) {
          if (compareWith[i] === this[0]) return true;
        }
        return false;
      }
      return false;
    }
  };

  prototype.parents = function (selector) {
    var parents = [];
    for (var i = 0; i < this.length; i++) {
      var parent = this[i].parentNode;
      while (parent) {
        if (selector) {
          if ($$(parent).is(selector)) parents.push(parent);
        }
        else {
          parents.push(parent);
        }
        parent = parent.parentNode;
      }
    }
    return $$(parents);
  };

  var hasClass = function (eles, className) {
    for (var x = 0; x < eles.length; x++) {
      var ele = eles[x],
        classList;
      if (ele.classList) {
        classList = ele.classList;
      } else {
        var classStr = ele.className;
        classList = (classStr || '').split(' ');
      }
      if (!classList.contains(className)) return false;
    }
    return true;
  };

  prototype.hasClass = function (className) {
    return hasClass(this, className);
  };

  prototype.addClass = function (className) {
    var eles = this;
    for (var x = 0; x < eles.length; x++) {
      var ele = eles[x];
      if (ele.classList) {
        ele.classList.add(className);
      } else {
        var classStr = ele.className;
        classArray = classStr ? classStr.split(' ') : [];
        classArray.push(className);
        ele.className = classArray.join(' ');
      }
    }
    return this;
  };

  prototype.removeClass = function (className) {
    var eles = this;
    for (var x = 0; x < eles.length; x++) {
      var ele = eles[x];
      if (ele.classList) {
        ele.classList.remove(className);
      } else {
        var classStr = ele.className,
          classArray = classStr ? classStr.split(' ') : [];
        classArray.remove(className);
        ele.className = classArray.join(' ');
      }
    }
  };

  prototype.on = function (eventName, targetSelector, listener, capture) {
    function handleLiveEvent(e) {
      var target = e.target;
      if ($$(target).is(targetSelector)) listener.call(target, e);
      else {
        var parents = $$(target).parents();
        for (var k = 0; k < parents.length; k++) {
          if ($$(parents[k]).is(targetSelector)) listener.call(parents[k], e);
        }
      }
    }

    var events = eventName.split(' ');
    var i, j;
    for (i = 0; i < this.length; i++) {
      if (typeof targetSelector === 'function' || targetSelector === undefined) {
        // Usual events
        if (typeof targetSelector === 'function') {
          listener = arguments[1];
          capture = arguments[2] || false;
        }
        for (j = 0; j < events.length; j++) {
          if (!this[i].dom7LiveListeners) this[i].dom7LiveListeners = [];
          this[i].addEventListener(events[j], listener, capture);
          this[i].dom7LiveListeners.push({listener: listener});
        }
      }
      else {
        //Live events
        for (j = 0; j < events.length; j++) {
          if (!this[i].dom7LiveListeners) this[i].dom7LiveListeners = [];
          this[i].dom7LiveListeners.push({listener: listener, liveListener: handleLiveEvent});
          this[i].addEventListener(events[j], handleLiveEvent, capture);
        }
      }
    }
    return this;
  };

  prototype.off = function (eventName, targetSelector, listener, capture) {
    var events = eventName.split(' ');
    for (var i = 0; i < events.length; i++) {
      for (var j = 0; j < this.length; j++) {
        if (typeof targetSelector === 'function' || targetSelector === undefined) {
          // Usual events
          if (typeof targetSelector === 'function') {
            listener = arguments[1];
            capture = arguments[2] || false;
          }
          if (listener === undefined) {
            if (this[j].dom7LiveListeners) {
              for (var k = 0; k < this[j].dom7LiveListeners.length; k++) {
                if (this[j].dom7LiveListeners[k].liveListener) {
                  this[j].removeEventListener(events[i], this[j].dom7LiveListeners[k].liveListener, capture);
                } else {
                  this[j].removeEventListener(events[i], this[j].dom7LiveListeners[k].listener, capture);
                }
              }
            }
          } else {
            this[j].removeEventListener(events[i], listener, capture);
          }
        }
        else {
          // Live event
          if (this[j].dom7LiveListeners) {
            for (var k = 0; k < this[j].dom7LiveListeners.length; k++) {
              if (this[j].dom7LiveListeners[k].listener === listener) {
                this[j].removeEventListener(events[i], this[j].dom7LiveListeners[k].liveListener, capture);
              }
            }
          }
        }
      }
    }
    return this;
  };

  prototype.trigger = function (eventName, eventData) {
    for (var i = 0; i < this.length; i++) {
      var evt;
      try {
        evt = new window.CustomEvent(eventName, {detail: eventData, bubbles: true, cancelable: true});
      }
      catch (e) {
        evt = document.createEvent('Event');
        evt.initEvent(eventName, true, true);
        evt.detail = eventData;
      }
      this[i].dispatchEvent(evt);
    }
    return this;
  };

  prototype.children = function (selector) {
    var childrenCollection = [];
    for (var i = 0; i < this.length; i++) {
      if (this[i].children) {
        childrenCollection = childrenCollection.concat(this[i].children);
      } else {
        for (var i = 0; i < this[i].childNodes.length; i++) {
          var child = this[i].childNodes[i];
          if (child.nodeType == 1 /*Node.ELEMENT_NODE*/) {
            childrenCollection.push(child);
          }
        }
      }
    }
    return $$(childrenCollection);
  };

  prototype.css = function (cssName, value) {
    var eles = this;
    if (cssName && typeof cssName === 'string' && value === undefined) {
      if (window.getComputedStyle) {
        var compStyle = window.getComputedStyle(eles[0], "");
      }
      else {
        var compStyle = eles[0].currentStyle;
      }
      return compStyle[cssName];
    }
    if (typeof cssName === 'string' && value) {
      for (var i = 0; i < eles.length; i++) {
        eles[i].style[cssName] = value;
      }
    } else if (typeof cssName === 'object') {
      for (var i = 0; i < eles.length; i++) {
        for (var key in cssName) {
          if (cssName.hasOwnProperty(key)) {
            eles[i].style[key] = cssName[key];
          }
        }
      }
    }
  };

  prototype.attr = function (name, value) {
    var eles = this;
    if (value === undefined) {
      return eles[0].getAttribute(name);
    } else {
      eles[0].setAttribute(name, value);
    }
  };

  prototype.width = function () {
    /**
     * 获取元素的宽度
     * @param el
     * @returns {number}
     */
    function getWidth(el) {
      if (window.getComputedStyle) {
        var styles = window.getComputedStyle(el);
      }
      else {
        var styles = window.currentStyle;
      }
      var width = el.offsetWidth;
      var borderLeftWidth = parseFloat(styles.borderLeftWidth);
      var borderRightWidth = parseFloat(styles.borderRightWidth);
      var paddingLeft = parseFloat(styles.paddingLeft);
      var paddingRight = parseFloat(styles.paddingRight);
      return width - borderLeftWidth - borderRightWidth - paddingLeft - paddingRight;
    }

    var iOS9 = function () {
      var deviceAgent = navigator.userAgent.toLowerCase();
      return /(iphone|ipod|ipad).* os 9_/.test(deviceAgent);
    };

    var eles = this;
    if (arguments.length === 0) {
      var ele = eles[0];
      if (ele === window) {
        return iOS9() ? document.documentElement.clientWidth : ele.innerWidth;
      } else {
        return getWidth(ele);
      }
    }
  };

  prototype.height = function () {
    /**
     * 获取元素的高度
     * @param el
     * @returns {number}
     */
    function getHeight(el) {
      if (window.getComputedStyle) {
        var styles = window.getComputedStyle(el);
      }
      else {
        var styles = window.currentStyle;
      }
      var height = el.offsetHeight;
      var borderTopWidth = parseFloat(styles.borderTopWidth);
      var borderBottomWidth = parseFloat(styles.borderBottomWidth);
      var paddingTop = parseFloat(styles.paddingTop);
      var paddingBottom = parseFloat(styles.paddingBottom);
      return height - borderTopWidth - borderBottomWidth - paddingTop - paddingBottom;
    }

    /**
     * 获取文档的高度
     * @returns {number}
     */
    function getDocumentHeight() {
      var body = document.body;
      var html = document.documentElement;
      return Math.max(
        body.offsetHeight,
        body.scrollHeight,
        html.clientHeight,
        html.offsetHeight,
        html.scrollHeight
      );
    }

    var eles = this;
    if (arguments.length === 0) {
      var ele = eles[0];
      if (ele === window) {
        return ele.innerHeight;
      } else if (ele === document) {
        return getDocumentHeight();
      } else {
        return getHeight(ele);
      }
    }
  };

  prototype.html = function () {
    var eles = this;
    if (arguments.length === 0) {
      return eles[0].innerHTML;
    } else {
      for (var i = 0; i < eles.length; i++) {
        eles[i].innerHTML = arguments[0];
      }
      return this;
    }
  };

  prototype.val = function () {
    var eles = this;
    if (arguments.length === 0) {
      return eles[0].value;
    } else {
      for (var i = 0; i < eles.length; i++) {
        eles[i].value = arguments[0];
      }
      return this;
    }
  };

  prototype.text = function () {
    var eles = this;
    if (arguments.length === 0) {
      return eles[0].textContent;
    } else {
      for (var i = 0; i < eles.length; i++) {
        eles[i].textContent = arguments[0];
      }
      return this;
    }
  };

  prototype.empty = function () {
    for (var i = 0; i < this.length; i++) {
      this[i].innerHTML = '';
    }
  };

  prototype.remove = function (selector) {
    var eles = getDom(this, [selector]);
    for (var i = 0; i < eles.length; i++) {
      eles[i].parentNode.removeChild(eles[i]);
    }
  };

  prototype.append = function () {
    var that = this;
    for (var i = 0; i < arguments.length; i++) {
      var content = arguments[i];
      if (typeof content === 'string') {
        stringAppend(content);
      }
    }

    function stringAppend(content) {
      for (var i = 0; i < that.length; i++) {
        if (that[i].insertAdjacentHTML) {
          that[i].insertAdjacentHTML('beforeend', content);
        } else {
          var range = document.createRange();
          var docFragmentToInsert = range.createContextualFragment(content);
          that[i].appendChild(docFragmentToInsert);
        }
      }
    }
  };

  $$.ck = dom7.prototype;
  /**
   * ajax 请求
   */
  $$.ajax = function (options) {

    //编码数据
    function setData() {
      //设置对象的遍码
      function setObjData(data, parentName) {
        function encodeData(name, value, parentName) {
          var items = [];
          name = parentName === undefined ? name : parentName + "[" + name + "]";
          if (typeof value === "object" && value !== null) {
            items = items.concat(setObjData(value, name));
          } else {
            name = encodeURIComponent(name);
            value = encodeURIComponent(value);
            items.push(name + "=" + value);
          }
          return items;
        }

        var arr = [], value;
        if (Object.prototype.toString.call(data) == '[object Array]') {
          for (var i = 0, len = data.length; i < len; i++) {
            value = data[i];
            arr = arr.concat(encodeData(typeof value == "object" ? i : "", value, parentName));
          }
        } else if (Object.prototype.toString.call(data) == '[object Object]') {
          for (var key in data) {
            value = data[key];
            arr = arr.concat(encodeData(key, value, parentName));
          }
        }
        return arr;
      }

      //设置字符串的遍码，字符串的格式为：a=1&b=2;
      function setStrData(data) {
        var arr = data.split("&");
        for (var i = 0, len = arr.length; i < len; i++) {
          name = encodeURIComponent(arr[i].split("=")[0]);
          value = encodeURIComponent(arr[i].split("=")[1]);
          arr[i] = name + "=" + value;
        }
        return arr;
      }

      if (data) {
        if (typeof data === "string") {
          data = setStrData(data);
        } else if (typeof data === "object") {
          data = setObjData(data);
        }
        data = data.join("&").replace("/%20/g", "+");
        //若是使用get方法或JSONP，则手动添加到URL中
        if (type === "get") {
          url += url.indexOf("?") > -1 ? (url.indexOf("=") > -1 ? "&" + data : data) : "?" + data;
        }
      }
    }

    //设置请求超时
    function setTime(callback, script) {
      if (timeOut !== undefined) {
        timeout_flag = setTimeout(function () {
          timeout_bool = true;
          xhr && xhr.abort();
        }, timeOut);
      }
    }

    // XHR
    function createXHR() {
      //由于IE6的XMLHttpRequest对象是通过MSXML库中的一个ActiveX对象实现的。
      //所以创建XHR对象，需要在这里做兼容处理。
      function getXHR() {
        if (window.XMLHttpRequest) {
          return new XMLHttpRequest();
        } else {
          //遍历IE中不同版本的ActiveX对象
          var versions = ["Microsoft", "msxm3", "msxml2", "msxml1"];
          for (var i = 0; i < versions.length; i++) {
            try {
              var version = versions[i] + ".XMLHTTP";
              return new ActiveXObject(version);
            } catch (e) {
            }
          }
        }
      }

      //创建对象。
      xhr = getXHR();
      xhr.open(type, url, async);
      //设置请求头
      if (type === "post" && !contentType) {
        //若是post提交，则设置content-Type 为application/x-www-four-urlencoded
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
      } else if (contentType) {
        xhr.setRequestHeader("Content-Type", contentType);
      }
      //添加监听
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (timeOut !== undefined) {
            //由于执行abort()方法后，有可能触发onreadystatechange事件，
            //所以设置一个timeout_bool标识，来忽略中止触发的事件。
            if (timeout_bool) {
              return;
            }
            clearTimeout(timeout_flag);
          }
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            success(xhr.responseText);
          } else {
            error(xhr.status, xhr.statusText);
          }
        }
      };
      //发送请求
      xhr.send(type === "get" ? null : data);
      setTime(); //请求超时
    }


    var url = options.url || "", //请求的链接
      type = (options.type || "get").toLowerCase(), //请求的方法,默认为get
      data = options.data || null, //请求的数据
      contentType = options.contentType || "", //请求头
      // dataType = options.dataType || "", //请求的类型
      async = options.async === undefined ? true : options.async, //是否异步，默认为true.
      timeOut = options.timeOut, //超时时间。
      before = options.before || function () {
        }, //发送之前执行的函数
      error = options.error || function () {
        }, //错误执行的函数
      success = options.success || function () {
        }; //请求成功的回调函数
    var timeout_bool = false, //是否请求超时
      timeout_flag = null, //超时标识
      xhr = null; //xhr对角
    setData();
    before();
    createXHR();
  };

  $$.extend = function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var argument = arguments[i];
      if (argument !== null || argument !== undefined) {
        for (var k in argument) {
          if (argument.hasOwnProperty(k)) {
            target[k] = argument[k];
          }
        }
      }
    }
    return target;
  };
})(window);