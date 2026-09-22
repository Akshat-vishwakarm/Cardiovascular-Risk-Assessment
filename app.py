"""
GeneGuard Flask Application
---------------------------
Web application for cardiovascular risk assessment powered by pre-trained ML model.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
from cardiovascular_model import predict_cardiovascular_risk

app = Flask(__name__)


@app.route("/", methods=["GET"])
def home():
    """
    Renders the GeneGuard home assessment page.
    """
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    """
    Processes patient health data, validates input, calls ML prediction model,
    and displays the GeneGuard result page.
    """
    try:
        # Extract inputs from form or JSON payload
        if request.is_json:
            form_data = request.get_json()
        else:
            form_data = request.form.to_dict()

        # Run prediction pipeline
        result = predict_cardiovascular_risk(form_data)

        if request.is_json:
            return jsonify(result)

        return render_template("result.html", result=result, form_data=form_data)

    except ValueError as val_err:
        # User-friendly validation error
        if request.is_json:
            return jsonify({"status": "error", "message": str(val_err)}), 400

        return render_template("index.html", error=str(val_err), form_data=request.form)

    except Exception as e:
        # Unexpected error caught gracefully without exposing stack traces
        if request.is_json:
            return jsonify({"status": "error", "message": "An unexpected error occurred during prediction."}), 500

        return render_template("index.html", error="Something went wrong processing your request. Please check your inputs.", form_data=request.form)


@app.route("/report", methods=["POST", "GET"])
def report():
    """
    Generates and renders the printable GeneGuard Cardiovascular Health Report.
    """
    try:
        if request.method == "POST":
            form_data = request.form.to_dict()
        else:
            form_data = request.args.to_dict()

        if not form_data:
            return redirect(url_for("home"))

        result = predict_cardiovascular_risk(form_data)
        return render_template("report.html", result=result, form_data=form_data)

    except Exception:
        return redirect(url_for("home"))


@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404


@app.errorhandler(500)
def server_error(e):
    return render_template("500.html"), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)