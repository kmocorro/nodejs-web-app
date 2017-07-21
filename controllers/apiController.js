var bodyParser = require('body-parser');
var mysql = require('mysql');


module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/:process_id', function(req, res){
        //  mysql connection via connection pooling ( I think it's better than creating new connections everytime )
        //  using the db credentials 

        var process = req.params.process_id;
        
        var pool = mysql.createPool({
            connectionLimit:    100, //try
            host    :           'ddolfsb30gea9k.c36ugxkfyi6r.us-west-2.rds.amazonaws.com',
            user    :           'fab4_engineers',
            password:           'Password123',
            database:           'fab4'
        });

        pool.getConnection(function(err, connection){

            //  callback = connection
            connection.query({
                sql: 'SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = ? AND	date_time >= CONCAT(CURDATE()," 06:30:00") AND date_time <= CONCAT(CURDATE()," 18:29:59")',
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

                connection.release();
                res.end(JSON.stringify(obj));
            });

            

        //  emit a connection event when a new connection is made within the pool. 
        //  set session variables on the connection before it gets used
        pool.on('connection',function(connection){
            connection.query('SET SESSION auto_increment_increment=1')
            });


        pool.end(function (err) {
            // all connections in the pool have ended 
            });

        });
    });

}


