# TABLE for rawBBdata
CREATE TABLE BBraw
	(datetime TIMESTAMP,
		date DATE,
		time TIMESTAMP,
		skin_temp FLOAT(3, 1),
		air_temp FLOAT(3, 1),
		heartrate SMALLINT UNSIGNED, 
		steps SMALLINT UNSIGNED, 
		gsr FLOAT(9, 7), 
		calories FLOAT(6, 2), 		
		CONSTRAINT pk_datetime PRIMARY KEY (datetime)
	);

load data local 
	infile '~/work/sleepmodel/static/data/BBdata_nooffset/BBdata2013-11-01.csv' 
	into TABLE BBraw fields terminated by ',' 
	enclosed by '"' 
	lines terminated by '\n';