var bodyParser = require('body-parser');
var mysql = require('mysql');
var moment = require('moment');
var fs = require('fs');

var TSV = require('tsv');


module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    //  mysql connection via connection pooling ( I think it's better than creating new connections everytime )
    //  using the db credentials 
    //  change this create a dbconfig later
    var pool = mysql.createPool({
        multipleStatements: true,
        connectionLimit:    100, //try for now
        host    :           'ddolfsb30gea9k.c36ugxkfyi6r.us-west-2.rds.amazonaws.com',
        user    :           'fab4_engineers',
        password:           'Password123',
        database:           'fab4'
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

                        //  not quite sure in the query july 22, 2017
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
    app.get('/hourly/:process_id', function(req, res){

        pool.getConnection(function(err, connection){

            //  parse process url
            var process = req.params.process_id;
           
                //  will check the AM and PM environment before running the query specifically for AM and PM shift
                if (checker >= check_am_start && checker <= check_am_end) {
                    // for total outs
                        connection.query({
                            sql: 'SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = ? AND	date_time >= CONCAT("' + today + ' "," 06:30:00") AND date_time <= CONCAT("' + today + ' "," 18:29:59")',
                        values: [process]
                        },  function(err, results, fields){

                            var processOuts = [];

                                processOuts.push(
                                    results[0].totalOuts
                                );

                                
                             res.render(process, {processOuts: processOuts});
                        });

                    //
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
                            
                            
                            res.render(process);
                        });

                        
                    
                
                // then for PM shift
                } else {
                    //
                    console.log(dateAndtime + ' is between PM');

                    //  18:30- 00:30 query
                        connection.query({
                            sql: 'SELECT SUM(out_qty) AS zero FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 18:30:00")  AND date_time <= CONCAT("' + today + ' "," 19:29:59"); SELECT SUM(out_qty) AS one FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 19:30:00")  AND date_time <= CONCAT("' + today + ' "," 20:29:59");     SELECT SUM(out_qty) AS two FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 20:30:00")  AND date_time <= CONCAT("' + today + ' "," 21:29:59");     SELECT SUM(out_qty) AS three FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 21:30:00")  AND date_time <= CONCAT("' + today + ' "," 22:29:59");     SELECT SUM(out_qty) AS four FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 23:30:00")  AND date_time <= CONCAT("' + today + ' "," 00:29:59");     SELECT SUM(out_qty) AS five FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 11:30:00")  AND date_time <= CONCAT("' + today + ' "," 00:29:59");     SELECT SUM(out_qty) AS six FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 00:30:00")  AND date_time <= CONCAT("' + today + ' "," 01:29:59");     SELECT SUM(out_qty) AS seven FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 01:30:00")  AND date_time <= CONCAT("' + today + ' "," 02:29:59");     SELECT SUM(out_qty) AS eight FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 02:30:00")  AND date_time <= CONCAT("' + today + ' "," 03:29:59");     SELECT SUM(out_qty) AS nine FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 03:30:00")  AND date_time <= CONCAT("' + today + ' "," 04:29:59");     SELECT SUM(out_qty) AS ten FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 04:30:00")  AND date_time <= CONCAT("' + today + ' "," 05:29:59");     SELECT SUM(out_qty) AS eleven FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 05:30:00")  AND date_time <= CONCAT("' + today + ' "," 06:29:59")',
                            
                            values: [process, process, process, process, process, process, process, process, process,           process, process, process]  

                        }, function(err, row){
                            if (err) throw err;

                            var arr12 = row[12];
                            var arr13 = row[13];
                            var arr14 = row[14];
                            var arr15 = row[15];
                            var arr16 = row[16];
                            var arr17 = row[17];
                            var arr18 = row[18];
                            var arr19 = row[19];
                            var arr20 = row[20];
                            var arr21 = row[21];
                            var arr22 = row[22];
                            var arr23 = row[23];
                            
                            var arr12 = arr12.concat(arr13, arr14, arr15, arr16, arr17, arr18, arr19, arr20, arr21, arr22, arr23);                            
                            

                            res.end(JSON.stringify(arr12));
                            

                        });

                }

        });

    
    
                       
    
    
    });

         
}


