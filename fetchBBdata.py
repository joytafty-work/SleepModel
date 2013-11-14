# import dependencies
import os, datetime, requests, csv
import argparse

# TASK: Write data to CSV first, then write CSV to SQL
# ######## Connect to local database ########
# def connectMySQL(usr, pwd, dbname):
#     import os
#     import MySQLdb
#     from sqlalchemy import create_engine

#     connectstr = "mysql+mysqldb://"+usr+":"+pwd+"@localhost/"+dbname
#     engine = create_engine(connectstr, pool_recycle=3600)
#     conn = engine.connect()
#     return conn

fpathdefault = 'static/data/BBdata_nooffset/'

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