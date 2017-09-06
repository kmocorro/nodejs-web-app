# !/bin/bash
# Query Trend real-time outs 
# KEVIN B MOCORRO
# Version 1.0

# this should run every 5 mins
cd /c/sandbox/nodejs-web-app/script/trend
PATH=$PATH:/c/xampp/mysql/bin

CURRENT_TIME=`date "+%H:%M:%S"`
START_AM_SHIFT="06:30:00"
END_AM_SHIFT="18:29:59"
START_PM_SHIFT="18:30:00"
END_PM_SHIFT="06:29:59"
NOTYETMIDNIGHT="11:59:59"
MIDNIGHT="00:00:00"

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
G_CURRENT_TIME=`echo $CURRENT_TIME | awk -F: '{ print ($1 * 3600) + ($2 * 60) + $3 }'`

# Process Array 
declare -a arr=("damage" "poly" "bsgdep" "ntm" "noxe" "ndep" "ptm" "toxe" "cleantex" "pdrive" "arc_barc" "pba" "lcm" "seed" "fga" "plm" "edg_ctr" "plating" "etchbk" "hst" "test")

echo "now running... trend outs"

# Now we compare current time to check the shift then load specific time query
    if [ "$G_CURRENT_TIME" -ge "$G_START_AM_SHIFT" ] && [ "$G_CURRENT_TIME" -le "$G_END_AM_SHIFT" ]; then
        
        echo "AM shift"

        echo $G_START_AM_SHIFT
        echo $G_CURRENT_TIME
        echo $G_END_AM_SHIFT

        echo "loading... please wait"

        for i in "${arr[@]}" 
        do

            mysql -h$HOST -u$USER -p$PASS $DB < '/c/sandbox/nodejs-web-app/script/trend/am/'$i'_0630to1830.sql' | sed 's/\t/,/g' > '/c/sandbox/nodejs-web-app/script/trend/temp/'$i'_temp.csv'
            
            cp '/c/sandbox/nodejs-web-app/script/trend/temp/'$i'_temp.csv' '/c/sandbox/nodejs-web-app/public/outs/'$i'_process_outs.csv'
            
            echo $i 'trend has been saved'

        done 
        sleep 10

    else
        # PM TO MIDNIGHT
        if [ "$G_CURRENT_TIME" -ge "$G_START_PM_SHIFT" ] && [ "$G_NOTYETMIDNIGHT" -le "$G_CURRENT_TIME" ]; 
        then
            
            echo $G_START_PM_SHIFT
            echo $G_CURRENT_TIME
            echo $G_NOTYETMIDNIGHT

            echo "PM shift between PM and Not yet midnight"
            echo "loading... please wait"

            for i in "${arr[@]}"
            do

                mysql -h$HOST -u$USER -p$PASS $DB < '/c/sandbox/nodejs-web-app/script/trend/mid/'$i'_1830to0000.sql' | sed 's/\t/,/g' > '/c/sandbox/nodejs-web-app/script/trend/temp/'$i'_temp.csv'

                cp '/c/sandbox/nodejs-web-app/script/trend/temp/'$i'_temp.csv' '/c/sandbox/nodejs-web-app/public/outs/'$i'_process_outs.csv'
            
            done
            sleep 10

        elif [ "$G_CURRENT_TIME" -ge "$G_MIDNIGHT" ] && [ "$G_CURRENT_TIME" -le "$G_END_PM_SHIFT" ]; 
        then

            echo $G_MIDNIGHT
            echo $G_CURRENT_TIME
            echo $G_END_PM_SHIFT

            for i in "${arr[@]}"
            do

                mysql -h$HOST -u$USER -p$PASS $DB < '/c/sandbox/nodejs-web-app/script/trend/pm/'$i'_0000to0630.sql' | sed 's/\t/,/g' > '/c/sandbox/nodejs-web-app/script/trend/temp/'$i'_temp.csv'

                cp '/c/sandbox/nodejs-web-app/script/trend/temp/'$i'_temp.csv' '/c/sandbox/nodejs-web-app/public/outs/'$i'_process_outs.csv'
            
            done
            sleep 10

        fi

    fi



echo "DONE!"
sleep 11