/**
 * Copyright (C) 2015 tieba.baidu.com
 * meetings.js
 *
 * changelog
 * 2015-09-14[16:06:41]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

define(['../lib/jquery', './htmlparser'], function ($, parser) {
    $ = $ || window.$;

    $.ajaxSetup({
        cache: false
    });

    var Core = {
        /**
         * Get the HTML of my-schedule-list 
         * from `http://meeting.baidu.com/web/scheduleList`.
         * 
         * @param  {Function} cb cb(err, html)
         * @return {this}
         */
        getScheduleListHTML: function (cb) {
            $.get('http://meeting.baidu.com/web/scheduleList').done(function (content) {
                if (content) {
                    cb(null, content);
                } else {
                    cb(new Error('No content'));
                }
            }).fail(function (jqXhr, err) {
                cb(err);
            });
        },

        /**
         * Parse html to schedule table.
         * 
         * @param  {string} html
         * @return {Object}
         */
        parseScheduleList: function (html) {
            return parser.parse(html);
        }
    };

    return {
        test: function () {
            Core.getScheduleListHTML(function (err, html) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(Core.parseScheduleList(html));
                }
            });
        },
        checkin: function () {},
        checkout: function (id) {},
        transder: function (targetMan, ids) {},
        list: function () {
            Core.getScheduleListHTML(function (err, html) {
                if (err) {
                    console.error(err);
                } else {
                    var schedules = Core.parseScheduleList(html).schedules;

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
                }
            });
        }
    };

});