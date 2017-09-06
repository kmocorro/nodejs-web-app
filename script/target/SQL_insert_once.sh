#!/bin/bash
# SQL Target Insert 
# KEVIN B MOCORRO
# Version 1.0

cd /c/sandbox/nodejs-web-app/script
PATH=$PATH:/c/xampp/mysql/bin
TABLE_NAME=tbl_target_input
DATE=`date +%Y-%m-%d`
CURDATE_TIME=`date "+%Y-%m-%d %H:%M:%S"`
STIME=0
NTIME=0
g=0
MIDNIGHT="00:00:00" 
NEXT_MORNING="06:29:59"
HEADER_SQL="INSERT INTO $TABLE_NAME (process_id, today_date, stime, ntime, toolpm, remarks)"

echo $CURDATE_TIME
# Will insert target every morning
# mysql -h localhost -u root -p2qhls34r dbtarget < target_insert_query.sql

echo "$HEADER_SQL VALUES "  > inserter.sql

G_midnight=`echo $MIDNIGHT | awk -F: '{ print ($1 * 3600) + ($2 * 60) + $3 }'`
G_nxt_morning=`echo $NEXT_MORNING | awk -F: '{ print ($1 * 3600) + ($2 * 60) + $3 }'`

for (( pid=101; pid<=121; pid++ )) # pid is the process_id
do

    for (( i=0; i<144; i++ )) #  i is less than 143 which equals to 24 hours / 10 minute slots + 10 mins to return from the starting point, +600 value is 600 seconds which is 10 minutes to each new slot it receives
    do 

        #if i = 143, then Comma=; else Comma=,
        if [ $pid -eq 121 ] && [ $i -eq 143 ]; then
            Comma=';'
        else
            Comma=','
        fi


        ((g++))
        if [ "$g" == "1" ]; then
            
            STIME=0;
        
        else

            STIME=$((STIME + 600))

        fi
        NTIME=$((STIME + 600))

        from=` date -d "1970-01-01 06:30:00 $STIME seconds " +"%H:%M:%S"`
        to=` date -d "1970-01-01 06:30:00 $NTIME seconds" +"%H:%M:%S"`

        G_from=`echo $from | awk -F: '{ print ($1 * 3600) + ($2 * 60) + $3 }'`

        echo $G_from
        # FROM BETWEEN MIDNIGHT AND NEXT MORNING
        if [ "$G_from" -ge "$G_midnight" ] && [ "$G_from" -le "$G_nxt_morning" ]; then

            echo "('$pid', CURDATE() + INTERVAL 1 DAY, '$from', '$to', '0', '--')$Comma" >> inserter.sql

        else

            echo "('$pid', CURDATE(), '$from', '$to', '0', '--')$Comma" >> inserter.sql

        fi

    done

done

mysql -h localhost -u root -p2qhls34r dbtarget < inserter.sql

echo "DONE"
sleep 10