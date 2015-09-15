/**
 * Copyright (C) 2015 yanni4night.com
 * back.js
 *
 * changelog
 * 2015-09-14[15:49:25]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

require(['./scripts/meetings'], function (Meetings) {

    console.debug('Start checking meetings');

    chrome.alarms.create('checkMeetings', {
        when: Date.now() + 2e3,
        periodInMinutes: 1
    });

    chrome.alarms.onAlarm.addListener(function (alarm) {
        Meetings.list();
    });
});