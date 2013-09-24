/*
 * File:        jquery.qaconn.js
 * Version:     0.0.0
 * Author:      Eduardo L. García Glez. 
 * 
 * Copyright 2013 Eduardo García, all rights reserved.
 *
 * This source file is free software, under either the GPL v3 license, 
 * as supplied with this software.
 * 
 * This source file is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. 
 * 
 * Parameters:
 * @ranges: {good: number, medium: number, low: number} Maximum values ​​expected 
 * for the quality of the connection.
 * @remote.url: Remote URL to call.
 * @remote.prosses: If remote.url processes requests.
 * @before: It runs before calling remote.url.
 * @after: It runs after calling remote.url.
 * @interval: Interval to call to remote.url.
 * @queueLength: Call queue lengt.
 * @outputHTML: Template to show data.
 * @qacCalculate: Function to calculate conection quality.
 * @failWeight: Weight to be added to the failures in @qacCalculate.
 */

(function($) {
    var failTimeMultiplier = 10;
    var defaultTemplateValues = {rt: "--", ok: "--", fail: "--"};

    $.fn.qaconn = function(action) {
                
        if (!this.instanceVars) {
            this.instanceVars = {
            qacCallInterval: null,
            opts: null,
            queue: []};
        }
        
        // Stop server calls
        if (action === "stop") {
            return stop(this);
        }
        // Start Server calls
        if (action === "start") {
            return start(this);
        }
        // Destroy the object
        if (action === "destroy") {
            return destroy(this);
        }
        // return calls queue
        if (action === "queue") {
            return this.instanceVars.queue;
        }

        if (!this.instanceVars.opts && !this.instanceVars.qacCallInterval) {
            // Extend our default options with those provided.
            this.instanceVars.opts = $.extend({}, $.fn.qaconn.defaults, action);
            start(this);
        }
        return this;
    };
    
    $.fn.qaconn.destroy = function(queue, options) {
        if (options.debug) {
            console.debug("It's running destroy function!!! ");
        }
        return this;
    };

    /**
     * It is called before the call to the server
     * @param queue - historical response values,
     * the first value is the oldest.
     * @param options - Instance options.
     */
    $.fn.qaconn.before = function(queue, options) {
        if (options.debug) {
            console.debug("It's running before function!!! ");
            console.debug("Before queue: " + queue);
        }
    };

    /**
     * It is called after the call to the server
     * @param queue - historical response values,
     * the first value is the oldest.
     * @param lastCalc - Object with the information of the last call.
     * format: {rt: number, ok: num ok on queue, fail: num fail on queue}
     * @param options - Instance options.
     */
    $.fn.qaconn.after = function(queue, lastCalc, options) {
        if (options.debug) {
            console.debug("It's running after function!!! ");
            console.debug("After queue: " + queue);
        }        
    };

    /**
     * Calculate the quality of the connection from queue values
     * @param responseValues Generally variable queue.
     * @param options - Instance options.
     * @returns {rt: number, ok: num ok on queue, fail: num fail on queue}
     */
    $.fn.qaconn.qacCalculate = function(responseValues, options) {
        if (!(responseValues && responseValues.length > 0)) {
            return null;
        }

        var sum = 0, ok = 0, fail = 0;
        for (var i = 0; i < responseValues.length; i++) {
            var r = responseValues[i];
            if (r[0] === "ok") {
                sum += r[1];
                ok++;
            } else {
                sum += options.failWeight.call(this, r[1], options);
                fail++;
            }
        }
        return {rt: (sum / responseValues.length).toFixed(2), ok: ok, fail: fail};
    };

    /**
     * Failure penalty to qacCalculate
     * @param {type} failTime - Time to process a fail request.
     * @param options - Instance options.
     * @returns {number} Penalized failure time
     */
    $.fn.qaconn.failWeight = function(failTime, options) {
        return failTime * failTimeMultiplier;
    };

    /**
     * Plugin defaults
     */
    $.fn.qaconn.defaults = {
        ranges: {good: 100, medium: 150, low: 200},
        remote: {
            url: 'qaconn.htm',
            prosses: false
        },
        before: $(this).qaconn.before,
        after: $(this).qaconn.after,
        destroy: $(this).qaconn.destroy,
        interval: 5000, // default 5 seconds.
        queueLength: 48,
        outputHTML: '<div class="qac-content ${qacClass}" title="${textLevel}: ${qacLevel}\n${textRT}: ${qacMed} ms\n${textOk}: ${qacResponseOk}\n${textFail}: ${qacResponseFail}"></div>',
        qacCalculate: $(this).qaconn.qacCalculate,
        failWeight: $(this).qaconn.failWeight,
        debug: false
    };

    function start(jqObject) {
        qaConnInterval(jqObject);
        
        if (!jqObject.instanceVars.qacCallInterval) {
            jqObject.instanceVars.qacCallInterval = window.setInterval(function() {
                qaConnInterval(jqObject);
            }, jqObject.instanceVars.opts.interval);
            jqObject.html('<div class="qac-processing-info"></div><div class="qac-container"></div>');
        }
        return jqObject;
    }

    function stop(jqObject) {
        window.clearInterval(jqObject.instanceVars.qacCallInterval);
        jqObject.instanceVars.qacCallInterval = undefined;          
        jqObject.find(".qac-container").html(fillTemplate(null, jqObject.instanceVars.opts));
        return jqObject;
    }
    
    function destroy(jqObject) {
        var options = jqObject.instanceVars.opts;
        var queue = jqObject.instanceVars.queue;
        
        stop(jqObject);
        var ret = options.destroy.call(this, queue, options);
        jqObject.empty();
        jqObject.unbind();
        return ret;
    }

    /**
     * Quantized level
     * @param {float} level quality connextion level.
     * @param options - Instance options.
     * @returns {String} Level quantized value
     */
    function qacQuantizer(level, options) {
        if (options.debug) {console.debug("Quantizing level!!! " + level);}
        if (level <= options.ranges.good) {
            return "good";
        }
        if (level <= options.ranges.medium) {
            return "medium";
        }
        if (level <= options.ranges.low) {
            return "low";
        }
        if (level > options.ranges.low) {
            return "bad";
        }
        return "unknown";
    }

    /**
     * Fill options.outputHTML with calculated values.
     * @param {type} values Values to show.
     * @param options - Instance options.
     * @returns {String} HTML code.
     */
    function fillTemplate(values, options) {
        if (!values) {
            values = defaultTemplateValues;
        }
        if (options.debug) {console.debug("Filling template!!! " + values);}
        var qq = qacQuantizer(values.rt, options);
        // TODO: Rewrite this.
        return options.outputHTML
                .replace(/\${textLevel}/gi, $(this).qaconn.lang("level"))
                .replace(/\${textRT}/gi, $(this).qaconn.lang("RT"))
                .replace(/\${textOk}/gi, $(this).qaconn.lang("ok"))
                .replace(/\${textFail}/gi, $(this).qaconn.lang("fail"))
                .replace(/\${qacMed}/gi, values.rt)
                .replace(/\${qacResponseOk}/gi, values.ok)
                .replace(/\${qacResponseFail}/gi, values.fail)
                .replace(/\${qacLevel}/gi, $(this).qaconn.lang(qq))
                .replace(/\${qacClass}/gi, "qac-image-" + qq);
    }

    /**
     * Invoke the server and processes requests.
     * @param {type} jqObject qacconn object.
     */
    function qaConnInterval(jqObject) {
        var options = jqObject.instanceVars.opts;
        var queue = jqObject.instanceVars.queue;
        options.before.call(this, queue, options);
        if (options.debug) {console.debug("+++++++ Call to " + options.remote.url + "!!!");}
        jqObject.find('.qac-processing-info').addClass("qac-processing");
        
        var time = new Date().getTime();
        //TODO: Always send all!!! Optimize.
        $.ajax({
            url: options.remote.url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(queue),
            dataType: 'json'
        }).done(function(data) {
            if (options.debug) {console.debug("Processing response!!!");}
            if (options.remote.process) {
                queue = queue && queue.length > 0 ? queue : data;
            }
            queue.push(["ok", new Date().getTime() - time]);
        }).fail(function() {
            if (options.debug) {console.debug("Server call error!!!");}
            queue.push(["fail", new Date().getTime() - time]);
        }).always(function() {
            if (options.debug) {console.debug("Queue call review!!!");}
            if (queue.length > options.queueLength) {
                queue.shift();
            }
            jqObject.find('.qac-processing-info').removeClass("qac-processing");
            
            var result = options.qacCalculate.call(this, queue, options);
            options.after.call(this, queue, result, options);
            jqObject.find(".qac-container").html(fillTemplate(result, options));
            jqObject.instanceVars.queue = queue;
        });
    }
})(jQuery);