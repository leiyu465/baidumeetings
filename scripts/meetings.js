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

define(['./htmlparser'], function (parser) {

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
            var tblHtml = html.match(/<table[\s\S]+<\/table>/);
            if (!tblHtml) {
                return null;
            }
            return parser.parse(tblHtml);
        }
    };

    return {
        test: function () {
            Core.getScheduleListHTML(function (err, html) {
                Core.parseScheduleList(html);
            });
        },
        checkin: function () {},
        checkout: function (id) {},
        transder: function (targetMan, ids) {},
        list: function () {}
    };

});