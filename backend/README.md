# Scout AI Backend

FastAPI backend for finding hidden gem football players using machine learning.

## Setup Instructions

### Prerequisites
- Python 3.9 or higher

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
  ```bash
  venv\Scripts\activate
  ```
- macOS/Linux:
  ```bash
  source venv/bin/activate
  ```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Backend

Start the development server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### API Endpoints

- `GET /health` - Health check endpoint
- `GET /search/{player_name}` - Search for a player and get hidden gem recommendations

### Data

The backend requires the FC 24 player data CSV file at:
- `backend/data/all_fc_24_players.csv`

This file is loaded at startup and used for ML processing.

## Development Status

Current implementation status:
- ✓ Project structure created
- ✓ Dependencies defined
- ✓ FastAPI application skeleton
- ✓ ML engine class structure
- ✓ CSV file verified
- ⏳ Data loading implementation (pending)
- ⏳ ML model training (pending)
- ⏳ Hidden gem discovery algorithm (pending)
