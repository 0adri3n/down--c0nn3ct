from flask import Flask, render_template, request, redirect, url_for, flash, session
import mysql.connector
import secrets
import array

app = Flask(__name__)
app.secret_key = "mydown"

def get_db_connection():
 
    conn = mysql.connector.connect(
        host = "host server ip",
        user = "username",
        password = "password",
        database="db_name"
    )

    return conn

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/documentation")
def documentatin():
    return render_template("documentation/index.html")

@app.route("/save", methods=["POST"])
def save():

    content = request.form.get('editor_content')

    if not content:
        print("No content")
        return redirect(url_for("index"))

    hex_dig = secrets.token_hex(nbytes=32)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO h4shTech (hash, content) VALUES (%s, COMPRESS(%s))", (hex_dig, content))
    conn.commit()
    conn.close()

    flash(f"Content saved with hash: {hex_dig}", "success")

    session["hash"] = hex_dig

    return redirect(url_for("index"))

@app.route("/open", methods=["POST"])
def open():
    hash_value = request.form.get('hash_value')

    if not hash_value:
        flash("No hash provided", "error")
        return redirect(url_for("index"))

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT UNCOMPRESS(content) FROM h4shTech WHERE hash = %s", (hash_value,))
    result = cursor.fetchone()
    conn.close()

    if result is None:
        flash("No content found for the provided hash", "error")
        return redirect(url_for("index"))


    opened_content_array = array.array('B', result[0])
    session["hash"] = hash_value
    flash("Content loaded successfully", "success")
    return render_template("index.html", opened_content=opened_content_array.tolist(), loaded="true")


if __name__ == '__main__':
    print("\n---------------------------------------------------------------------\n")
    print("down-c0nn3ct server running\n")
    print("---------------------------------------------------------------------\n")

    app.run(host="0.0.0.0", debug=True)
