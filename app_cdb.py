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

# Load data from local redis
def loadBB():
    DATABASES['default'] = {
    'ENGINE': 'django.db.backends.mysql',
    'HOST': 'my-host-goes-here',
    'USER': 'my-user-goes-here',
    'NAME': 'my-db-name-goes-here',
    'PASSWORD': 'my-db-pass-goes-here',
    'OPTIONS': {'ssl': {'ca':'/path/to/ca-cert.pem', 'cert':'/path/to/cert.pem', 'key':'/path/to/key.pem'},},
}



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

    auth_url1 = 'https://jawbone.com/auth/oauth2/auth'
    auth_url2 = 'https://jawbone.com/nudge/api/v.1.0/users/@me'
    client = oauth.Client(consumer)
    resp, content = client.request(auth_url1)
    resp, content = client.request(auth_url2)

s = requests.Session()
login_url = 'https://jawbone.com/user/signin/login'
r = s.get(login_url)
print(r.text)
credentials = {
    'inUserName': 'joytafty@gmail.com',
    'inUserPass': '',
    'server': 'nudge'
}

def CDBserver():
    app.config['SQLALCHEMY_DATABASE_URI'] = mysql://your-username:your-password@localhost/ufosightings

def server():
    from cherrypy import wsgiserver
    app = Flask(__name__)
    app.config.from_object('config')

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
    parser.add_argument('command', action="store", choices=['load', 'loadFB','server'])
    args = parser.parse_args()

    # port = 8000
    # Open a web browser pointing at the app.
    # os.system("open http://localhost:{0}".format(port))

    # Set up the development server on port 8000.
    if args.command == 'load' or 'loadFB':
        loadFB()
    if args.command == 'server':
        server()