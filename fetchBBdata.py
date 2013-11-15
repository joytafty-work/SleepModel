# import dependencies
import os, datetime, requests, csv
import argparse

# TASK: Write data to CSV first, then write CSV to SQL
######## Connect to local database ########
# def connectMySQL(usr, pwd, dbname):
#      # connect to clearDB database
#     import os, sys, urlparse
#     cdb_usr = os.getenv("CLEARDB_USR")
#     cdb_pwd = os.getenv("CLEARDB_PWD")
#     cdb_host = os.getenv("CLEARDB_HOST")
#     cdb_port = os.getenv("CLEARDB_PORT")
#     # Define connection url
#     cdb_url = "mysql://" + cdb_usr + ":" + cdb_pwd + "@" + cdb_host + ".cleardb.com/heroku_" + cdb_port
#     # Create core interface to ClearDB database
#     engine = create_engine(cdb_url, pool_recycle=3600, echo=False)

#     from sqlalchemy.ext.declarative import declarative_base
#     from sqlalchemy.schema import CreateTable
#     from sqlalchemy.orm import sessionmaker
#     from sqlalchemy import Column, Integer, String, Float, SMALLINT
#     from sqlalchemy import TIMESTAMP as T
#     from sqlalchemy import Date as D
#     Base = declarative_base()

#     # Define table mapped class
#     class BBmeasure(Base):
#         __tablename__ = 'BBraw'

#         # Properties
#         id = Column(Integer, primary_key=True)
#         recdate = Column(D)
#         rectime = Column(T)
#         skin_temp = Column(Float(3, 1))
#         air_temp = Column(Float(3, 1))
#         heartrate = Column(SMALLINT)
#         steps = Column(SMALLINT)
#         gsr = Column(Float(9, 7))
#         calories = Column(Float(6, 2))

#         # Update Return Statement so it includes all the parameters
#         def __repr__(self):
#             return "<BBmeasure(heartrate='%i', steps='%i', calories='%d')>" % (self.heartrate, self.steps, self.calories)

#     #Create tables
#     Base.metadata.create_all(engine)
#     # Create Session to talking to databases

#     # Connect engine to ClearDB
#     conn = engine.connect()

fpathdefault = 'static/data/BBdata_nooffset/'
if not os.path.exists(fpathdefault):
    input("Will create datafiles in %r.\n"
        "To reset the cache + database, delete this directory.\n"
        "Press enter to continue.\n" % fpathdefault)
    os.makedirs(fpathdefault)

def fetchBB(user_id, startdate, enddate, *BBargs, **BBkeys):
    # First date to import
    startdate = datetime.datetime.strptime(startdate, '%Y-%m-%d').date()
    enddate = datetime.datetime.strptime(enddate, '%Y-%m-%d').date()
    if 'fname' and 'fpath' in BBkeys:
        fname = BBkeys['fname']
        fpath = BBkeys['fpath']
    else:
        fname = 'BBdata' + startdate.strftime('%Y-%m-%d') + '.csv'
        fpath = fpathdefault

    if user_id != '':
        for dat in get_data(user_id, startdate, enddate):
            append_csv(dat, fname, fpath)
            return dat

######## Fetch data from basis website ########
def get_data(user_id, startdate, enddate):
    d = startdate
    delta = datetime.timedelta(days=1)
    
    while d <= enddate:
        url = 'https://app.mybasis.com/api/v1/chart/{0}.json?summary=true&interval=60&units=ms&start_date={1}&start_offset=0&end_offset=0&heartrate=true&steps=true&calories=true&gsr=true&skin_temp=true&air_temp=true&bodystates=true'.format(user_id, d.strftime('%Y-%m-%d'))
        yield requests.get(url).json # Fetch generator
        d += delta
        
######## Append DATA to CSV ########
def append_csv(dat, fname, fpath):
    print dat
    # import csv
    fname = fpath + fname
    with open(fname, 'ab') as csvo:
        writer = csv.writer(csvo)
        # Write header
        writer.writerow(['datetime', 'date', 'timestamp', 'skin_temp', 'air_temp', 'heartrate', 'steps', 'gsr', 'calories'])
        # print(dat)        
        if 'endtime' not in dat:
            return
        epoch = datetime.datetime(1969, 12, 31, 20, 0, 0)
        tpass = datetime.timedelta(seconds=dat['starttime'])
        recdate = (epoch + tpass).date()
        
        for i in range((dat['endtime']-dat['starttime'])/dat['interval']):
            unix_time_utc = dat['starttime'] + i*dat['interval']
            # ** Activity Level (inactive, light, moderate)
            steps = dat['metrics']['steps']['values'][i]
            # ** Duration, number of intervals, average length for each level
            # ** total calories burned
            calories = dat['metrics']['calories']['values'][i]
            # * Sleep factors (hand curated)
            # ** bedtime
            # ** wakeup time
            # ** sleep interruption
            # * Perspiration
            gsr = dat['metrics']['gsr']['values'][i]
            # * Heart function
            heartrate = dat['metrics']['heartrate']['values'][i]
            # ** awake_heartrate
            # ** resting_heartrate
            # ** total_body_heat_flux
            skin_temp = dat['metrics']['skin_temp']['values'][i]
            air_temp = dat['metrics']['air_temp']['values'][i]

            mydt = datetime.datetime.fromtimestamp(unix_time_utc)
            timestamp = mydt.time()
            writer.writerow([mydt, recdate, timestamp, skin_temp, air_temp, heartrate, steps, gsr, calories])
            
####### Main ####### 
if __name__ == '__main__':
    # Parse date argument
    parser = argparse.ArgumentParser(description="Fetch BB data from specified date range")
    parser.add_argument('startdate', nargs='?', type=str, default="2013-10-01")
    parser.add_argument('enddate', nargs='?', type=str, default="2013-10-31")
    parser.add_argument('fpath', nargs='?', type=str, default=fpathdefault)
    args = parser.parse_args()
    # Basis Band ID
    # BB_user_id = os.getenv("BBid")
    # First date to import
    startdate = datetime.datetime.strptime(args.startdate, '%Y-%m-%d').date()
    # Append startdate to filename
    parser.add_argument('fname', nargs='?', type=str, default='BBdata' + startdate.strftime('%Y-%m-%d') + '.csv')
    args = parser.parse_args()
    # Last date to import
    enddate = datetime.datetime.strptime(args.enddate, '%Y-%m-%d').date()
    # Parse file name
    fname = args.fname
    # Parse file path
    fpath = args.fpath

    if BB_user_id != '':
        for dat in get_data(BB_user_id, startdate, enddate):
            append_csv(dat, fname, fpath)