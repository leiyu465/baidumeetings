/**
 * Copyright (C) 2015 yanni4night.com
 * back.js
 *
 * changelog
 * 2015-09-14[15:49:25]:revised
 * 2015-09-17[17:19:40]:refresh after checkin
 *
 * @author yanni4night@gmail.com
 * @version 0.1.1
 * @since 0.1.0
 */

require(['./scripts/meetings'], function (Meetings) {

    var MeetingsChecker = function () {
        var started = false;
        var errTimes = 0;
        var lastNotification;
        var errNotification;

        var MAX_ERR_TIMES = 5;

        this.start = function () {
            var self = this;

            if (started) {
                return self;
            }

            chrome.alarms.create('checkMeetings', {
                when: Date.now() + 2e3,
                periodInMinutes: 1
            });

            var listMeetings = function () {
                Meetings.list(function (err, scheduleList) {

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
                    } else {
                        self.clearError();
                    }

                    errTimes = 0;

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

                        var meetingRoomName = onCheckingin[0]['会议室名称'];
                        var tipStr = '您有需要签到的会议室：' + meetingRoomName;

                        var meetingRoomInfo = '\n开始时间：' + onCheckingin[0]['开始时间'] +
                            '\n位置：' + onCheckingin[0]['地域'] + '-' +
                            onCheckingin[0]['楼层'] + '-' + onCheckingin[0]['会议室描述'];

                        var id = (onCheckingin[0]['操作'].match(/\b\d+\b/) || [])[0];

                        if (id) {
                            Meetings.checkin(id, function (err, data) {
                                if (err) {
                                    lastNotification = new Notification('会议室签到', {
                                        icon: 'img/ask.png',
                                        body: '会议室【' + meetingRoomName +
                                            '】自动签到失败，请手动签到' +
                                            meetingRoomInfo
                                    });
                                } else {
                                    lastNotification = new Notification('会议室签到', {
                                        icon: 'img/success.png',
                                        body: '会议室【' + meetingRoomName +
                                            '】已自动签到成功' + meetingRoomInfo
                                    });

                                    //Refresh meetings immediately
                                    listMeetings();
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
                            }, function () {});
                        }
                    }
                });
            };

            chrome.alarms.onAlarm.addListener(listMeetings);

            return self;
        };


        this.reportError = function (errmsg) {
            //Prevent from mutiple notifications
            if (errNotification) {
                errNotification.close();
            }

            errNotification = new Notification('出错', {
                icon: 'img/warn.png',
                body: errmsg
            });
        };

        this.clearError = function () {
            if (errNotification) {
                errNotification.close();
                errNotification = null;
            }
        };
    };

    console.debug('Start checking meetings');
    new MeetingsChecker().start();

});