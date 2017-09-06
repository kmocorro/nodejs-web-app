SET time_zone ='+08:00';

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'DAMAGE' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'POLY' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
  
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'BSGDEP' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'NTM' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'NOXE' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'NOXE' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'NDEP' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'PTM' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'TOXE' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'CLEANTEX' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'PDRIVE' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")

 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'ARC_BARC' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'PBA' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'LCM' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'SEED' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'FGA' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")


 
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'PLM' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'EDG_CTR' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'PLATING' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'ETCHBK' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'HST' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT process_id, SUM(out_qty) AS totalOuts FROM MES_OUT_DETAILS WHERE process_id = 'TEST' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
