# Configured for clearDB database
import json
import flask
from flask import Flask, url_for, render_template
from functools import update_wrapper
from cherrypy import wsgiserver
import argparse
import fitbit
import datetime
import os
from store import redis
import time
import numpy as np
import urlparse
from table_def import Subject, BBdate, Record

# Load data from local redis
def loadBB(startdate, enddate):
    import os, sys, urlparse, requests
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    ######## Fetch data from basis website ########
    def get_BBdata(user_id, startdate, enddate):
        d = startdate
        delta = datetime.timedelta(days=1)
    
        while d <= enddate:
            url = 'https://app.mybasis.com/api/v1/chart/{0}.json?summary=true&interval=60&units=ms&start_date={1}&start_offset=0&end_offset=0&heartrate=true&steps=true&calories=true&gsr=true&skin_temp=true&air_temp=true&bodystates=true'.format(user_id, d.strftime('%Y-%m-%d'))
            yield requests.get(url).json # Fetch generator
            d += delta

    def insert_BBdata(dat, session, bbdate, Recdate):
        if 'endtime' not in dat:
            return
        # epoch = datetime.datetime(1969, 12, 31, 20, 0, 0)
        # tpass = datetime.timedelta(seconds=dat['starttime'])
        # Recdate = (epoch + tpass).date()

        for i in range((dat['endtime'] - dat['starttime'])/dat['interval']):
        # nvals = (dat['endtime']-dat['starttime'])/dat['interval'] + 1
        # unix_time_utc = [(i-1)*dat['interval'] for i in xrange(nvals)]
            unix_time_utc = dat['starttime'] + i*dat['interval']
            Rectime = datetime.datetime.fromtimestamp(unix_time_utc)
            Skin_temp = dat['metrics']['skin_temp']['values'][i]
            Air_temp = dat['metrics']['air_temp']['values'][i]
            Heartrate = dat['metrics']['heartrate']['values'][i]
            Steps = dat['metrics']['steps']['values'][i]
            Gsr = dat['metrics']['gsr']['values'][i]    
            Calories = dat['metrics']['calories']['values'][i]
        
            record = [Record(recdate=Recdate, rectime=Rectime,
                skin_temp=Skin_temp, air_temp=Air_temp, heartrate=Heartrate, 
                steps=Steps, gsr=Gsr, calories=Calories)]
            bbdate.records.extend(record)

        session.add(bbdate)
        # session.commit()
        # return session, record
        return session, bbdate

    # fetch data
    BB_user_id = os.getenv("BBid")

    # connect to clearDB database
    cdb_usr = os.getenv("CLEARDB_USR")
    cdb_pwd = os.getenv("CLEARDB_PWD")
    cdb_host = os.getenv("CLEARDB_HOST")
    cdb_port = os.getenv("CLEARDB_PORT")
    # Define connection url
    cdb_url = "mysql://" + cdb_usr + ":" + cdb_pwd + "@" + cdb_host + ".cleardb.com/heroku_" + cdb_port
    # Create core interface to ClearDB database
    engine = create_engine(cdb_url, pool_recycle=3600, echo=True)

    # Create a Session
    Session = sessionmaker(bind=engine)
    session = Session()
    if BB_user_id != '':
        for dat in get_BBdata(BB_user_id, startdate, enddate):
            epoch = datetime.datetime(1969, 12, 31, 20, 0, 0)
            tpass = datetime.timedelta(seconds=dat['starttime'])
            Recdate = (epoch + tpass).date()

            bbdate = BBdate(Recdate)
            session, bbdate = insert_BBdata(dat, session, bbdate, Recdate)
        
        # Commit change
        session.commit()

def loadFB():
    # see: http://python-fitbit.readthedocs.org/en/latest/#fitbit-api
    fb = fitbit.Fitbit(
        os.getenv('CONSUMER_KEY'),
        os.getenv('CONSUMER_SECRET'), 
        user_key=os.getenv('USER_KEY'),
        user_secret=os.getenv('USER_SECRET'))
    
    redis.delete('fitbit')
    
    if True:
        sleepData = dict();
        sl1 = fb.time_series('sleep/startTime', period='max')['sleep-startTime']
        sl2 = fb.time_series('sleep/timeInBed', period='max')['sleep-timeInBed']
        sl3 = fb.time_series('sleep/minutesAsleep', period='max')['sleep-minutesAsleep']
        sl4 = fb.time_series('sleep/minutesAwake', period='max')['sleep-minutesAwake']
        sl5 = fb.time_series('sleep/minutesToFallAsleep', period='max')['sleep-minutesToFallAsleep']
        sl6 = fb.time_series('sleep/minutesAfterWakeup', period='max')['sleep-minutesAfterWakeup']
        sl7 = fb.time_series('sleep/efficiency', period='max')['sleep-efficiency']
        
        for sl in range(len(sl1)-1):            
            if sl1[sl]['value'] != '':                
                tempdate = datetime.datetime.strptime(sl1[sl]['dateTime'], '%Y-%m-%d').timetuple()
                sleepData['date'] = time.mktime(tempdate)
                temptime = time.strptime((sl1[sl]['dateTime'] + '-' + sl1[sl]['value']), '%Y-%m-%d-%H:%M')
                sleepData['startTime'] = time.mktime(temptime)
                sleepData['timeInBed'] = sl2[sl]['value']
                sleepData['minutesAsleep'] = sl3[sl]['value']
                sleepData['minutesAwake'] = sl4[sl]['value']
                sleepData['minutesToFallAsleep'] = sl5[sl]['value']
                sleepData['minutesAfterWakeup'] = sl6[sl]['value']
                sleepData['efficiency'] = sl7[sl]['value']
                s = json.dumps(sleepData)
                redis.sadd('fitbit', s)
                print s

def authenticate():
    import oauth2 as oauth
    import urllib2
    import urlparse

    consumer = oauth.Consumer(
        key    = 'RxOzz6tE38w',
        secret = '094c3ff0fcfc767e7a8789d5242fa56a48ae78bc', 
        response_type = "code", 
        scope = "basic_read", 
        redirect_uri = "https://sleepmodel.herokuapp.com/")

    # CLIENT_ID = "RxOzz6tE38w"
    CLIENT_ID = os.getenv("UP_client_id")
    CLIENT_SECRET = os.getenv("UP_client_secret")
    REDIRECT_URI = "https://sleepmodel.herokuapp.com/"
    base_auth_url = 'https://jawbone.com/auth/oauth2/auth'
    auth_params = "response_type=code&client_id=" + CLIENT_ID + "&scope=basic_read&redirect_uri=" + REDIRECT_URI
    client = oauth.Client(consumer)
    # Get authentication url for request token
    auth_url1 = base_auth_url + "?" + auth_params

    auth_url2 = 'https://jawbone.com/nudge/api/v.1.0/users/@me'

    resp, content = client.request(auth_url1, headers={"Authorization": "<Authorization>"})


def server():
    from cherrypy import wsgiserver
    app = Flask(__name__)
    # app.config.from_object('config')

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/bar/")
    def bar():
        return render_template("bar.html")

    @app.route("/sleep/")
    def sleep():
        return render_template("sleep.html")

    @app.route("/up/")
    def up():
        return render_template("dcjsup.html")    

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('404.html'), 404

    app.debug = True
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
    d = wsgiserver.WSGIPathInfoDispatcher({'/': app})
    server = wsgiserver.CherryPyWSGIServer(('0.0.0.0', 8001), d)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Do stuff")
    parser.add_argument('command', action="store", choices=['load', 'loadBB', 'loadFB','server'])
    parser.add_argument('startdate', nargs='?', type=str, default="2013-08-01")
    parser.add_argument('enddate', nargs='?', type=str, default="2013-08-31")
    args = parser.parse_args()

    # Set up the development server on port 8000.
    if args.command == 'load' or 'loadBB':
        # Check that startdate comes before enddate
        startdate = datetime.datetime.strptime(args.startdate, '%Y-%m-%d').date()
        enddate = datetime.datetime.strptime(args.enddate, '%Y-%m-%d').date()
        loadBB(startdate, enddate)

    if args.command == 'loadFB':
        loadFB()
    if args.command == 'server':
        server()