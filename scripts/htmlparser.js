/**
 * Copyright (C) 2015 tieba.baidu.com
 * htmlparser.js
 *
 * changelog
 * 2015-09-14[16:24:48]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */
define(['../lib/context-parser'], function (contextParser) {

    function parse(html) {
        var i, j;
        var doc;
        var ths, trs;
        var headers = [];
        var scheduleItems = [];

        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'about:blank';
        document.body.appendChild(iframe);
        doc = iframe.contentDocument;
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
                scheduleItem[headers[j]] = tds[j].innerText.trim();
            }

            scheduleItems.push(scheduleItem);
        }

        iframe.parentNode.remove(iframe);
        return {
            headers: headers,
            schedules: scheduleItems
        };
    }

    return {
        parse: parse
    };
});