# !/bin/bash
# SQL All process query
# KEVIN B. MOCORRO
# Version 1.0

cd /c/sandbox/nodejs-web-app/script
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
G_CURRENT_TIME=`echo $CURRENT_TIME | awk -F: '{ print ($1 * 3600) + ($2 + 60) + $3 }'`

echo $G_CURRENT_TIME
echo $G_START_AM_SHIFT
echo $G_END_AM_SHIFT

echo "now running... allouts"
# Now we compare current time
    if [ "$G_CURRENT_TIME" -ge "$G_START_AM_SHIFT" ] && [ "$G_CURRENT_TIME" -le "$G_END_AM_SHIFT" ]; then
        echo "AM shift"
        # run the query and save the data inside a tsv file
        # -B means Batch, which will use tab to separate values
        mysql -B -h$HOST -u$USER -p$PASS $DB < am_allouts.sql > am_temp.tsv
        
        cp am_temp.tsv '/c/sandbox/nodejs-web-app/public/am_total_outs.tsv'

    else

        if [ "$G_CURRENT_TIME" -ge "$G_START_PM_SHIFT" ] && [ "$G_CURRENT_TIME" -le "$G_NOTYETMIDNIGHT" ]; then

            echo "PM shift between pm start and notyetmidnight"
            #PM
            mysql -B -h$HOST -u$USER -p$PASS $DB < pm_allouts.sql > pm_temp.tsv

            cp pm_temp.tsv '/c/sandbox/nodejs-web-app/public/pm_total_outs.tsv'

        elif [ "$G_CURRENT_TIME" -ge "$G_MIDNIGHT" ] && [ "$G_CURRENT_TIME" -le "$G_END_PM_SHIFT" ]; 
        then

            echo "PM shift between MIDNIGHT and PM END shift"
        
        fi

    fi



echo "DONE!"
sleep 5