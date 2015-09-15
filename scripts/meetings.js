/**
 * Copyright (C) 2015 yanni4night.com
 * meetings.js
 *
 * changelog
 * 2015-09-14[16:06:41]:revised
 *
 * @author yanni4night@gmail.com
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
         * Get my-schedule-list 
         * from `http://meeting.baidu.com/web/scheduleList`.
         * 
         * @param  {Function} cb cb(err, html)
         * @return {this}
         */
        getScheduleList: function (cb) {
            $.get('http://meeting.baidu.com/web/scheduleList').done(function (content) {
                if (content) {
                    var parsedSchedules = parser.parse(content);
                    if (parsedSchedules) {
                        cb(null, parsedSchedules);
                    } else {
                        cb(new Error('Parsed error'));
                    }
                } else {
                    cb(new Error('No content'));
                }
            }).fail(function (jqXhr, err) {
                cb(err);
            });
        }
    };

    return {
        test: function (cb) {
            Core.getScheduleList(function (err, scheduleList) {
                return cb(!err && scheduleList.headers && scheduleList.schedules);
            });
        },
        checkin: function (id, cb) {},
        checkout: function (id, cb) {},
        transder: function (targetMan, ids, cb) {},
        list: function (cb) {
            Core.getScheduleList(cb);
        }
    };

});