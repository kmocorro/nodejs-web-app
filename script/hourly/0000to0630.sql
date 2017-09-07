SET time_zone ='+08:00';

SELECT IF(process_id IS NULL, 'DAMAGE', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'DAMAGE' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
UNION ALL 

SELECT IF(process_id IS NULL, 'POLY', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'POLY' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
  
UNION ALL 

SELECT IF(process_id IS NULL, 'BSGDEP', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'BSGDEP' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 UNION ALL 

SELECT IF(process_id IS NULL, 'NTM', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'NTM' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT IF(process_id IS NULL, 'NOXE', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'NOXE' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT IF(process_id IS NULL, 'NDEP', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'NDEP' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT IF(process_id IS NULL, 'PTM', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'PTM' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT IF(process_id IS NULL, 'TOXE', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'TOXE' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT IF(process_id IS NULL, 'CLEANTEX', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'CLEANTEX' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT IF(process_id IS NULL, 'PDRIVE', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'PDRIVE' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")

 
UNION ALL 

SELECT IF(process_id IS NULL, 'ARC_BARC', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'ARC_BARC' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT IF(process_id IS NULL, 'PBA', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'PBA' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT IF(process_id IS NULL, 'LCM', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'LCM' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT IF(process_id IS NULL, 'SEED', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'SEED' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
 
UNION ALL 

SELECT IF(process_id IS NULL, 'FGA', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'FGA' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")


 
UNION ALL 

SELECT IF(process_id IS NULL, 'PLM', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'PLM' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT IF(process_id IS NULL, 'EDG_CTR', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'EDG_CTR' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT IF(process_id IS NULL, 'PLATING', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'PLATING' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT IF(process_id IS NULL, 'ETCHBK', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'ETCHBK' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT IF(process_id IS NULL, 'HST', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'HST' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
 
  
UNION ALL 

SELECT IF(process_id IS NULL, 'TEST', process_id) AS process_id, IF(SUM(out_qty) IS NULL, 0, SUM(out_qty)) FROM MES_OUT_DETAILS WHERE process_id = 'TEST' 
 AND date_time >= CONCAT(CURDATE() - INTERVAL 1 DAY," 18:30:00") AND date_time <= CONCAT(CURDATE()," 06:29:59")
