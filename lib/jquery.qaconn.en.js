(function($) {
    $.fn.qaconn.lang = function(textId) {
        lang = {
            ok: "OK",
            fail: "Fail",
            level: "Level",
            RT: "Response Time",
            good: "Good",
            medium: "Medium",
            low: "Low",
            bad: "Bad",
            unknown: "Unknown"
        };
        return lang[textId];
    };
}(jQuery));

