/**
  * Copyright (C) 2015 yanni4night.com
  * popup.js
  *
  * changelog
  * 2015-09-15[11:02:07]:revised
  *
  * @author yanni4night@gmail.com
  * @version 0.1.0
  * @since 0.1.0
  */
require(['./lib/jquery', './scripts/meetings'], function($, Meetings) {
    $ = $ || window.$;

    $.ajaxSetup({
        cache: false
    });

    $('.myschedule').click(function (e) {
        e.preventDefault();
        chrome.tabs.create({
            url: 'http://meeting.baidu.com/web/scheduleList'
        });
    });
});