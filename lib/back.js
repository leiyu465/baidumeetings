/**
 * Copyright (C) 2015 yanni4night.com
 * service.js
 *
 * changelog
 * 2015-09-14[15:49:25]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

require(['./lib/jquery', './scripts/meetings'], function ($, Meetings) {
    $ = $ || window.$;

   /* chrome.tabs.create({
        url: 'http://meeting.baidu.com/web/scheduleList'
    });*/
    console.debug('start check meetings');
    
    chrome.alarms.create('checkMeetings', {
        when: Date.now() + 500,
        periodInMinutes: 1
    });

    chrome.alarms.onAlarm.addListener(function (alarm) {
        Meetings.test();
    });
});