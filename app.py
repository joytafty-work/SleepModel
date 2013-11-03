"""
This file is part of the flask+d3 Hello World project.
"""
import json
import flask
from flask import Flask, url_for, render_template
import numpy as np


app = Flask(__name__)


@app.route("/")
def index():
    """
    When you request the root path, you'll get the index.html template.

    """
    return render_template("index.html")


@app.route("/bar/")
def bar():
    return render_template("bar.html")

@app.route("/number/")
def number():
    return render_template("number.html")

@app.route("/sleep/")
def dcchart():
    return render_template("sleep.html")

@app.route("/up/")
def up():
    return render_template("dcjsup.html")    

@app.route("/data")
@app.route("/data/<int:ndata>")
def data(ndata=100):
    """
    On request, this returns a list of ``ndata`` randomly made data points.

    :param ndata: (optional)
        The number of data points to return.

    :returns data:
        A JSON string of ``ndata`` data points.

    """
    x = 20 * np.random.rand(ndata) - 5
    y = 0.2 * x + 0.5 * np.random.randn(ndata)
    A = 10. ** np.random.rand(ndata)
    c = np.random.rand(ndata)
    return json.dumps([{"_id": i, "x": x[i], "y": y[i], "area": A[i],
        "color": c[i]}
        for i in range(ndata)])

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == "__main__":
    import os

    # port = 8000
    port = int(os.environ.get("PORT", 5000))
    # Open a web browser pointing at the app.
    # os.system("open http://localhost:{0}".format(port))

    # Set up the development server on port 8000.
    app.debug = True
    app.run(host='0.0.0.0', port=port)