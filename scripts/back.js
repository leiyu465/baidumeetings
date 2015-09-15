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
        var lastNotification;

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

                    var onCheckingin = schedules.filter(function (item) {
                        return '可签入' === item['当前状态']
                    });

                    chrome.browserAction.setBadgeText({
                        text: onSchedulingSize + '(' + onCheckingin.length +
                            ')'
                    });

                    if (onCheckingin.length) {
                        if (lastNotification) {
                            lastNotification.close();
                        }

                        lastNotification = new Notification('签到', {
                            icon: 'img/ask.png',
                            body: '会议室【' + onCheckingin[0]['会议室名称'] + '】需要签到'
                        });

                        chrome.tts.speak('您有需要签到的会议室：' + onCheckingin[0]['会议室名称'], {
                            lang: 'zh-CN',
                            rate: 1.0,
                            enqueue: true
                        }, function () {});
                    }
                });
            });

            return self;
        };


        this.reportError = function (errmsg) {
            //Prevent from mutiple notifications
            if (lastNotification) {
                lastNotification.close();
            }

            lastNotification = new Notification('出错', {
                icon: 'img/warn.png',
                body: errmsg
            });
        };
    };

    console.debug('Start checking meetings');
    new MeetingsChecker().start();

});