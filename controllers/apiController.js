var bodyParser = require('body-parser');
var mysql = require('mysql');
var moment = require('moment');
var fs = require('fs');

var json2csv = require('json2csv');
var csv = require('csv-array');


//  export
module.exports = function(app){

    //  look for http request, parse out json from http request
    app.use(bodyParser.json());
    //  make sure that this api can handle url requests
    app.use(bodyParser.urlencoded({ extended: true }));

    //  for date issues format
    Date.prototype.toJSON = function() {
    return moment(this).format("YYYY-MM-DD");
    }

    //  mysql connection via connection pooling ( I think it's better than creating new connections everytime )
    //  using the db credentials 
    //  change this create a dbconfig later
    //  need to encrypt this.
    var pool = mysql.createPool({
        multipleStatements: true,
        connectionLimit:    100, //try for now :))
        host    :           'ddolfsb30gea9k.c36ugxkfyi6r.us-west-2.rds.amazonaws.com',
        user    :           'fab4_engineers',
        password:           'Password123',
        database:           'fab4'
    });    


    var poolLocal = mysql.createPool({
        multipleStatements: true,
        connectionLimit:    100, //try for now :))
        host    :           'localhost',
        user    :           'root',
        password:           '2qhls34r',
        database:           'dbtarget'
        }); 
        
    //  today today today
    var today = new Date();
    var todayPlus = moment();
    var todayMinus = moment();
    var dateAndtime = new Date();
    var hh = today.getHours();
    var min = today.getMinutes();
    var sec = today.getSeconds();

    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

        if(dd<10) {
            dd = '0'+dd
        } 

        if(mm<10) {
            mm = '0'+mm
        } 

        //  for am shift, and pm to midnight and midnight to am
        today = yyyy + '-' + mm + '-' + dd;
        todayPlusOne = moment(todayPlus).add(1, 'days').format('YYYY-MM-DD');
        todayMinusOne = moment(todayMinus).subtract(1, 'days').format('YYYY-MM-DD');

        dateAndtime = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min + ':' + sec;
        
        //  var use for checking AM and PM
        //  using momentjs 
        var checker = moment(dateAndtime, "YYYY-MM-DD h:mm:ss");
        var check_am_start = moment(today + " " + "06:30:00", "YYYY-MM-DD h:mm:ss");
        var check_am_end = moment(today + " " + "18:29:59", "YYYY-MM-DD h:mm:ss");    
        
        var check_pm_start = moment(today + " " + "18:30:00", "YYYY-MM-DD h:mm:ss");
        var check_notyet_midnight = moment(today + " " + "23:59:59", "YYYY-MM-DD h:mm:ss");   
        var check_exact_midnight = moment(today + " " + "00:00:00", "YYYY-MM-DD h:mm:ss");    
        var check_pm_end = moment(today + " " + "06:29:59", "YYYY-MM-DD h:mm:ss" );

    /*
    // api not yet needed
    // http request total outs per process
    app.get('/outs/:process_id', function(req, res){

        //  get pool connection
        pool.getConnection(function(err, connection){
            //  parse the process input from the url
            var process = req.params.process_id;

                //  will check the AM and PM environment before running the query specifically for AM and PM shift
                if (checker >= check_am_start && checker <= check_am_end) {

                    console.log(dateAndtime + ' is between AM');
                    //  callback = connection if it's AM
                    connection.query({
                        sql: 'SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = ? AND	date_time >= CONCAT("' + today + ' "," 06:30:00") AND date_time <= CONCAT("' + today + ' "," 18:29:59")',
                        values: [process]
                    },  function (err, results, fields){
                        if (err) throw err;

                            var obj = [];

                                for (var i = 0; i < results.length; i++) {
                                    obj.push(
                                        {
                                            processName: results[i].process_id,
                                            sumOuts: results[i].totalOuts 
                                        }
                                    );
                                }

                        //connection.release();
                        var processOuts_json = JSON.stringify(obj);
                        var processOuts_tsv = TSV.stringify(obj);
                       

                        fs.writeFile('./json/' + process + '_totalouts.json', processOuts_json, 'utf8', function(err){
                            if (err) throw err;
                        }); 
                        
                        res.end(JSON.stringify(obj));
                        
                    });
                
                // if it's not between AM range then
                } else {

                    console.log(dateAndtime + ' is between PM');

                    //  callback = connection if it's PM
                    connection.query({

                        //  not quite sure in the query as of july 22, 2017 need to go through later
                        //  __________________________________________________
                        sql: 'SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = ? AND	date_time >= CONCAT("' + today + ' "," 18:30:00") AND date_time <= CONCAT("' + today + ' " ," 06:29:59")',
                        values: [process]
                    },  function (err, results, fields){
                        if (err) throw err;

                            var obj = [];

                                for (var i = 0; i < results.length; i++) {
                                    obj.push(
                                        {
                                            processName: results[i].process_id,
                                            sumOuts: results[i].totalOuts
                                        }
                                    );
                                }

                        //connection.release();
                        res.end(JSON.stringify(obj));
                    });
                }
                    
        });

        
    });
    */


    // http request hourly outs per process
    app.get('/hourly/:process_url', function(req, res){
        
        //  parse process url
        var process = req.params.process_url;   
        
            // promise 1
            var hourlyTargetPromise = new Promise (function(resolve, reject){

                //  local database
                poolLocal.getConnection(function(err, connection){
                    if (err) throw err;
                    //  will check the AM and PM 
                    if (checker >= check_am_start && checker <= check_am_end) {
                            
                        //  query
                        connection.query({
                            sql: 'SELECT process_id, process_name, SUM(CASE WHEN today_date = CURDATE() AND stime >= "06:30:00" && stime < CURTIME() - INTERVAL 10 MINUTE THEN total_target ELSE 0 END) AS t_target FROM  view_target WHERE process_name = ?',
                            values: [process]
                                },  function(err, results, fields){
                                    if (err) return reject(err);

                                    var processTarget = [];
                                        processTarget.push(
                                            results[0].t_target
                                        );                 

                                    resolve({processTarget: processTarget});
                                    
                        });
                    
                    }else {
                    //  pm shift
                        //  dont forget the 00:00:00 if statement
                        //  query

                         if (checker >= check_pm_start && checker <= check_notyet_midnight) {
                            
                            connection.query({
                            sql: 'SELECT process_id, process_name, SUM(CASE WHEN today_date = CURDATE() AND stime >= "18:30:00" && stime < CURTIME() - INTERVAL 10 MINUTE THEN total_target ELSE 0 END) AS t_target FROM  view_target WHERE process_name = ?',
                            values: [process]
                                },  function(err, results, fields){
                                    if (err) return reject(err);

                                    var processTarget = [];
                                        processTarget.push(
                                            results[0].t_target
                                        );                 

                                    resolve({processTarget: processTarget});
                                    
                            });

                         } else if (checker >= check_exact_midnight && checker <= check_pm_end) {
                            
                            connection.query({
                            sql: 'SELECT process_id, process_name, (SUM(CASE  WHEN  today_date = CURDATE() - INTERVAL 1 DAY  AND stime >= "18:30:00"  && stime <= "23:59:59" THEN  total_target  ELSE 0 END) + SUM(CASE WHEN	today_date = CURDATE()	AND stime >= "00:00:00"    && stime < CURTIME() - INTERVAL 10 MINUTE	THEN	total_target	ELSE 0	END)) AS t_target FROM   view_target WHERE  process_name = ?',
                            values: [process]
                                },  function(err, results, fields){
                                    if (err) return reject(err);

                                    var processTarget = [];
                                        processTarget.push(
                                            results[0].t_target
                                        );                 

                                    resolve({processTarget: processTarget});
                                    
                            });

                         }
                        
                    }

                    //  release
                    connection.release();

                }); 

                
            });
        
            //  promise 2
            var hourlyOutsPromise = new Promise (function(resolve, reject){
                
                //if (err) return reject(err);
                csv.parseCSV('./public/outs/process_outs.csv', function(data){
                    
                    var processOuts = [];

                    for(i=0; i<data.length; i++){
                        if(data[i].process_id === process.toUpperCase()){
                            processOuts.push(
                                
                                // parsing to INT to add COMMA bcz he's sleepy
                                parseInt(data[i].totalOuts)

                            );

                        } 
                    }
                
                    resolve({processOuts: processOuts});
                
                });

            });
        

        // aggregate multiple promises 
        Promise.all([hourlyTargetPromise, hourlyOutsPromise]).then(function(values){

           var process = req.params.process_url;    //  path
           var data = values;         //    to variable

           console.log(data);

                    //  subtract to get the variance
                    var variance = data[0]['processTarget'][0] - data[1]['processOuts'][0];

                    console.log(variance);
                    
                    //  this is to make variance negative
                    if (variance > 0) { 
                        
                        //  this is to check if the value is null then make the variable zero
                        if (data[0]['processTarget'][0] !== null) {

                            var ggTarget = (data[0]['processTarget'][0]).toLocaleString(undefined,              {maximumFractionDigits: 0});
                        } else {
                            
                            var ggTarget = 0;
                        }

                        if (data[1]['processOuts'][0] !== null) {

                            var ggOuts = (data[1]['processOuts'][0]).toLocaleString(undefined, {maximumFractionDigits: 0}); 
                        } else {
                            
                            var ggOuts = 0;
                        }

                        if (data[0]['processTarget'][0] !== null && data[1]['processOuts'][0] !== null) {
                            
                            var variance = (data[1]['processOuts'][0] - data[0]['processTarget'][0]).toLocaleString(undefined, {maximumFractionDigits: 0});
                            
                            // combine the values with comma
                                data["variance"] = [variance];
                                
                        } else {
                           
                            var variance = 0;
                           // var variance = (data[0]['processTarget'][0] - data[1]['processOuts'][0]).toLocaleString(undefined, {maximumFractionDigits: 0});
                        }
                    
                                
                                data["ggTarget"] = [ggTarget];
                                data["ggOuts"] = [ggOuts];

                    } else {
                        
                        //  this is to check if the value is null then make the variable zero
                        if (data[0]['processTarget'][0] !== null) {

                            var ggTarget = (data[0]['processTarget'][0]).toLocaleString(undefined,              {maximumFractionDigits: 0});
                        } else {
                            
                            var ggTarget = 0;
                        }

                        if (data[1]['processOuts'][0] !== null) {

                            var ggOuts = (data[1]['processOuts'][0]).toLocaleString(undefined, {maximumFractionDigits: 0}); 
                        } else {
                            
                            var ggOuts = 0;
                        }

                        if (data[0]['processTarget'][0] !== null && data[1]['processOuts'][0] !== null) {
                            
                            
                            var variance = '+' + (data[1]['processOuts'][0] - data[0]['processTarget'][0]).toLocaleString(undefined, {maximumFractionDigits: 0});

                            // combine the values with comma
                                data["variance"] = [variance];
                        } else {

                            var variance = 0;
                        }
                                
                            data["ggTarget"] = [ggTarget];
                            data["ggOuts"] = [ggOuts];
                    }
            
            
           //combine all resolve data to be render into front end at once
            res.render(process, {data} );
            
        }); 

        // REPLACED BY SCRIPT @ September 9, 2017 
        /*
       //   systems database
        pool.getConnection(function(err, connection){
           if (err) throw err;
            //  will check the AM and PM 
            if (checker >= check_am_start && checker <= check_am_end) {
  
                    //  need to translate this to script.......
                        connection.query({
                            
                            sql: 'SELECT A.process_id, IF(A.totalOuts IS NULL, 0, A.totalOuts) AS outs_one, IF(B.totalOuts IS NULL, 0, B.totalOuts) AS outs_two, IF(C.totalOuts IS NULL, 0, C.totalOuts) AS outs_three, IF(D.totalOuts IS NULL, 0, D.totalOuts) AS outs_four, IF(E.totalOuts IS NULL, 0, E.totalOuts) AS outs_five, IF(F.totalOuts IS NULL, 0, F.totalOuts) AS outs_six, IF(G.totalOuts IS NULL, 0, G.totalOuts) AS outs_seven, IF(H.totalOuts IS NULL, 0, H.totalOuts) AS outs_eight, IF(I.totalOuts IS NULL, 0, I.totalOuts) AS outs_nine, IF(J.totalOuts IS NULL, 0, J.totalOuts) AS outs_ten, IF(K.totalOuts IS NULL, 0, K.totalOuts) AS outs_eleven, IF(L.totalOuts IS NULL, 0, L.totalOuts) AS outs_twelve FROM (SELECT A.process_id, SUM(A.out_qty) AS totalOuts FROM MES_OUT_DETAILS A  WHERE A.process_id = ? AND A.date_time >= CONCAT("' + today + ' ", " 06:30:00")     && A.date_time <= CONCAT("' + today + ' ", " 07:29:59")) A   CROSS JOIN (SELECT     SUM(A.out_qty) AS totalOuts  FROM   MES_OUT_DETAILS A  WHERE   A.process_id = ?    AND A.date_time >= CONCAT("' + today + ' ", " 07:30:00")    && A.date_time <= CONCAT("' + today + ' ", " 08:29:59")) B CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 08:30:00")      && A.date_time <= CONCAT("' + today + ' ", " 09:29:59")) C  CROSS JOIN  (SELECT       SUM(A.out_qty) AS totalOuts  FROM      MES_OUT_DETAILS A  WHERE      A.process_id = ?        AND A.date_time >= CONCAT("' + today + ' ", " 09:30:00")       && A.date_time <= CONCAT("' + today + ' ", " 10:29:59")) D    CROSS JOIN  (SELECT       SUM(A.out_qty) AS totalOuts  FROM      MES_OUT_DETAILS A  WHERE      A.process_id = ?    AND A.date_time >= CONCAT("' + today + ' ", " 10:30:00")    && A.date_time <= CONCAT("' + today + ' ", " 11:29:59")) E   CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts  FROM      MES_OUT_DETAILS A  WHERE      A.process_id = ?          AND A.date_time >= CONCAT("' + today + ' ", " 11:30:00")          && A.date_time <= CONCAT("' + today + ' ", " 12:29:59")) F    CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?        AND A.date_time >= CONCAT("' + today + ' ", " 12:30:00")       && A.date_time <= CONCAT("' + today + ' ", " 13:29:59")) G CROSS JOIN(SELECT  SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE  A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 13:30:00")        && A.date_time <= CONCAT("' + today + ' ", " 14:29:59")) H    CROSS JOIN(SELECT        SUM(A.out_qty) AS totalOuts   FROM       MES_OUT_DETAILS A   WHERE       A.process_id = ?          AND A.date_time >= CONCAT("' + today + ' ", " 14:30:00")         && A.date_time <= CONCAT("' + today + ' ", " 15:29:59")) I     CROSS JOIN  (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 15:30:00")         && A.date_time <= CONCAT("' + today + ' ", " 16:29:59")) J     CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 16:30:00")         && A.date_time <= CONCAT("' + today + ' ", " 17:29:59")) K    CROSS JOIN(SELECT     SUM(A.out_qty) AS totalOuts FROM    MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 17:30:00")        && A.date_time <= CONCAT("' + today + ' ", " 18:29:59")) L UNION ALL SELECT A.process_id, IF(A.totalScraps IS NULL, 0, A.totalScraps) AS scraps_one, IF(B.totalScraps IS NULL, 0, B.totalScraps) AS scraps_two, IF(C.totalScraps IS NULL, 0, C.totalScraps) AS scraps_three, IF(D.totalScraps IS NULL, 0, D.totalScraps) AS scraps_four, IF(E.totalScraps IS NULL, 0, E.totalScraps) AS scraps_five, IF(F.totalScraps IS NULL, 0, F.totalScraps) AS scraps_six, IF(G.totalScraps IS NULL, 0, G.totalScraps) AS scraps_seven, IF(H.totalScraps IS NULL, 0, H.totalScraps) AS scraps_eight, IF(I.totalScraps IS NULL, 0, I.totalScraps) AS scraps_nine, IF(J.totalScraps IS NULL, 0, J.totalScraps) AS scraps_ten, IF(K.totalScraps IS NULL, 0, K.totalScraps) AS scraps_eleven, IF(L.totalScraps IS NULL, 0, L.totalScraps) AS scraps_twelve FROM (SELECT A.process_id, SUM(A.scrap_qty) AS totalScraps FROM MES_SCRAP_DETAILS A  WHERE  A.process_id = ? AND   A.date_time >= CONCAT("' + today + ' ", " 06:30:00")     && A.date_time <= CONCAT("' + today + ' ", " 07:29:59")) A   CROSS JOIN (SELECT     SUM(A.scrap_qty) AS totalScraps  FROM   MES_SCRAP_DETAILS A  WHERE   A.process_id = ?    AND A.date_time >= CONCAT("' + today + ' ", " 07:30:00")    && A.date_time <= CONCAT("' + today + ' ", " 08:29:59")) B CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 08:30:00")      && A.date_time <= CONCAT("' + today + ' ", " 09:29:59")) C  CROSS JOIN  (SELECT       SUM(A.scrap_qty) AS totalScraps  FROM      MES_SCRAP_DETAILS A  WHERE      A.process_id = ?        AND A.date_time >= CONCAT("' + today + ' ", " 09:30:00")       && A.date_time <= CONCAT("' + today + ' ", " 10:29:59")) D    CROSS JOIN  (SELECT       SUM(A.scrap_qty) AS totalScraps  FROM      MES_SCRAP_DETAILS A  WHERE      A.process_id = ?    AND A.date_time >= CONCAT("' + today + ' ", " 10:30:00")    && A.date_time <= CONCAT("' + today + ' ", " 11:29:59")) E   CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps  FROM      MES_SCRAP_DETAILS A  WHERE      A.process_id = ?          AND A.date_time >= CONCAT("' + today + ' ", " 11:30:00")          && A.date_time <= CONCAT("' + today + ' ", " 12:29:59")) F    CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?        AND A.date_time >= CONCAT("' + today + ' ", " 12:30:00")       && A.date_time <= CONCAT("' + today + ' ", " 13:29:59")) G CROSS JOIN(SELECT  SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE  A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 13:30:00")        && A.date_time <= CONCAT("' + today + ' ", " 14:29:59")) H    CROSS JOIN(SELECT        SUM(A.scrap_qty) AS totalScraps   FROM       MES_SCRAP_DETAILS A   WHERE       A.process_id = ?          AND A.date_time >= CONCAT("' + today + ' ", " 14:30:00")         && A.date_time <= CONCAT("' + today + ' ", " 15:29:59")) I     CROSS JOIN  (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 15:30:00")         && A.date_time <= CONCAT("' + today + ' ", " 16:29:59")) J     CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 16:30:00")         && A.date_time <= CONCAT("' + today + ' ", " 17:29:59")) K    CROSS JOIN(SELECT     SUM(A.scrap_qty) AS totalScraps FROM    MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 17:30:00")        && A.date_time <= CONCAT("' + today + ' ", " 18:29:59")) L',

                            values: [process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process]  

                        }, function(err, results, fields){
                            if (err) throw err;

                            var obj = [];

                                    obj.push(
                                        {   
                                            hours: today + ' 06:30',
                                            outs: results[0].outs_one,
                                            dppm: Math.round(results[1].outs_one/(results[0].outs_one + results[1].outs_one) * 1000000) || 0
                                            
                                        },
                                        {
                                            hours: today + ' 07:30',
                                            outs: results[0].outs_two,
                                            dppm: Math.round(results[1].outs_two/(results[0].outs_two + results[1].outs_two) * 1000000) || 0
                                            
                                        },
                                        {
                                            hours: today + ' 08:30',
                                            outs: results[0].outs_three,
                                            dppm: Math.round(results[1].outs_three/(results[0].outs_three + results[1].outs_three) * 1000000) || 0
                                        },
                                        {
                                            hours: today + ' 09:30',
                                            outs: results[0].outs_four,
                                            dppm: Math.round(results[1].outs_four/(results[0].outs_four + results[1].outs_four) * 1000000) || 0
                                        },
                                        {
                                            hours: today + ' 10:30',
                                            outs: results[0].outs_five,
                                            dppm: Math.round(results[1].outs_five/(results[0].outs_five + results[1].outs_five) * 1000000) || 0
                                        },
                                        {
                                            hours: today + ' 11:30',
                                            outs: results[0].outs_six,
                                            dppm: Math.round(results[1].outs_six/(results[0].outs_six + results[1].outs_six) * 1000000) || 0
                                        },
                                        {
                                            hours: today + ' 12:30',
                                            outs: results[0].outs_seven,
                                            dppm: Math.round(results[1].outs_seven/(results[0].outs_seven + results[1].outs_seven) * 1000000) || 0
                                        },
                                        {
                                            hours: today + ' 13:30',
                                            outs: results[0].outs_eight,
                                            dppm: Math.round(results[1].outs_eight/(results[0].outs_eight + results[1].outs_eight) * 1000000) || 0
                                        },
                                        {
                                            hours: today + ' 14:30',
                                            outs: results[0].outs_nine,
                                            dppm: Math.round(results[1].outs_nine/(results[0].outs_nine + results[1].outs_nine) * 1000000) || 0
                                        },
                                        {
                                            hours: today + ' 15:30',
                                            outs: results[0].outs_ten,
                                            dppm: Math.round(results[1].outs_ten/(results[0].outs_ten + results[1].outs_ten) * 1000000) || 0
                        
                                        },
                                        {
                                            hours: today + ' 16:30',
                                            outs: results[0].outs_eleven,
                                            dppm: Math.round(results[1].outs_eleven/(results[0].outs_eleven + results[1].outs_eleven) * 1000000) || 0
                                        },
                                        {
                                            hours: today + ' 17:30',
                                            outs: results[0].outs_twelve,
                                            dppm: Math.round(results[1].outs_twelve/(results[0].outs_twelve + results[1].outs_twelve) * 1000000) || 0
                                        }
                                        
                                    );
                            
                            // stringify obj to TSV
                            // var processHourly_tsv = TSV.stringify(obj);

                            //  create .tsv per request
                            //fs.writeFile('./public/' + process + '.tsv', processHourly_tsv, 'utf8', function(err){
                            //    if (err) throw err;
                            //});


                            //  json2csv 
                            var fields = ['hours', 'outs', 'dppm'];
                            var gg = {
                                data: obj,
                                fields: fields,
                                quotes: ''
                            };
                            
                            var processHourly_csv = json2csv(gg);
                            console.log(processHourly_csv);
                            //  create .csv 
                            fs.writeFile('./public/' + process + '.csv', processHourly_csv, function(err){
                                if (err) throw err;
                            });

                          // remove connection
                            connection.release();

                           // res.render(process);
                        });

                
                // then for PM shift
                } else {
                    
                    //  if current time is between start pm shift and midnight
                    if (checker >= check_pm_start && checker <= check_notyet_midnight) {
                         // console.log(dateAndtime + ' ' + process + ' is between 18:30:00 and not yet midnight');

                            connection.query({
                                sql: 'SELECT A.process_id, IF(A.totalOuts IS NULL, 0, A.totalOuts) AS outs_one, IF(B.totalOuts IS NULL, 0, B.totalOuts) AS outs_two, IF(C.totalOuts IS NULL, 0, C.totalOuts) AS outs_three, IF(D.totalOuts IS NULL, 0, D.totalOuts) AS outs_four, IF(E.totalOuts IS NULL, 0, E.totalOuts) AS outs_five, IF(F.totalOuts IS NULL, 0, F.totalOuts) AS outs_six, IF(G.totalOuts IS NULL, 0, G.totalOuts) AS outs_seven, IF(H.totalOuts IS NULL, 0, H.totalOuts) AS outs_eight, IF(I.totalOuts IS NULL, 0, I.totalOuts) AS outs_nine, IF(J.totalOuts IS NULL, 0, J.totalOuts) AS outs_ten, IF(K.totalOuts IS NULL, 0, K.totalOuts) AS outs_eleven, IF(L.totalOuts IS NULL, 0, L.totalOuts) AS outs_twelve FROM (SELECT A.process_id, SUM(A.out_qty) AS totalOuts FROM MES_OUT_DETAILS A  WHERE A.process_id = ? AND A.date_time >= CONCAT("' + today + ' ", " 18:30:00")     && A.date_time <= CONCAT("' + today + ' ", " 19:29:59")) A   CROSS JOIN (SELECT     SUM(A.out_qty) AS totalOuts  FROM   MES_OUT_DETAILS A  WHERE   A.process_id = ?    AND A.date_time >= CONCAT("' + today + ' ", " 19:30:00")    && A.date_time <= CONCAT("' + today + ' ", " 20:29:59")) B CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 20:30:00")      && A.date_time <= CONCAT("' + today + ' ", " 21:29:59")) C  CROSS JOIN  (SELECT       SUM(A.out_qty) AS totalOuts  FROM      MES_OUT_DETAILS A  WHERE      A.process_id = ?        AND A.date_time >= CONCAT("' + today + ' ", " 21:30:00")       && A.date_time <= CONCAT("' + today + ' ", " 22:29:59")) D    CROSS JOIN  (SELECT       SUM(A.out_qty) AS totalOuts  FROM      MES_OUT_DETAILS A  WHERE      A.process_id = ?    AND A.date_time >= CONCAT("' + today + ' ", " 22:30:00")    && A.date_time <= CONCAT("' + today + ' ", " 23:29:59")) E   CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts  FROM      MES_OUT_DETAILS A  WHERE      A.process_id = ?          AND A.date_time >= CONCAT("' + today + ' ", " 23:30:00")          && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 00:29:59")) F    CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?        AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 00:30:00")       && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 01:29:59")) G CROSS JOIN(SELECT  SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE  A.process_id = ?         AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 01:30:00")        && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 02:29:59")) H    CROSS JOIN(SELECT        SUM(A.out_qty) AS totalOuts   FROM       MES_OUT_DETAILS A   WHERE       A.process_id = ?          AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 02:30:00")         && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 03:29:59")) I     CROSS JOIN  (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 03:30:00")         && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 04:29:59")) J     CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 04:30:00")         && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 05:29:59")) K    CROSS JOIN(SELECT     SUM(A.out_qty) AS totalOuts FROM    MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 05:30:00")        && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 06:29:59")) L UNION ALL SELECT A.process_id, IF(A.totalScraps IS NULL, 0, A.totalScraps) AS scraps_one, IF(B.totalScraps IS NULL, 0, B.totalScraps) AS scraps_two, IF(C.totalScraps IS NULL, 0, C.totalScraps) AS scraps_three, IF(D.totalScraps IS NULL, 0, D.totalScraps) AS scraps_four, IF(E.totalScraps IS NULL, 0, E.totalScraps) AS scraps_five, IF(F.totalScraps IS NULL, 0, F.totalScraps) AS scraps_six, IF(G.totalScraps IS NULL, 0, G.totalScraps) AS scraps_seven, IF(H.totalScraps IS NULL, 0, H.totalScraps) AS scraps_eight, IF(I.totalScraps IS NULL, 0, I.totalScraps) AS scraps_nine, IF(J.totalScraps IS NULL, 0, J.totalScraps) AS scraps_ten, IF(K.totalScraps IS NULL, 0, K.totalScraps) AS scraps_eleven, IF(L.totalScraps IS NULL, 0, L.totalScraps) AS scraps_twelve FROM (SELECT A.process_id, SUM(A.scrap_qty) AS totalScraps FROM MES_SCRAP_DETAILS A  WHERE  A.process_id = ? AND   A.date_time >= CONCAT("' + today + ' ", " 18:30:00")     && A.date_time <= CONCAT("' + today + ' ", " 19:29:59")) A   CROSS JOIN (SELECT     SUM(A.scrap_qty) AS totalScraps  FROM   MES_SCRAP_DETAILS A  WHERE   A.process_id = ?    AND A.date_time >= CONCAT("' + today + ' ", " 19:30:00")    && A.date_time <= CONCAT("' + today + ' ", " 20:29:59")) B CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + ' ", " 20:30:00")      && A.date_time <= CONCAT("' + today + ' ", " 21:29:59")) C  CROSS JOIN  (SELECT       SUM(A.scrap_qty) AS totalScraps  FROM      MES_SCRAP_DETAILS A  WHERE      A.process_id = ?        AND A.date_time >= CONCAT("' + today + ' ", " 21:30:00")       && A.date_time <= CONCAT("' + today + ' ", " 22:29:59")) D    CROSS JOIN  (SELECT       SUM(A.scrap_qty) AS totalScraps  FROM      MES_SCRAP_DETAILS A  WHERE      A.process_id = ?    AND A.date_time >= CONCAT("' + today + ' ", " 22:30:00")    && A.date_time <= CONCAT("' + today + ' ", " 23:29:59")) E   CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps  FROM      MES_SCRAP_DETAILS A  WHERE      A.process_id = ?          AND A.date_time >= CONCAT("' + today + ' ", " 23:30:00")          && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 00:29:59")) F    CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?        AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 00:30:00")       && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 01:29:59")) G CROSS JOIN(SELECT  SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE  A.process_id = ?         AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 01:30:00")        && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 02:29:59")) H    CROSS JOIN(SELECT        SUM(A.scrap_qty) AS totalScraps   FROM       MES_SCRAP_DETAILS A   WHERE       A.process_id = ?          AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 02:30:00")         && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 03:29:59")) I     CROSS JOIN  (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 03:30:00")         && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 04:29:59")) J     CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 04:30:00")         && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 05:29:59")) K    CROSS JOIN(SELECT     SUM(A.scrap_qty) AS totalScraps FROM    MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + todayPlusOne + ' ", " 05:30:00")        && A.date_time <= CONCAT("' + todayPlusOne + ' ", " 06:29:59")) L',
                                values: [process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process]
                            },  function(err, results, fields){
                                
                                    var obj = [];

                                        obj.push(
                                            {   
                                                hours: today + ' 18:30',
                                                outs: results[0].outs_one,
                                                dppm: Math.round(results[1].outs_one/(results[0].outs_one + results[1].outs_one) * 1000000) || 0
                                                
                                            },
                                            {
                                                hours: today + ' 19:30',
                                                outs: results[0].outs_two,
                                                dppm: Math.round(results[1].outs_two/(results[0].outs_two + results[1].outs_two) * 1000000) || 0
                                                
                                            },
                                            {
                                                hours: today + ' 20:30',
                                                outs: results[0].outs_three,
                                                dppm: Math.round(results[1].outs_three/(results[0].outs_three + results[1].outs_three) * 1000000) || 0
                                            },
                                            {
                                                hours: today + ' 21:30',
                                                outs: results[0].outs_four,
                                                dppm: Math.round(results[1].outs_four/(results[0].outs_four + results[1].outs_four) * 1000000) || 0
                                            },
                                            {
                                                hours: today + ' 22:30',
                                                outs: results[0].outs_five,
                                                dppm: Math.round(results[1].outs_five/(results[0].outs_five + results[1].outs_five) * 1000000) || 0
                                            },
                                            {
                                                hours: today + ' 23:30',
                                                outs: results[0].outs_six,
                                                dppm: Math.round(results[1].outs_six/(results[0].outs_six + results[1].outs_six) * 1000000) || 0
                                            },
                                            {
                                                hours: todayPlusOne + ' 00:30',
                                                outs: results[0].outs_seven,
                                                dppm: Math.round(results[1].outs_seven/(results[0].outs_seven + results[1].outs_seven) * 1000000) || 0
                                            },
                                            {
                                                hours: todayPlusOne + ' 01:30',
                                                outs: results[0].outs_eight,
                                                dppm: Math.round(results[1].outs_eight/(results[0].outs_eight + results[1].outs_eight) * 1000000) || 0
                                            },
                                            {
                                                hours: todayPlusOne + ' 02:30',
                                                outs: results[0].outs_nine,
                                                dppm: Math.round(results[1].outs_nine/(results[0].outs_nine + results[1].outs_nine) * 1000000) || 0
                                            },
                                            {
                                                hours: todayPlusOne + ' 03:30',
                                                outs: results[0].outs_ten,
                                                dppm: Math.round(results[1].outs_ten/(results[0].outs_ten + results[1].outs_ten) * 1000000) || 0
                            
                                            },
                                            {
                                                hours: todayPlusOne + ' 04:30',
                                                outs: results[0].outs_eleven,
                                                dppm: Math.round(results[1].outs_eleven/(results[0].outs_eleven + results[1].outs_eleven) * 1000000) || 0
                                            },
                                            {
                                                hours: todayPlusOne + ' 05:30',
                                                outs: results[0].outs_twelve,
                                                dppm: Math.round(results[1].outs_twelve/(results[0].outs_twelve + results[1].outs_twelve) * 1000000) || 0
                                            }
                                            
                                        );
                                
                                
                                //  json2csv 
                                var fields = ['hours', 'outs', 'dppm'];
                                var gg = {
                                    data: obj,
                                    fields: fields,
                                    quotes: ''
                                };
                                
                                var processHourly_csv = json2csv(gg);
                                console.log(processHourly_csv);
                                //  create .csv 
                                fs.writeFile('./public/' + process + '.csv', processHourly_csv, function(err){
                                    if (err) throw err;
                                });

                                // remove connection
                                connection.release();

                            });

                    } else if (checker >= check_exact_midnight && checker <= check_pm_end) {
                        // console.log(dateAndtime + ' ' + process + ' is between exact midnight and pm end shift');

                         connection.query({
                             sql: 'SELECT A.process_id, IF(A.totalOuts IS NULL, 0, A.totalOuts) AS outs_one, IF(B.totalOuts IS NULL, 0, B.totalOuts) AS outs_two, IF(C.totalOuts IS NULL, 0, C.totalOuts) AS outs_three, IF(D.totalOuts IS NULL, 0, D.totalOuts) AS outs_four, IF(E.totalOuts IS NULL, 0, E.totalOuts) AS outs_five, IF(F.totalOuts IS NULL, 0, F.totalOuts) AS outs_six, IF(G.totalOuts IS NULL, 0, G.totalOuts) AS outs_seven, IF(H.totalOuts IS NULL, 0, H.totalOuts) AS outs_eight, IF(I.totalOuts IS NULL, 0, I.totalOuts) AS outs_nine, IF(J.totalOuts IS NULL, 0, J.totalOuts) AS outs_ten, IF(K.totalOuts IS NULL, 0, K.totalOuts) AS outs_eleven, IF(L.totalOuts IS NULL, 0, L.totalOuts) AS outs_twelve FROM (SELECT A.process_id, SUM(A.out_qty) AS totalOuts FROM MES_OUT_DETAILS A  WHERE A.process_id = ? AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 18:30:00")     && A.date_time <= CONCAT("' + todayMinusOne + ' ", " 19:29:59")) A   CROSS JOIN (SELECT     SUM(A.out_qty) AS totalOuts  FROM   MES_OUT_DETAILS A  WHERE   A.process_id = ?    AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 19:30:00")    && A.date_time <= CONCAT("' + todayMinusOne + ' ", " 20:29:59")) B CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 20:30:00")      && A.date_time <= CONCAT("' + todayMinusOne + ' ", " 21:29:59")) C  CROSS JOIN  (SELECT       SUM(A.out_qty) AS totalOuts  FROM      MES_OUT_DETAILS A  WHERE      A.process_id = ?        AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 21:30:00")       && A.date_time <= CONCAT("' + todayMinusOne + ' ", " 22:29:59")) D    CROSS JOIN  (SELECT       SUM(A.out_qty) AS totalOuts  FROM      MES_OUT_DETAILS A  WHERE      A.process_id = ?    AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 22:30:00")    && A.date_time <= CONCAT("' + todayMinusOne + ' ", " 23:29:59")) E   CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts  FROM      MES_OUT_DETAILS A  WHERE      A.process_id = ?          AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 23:30:00")          && A.date_time <= CONCAT("' + today + ' ", " 00:29:59")) F    CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?        AND A.date_time >= CONCAT("' + today + '  ", " 00:30:00")       && A.date_time <= CONCAT("' + today + '  ", " 01:29:59")) G CROSS JOIN(SELECT  SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE  A.process_id = ?         AND A.date_time >= CONCAT("' + today + '   ", " 01:30:00")        && A.date_time <= CONCAT("' + today + '  ", " 02:29:59")) H    CROSS JOIN(SELECT        SUM(A.out_qty) AS totalOuts   FROM       MES_OUT_DETAILS A   WHERE       A.process_id = ?          AND A.date_time >= CONCAT("' + today + '  ", " 02:30:00")         && A.date_time <= CONCAT("' + today + '  ", " 03:29:59")) I     CROSS JOIN  (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + '  ", " 03:30:00")         && A.date_time <= CONCAT("' + today + '  ", " 04:29:59")) J     CROSS JOIN (SELECT      SUM(A.out_qty) AS totalOuts FROM     MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + '  ", " 04:30:00")         && A.date_time <= CONCAT("' + today + '  ", " 05:29:59")) K    CROSS JOIN(SELECT     SUM(A.out_qty) AS totalOuts FROM    MES_OUT_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + '  ", " 05:30:00")        && A.date_time <= CONCAT("' + today + '  ", " 06:29:59")) L UNION ALL SELECT A.process_id, IF(A.totalScraps IS NULL, 0, A.totalScraps) AS scraps_one, IF(B.totalScraps IS NULL, 0, B.totalScraps) AS scraps_two, IF(C.totalScraps IS NULL, 0, C.totalScraps) AS scraps_three, IF(D.totalScraps IS NULL, 0, D.totalScraps) AS scraps_four, IF(E.totalScraps IS NULL, 0, E.totalScraps) AS scraps_five, IF(F.totalScraps IS NULL, 0, F.totalScraps) AS scraps_six, IF(G.totalScraps IS NULL, 0, G.totalScraps) AS scraps_seven, IF(H.totalScraps IS NULL, 0, H.totalScraps) AS scraps_eight, IF(I.totalScraps IS NULL, 0, I.totalScraps) AS scraps_nine, IF(J.totalScraps IS NULL, 0, J.totalScraps) AS scraps_ten, IF(K.totalScraps IS NULL, 0, K.totalScraps) AS scraps_eleven, IF(L.totalScraps IS NULL, 0, L.totalScraps) AS scraps_twelve FROM (SELECT A.process_id, SUM(A.scrap_qty) AS totalScraps FROM MES_SCRAP_DETAILS A  WHERE  A.process_id = ? AND   A.date_time >= CONCAT("' + todayMinusOne + ' ", " 18:30:00")     && A.date_time <= CONCAT("' + todayMinusOne + ' ", " 19:29:59")) A   CROSS JOIN (SELECT     SUM(A.scrap_qty) AS totalScraps  FROM   MES_SCRAP_DETAILS A  WHERE   A.process_id = ?    AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 19:30:00")    && A.date_time <= CONCAT("' + todayMinusOne + ' ", " 20:29:59")) B CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 20:30:00")      && A.date_time <= CONCAT("' + todayMinusOne + ' ", " 21:29:59")) C  CROSS JOIN  (SELECT       SUM(A.scrap_qty) AS totalScraps  FROM      MES_SCRAP_DETAILS A  WHERE      A.process_id = ?        AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 21:30:00")       && A.date_time <= CONCAT("' + todayMinusOne + ' ", " 22:29:59")) D    CROSS JOIN  (SELECT       SUM(A.scrap_qty) AS totalScraps  FROM      MES_SCRAP_DETAILS A  WHERE      A.process_id = ?    AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 22:30:00")    && A.date_time <= CONCAT("' + today + '  - INTERVAL 1 DAY", " 23:29:59")) E   CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps  FROM      MES_SCRAP_DETAILS A  WHERE      A.process_id = ?          AND A.date_time >= CONCAT("' + todayMinusOne + ' ", " 23:30:00")          && A.date_time <= CONCAT("' + today + '  ", " 00:29:59")) F    CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?        AND A.date_time >= CONCAT("' + today + '  ", " 00:30:00")       && A.date_time <= CONCAT("' + today + '  ", " 01:29:59")) G CROSS JOIN(SELECT  SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE  A.process_id = ?         AND A.date_time >= CONCAT("' + today + '  ", " 01:30:00")        && A.date_time <= CONCAT("' + today + '  ", " 02:29:59")) H    CROSS JOIN(SELECT        SUM(A.scrap_qty) AS totalScraps   FROM       MES_SCRAP_DETAILS A   WHERE       A.process_id = ?          AND A.date_time >= CONCAT("' + today + '  ", " 02:30:00")         && A.date_time <= CONCAT("' + today + '  ", " 03:29:59")) I     CROSS JOIN  (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + '  ", " 03:30:00")         && A.date_time <= CONCAT("' + today + '  ", " 04:29:59")) J     CROSS JOIN (SELECT      SUM(A.scrap_qty) AS totalScraps FROM     MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + '  ", " 04:30:00")         && A.date_time <= CONCAT("' + today + '  ", " 05:29:59")) K    CROSS JOIN(SELECT     SUM(A.scrap_qty) AS totalScraps FROM    MES_SCRAP_DETAILS A WHERE     A.process_id = ?         AND A.date_time >= CONCAT("' + today + '  ", " 05:30:00")        && A.date_time <= CONCAT("' + today + '  ", " 06:29:59")) L',

                             values : [process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process, process]
                         }, function(err, results, fields){

                                var obj = [];

                                        obj.push(
                                            {   
                                                hours: todayMinusOne + ' 18:30',
                                                outs: results[0].outs_one,
                                                dppm: Math.round(results[1].outs_one/(results[0].outs_one + results[1].outs_one) * 1000000) || 0
                                                
                                            },
                                            {
                                                hours: todayMinusOne + ' 19:30',
                                                outs: results[0].outs_two,
                                                dppm: Math.round(results[1].outs_two/(results[0].outs_two + results[1].outs_two) * 1000000) || 0
                                                
                                            },
                                            {
                                                hours: todayMinusOne + ' 20:30',
                                                outs: results[0].outs_three,
                                                dppm: Math.round(results[1].outs_three/(results[0].outs_three + results[1].outs_three) * 1000000) || 0
                                            },
                                            {
                                                hours: todayMinusOne + ' 21:30',
                                                outs: results[0].outs_four,
                                                dppm: Math.round(results[1].outs_four/(results[0].outs_four + results[1].outs_four) * 1000000) || 0
                                            },
                                            {
                                                hours: todayMinusOne + ' 22:30',
                                                outs: results[0].outs_five,
                                                dppm: Math.round(results[1].outs_five/(results[0].outs_five + results[1].outs_five) * 1000000) || 0
                                            },
                                            {
                                                hours: todayMinusOne + ' 23:30',
                                                outs: results[0].outs_six,
                                                dppm: Math.round(results[1].outs_six/(results[0].outs_six + results[1].outs_six) * 1000000) || 0
                                            },
                                            {
                                                hours: today + ' 00:30',
                                                outs: results[0].outs_seven,
                                                dppm: Math.round(results[1].outs_seven/(results[0].outs_seven + results[1].outs_seven) * 1000000) || 0
                                            },
                                            {
                                                hours: today + ' 01:30',
                                                outs: results[0].outs_eight,
                                                dppm: Math.round(results[1].outs_eight/(results[0].outs_eight + results[1].outs_eight) * 1000000) || 0
                                            },
                                            {
                                                hours: today + ' 02:30',
                                                outs: results[0].outs_nine,
                                                dppm: Math.round(results[1].outs_nine/(results[0].outs_nine + results[1].outs_nine) * 1000000) || 0
                                            },
                                            {
                                                hours: today + ' 03:30',
                                                outs: results[0].outs_ten,
                                                dppm: Math.round(results[1].outs_ten/(results[0].outs_ten + results[1].outs_ten) * 1000000) || 0
                            
                                            },
                                            {
                                                hours: today + ' 04:30',
                                                outs: results[0].outs_eleven,
                                                dppm: Math.round(results[1].outs_eleven/(results[0].outs_eleven + results[1].outs_eleven) * 1000000) || 0
                                            },
                                            {
                                                hours: today + ' 05:30',
                                                outs: results[0].outs_twelve,
                                                dppm: Math.round(results[1].outs_twelve/(results[0].outs_twelve + results[1].outs_twelve) * 1000000) || 0
                                            }
                                            
                                        );
                                
                                //  json2csv 
                                var fields = ['hours', 'outs', 'dppm'];
                                var gg = {
                                    data: obj,
                                    fields: fields,
                                    quotes: ''
                                };
                                
                                var processHourly_csv = json2csv(gg);
                                console.log(processHourly_csv);
                                //  create .csv 
                                fs.writeFile('./public/' + process + '.csv', processHourly_csv, function(err){
                                    if (err) throw err;
                                });

                                // remove connection
                                connection.release();

                         });

                    }

                }

        });
        
        */
        
    }); 


    //  index initializer 
    app.get('/api/view', function(req, res){

        poolLocal.getConnection(function(err, connection){
            if (err) throw err;

            connection.query({
                sql: 'SELECT * FROM view_api WHERE today_date >= CURDATE() - INTERVAL 1 DAY && CURDATE() AND adjusted_target != "0"',
            },  function(err, results, fields){
                if (err) throw err;
                
                    var obj = [];
                    
                        for(i = 0; i < results.length; i++){
                            obj.push({

                                process_id:     results[i].process_id,
                                process_name:   results[i].process_name,
                                today_date:     new Date(results[i].today_date),
                                stime:          results[i].stime,
                                ntime:          results[i].ntime,
                                default_target: results[i].default_target,
                                adjusted_target:results[i].adjusted_target,
                                total_target:   results[i].total_target,
                                remarks:        results[i].remarks

                            });
                        };
                    
                
                    //  send json 
                    res.send(JSON.stringify(obj));

                    fs.writeFile('./public/view.json', JSON.stringify(obj), 'utf8', function(err){
                        if (err) throw err;
                    });
                    

            });

        // remove connection
        connection.release();

        });

        

    });

    // update data
    app.post('/api/update', function(req, res){
        poolLocal.getConnection(function(err, connection){
            if (err) throw err;

            if(req.body.id) {

                //  need to dis to align the jeasyui datetime with my format
                startTime = new Date(req.body.start_time);
                endTime = new Date(req.body.end_time);

                //  for target data, compute details
                var computedTarget = Math.round((req.body.uph * (req.body.num_tool - req.body.toolpm)) * (req.body.oee/100)) || 0;


                connection.query({
                sql: 'UPDATE tbl_target_toolpm SET start_time =?, end_time =?, toolpm =?, remarks= ? WHERE id =? ',
                values: [startTime, endTime, req.body.toolpm, req.body.remarks, req.body.id]
            },  function(err, results, fields){
                if(err) throw err;

                console.log('Target id: ' + req.body.id + ' has been updated!');
                res.redirect('back');
            });

            } else {
                console.log('something is wrong');
            }

        // remove connection
        connection.release();
            
        });

        

    });
        
    //  add tool time data
    app.post('/api/add', function(req, res){
        poolLocal.getConnection(function(err, connection){
            if (err) throw err;

            if(req.body.process_id){

                //  need to dis to align the jeasyui datetime with my format
                startTime = new Date(req.body.startTime);
                endTime = new Date(req.body.endTime);

                /*
                connection.query({
                    sql: 'INSERT INTO tbl_target_view SET process_id =?, start_time=?, end_time=?, toolpm=?, remarks=?',
                    values: [req.body.process_id, startTime, endTime, req.body.toolpm, req.body.remarks]
                },  function(err, results, fields){
                    if (err) throw err;

                    console.log('Process : ' + req.body.process_id + ' has been added!');
                    res.redirect('back');
                }); */

                // UPDATE@@@@@@@@2 start_time to tbl_target_details
                connection.query({
                    sql: 'INSERT INTO tbl_target_details SET date_time=?, process_id =?' ,
                    values: [startTime, req.body.process_id]
                },  function(err, resutls, fields){
                    if (err) throw err;
                });

                // UPDATE@@@@@@@@@@ end_time to tbl_target_details
                connection.query({
                    sql: 'INSERT INTO tbl_target_details SET date_time=?, process_id =?' ,
                    values: [endTime, req.body.process_id]
                },  function(err, resutls, fields){
                    if (err) throw err;
                });

               //   instead of adding literal values, UPDATE!
                connection.query({
                    sql: 'UPDATE tbl_target_input SET toolpm = ? , remarks = ? WHERE today_date = ? AND process_id = ? AND stime >= ? && stime < ? ',
                    values: [req.body.toolpm, req.body.remarks, new Date(req.body.today_date), req.body.process_id, req.body.stime, req.body.etime]
                },  function(err, results, fields){
                    if (err) throw err;

                    console.log(req.body.toolpm);
                    console.log(req.body.remarks);
                    console.log(new Date(req.body.today_date));
                    console.log(req.body.process_id);
                    console.log(req.body.stime);
                    console.log(req.body.etime);
                        
                                      
                    console.log('Target id: ' + req.body.process_id + ' has been ADDED!');
                    res.redirect('back');

                });

                
            } else {

                console.log('error');
                console.log(req.body.process_id);
            }

        // remove connection
        connection.release();
       
        });

        
    
    });



    //  Settings
    app.get('/settings/view', function(req, res) {

        poolLocal.getConnection(function(err, connection){
            if (err) throw err;

            connection.query({
                sql: 'SELECT * FROM view_default',
            },  function(err, results, fields){
                if (err) throw err;

                    var obj = [];

                    for(i=0; i < results.length; i++){

                        obj.push({

                            id:         results[i].id,
                            process_name: results[i].process_name,
                            uph:        results[i].uph,
                            oee:        results[i].oee,
                            num_tool:   results[i].num_tool

                        });

                    };

                //  send json 
                res.send(JSON.stringify(obj));
                
                fs.writeFile('./public/settings.json', JSON.stringify(obj), 'utf8', function(err){
                  if (err) throw err;
                });  

            });

        // remove connection
        connection.release();

        });

        
    });

    //  SETTINGS edit button

    app.post('/settings/update', function(req, res){
    
        poolLocal.getConnection(function(err,connection){
            if (err) throw err;

            if(req.body.id){

                connection.query({
                sql: 'UPDATE tbl_target_default SET uph= ?, oee= ?, num_tool= ? WHERE id = ? ',
                values: [req.body.uph, req.body.oee, req.body.num_tool, req.body.id]

                },  function(err, results, fields){
                    if (err) throw err;
                    
                    console.log('Target id: ' + req.body.id + ' has been updated!');
                    res.redirect('back');

                });
            }else{
                console.log('settings/update api error')
            }
        
        // remove connection
        connection.release();


        });

        

    });


    app.get('/mobile/', function(req, res){

        poolLocal.getConnection(function(err, connection){
            if (err) throw err;

            connection.query({
                sql: 'SELECT process_id, process_name, SUM(CASE WHEN today_date = CURDATE() AND stime >= "06:30:00" && stime < CURTIME() - INTERVAL 10 MINUTE THEN total_target ELSE 0 END) AS t_target FROM  view_target WHERE process_name = "DAMAGE" UNION ALL SELECT process_id, process_name, SUM(CASE WHEN today_date = CURDATE() AND stime >= "06:30:00" && stime < CURTIME() - INTERVAL 10 MINUTE THEN total_target ELSE 0 END) AS t_target FROM  view_target WHERE process_name = "POLY" ',
            }, function(err, results, fields){
                if (err) throw err;

                    var obj = [];
                    

                    for(i = 0; i< results.length; i++){
                            
                                obj.push({
                                    process_id: results[i].process_id,
                                    process_name: results[i].process_name ,
                                    t_target:  results[i].t_target ,
                                });
                            
                    };

                    var GG = {process: obj};
                
                res.send(GG);

            });
            
        });

    });

    app.get('/gg/:process_url', function(req, res){

        var process = req.params.process_url;
                
            csv.parseCSV('./public/outs/process_outs.csv', function(data){
                
                var processOuts = [];

                for(i=0; i<data.length; i++){
                    if(data[i].process_id === process.toUpperCase()){
                        processOuts.push(
                            data[i].totalOuts
                        );

                        console.log('it is ' + process + '!');
                        console.log(processOuts);
                    } 
                }
            
            resolve({processOuts: processOuts});
            
          });
    });
}



