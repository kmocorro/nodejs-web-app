var bodyParser = require('body-parser');
var mysql = require('mysql');
var moment = require('moment');
var fs = require('fs');
var TSV = require('tsv');


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
        connectionLimit:    100, //try for now
        host    :           'ddolfsb30gea9k.c36ugxkfyi6r.us-west-2.rds.amazonaws.com',
        user    :           'fab4_engineers',
        password:           'Password123',
        database:           'fab4'
    });    


    var poolLocal = mysql.createPool({
        multipleStatements: true,
        connectionLimit:    100, //try for now
        host    :           'localhost',
        user    :           'root',
        password:           '2qhls34r',
        database:           'dbtarget'
        }); 
        
    //  today today today
    var today = new Date();
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

        today = yyyy + '-' + mm + '-' + dd;
        dateAndtime = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min + ':' + sec;
        
        //  var use for checking AM and PM
        //  using momentjs 
        var checker = moment(dateAndtime, "YYYY-MM-DD h:mm:ss");
        var check_am_start = moment(today + " " + "06:30:00", "YYYY-MM-DD h:mm:ss");
        var check_am_end = moment(today + " " + "18:29:59", "YYYY-MM-DD h:mm:ss");    
        
        var check_midnight = moment(today + " " + "00:00:00", "YYYY-MM-DD h:mm:ss");


    // api
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



    // http request hourly outs per process
    app.get('/hourly/:process_url', function(req, res, next){
        
        //  parse process url
        var process = req.params.process_url;   
        
            // promise 1
            var hourlyTargetPromise = new Promise (function(resolve, reject){
                    
                //  local database
                poolLocal.getConnection(function(err, connection){
                            
                        //  query
                    connection.query({
                        sql: 'SELECT process_id, process_name, SUM(CASE WHEN today_date = CURDATE() AND stime >= "06:00:00" && stime <= CURTIME() THEN total_target ELSE 0 END) AS t_target FROM  view_target WHERE  process_name = ?',
                        values: [process]
                            },  function(err, results, fields){
                                if (err) return reject(err);

                                var processTarget = [];
                                    processTarget.push(
                                        results[0].t_target
                                    );                 

                                resolve({processTarget: processTarget});
                                
                    });

                }); 

            });
        
            //  promise 2
            var hourlyOutsPromise = new Promise (function(resolve, reject){

                //   systems database
                pool.getConnection(function(err, connection){
                
                    //  will check the AM and PM 
                    if (checker >= check_am_start && checker <= check_am_end) {

                        // for total outs
                            connection.query({
                                sql: 'SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = ? AND	date_time >= CONCAT("' + today + ' "," 06:30:00") AND date_time <= CONCAT("' + today + ' "," 18:29:59")',
                                values: [process]
                                },  function(err, results, fields){
                                    if (err) return reject(err);

                                    var processOuts = [];

                                        processOuts.push(
                                            results[0].totalOuts
                                        );

                                    resolve({processOuts: processOuts});

                            });

                        }else{
                        // pm shift here...
                    }
                });
            });

        //  aggregate multiple promises 
        Promise.all([hourlyTargetPromise, hourlyOutsPromise]).then(function(values){

           var process = req.params.process_url;

           var data = values;

           var variance = data[0]['processTarget'][0] - data[1]['processOuts'][0];

           data["variance"] = [variance];
        
           //combine all resolve data to be render
           res.render(process, {data} );
        });


       //   systems database
        pool.getConnection(function(err, connection){
           
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
                                            hours: '06:30',
                                            outs: results[0].outs_one,
                                            dppm: Math.round(results[1].outs_one/(results[0].outs_one + results[1].outs_one) * 1000000) || 0
                                            
                                        },
                                        {
                                            hours: '07:30',
                                            outs: results[0].outs_two,
                                            dppm: Math.round(results[1].outs_two/(results[0].outs_two + results[1].outs_two) * 1000000) || 0
                                            
                                        },
                                        {
                                            hours: '08:30',
                                            outs: results[0].outs_three,
                                            dppm: Math.round(results[1].outs_three/(results[0].outs_three + results[1].outs_three) * 1000000) || 0
                                        },
                                        {
                                            hours: '09:30',
                                            outs: results[0].outs_four,
                                            dppm: Math.round(results[1].outs_four/(results[0].outs_four + results[1].outs_four) * 1000000) || 0
                                        },
                                        {
                                            hours: '10:30',
                                            outs: results[0].outs_five,
                                            dppm: Math.round(results[1].outs_five/(results[0].outs_five + results[1].outs_five) * 1000000) || 0
                                        },
                                        {
                                            hours: '11:30',
                                            outs: results[0].outs_six,
                                            dppm: Math.round(results[1].outs_six/(results[0].outs_six + results[1].outs_six) * 1000000) || 0
                                        },
                                        {
                                            hours: '12:30',
                                            outs: results[0].outs_seven,
                                            dppm: Math.round(results[1].outs_seven/(results[0].outs_seven + results[1].outs_seven) * 1000000) || 0
                                        },
                                        {
                                            hours: '13:30',
                                            outs: results[0].outs_eight,
                                            dppm: Math.round(results[1].outs_eight/(results[0].outs_eight + results[1].outs_eight) * 1000000) || 0
                                        },
                                        {
                                            hours: '14:30',
                                            outs: results[0].outs_nine,
                                            dppm: Math.round(results[1].outs_nine/(results[0].outs_nine + results[1].outs_nine) * 1000000) || 0
                                        },
                                        {
                                            hours: '15:30',
                                            outs: results[0].outs_ten,
                                            dppm: Math.round(results[1].outs_ten/(results[0].outs_ten + results[1].outs_ten) * 1000000) || 0
                        
                                        },
                                        {
                                            hours: '16:30',
                                            outs: results[0].outs_eleven,
                                            dppm: Math.round(results[1].outs_eleven/(results[0].outs_eleven + results[1].outs_eleven) * 1000000) || 0
                                        },
                                        {
                                            hours: '17:30',
                                            outs: results[0].outs_twelve,
                                            dppm: Math.round(results[1].outs_twelve/(results[0].outs_twelve + results[1].outs_twelve) * 1000000) || 0
                                        }
                                        
                                    );
                            
                            // stringify obj to TSV
                            var processHourly_tsv = TSV.stringify(obj);
        
                            //  create .tsv per request
                            fs.writeFile('./public/' + process + '.tsv', processHourly_tsv, 'utf8', function(err){
                                if (err) throw err;
                            });
                    
                           // res.render(process);
                        });

                
                // then for PM shift
                } else {
                    //
                    console.log(dateAndtime + ' is between PM');

                    //  18:30- 00:30 query
                    //  need to go through PM shift to validate

                }

        });
        

    }); 


    //  index initializer 
    app.get('/api/view', function(req, res){

        poolLocal.getConnection(function(err, connection){
            
            connection.query({
                sql: 'SELECT A.process_id, C.process_name, A.today_date, A.stime, round(CASE WHEN A.stime = "06:00:00" || A.stime = "18:00:00" THEN (((B.oee / 100) * B.uph * B.num_tool)/2) ELSE ((B.oee / 100) * B.uph * B.num_tool) END) AS default_target, round((B.oee / 100) * B.uph * A.toolpm) AS adjusted_target, round((CASE WHEN A.stime = "06:00:00" || A.stime = "18:00:00" THEN (((B.oee / 100) * B.uph * B.num_tool)/2) ELSE ((B.oee / 100) * B.uph * B.num_tool) END) - ((B.oee / 100) * B.uph * A.toolpm)) AS total_target FROM tbl_target_input A JOIN tbl_target_default B ON A.process_id = B.process_id JOIN tbl_target_process C ON A.process_id = C.process_id WHERE today_date = curdate()',
            },  function(err, results, fields){
                if (err) throw err;
                
                    var obj = [];
                    
                        for(i = 0; i < results.length; i++){
                            obj.push({

                                process_id:     results[i].process_id,
                                process_name:   results[i].process_name,
                                today_date:     new Date(results[i].today_date),
                                stime:          results[i].stime,
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

        });

    });

    // update data
    app.post('/api/update', function(req, res){
        poolLocal.getConnection(function(err, connection){
            
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
            
        });

    });
        
    //  add tool time data
    app.post('/api/add', function(req, res){
        poolLocal.getConnection(function(err, connection){

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
                    sql: 'UPDATE tbl_target_input SET toolpm = ? , remarks = ? WHERE today_date = ? AND process_id = ? AND stime >= ? && stime <= ? ',
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
       
        });
    
    });


    //  delete tool time data using id
    app.post('/api/delete', function(req, res){
        poolLocal.getConnection(function(err, connection){

            connection.query({
                sql: 'DELETE FROM tbl_target_view WHERE id=?',
                values: [req.body.id]
            },  function(err, results, fields){
                if (err) throw err;

                console.log('ID: ' + req.body.id + ' has been deleted!');
                res.redirect('back');
            });

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
            


        });

    });
}



