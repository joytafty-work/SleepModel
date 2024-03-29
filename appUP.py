import os
import flask
from flask import Flask, url_for, render_template, request, redirect
from functools import update_wrapper
from cherrypy import wsgiserver
import argparse
import urlparse
import logging
import urllib, urllib2, json

def authenticateUP():
    print "authenticateUP inside"
    import oauth2 as oauth
    import urllib2
    import urlparse
    import logging

    # consumer = oauth.Consumer(
    #     key    = 'RxOzz6tE38w',
    #     secret = '094c3ff0fcfc767e7a8789d5242fa56a48ae78bc',
    #     )

    # consumer = oauth.Consumer(key=os.getenv("UP_client_id"), secret=os.getenv("UP_client_secret"))
    consumer = oauth.Consumer(key=os.getenv("UP_client_id"), secret=os.getenv("UP_client_secret"))

    # CLIENT_ID = "RxOzz6tE38w"
    CLIENT_ID = os.getenv("UP_client_id")
    CLIENT_SECRET = os.getenv("UP_client_secret")
    REDIRECT_URI = "https://sleepmodel.herokuapp.com/"
    base_auth_url = 'https://jawbone.com/auth/oauth2/auth'
    auth_params = "response_type=code&client_id=" + CLIENT_ID + "&scope=basic_read&redirect_uri=" + REDIRECT_URI
    client = oauth.Client(consumer)
    # Get authentication url for request token
    auth_url1 = base_auth_url + "?" + auth_params

    # auth_url2 = 'https://jawbone.com/nudge/api/v.1.0/users/@me'

    print auth_url1
    # resp, content = client.request(auth_url1, headers={"Authorization": "<Authorization>"})
    # resp, content = client.request(auth_url1, "POST")

    params = {
              'response_type': 'code',
              'client_id': os.getenv('UP_client_id'), 
              'redirect_url': REDIRECT_URI, 
    #           'state': request.get.args.get('next'),
              }
    logger = logging.getLogger(__name__)
    # logger.debug('GET: %s' % request.args)
    print logger
    print "params : " + urllib.urlencode(params)
    url1 = base_auth_url + "?" + urllib.urlencode(params)
    context = {'login_url': url1}
    print url1

def server():
    from cherrypy import wsgiserver
    app = Flask(__name__)
    # app.config.from_object('config')

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/login")
    def login():
        import urllib2

        consumer = oauth.Consumer(os.getenv("UP_client_id"), os.getenv("UP_client_secret"))
        client = oauth.Client(consumer)

        CLIENT_ID = os.getenv("UP_client_id")
        CLIENT_SECRET = os.getenv("UP_client_secret")
        REDIRECT_URI = "https://sleepmodel.herokuapp.com/"
        base_auth_url = 'https://jawbone.com/auth/oauth2/auth'
        auth_params = "response_type=code&client_id=" + CLIENT_ID + "&scope=basic_read&redirect_uri=" + REDIRECT_URI

        # Get authentication url for request token
        auth_url1 = base_auth_url + "?" + auth_params

        resp, content = client.request(auth_url1)
        print resp
        request_token = dict(urlparse.parse_qsl(content))
        url = REDIRECT_URI + request_token['oauth_signature']
        print url
        return flask.redirect(url)

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
    parser.add_argument('command', action="store", choices=['authenticateUP','server'])
    parser.add_argument('startdate', nargs='?', type=str, default="2013-08-01")
    parser.add_argument('enddate', nargs='?', type=str, default="2013-08-31")
    args = parser.parse_args()

    # Set up the development server on port 8000.
    if args.command == 'authenticateUP':
        print "authenticateUP outside"
        authenticateUP()

    if args.command == 'server':
        server()