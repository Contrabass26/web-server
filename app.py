#!/usr/bin/env python3

import random

from flask import Flask, render_template
from waitress import serve
import json
import hashlib

app = Flask(__name__)

@app.route('/')
def main():
    return render_template('main.html')

@app.route('/instant_nerdle')
def instant_nerdle():
    with open('possibilities.txt') as file:
        possibilities = []
        lines = file.readlines()
        for i in range(10):
            possibility = random.choice(lines).strip().split(' ')
            possibilities.append({'guess': possibility[0], 'feedback': possibility[1], 'answer': hashlib.sha1(bytes(possibility[2], 'utf-8')).hexdigest()})
    return render_template('instant_nerdle.html', possibilities=json.dumps(possibilities))

@app.route('/2048')
def _2048():
    return render_template('2048.html')

if __name__ == '__main__':
    serve(app, port=80)
