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

define(['./htmlparser', './schedule'], function (parser, Schedule) {

    var Core = {
        /**
         * Get my-schedule-list 
         * from `http://meeting.baidu.com/web/scheduleList`.
         * 
         * @param  {Function} cb cb(err, html)
         * @return {this}
         */
        getScheduleList: function (cb) {
            $.ajax({
                url: 'http://meeting.baidu.com/web/scheduleList',
                timeout: 2e3,
                cache: false
            }).done(function (content) {
                if (content) {
                    var parsedSchedules = parser.parse(content);
                    if (parsedSchedules) {
                        cb(null, parsedSchedules.map(function (item) {
                            return new Schedule(item);
                        }));
                    } else {
                        cb(new Error('Parsed error'));
                    }
                } else {
                    cb(new Error('No content'));
                }
            }).fail(function (jqXhr, error, errText) {
                cb(new Error(errText));
            });
        }
    };

    return {
        list: function (cb) {
            Core.getScheduleList(cb);
        }
    };

});