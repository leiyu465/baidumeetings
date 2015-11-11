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
                Meetings.list(function (err, schedules) {

                    if (err) {
                        // Do not report error duplicately.
                        if (++errTimes === MAX_ERR_TIMES) {
                            self.showErrorNotification('获取会议室信息失败：' + err.message);

                            chrome.browserAction.setBadgeText({
                                text: 'error'
                            });

                            // errTimes = 0;
                        }

                        return;
                    } else {
                        // If success,clear error notification immediately
                        self.clearErrorNotification();
                    }

                    errTimes = 0;

                    var schedulesInPlanCount = schedules.filter(function (schedule) {
                        return schedule.isInPlan();
                    }).length;

                    var checkinginSchedule = schedules.filter(function (schedule) {
                        return schedule.canCheckin();
                    })[0];

                    chrome.browserAction.setBadgeText({
                        text: schedulesInPlanCount + (checkinginSchedule ? '(1)' :
                                '') // Only one
                    });

                    if (checkinginSchedule) {
                        if (lastNotification) {
                            lastNotification.close();
                        }

                        var meetingRoomName = checkinginSchedule.get('会议室名称');

                        var ttsStr = '您有需要签到的会议室：' + meetingRoomName;

                        var meetingRoomInfo = ['\n开始时间：', checkinginSchedule.get('开始时间'),
                            '\n位置：', checkinginSchedule.get('地域'), '-',
                            checkinginSchedule.get('楼层'), '-', checkinginSchedule.get(
                                '会议室描述')
                        ].join('');

                        if (true /*auto checking*/ ) {
                            checkinginSchedule.checkin(function (err, data) {
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
                                body: ttsStr + meetingRoomInfo
                            });
                            // Speak out
                            chrome.tts.speak(ttsStr, {
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


        this.showErrorNotification = function (errmsg) {
            //Prevent from mutiple notifications
            if (errNotification) {
                errNotification.close();
            }

            errNotification = new Notification('出错', {
                icon: 'img/warn.png',
                body: errmsg
            });
        };

        this.clearErrorNotification = function () {
            if (errNotification) {
                errNotification.close();
                errNotification = null;
            }
        };
    };

    console.debug('Start checking meetings');
    new MeetingsChecker().start();

});