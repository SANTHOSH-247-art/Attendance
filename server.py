from flask import Flask, request, jsonify
from flask_cors import CORS
from twilio.rest import Client
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
# Ideally these should be in environment variables, but for "simple code" 
# requested by user, we will keep them here.
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', 'AC202656791cd32409d49c91b69ac208c0')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '2d72bba1ecdf27fe4005d246a386733c')
TWILIO_FROM_NUMBER = os.environ.get('TWILIO_FROM_NUMBER', '+14067327347')

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

@app.route('/send-sms', methods=['POST'])
def send_sms():
    print(f"Received request: {request.json}")
    try:
        data = request.json
        to_number = data.get('to')
        message_body = data.get('message')

        if not to_number or not message_body:
            print("Missing fields")
            return jsonify({'error': 'Missing "to" or "message" fields'}), 400

        print(f"Attempting to send from {TWILIO_FROM_NUMBER} to {to_number}")
        print(f"Body: {message_body}")

        message = client.messages.create(
            body=message_body,
            from_=TWILIO_FROM_NUMBER,
            to=to_number
        )

        print(f"SMS Sent! SID: {message.sid}")
        return jsonify({'status': 'success', 'sid': message.sid}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error sending SMS: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting SMS Server on port 5000...")
    app.run(port=5000, debug=True)
