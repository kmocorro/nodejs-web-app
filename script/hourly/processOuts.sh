# !/bin/bash
# Query DAMAGE real-time outs 
# KEVIN B MOCORRO
# Version 1.0

# this should run every 5 mins
cd /c/sandbox/nodejs-web-app/script/hourly
PATH=$PATH:/c/xampp/mysql/bin
CURRENT_TIME=`date "+%H:%M:%S"`
START_AM_SHIFT=`date "+06:30:00"`
END_AM_SHIFT=`date "+18:29:59"`
START_PM_SHIFT=`date "+18:30:00"`
END_PM_SHIFT=`date "+06:29:59"`
NOTYETMIDNIGHT=`date "+11:59:59"`
MIDNIGHT=`date "+00:00:00"`

HOST="ddolfsb30gea9k.c36ugxkfyi6r.us-west-2.rds.amazonaws.com"
USER="fab4_engineers"
PASS="Password123"
DB="fab4"

# Convert declared time to seconds so we could compare
G_START_AM_SHIFT=`echo $START_AM_SHIFT | awk -F: '{ print ($1 * 3600) + ($2 * 60) + $3 }'`
G_END_AM_SHIFT=`echo $END_AM_SHIFT | awk -F: '{ print ($1 * 3600) + ($2 * 60) + $3 }'`
G_START_PM_SHIFT=`echo $START_PM_SHIFT | awk -F: '{ print ($1 * 3600) + ($2 * 60) + $3 }'`
G_END_PM_SHIFT=`echo $END_PM_SHIFT | awk -F: '{ print ($1 * 3600) + ($2 * 60) + $3 }'`
G_MIDNIGHT=`echo $MIDNIGHT | awk -F: '{ print ($1 * 3600) + ($2 * 60) + $3 }'`
G_NOTYETMIDNIGHT=`echo $NOTYETMIDNIGHT | awk -F: '{ print ($1 * 3600) + ($2 * 60) + $3 }'`
G_CURRENT_TIME=`echo $CURRENT_TIME | awk -F: '{ print ($1 * 3600) + ($2 + 60) + $3 }'`


echo "now running... total process outs"

# Now we compare current time to check the shift then load specific time query
    if [ "$G_CURRENT_TIME" -ge "$G_START_AM_SHIFT" ] && [ "$G_CURRENT_TIME" -le "$G_END_AM_SHIFT" ]; then
        
        echo "AM shift"

        echo $G_START_AM_SHIFT
        echo $G_CURRENT_TIME
        echo $G_END_AM_SHIFT

        echo "loading... please wait"
        mysql -h$HOST -u$USER -p$PASS $DB < 630to1830.sql | sed 's/\t/,/g' > outs_amTopm_temp.csv
        cp outs_amTopm_temp.csv '/c/sandbox/nodejs-web-app/public/outs/process_outs.csv'

    else

        if [ "$G_CURRENT_TIME" -ge "$G_START_PM_SHIFT" ] && [ "$G_NOTYETMIDNIGHT" -le "$G_CURRENT_TIME" ]; 
        then
            
            echo $G_START_PM_SHIFT
            echo $G_CURRENT_TIME
            echo $G_NOTYETMIDNIGHT

            echo "PM shift between PM and Not yet midnight"
            echo "loading... please wait"
            mysql -h$HOST -u$USER -p$PASS $DB < 1830to0000.sql | sed 's/\t/,/g' > outs_pmTomid_temp.csv
            cp outs_pmTomid_temp.csv '/c/sandbox/nodejs-web-app/public/outs/process_outs.csv'
            

        elif [ "$G_CURRENT_TIME" -ge "$G_MIDNIGHT" ] && [ "$G_CURRENT_TIME" -le "$G_END_PM_SHIFT" ]; 
        then

            echo $G_MIDNIGHT
            echo $G_CURRENT_TIME
            echo $G_END_PM_SHIFT

            echo "PM shift between MIDNIGHT and PM END shift"
            echo "loading... please wait"
            mysql -h$HOST -u$USER -p$PASS $DB < 0000to0630.sql | sed 's/\t/,/g' > outs_midToam_temp.csv
            cp outs_midToam_temp.csv '/c/sandbox/nodejs-web-app/public/outs/process_outs.csv'
        
        fi

    fi



echo "DONE!"
sleep 11