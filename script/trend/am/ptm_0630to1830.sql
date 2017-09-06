SET time_zone='+8:00';
	
SELECT A.hours as hours,
	IF(A.outs IS NULL, 0, A.outs) as outs,
    IF(ROUND(B.scraps/(A.outs + B.scraps) * 1000000) IS NULL, 0, ROUND(B.scraps/(A.outs + B.scraps) * 1000000)) AS dppm 

FROM

(SELECT 
			CONCAT(CURDATE(), ' 06:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A 
		WHERE
			A.process_id = "PTM"

			AND A.date_time >= CONCAT(CURDATE(), ' 06:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 07:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 07:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A 
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 07:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 08:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 08:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 08:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 09:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 09:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 09:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 10:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 10:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 10:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 11:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 11:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 11:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 12:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 12:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 12:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 13:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 13:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 13:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 14:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 14:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 14:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 15:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 15:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 15:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 16:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 16:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 16:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 17:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 17:30') as hours, SUM(A.out_qty) AS outs
		FROM
			MES_OUT_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 17:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 18:29:59')) A
                
JOIN

    (SELECT 
			CONCAT(CURDATE(), ' 06:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A 
		WHERE
			A.process_id = "PTM"

			AND A.date_time >= CONCAT(CURDATE(), ' 06:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 07:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 07:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A 
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 07:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 08:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 08:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 08:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 09:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 09:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 09:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 10:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 10:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 10:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 11:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 11:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 11:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 12:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 12:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 12:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 13:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 13:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 13:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 14:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 14:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 14:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 15:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 15:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 15:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 16:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 16:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 16:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 17:29:59')
			UNION ALL
	SELECT 
		   CONCAT(CURDATE(), ' 17:30') as hours, SUM(A.scrap_qty) AS scraps
		FROM
			MES_SCRAP_DETAILS A
		WHERE
			A.process_id = "PTM"
				AND A.date_time >= CONCAT(CURDATE(), ' 17:30:00')
				&& A.date_time <= CONCAT(CURDATE(), ' 18:29:59')) B
                
    
ON A.hours = B.hours