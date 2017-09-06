SET time_zone='+8:00';
	
SELECT A.hours as hours,
	IF(A.outs IS NULL, 0, A.outs) as outs,
    IF(ROUND(B.scraps/(A.outs + B.scraps) * 1000000) IS NULL, 0, ROUND(B.scraps/(A.outs + B.scraps) * 1000000)) AS dppm 

FROM

(SELECT 
			CONCAT(CURDATE(), ' 18:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A 
		WHERE
			A.process_id = "EDG_CTR"

			AND A.date_time >= CONCAT(CURDATE(), ' 18:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 19:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 19:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A 
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 19:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 20:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 20:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 20:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 21:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 21:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 21:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 22:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 22:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 22:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 23:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 23:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 23:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 00:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 00:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 00:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 01:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 01:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 01:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 02:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 02:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 02:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 03:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 03:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 03:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 04:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 04:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 04:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 05:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 05:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 05:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 06:29:59')) A
                
JOIN

    (SELECT 
			CONCAT(CURDATE(), ' 18:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A 
		WHERE
			A.process_id = "EDG_CTR"

			AND A.date_time >= CONCAT(CURDATE(), ' 18:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 19:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 19:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A 
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 19:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 20:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 20:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 20:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 21:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 21:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 21:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 22:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 22:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 22:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 23:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 23:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 23:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 00:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 00:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 00:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 01:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 01:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 01:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 02:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 02:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 02:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 03:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 03:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 03:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 04:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 04:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 04:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 05:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 05:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "EDG_CTR"
				AND A.date_time >= CONCAT(CURDATE(), ' 05:30:00')
				&& A.date_time <= CONCAT(CURDATE() + INTERVAL 1 DAY, ' 06:29:59')) B
                
    
ON A.hours = B.hours