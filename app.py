from flask import Flask, jsonify, render_template
from flask_cors import CORS
import random
from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler
import os
import logging

# Create the Flask app and configure CORS
app = Flask(__name__)
CORS(app)

# Configure SQLAlchemy for SQLite database
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///players.db'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///players.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Enable logging for APScheduler
logging.basicConfig()
logging.getLogger('apscheduler').setLevel(logging.DEBUG)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define the PlayerStats model
class PlayerStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    active_players = db.Column(db.Integer)
    top_scores = db.Column(db.PickleType)  # Stores a list
    server_health = db.Column(db.String(10))
    win_loss_ratio = db.Column(db.Float)

# Function to generate random data and add it to the database
def generate_data_job():
    with app.app_context():
        stats = PlayerStats(
            active_players=random.randint(50, 100),
            top_scores=[random.randint(1000, 5000) for _ in range(5)],
            server_health=random.choice(['Good', 'Fair', 'Poor']),
            win_loss_ratio=round(random.uniform(0.5, 1.0), 2)
        )
        db.session.add(stats)
        db.session.commit()
        app.logger.info('Generated new data and committed to the database.')

# # Initialize the database tables
# with app.app_context():
#     db.create_all()

# Flask routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/player-stats', methods=['GET'])
def get_player_stats():
    # Get the latest stats
    stats = PlayerStats.query.order_by(PlayerStats.id.desc()).first()
    if stats:
        data = {
            'active_players': stats.active_players,
            'top_scores': stats.top_scores,
            'server_health': stats.server_health,
            'win_loss_ratio': stats.win_loss_ratio
        }
    else:
        data = {
            'active_players': 0,
            'top_scores': [],
            'server_health': 'Unknown',
            'win_loss_ratio': 0.0
        }
    return jsonify(data)

@app.route('/api/player-stats-history', methods=['GET'])
def get_player_stats_history():
    stats = PlayerStats.query.order_by(PlayerStats.id.asc()).all()
    data = {
        'timestamps': [stat.id for stat in stats],
        'active_players': [stat.active_players for stat in stats],
        'top_scores': [stat.top_scores for stat in stats],
        'server_health': [stat.server_health for stat in stats],
        'win_loss_ratio': [stat.win_loss_ratio for stat in stats]
    }
    return jsonify(data)

@app.route('/api/generate-dummy-data', methods=['POST'])
def generate_dummy_data():
    stats = PlayerStats(
        active_players=random.randint(50, 100),
        top_scores=[random.randint(1000, 5000) for _ in range(5)],
        server_health=random.choice(['Good', 'Fair', 'Poor']),
        win_loss_ratio=round(random.uniform(0.5, 1.0), 2)
    )
    db.session.add(stats)
    db.session.commit()
    return jsonify({'message': 'Dummy data added'}), 201

# Scheduler configuration and start
scheduler = APScheduler()

# Initialize the database tables
with app.app_context():
    db.create_all()
    logger.info('Database tables created.')

# Function to initialize and start the scheduler
def start_scheduler():
    scheduler.init_app(app)
    scheduler.start()
    # Schedule the job to run every 5 seconds
    scheduler.add_job(
        id='Generate Data Job',
        func=generate_data_job,
        trigger='interval',
        seconds=5
    )
    app.logger.info('Scheduler started and job added.')

# Start the scheduler
start_scheduler()

if __name__ == '__main__':
    # Run the Flask app
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
