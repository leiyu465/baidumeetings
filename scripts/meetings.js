/**
 * Copyright (C) 2015 yanni4night.com
 * meetings.js
 *
 * changelog
 * 2015-09-14[16:06:41]:revised
 * 2015-09-22[12:05:45]:support multiple pages
 *
 * @author yanni4night@gmail.com
 * @version 0.1.1
 * @since 0.1.0
 */

define(['./htmlparser', './schedule'], function (parser, Schedule) {

    var Core = {
        /**
         * Get my-schedule-list 
         * from `http://meeting.baidu.com/web/scheduleList`.
         * 
         * @param  {Function} cb cb(err, html)
         * @param  {number} pageNo current page No.
         * @param  {boolean} ignorePages If ignore multiple pages
         * @return {this}
         */
        getScheduleList: function (cb, pageNo, ignorePages) {
            $.ajax({
                url: 'http://meeting.baidu.com/web/scheduleList',
                data: {
                    pageNo: pageNo || 1
                },
                timeout: 1e4,
                type: 'post'
            }).done(function (content) {
                if (content) {
                    var parsedSchedules = parser.parse(content);
                    if (parsedSchedules && parsedSchedules.schedules) {
                        var pageCount = parsedSchedules.pageCount;

                        var schedules = parsedSchedules.schedules.map(function (item) {
                            return new Schedule(item);
                        });

                        var promises = [];

                        if (pageCount < 2 || ignorePages) {
                            cb(null, schedules);
                        } else {
                            for (var i = 0; i < pageCount - 1; ++i) {
                                promises.push(new Promise(function (resolve, reject) {
                                    Core.getScheduleList(function (err,
                                        singlePageschedules) {
                                        (err ? reject : resolve)();
                                        if (singlePageschedules) {
                                            schedules = schedules.concat(
                                                singlePageschedules
                                            )
                                        }
                                    }, i + 2, true);
                                }));
                            }

                            Promise.all(promises).then(function () {
                                cb(null, schedules);
                            }, function () {
                                cb(null, schedules);
                            });;
                        }
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