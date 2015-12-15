/**
 * Copyright (C) 2015 yanni4night.com
 * htmlparser.js
 *
 * changelog
 * 2015-09-14[16:24:48]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
define([], function () {

    function parse(html) {
        var i, j;
        var doc;
        var ths, trs;
        var headers = [];
        var scheduleItems = [];

        try {
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'about:blank';
            document.body.appendChild(iframe);
            doc = iframe.contentWindow.document;
            doc.body.innerHTML = html;

            ths = doc.querySelectorAll('table tbody:first-of-type tr:last-of-type th');

            for (i = 0; i < ths.length; ++i) {
                headers.push(ths[i].innerText.trim());
            }

            trs = doc.querySelectorAll('table tbody:last-of-type tr');
            for (i = 0; i < trs.length; ++i) {
                var scheduleItem = {};
                var tds = trs[i].children;
                for (j = 0; j < tds.length; ++j) {
                    scheduleItem[headers[j]] = tds[j].innerHTML.trim().split(':')[0];
                }

                scheduleItems.push(scheduleItem);
            }

            iframe.parentNode.removeChild(iframe);
            return {
                schedules: scheduleItems,
                pageCount: (doc.querySelectorAll('.pagination .number') || [1]).length
            };
        } catch (e) {
            return null;
        }

    }

    return {
        parse: parse
    };
});