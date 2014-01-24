import json
import flask
from flask import Flask, url_for, render_template
import argparse
# import fitbit
import datetime
import os
import redis
import time
import numpy as np
import urlparse

# Local
redis = redis.Redis()

# Load data from local redis
def loadBB():
    import fetchBBdata
    d0 = '2013-11-01'
    df = '2013-11-02'
    BB_user_id = os.getenv("BBid")
    fetchBBdata.fetchBB(BB_user_id, d0, df)

# def loadFB():
#     # see: http://python-fitbit.readthedocs.org/en/latest/#fitbit-api
#     fb = fitbit.Fitbit(
#         os.getenv('CONSUMER_KEY'),
#         os.getenv('CONSUMER_SECRET'), 
#         user_key=os.getenv('USER_KEY'),
#         user_secret=os.getenv('USER_SECRET'))
    
#     redis.delete('fitbit')
    
#     if True:
#         sleepData = dict();
#         sl1 = fb.time_series('sleep/startTime', period='max')['sleep-startTime']
#         sl2 = fb.time_series('sleep/timeInBed', period='max')['sleep-timeInBed']
#         sl3 = fb.time_series('sleep/minutesAsleep', period='max')['sleep-minutesAsleep']
#         sl4 = fb.time_series('sleep/minutesAwake', period='max')['sleep-minutesAwake']
#         sl5 = fb.time_series('sleep/minutesToFallAsleep', period='max')['sleep-minutesToFallAsleep']
#         sl6 = fb.time_series('sleep/minutesAfterWakeup', period='max')['sleep-minutesAfterWakeup']
#         sl7 = fb.time_series('sleep/efficiency', period='max')['sleep-efficiency']
        
#         for sl in range(len(sl1)-1):            
#             if sl1[sl]['value'] != '':                
#                 tempdate = datetime.datetime.strptime(sl1[sl]['dateTime'], '%Y-%m-%d').timetuple()
#                 sleepData['date'] = time.mktime(tempdate)
#                 temptime = time.strptime((sl1[sl]['dateTime'] + '-' + sl1[sl]['value']), '%Y-%m-%d-%H:%M')
#                 sleepData['startTime'] = time.mktime(temptime)
#                 sleepData['timeInBed'] = sl2[sl]['value']
#                 sleepData['minutesAsleep'] = sl3[sl]['value']
#                 sleepData['minutesAwake'] = sl4[sl]['value']
#                 sleepData['minutesToFallAsleep'] = sl5[sl]['value']
#                 sleepData['minutesAfterWakeup'] = sl6[sl]['value']
#                 sleepData['efficiency'] = sl7[sl]['value']
#                 s = json.dumps(sleepData)
#                 redis.sadd('fitbit', s)
#                 print s


def server():
    from cherrypy import wsgiserver
    app = Flask(__name__)

    # @app.route("/")
    # def index():
    #     return render_template("index.html")

    @app.route("/explore/")
    def bar():
        return render_template("chloropleth.html")

    @app.route("/base/")
    def base():
        return render_template("base.html")


    @app.route("/index2/")
    def index2():
        return render_template("index2.html")

    @app.route("/")
    def index3():
        return render_template("index3.html")

    @app.route("/index4/")
    def index4():
        return render_template("index4.html")


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
    parser.add_argument('command', action="store", choices=['load', 'loadFB', 'loadBB', 'server'])
    args = parser.parse_args()

    # Set up the development server on port 8000.
    if args.command == 'loadBB':
        loadBB()
    if args.command == 'server':
        server()
    # if args.command == 'load' or 'loadFB':
    #     loadFB()
