import os
import MySQLdb
from sqlalchemy import create_engine

# Connect to database
usr = os.getenv("MYSQL_USR")
pwd = os.getenv("MYSQL_PWD")
dbname = os.getenv("MYSQL_BBDB")
connectstr = "mysql+mysqldb://"+usr+":"+pwd+"@localhost/"+dbname
engine = create_engine(connectstr, pool_recycle=3600)
conn = engine.connect()

path2sql = 'static/data/importUP.sql'

a = open(path2sql, 'r')
while a != []:
	b = a.readline()
	l0 = ''
	if b[0] is '#':
		continue
	else:
		while b[-2] is not ';':		
			l0 = l0 + b[-1]
		print l0
	# Append line 

# Run SQL script


