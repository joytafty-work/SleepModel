# table_def
import os
from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Column, Date, Time, Float, Integer, SMALLINT, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref

cdb_usr = os.getenv("CLEARDB_USR")
cdb_pwd = os.getenv("CLEARDB_PWD")
cdb_host = os.getenv("CLEARDB_HOST")
cdb_port = os.getenv("CLEARDB_PORT")
cdb_url = "mysql://" + cdb_usr + ":" + cdb_pwd + "@" + cdb_host + ".cleardb.com/heroku_" + cdb_port

engine = create_engine(cdb_url, pool_recycle=3600, echo=True)
Base = declarative_base()

class Record(Base):
	__tablename__ = 'records'

	id = Column(Integer, primary_key=True)
	recdate = Column(Date)
	rectime = Column(Time)
	skin_temp = Column(Float(3, 1))
	air_temp = Column(Float(3, 1))
	heartrate = Column(SMALLINT)
	steps = Column(SMALLINT)
	gsr = Column(Float(9, 7))
	calories = Column(Float(6, 2))

	dateid = Column(Integer, ForeignKey("bbdates.id"))
	bbdate = relationship("BBdate", backref=backref("records", order_by=id))

	# def __init__(self, recdate):
	# 	self.recdate = recdate

	def __init__(self, recdate, rectime, skin_temp, air_temp, heartrate, steps, gsr, calories):
		self.recdate = recdate
		self.rectime = rectime
		self.skin_temp = skin_temp
		self.air_temp = air_temp
		self.heartrate = heartrate
		self.steps = steps
		self.gsr = gsr
		self.calories = calories

class Subject(Base):
	__tablename__ = 'subjects'

	id = Column(Integer, primary_key=True)
	name = Column(String(20))

	def __init__(self, name):
		self.name = name

### Define table mapped classes
class BBdate(Base):
	__tablename__ = 'bbdates'

	id = Column(Integer, primary_key=True)
	recdate = Column(Date)
	# rectime = Column(Time)
	# skin_temp = Column(Float(3, 1))
	# air_temp = Column(Float(3, 1))
	# heartrate = Column(SMALLINT)
	# steps = Column(SMALLINT)
	# gsr = Column(Float(9, 7))
	# calories = Column(Float(6, 2))

	def __init__(self, recdate):
		self.recdate = recdate
		# self.rectime = rectime
		# self.skin_temp = skin_temp
		# self.air_temp = air_temp
		# self.heartrate = heartrate
		# self.steps = steps
		# self.gsr = gsr
		# self.calories = calories

### Create tables
Base.metadata.create_all(engine)
