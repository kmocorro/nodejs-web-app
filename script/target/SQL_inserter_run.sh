#!/bin/bash
# SQL Target Insert 
# KEVIN B MOCORRO
# Version 1.0

cd /c/sandbox/nodejs-web-app/script
PATH=$PATH:/c/xampp/mysql/bin

 # Will insert target every morning
 mysql -h localhost -u root -p2qhls34r dbtarget < inserter.sql

 echo "Done!"
 sleep 5
