from random import choice

from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def main():
    return render_template('main.html')

@app.route('/instant_nerdle')
def instant_nerdle():
    with open('possibilities.txt') as file:
        lines = file.readlines()
        possibility = choice(lines).strip().split(' ')
    return render_template('instant_nerdle.html', guess=possibility[0], feedback=possibility[1], answer=possibility[2])

if __name__ == '__main__':
    app.run()
