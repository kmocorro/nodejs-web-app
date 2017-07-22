var bodyParser = require('body-parser');
var mysql = require('mysql');
var moment = require('moment');
var fs = require('fs');

module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    //  mysql connection via connection pooling ( I think it's better than creating new connections everytime )
    //  using the db credentials 
    //  change this create a dbconfig later
    var pool = mysql.createPool({
        connectionLimit:    100, //try for now
        multipleStatements: true,
        host    :           '',
        user    :           '',
        password:           '',
        database:           ''
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
                                            processName: results[i].process_id 
                                        },
                                        {
                                            sumOuts: results[i].totalOuts
                                        }
                                    );
                                }

                        //connection.release();
                        var processOuts_json = JSON.stringify(obj);
                        res.end(JSON.stringify(obj));

                        fs.writeFile('./JSONfile/' + process + '_outs.json', processOuts_json, 'utf8', function(err){
                            if (err) throw err;
                        }); 
                    });
                
                // if it's not between AM range then
                } else {

                    console.log(dateAndtime + ' is between PM');

                    //  callback = connection if it's PM
                    connection.query({

                        //  not quite sure in the query july 22, 2017
                        sql: 'SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = ? AND	date_time >= CONCAT("' + today + ' "," 18:30:00") AND date_time <= CONCAT("' + today + ' " + INTERVAL 1 DAY," 06:29:59")',
                        values: [process]
                    },  function (err, results, fields){
                        if (err) throw err;

                            var obj = [];

                                for (var i = 0; i < results.length; i++) {
                                    obj.push(
                                        {
                                            processName: results[i].process_id 
                                        },
                                        {
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
                    //
                    console.log(dateAndtime + ' is between AM');

                    //  6:30- 7:30 query
                        connection.query({
                            sql: 'SELECT SUM(out_qty) AS zero FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 06:30:00")  AND date_time <= CONCAT("' + today + ' "," 07:29:59"); SELECT SUM(out_qty) AS one FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 07:30:00")  AND date_time <= CONCAT("' + today + ' "," 08:29:59");     SELECT SUM(out_qty) AS two FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 08:30:00")  AND date_time <= CONCAT("' + today + ' "," 09:29:59");     SELECT SUM(out_qty) AS three FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 09:30:00")  AND date_time <= CONCAT("' + today + ' "," 10:29:59");     SELECT SUM(out_qty) AS four FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 10:30:00")  AND date_time <= CONCAT("' + today + ' "," 11:29:59");     SELECT SUM(out_qty) AS five FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 11:30:00")  AND date_time <= CONCAT("' + today + ' "," 12:29:59");     SELECT SUM(out_qty) AS six FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 12:30:00")  AND date_time <= CONCAT("' + today + ' "," 13:29:59");     SELECT SUM(out_qty) AS seven FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 13:30:00")  AND date_time <= CONCAT("' + today + ' "," 14:29:59");     SELECT SUM(out_qty) AS eight FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 14:30:00")  AND date_time <= CONCAT("' + today + ' "," 15:29:59");     SELECT SUM(out_qty) AS nine FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 15:30:00")  AND date_time <= CONCAT("' + today + ' "," 16:29:59");     SELECT SUM(out_qty) AS ten FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 16:30:00")  AND date_time <= CONCAT("' + today + ' "," 17:29:59");     SELECT SUM(out_qty) AS eleven FROM MES_OUT_DETAILS WHERE process_id = ? AND date_time >= CONCAT("' + today + ' "," 17:30:00")  AND date_time <= CONCAT("' + today + ' "," 18:29:59")',
                            
                            values: [process, process, process, process, process, process, process, process, process,           process, process, process]  

                        }, function(err, row){
                            if (err) throw err;

                            var arr0 = row[0];
                            var arr1 = row[1];
                            var arr2 = row[2];
                            var arr3 = row[3];
                            var arr4 = row[4];
                            var arr5 = row[5];
                            var arr6 = row[6];
                            var arr7 = row[7];
                            var arr8 = row[8];
                            var arr9 = row[9];
                            var arr10 = row[10];
                            var arr11 = row[11];
                            
                            var arr0 = arr0.concat(arr1, arr2, arr3, arr4, arr5, arr6, arr7, arr8, arr9, arr10, arr11);                 
                            var processHourly_json = JSON.stringify(arr0);        
                            res.end(JSON.stringify(arr0));

                            fs.writeFile('./JSONfile/' + process + '_hourly.json', processHourly_json, 'utf8', function(err){
                            if (err) throw err;
                            }); 

                        });
                // then for PM shift
                } else {
                    //
                    console.log(dateAndtime + ' is between AM');

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


