test("Inint QAConn", function() {
    var qac = $(".qaconn").qaconn({
        remote: {url: "../noProcess.html", process: false},
        debug: false
    });
    notEqual(qac.html(), "", "We expect a .qaconn item not empty.");
    qac.qaconn("destroy");
});

test("Destroy QAConn", function() {
    var qac = $(".qaconn").qaconn({
        remote: {url: "../noProcess.html", process: false},
        destroy: function() {return "obj destroyed"},
        debug: false
    }); 
    var r = qac.qaconn("destroy");
    equal(qac.html(), "", "QAC obj html empty.");
    equal(r, "obj destroyed", "QAC destroy function call Ok.");
});

test("Before QAConn", function() {
    stop();
    var qac = $(".qaconn").qaconn({
        remote: {url: "../noProcess.html", process: false},
        before: function() { 
            ok(true, "Before");
            start();
        },
        debug: false
    });    
    qac.qaconn("destroy");
});

test("After QAConn", function() {
    stop();
    var qac = $(".qaconn").qaconn({
        remote: {url: "../noProcess.html", process: false},
        after: function() { 
            ok(true, "after");
            start();
        },
        debug: false
    });    
    qac.qaconn("destroy");
});

test("Calculate QAConn", function() {
    stop();
    var qac = $(".qaconn").qaconn({
        remote: {url: "../noProcess.html", process: false},
        qacCalculate: function() { 
            ok(true, "calculate");
            start();
            return {rt: 0, ok: 0, fail: 0};
        },
        debug: false
    });    
    qac.qaconn("destroy");
    
    var qac = $(".qaconn").qaconn({
        remote: {url: "../noProcess.html", process: false},
        interval: 10,
        debug: false
    });
    var res = qac.qaconn.qacCalculate([], qac.instanceVars.opts);
    deepEqual(res, null, "Miscalculations: qacCalculate");
    var res = qac.qaconn.qacCalculate([["ok",1]], qac.instanceVars.opts);
    deepEqual(res, {"fail": 0,"ok": 1,"rt": "1.00"}, "Miscalculations: qacCalculate");
    var res = qac.qaconn.qacCalculate([["ok",1],["ok",2]], qac.instanceVars.opts);
    deepEqual(res, {"fail": 0,"ok": 2,"rt": "1.50"}, "Miscalculations: qacCalculate");
    var res = qac.qaconn.qacCalculate([["ok",1],["ok",2],["fail",1],["fail",2]], qac.instanceVars.opts);
    deepEqual(res, {"fail": 2,"ok": 2,"rt": "8.25"}, "Miscalculations: qacCalculate");
    var res = qac.qaconn.qacCalculate([["fail",1],["fail",2],["fail",1],["fail",2]], qac.instanceVars.opts);
    deepEqual(res, {"fail": 4,"ok": 0,"rt": "15.00"}, "Miscalculations: qacCalculate");
    qac.qaconn("destroy");    
});

test("failWeight QAConn", function() {
    var qac = $(".qaconn").qaconn({
        remote: {url: "../noProcess.html", process: false},
        failWeight: function(failTime, options) {
            return failTime * 1000;
        },
        debug: false
    });  
    
    var res = qac.qaconn.qacCalculate([["ok",1]], qac.instanceVars.opts);
    deepEqual(res, {"fail": 0,"ok": 1,"rt": "1.00"}, "Miscalculations: failWeight");
    var res = qac.qaconn.qacCalculate([["ok",1],["ok",2],["fail",1],["fail",2]], qac.instanceVars.opts);
    deepEqual(res, {"fail": 2,"ok": 2,"rt": "750.75"}, "Miscalculations: failWeight");
    var res = qac.qaconn.qacCalculate([["fail",1],["fail",2],["fail",1],["fail",2]], qac.instanceVars.opts);
    deepEqual(res, {"fail": 4,"ok": 0,"rt": "1500.00"}, "Miscalculations: failWeight");
    qac.qaconn("destroy");
});

