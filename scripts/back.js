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

require(['./scripts/meetings'], function(Meetings) {

    var MeetingsChecker = function() {
        var started = false;
        var errTimes = 0;
        var lastNotification;

        var MAX_ERR_TIMES = 5;

        this.start = function() {
            var self = this;

            if (started) {
                return self;
            }

            chrome.alarms.create('checkMeetings', {
                when: Date.now() + 2e3,
                periodInMinutes: 1
            });

            chrome.alarms.onAlarm.addListener(function(alarm) {
                Meetings.list(function(err, scheduleList) {

                    if (err) {
                        // Do not report error duplicately.
                        if (++errTimes > MAX_ERR_TIMES) {
                            self.reportError(err.message || '获取会议室信息失败');

                            chrome.browserAction.setBadgeText({
                                text: 'error'
                            });

                            errTimes = 0;
                        }

                        return;
                    }


                    errTimes = 0;

                    var schedules = scheduleList.schedules;

                    var onSchedulingSize = schedules.filter(function(item) {
                        return '未开始' === item['当前状态']
                    }).length;

                    var onCheckingin = schedules.filter(function(item) {
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

                        var meetingRoomName = onCheckingin[0]['会议室名称'];
                        var tipStr = '您有需要签到的会议室：' + meetingRoomName;

                        var meetingRoomInfo = '\n开始时间：' + onCheckingin[0]['开始时间'] +
                            '\n位置：' + onCheckingin[0]['地域'] + '-' +
                            onCheckingin[0]['楼层'] + '-' + onCheckingin[0]['会议室描述'];

                        var id = (onCheckingin[0]['操作'].match(/\b\d+\b/) || [])[0];

                        if (id) {
                            Meetings.checkin(id, function(err, data) {
                                if (err) {
                                    lastNotification = new Notification('会议室签到', {
                                        icon: 'img/ask.png',
                                        body: '会议室【' + meetingRoomName + '】自动签到失败，请手动签到' + meetingRoomInfo
                                    });
                                } else {
                                    lastNotification = new Notification('会议室签到', {
                                        icon: 'img/success.png',
                                        body: '会议室【' + meetingRoomName + '】已自动签到成功' + meetingRoomInfo
                                    });
                                }
                            });
                        } else {
                            lastNotification = new Notification('会议室签到', {
                                icon: 'img/ask.png',
                                body: tipStr + meetingRoomInfo
                            });
                            // Speak out
                            chrome.tts.speak(tipStr, {
                                lang: 'zh-CN',
                                rate: 1.0,
                                enqueue: true
                            }, function() {});
                        }
                    }
                });
            });

            return self;
        };


        this.reportError = function(errmsg) {
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