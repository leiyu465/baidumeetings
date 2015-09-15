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

    var MeetingsChecker = function () {
        var started = false;
        var inError = false;

        this.start = function () {
            var self = this;

            if (started) {
                return self;
            }

            chrome.alarms.create('checkMeetings', {
                when: Date.now() + 1e3,
                periodInMinutes: 1
            });

            chrome.alarms.onAlarm.addListener(function (alarm) {
                Meetings.list(function (err, scheduleList) {

                    if (err) {
                        // Do not report error duplicately.
                        if (!inError) {
                            self.reportError(err.message || '获取会议室信息失败');
                        }

                        inError = true;
                        return;
                    }

                    inError = false;

                    var schedules = scheduleList.schedules;

                    var onSchedulingSize = schedules.filter(function (item) {
                        return '未开始' === item['当前状态']
                    }).length;

                    var onCheckinginSize = schedules.filter(function (item) {
                        return '可签入' === item['当前状态']
                    }).length;

                    chrome.browserAction.setBadgeText({
                        text: onSchedulingSize + '(' + onCheckinginSize + ')'
                    });

                    if (onCheckinginSize) {
                        new Notification('会议室签到', {
                            icon: 'favicon.png',
                            body: '请检查是否有需要签到的会议室'
                        });
                    }
                });
            });

            return self;
        };
    };

    MeetingsChecker.prototype.reportError = function (errmsg) {
        new Notification('出错', {
            icon: 'favicon.png', // TODO
            body: errmsg
        });
    };

    console.debug('Start checking meetings');
    new MeetingsChecker().start();

});