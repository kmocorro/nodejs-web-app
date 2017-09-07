let bodyParser = require('body-parser');
let mysql = require('mysql');
let moment = require('moment');
let fs = require('fs');
let json2csv = require('json2csv');
let csv = require('csv-array');

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
    let pool = mysql.createPool({
        multipleStatements: true,
        connectionLimit:    100, //try for now :))
        host    :           'ddolfsb30gea9k.c36ugxkfyi6r.us-west-2.rds.amazonaws.com',
        user    :           'fab4_engineers',
        password:           'Password123',
        database:           'fab4'
    });    


    let poolLocal = mysql.createPool({
        multipleStatements: true,
        connectionLimit:    100, //try for now :))
        host    :           'localhost',
        user    :           'root',
        password:           '2qhls34r',
        database:           'dbtarget'
        }); 
        
    //  today today today
    let today = new Date();
    let todayPlus = moment();
    let todayMinus = moment();
    let dateAndtime = new Date();
    let hh = today.getHours();
    let min = today.getMinutes();
    let sec = today.getSeconds();

    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!
    let yyyy = today.getFullYear();

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
        
        //  let use for checking AM and PM
        //  using momentjs 
        let checker = moment(dateAndtime, "YYYY-MM-DD h:mm:ss");
        let check_am_start = moment(today + " " + "06:30:00", "YYYY-MM-DD h:mm:ss");
        let check_am_end = moment(today + " " + "18:29:59", "YYYY-MM-DD h:mm:ss");    
        
        let check_pm_start = moment(today + " " + "18:30:00", "YYYY-MM-DD h:mm:ss");
        let check_notyet_midnight = moment(today + " " + "23:59:59", "YYYY-MM-DD h:mm:ss");   
        let check_exact_midnight = moment(today + " " + "00:00:00", "YYYY-MM-DD h:mm:ss");    
        let check_pm_end = moment(today + " " + "06:29:59", "YYYY-MM-DD h:mm:ss" );

    // http request hourly outs per process
    app.get('/hourly/:process_url', function(req, res){
        
        //  parse process url
        let process = req.params.process_url;   
        
            // promise 1
            let hourlyTargetPromise = new Promise (function(resolve, reject){

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

                                    let processTarget = [];
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
                            sql: 'SELECT process_id, process_name, SUM(total_target) AS t_target FROM view_target WHERE     stime >= "18:30:00" AND     stime <= CURTIME() - INTERVAL 10 MINUTE AND  process_name = ?',
                            values: [process]
                                },  function(err, results, fields){
                                    if (err) return reject(err);

                                    let processTarget = [];
                                        processTarget.push(
                                            results[0].t_target
                                        );                 

                                    resolve({processTarget: processTarget});
                                    
                            });

                         } else if (checker >= check_exact_midnight && checker <= check_pm_end) {
                            
                            connection.query({
                            sql: 'SELECT A.process_id, B.process_name, (A.t_target + B.t_target) as t_target FROM ( (SELECT process_id, process_name, SUM(total_target) AS t_target  FROM view_target  WHERE    stime >= "18:30:00"  AND   today_date = CURDATE() - INTERVAL 1 DAY  AND   process_name = ?) A  JOIN (SELECT process_id, process_name, SUM(total_target) AS t_target   FROM view_target   WHERE     stime >= "00:00:00"   AND  stime <= CURTIME() - INTERVAL 10 MINUTE   AND   process_name = ?) B  ON A.process_id = B.process_id )',
                            values: [process]
                                },  function(err, results, fields){
                                    if (err) return reject(err);

                                    let processTarget = [];
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
            let hourlyOutsPromise = new Promise (function(resolve, reject){
                
                //if (err) return reject(err);
                csv.parseCSV('./public/outs/process_outs.csv', function(data){
                    
                    let processOuts = [];

                    for(let i=0; i<data.length; i++){
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

           let process = req.params.process_url;    //  path
           let data = values;         //    to variable

                    //  subtract to get the variance
                    var variance = data[0]['processTarget'][0] - data[1]['processOuts'][0];
                    
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
                           // let variance = (data[0]['processTarget'][0] - data[1]['processOuts'][0]).toLocaleString(undefined, {maximumFractionDigits: 0});
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
 
    }); 


    //  index initializer 
    app.get('/api/view', function(req, res){

        poolLocal.getConnection(function(err, connection){
            if (err) throw err;

            connection.query({
                sql: 'SELECT * FROM view_api WHERE today_date >= CURDATE() - INTERVAL 1 DAY && CURDATE() AND adjusted_target != "0"',
            },  function(err, results, fields){
                if (err) throw err;
                
                    let obj = [];
                    
                        for( let i = 0; i < results.length; i++){
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
                let computedTarget = Math.round((req.body.uph * (req.body.num_tool - req.body.toolpm)) * (req.body.oee/100)) || 0;


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


    // delete tool time
    app.post('/api/delete', function(req, res){
        poolLocal.getConnection(function(err, connection){
            if (err) throw err;

                connection.query({
                    sql: 'UPDATE tbl_target_input SET toolpm = 0',
                    //  values: [req.body.process_id]
                },  function(err, results, field){
                        res.redirect('back');
                });
            

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

                    let obj = [];

                    for(let i=0; i < results.length; i++){

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    app.get('/mobile/', function(req, res){

        poolLocal.getConnection(function(err, connection){
            if (err) throw err;

            connection.query({
                sql: 'SELECT process_id, process_name, SUM(CASE WHEN today_date = CURDATE() AND stime >= "06:30:00" && stime < CURTIME() - INTERVAL 10 MINUTE THEN total_target ELSE 0 END) AS t_target FROM  view_target WHERE process_name = "DAMAGE" UNION ALL SELECT process_id, process_name, SUM(CASE WHEN today_date = CURDATE() AND stime >= "06:30:00" && stime < CURTIME() - INTERVAL 10 MINUTE THEN total_target ELSE 0 END) AS t_target FROM  view_target WHERE process_name = "POLY" ',
            }, function(err, results, fields){
                if (err) throw err;

                    let obj = [];
                    

                    for(let i = 0; i< results.length; i++){
                            
                                obj.push({
                                    process_id: results[i].process_id,
                                    process_name: results[i].process_name ,
                                    t_target:  results[i].t_target ,
                                });
                            
                    };

                    let GG = {process: obj};
                
                res.send(GG);

            });
            
        });

    });

    app.get('/gg/:process_url', function(req, res){

        let process = req.params.process_url;
                
            csv.parseCSV('./public/outs/process_outs.csv', function(data){
                
                let processOuts = [];

                for(let i=0; i<data.length; i++){
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



