/**
 * Created by common on 2016/6/27.
 */
(function ($) {
  var ms = {
    init: function (obj, args) {
      ms.fillHtml(obj, args);
      ms.bindEvent(obj, args);
    },
    //填充html
    fillHtml: function (obj, args) {
      obj.empty();
      //上一页
      if (args.current > 1) {
        obj.append('<a href="javascript:;" class="prevPage">上一页</a>');
      } else {
        obj.remove('.prevPage');
        obj.append('<span class="prevPage disabled">上一页</span>');
      }
      //数字页键
      var start = args.current - 2, end = args.current + 2;
      if (args.current + 5 - args.pageCount > 1) {
        start = args.pageCount - 5;
      }
      if (start < 1) {
        start = 1;
        end = 6 <= args.pageCount ? 6 : args.pageCount;
      } else if (start === 1) {
        start--;
        end += 1;
      } else if (start > 1) {
        obj.append('<a href="javascript:;" class="tcdNumber">' + 1 + '</a>');
        if (
          (args.current > args.pageCount - 4 && args.pageCount > 7) ||
          start > 2
        ) {
          obj.append('<span>...</span>');
        }
      }
      for (; start <= end; start++) {
        if (start <= args.pageCount && start >= 1) {
          if (start != args.current) {
            obj.append('<a href="javascript:;" class="tcdNumber">' + start + '</a>');
          } else {
            obj.append('<span class="current">' + start + '</span>');
          }
        }
      }
      if (args.current + 2 < args.pageCount - 1 && args.pageCount > 7) {
        obj.append('<span>...</span>');
      }
      if (args.current != args.pageCount && args.current < args.pageCount - 2 && args.pageCount > 6) {
        obj.append('<a href="javascript:;" class="tcdNumber">' + args.pageCount + '</a>');
      }
      //下一页
      if (args.current < args.pageCount) {
        obj.append('<a href="javascript:;" class="nextPage">下一页</a>');
      } else {
        obj.remove('.nextPage');
        obj.append('<span class="nextPage disabled">下一页</span>');
      }
    },
    //翻页事件绑定
    bindEvent: function (obj, args) {
      obj.off();
      obj.on("click", "a.tcdNumber", function () {
        var current = parseInt($(this).text());
        ms.fillHtml(obj, {"current": current, "pageCount": args.pageCount});
        if (typeof(args.clickFn) == "function") {
          args.clickFn(current);
        }
      });
      //点击上一页
      obj.on("click", "a.prevPage", function () {
        var current = parseInt(obj.find(".current").text());
        ms.fillHtml(obj, {"current": current - 1, "pageCount": args.pageCount});
        if (typeof(args.clickFn) == "function") {
          args.clickFn(current - 1);
        }
      });
      //点击下一页
      obj.on("click", "a.nextPage", function () {
        var current = parseInt(obj.find(".current").text());
        ms.fillHtml(obj, {"current": current + 1, "pageCount": args.pageCount});
        if (typeof(args.clickFn) == "function") {
          args.clickFn(current + 1);
        }
      });
    }
  };
  $.ck.createPage = function (options) {
    var args = $.extend({
        pageCount: 10,
        current: 1,
        clickFn: function () {
        }
      }, options),
      it = this;
    return {
      paging: function () {
        ms.init(it, args);
      }
    }
  }
})($$);