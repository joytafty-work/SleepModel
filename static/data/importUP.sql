use upsdata;

# Create TABLES
# TABLE 1. Nutrient
CREATE TABLE nutrient 
 	(date DATE,  
 		calcium 	FLOAT(7, 2), 
 		calories 	FLOAT(7, 2),  
 		carb 		FLOAT(7, 2), 
 		cholesterol FLOAT(7, 2), 
 		fiber 		FLOAT(7, 2), 
 		protein 	FLOAT(7, 2), 
 		sat_fat 	FLOAT(7, 2), 
 		sodium 		FLOAT(7, 2), 
 		sugar 		FLOAT(7, 2), 
 		unsat_fat 	FLOAT(7, 2), 
 		CONSTRAINT pk_date PRIMARY KEY (date)
 	);

# TABLE 2. Activity
CREATE TABLE activity
 	(date DATE, 
 		active_time FLOAT(7, 2), 
 		calories_burned FLOAT(7, 2), 
 		distance FLOAT(7, 2), 
 		inactive_time FLOAT(7, 2), 
 		lcat FLOAT(7, 2),		
 		lcit FLOAT(7, 2),		
 		steps SMALLINT UNSIGNED, 
 		workout_count SMALLINT UNSIGNED, 
 		workout_time SMALLINT UNSIGNED,
		CONSTRAINT pk_date PRIMARY KEY (date)
	);

# TABLE 3. Sleep
CREATE TABLE sleep
	(date DATE, 
		sl_asleep_time FLOAT(7, 2),	
		sl_awake FLOAT(7, 2),		
		sl_awake_time FLOAT(7, 2),	
		sl_awakenings SMALLINT UNSIGNED, 
		sl_bedtime FLOAT(7, 2),		
		sl_deep FLOAT(7, 2), 		
		sl_duration FLOAT(7, 2), 	
		sl_light FLOAT(7, 2), 		
		sl_quality FLOAT(3, 1), 	
		sl_REM FLOAT(7, 2), 		
		CONSTRAINT pk_date PRIMARY KEY (date)
	);

# TABLE 4. Nap
CREATE TABLE nap
	(date DATE, 
		nap_asleep_time FLOAT(7, 2), # minutes
		nap_awake FLOAT(7, 2),		 # seconds
		nap_awake_time FLOAT(7, 2),	 # seconds
		nap_awakenings SMALLINT UNSIGNED, 
		nap_bedtime FLOAT(7, 2),	 # seconds
		nap_deep FLOAT(7, 2),		 # seconds
		nap_duration FLOAT(7, 2),	 # seconds
		nap_light FLOAT(7, 2),		 # seconds
		nap_quality FLOAT(7, 2),	 # seconds
		nap_REM FLOAT(7, 2),		 # seconds
		CONSTRAINT pk_date PRIMARY KEY (date)
	);

# TABLE 5. MOOD
CREATE TABLE mood
	(date DATE, 
		count SMALLINT UNSIGNED, 
		mood FLOAT(3, 1),
		CONSTRAINT pk_date PRIMARY KEY (date)
		);

# Load data
# 1. Nutrient Sheet
load data local 
	infile '~/work/sleepmodel/static/data/UP/UPnutrient.csv' 
	into TABLE nutrient fields terminated by ',' 
	enclosed by '"' 
	lines terminated by '\n';      
# 2. Activity Sheet
load data local 
	infile '~/work/sleepmodel/static/data/UP/UPactivity.csv' 
	into TABLE activity fields terminated by ',' 
	enclosed by '"' 
	lines terminated by '\n';
# 3. Sleep Sheet
load data local 
	infile '~/work/sleepmodel/static/data/UP/UPsleep.csv' 
	into TABLE sleep fields terminated by ',' 
	enclosed by '"' 
	lines terminated by '\n';
# 4. Nap Sheet
load data local 
	infile '~/work/sleepmodel/static/data/UP/UPnap.csv' 
	into TABLE nap fields terminated by ',' 
	enclosed by '"' 
	lines terminated by '\n';
# 5. Mood Sheet
load data local
	infile '~/work/sleepmodel/static/data/UP/UPmood.csv' 
	into TABLE mood fields terminated by ',' 
	enclosed by '"' 
	lines terminated by '\n'; 

-- Local Dump from database
mysqldump -u root -h localhost -p upsdata activity > activity.sql
mysqldump -u root -h localhost -p upsdata nutrient > nutrient.sql
mysqldump -u root -h localhost -p upsdata sleep > sleep.sql
mysqldump -u root -h localhost -p upsdata nap > nap.sql
mysqldump -u root -h localhost -p upsdata mood > mood.sql

