from sklearn.tree import DecisionTreeClassifier
import pickle
import os

BASE_DIR = os.path.dirname(_file_)
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

difficulty_reverse = {
    0: "קל",
    1: "בינוני",
    2: "קשה"
}


def train_model():
    """
    אימון מודל פשוט – נוצר אוטומטית אם לא קיים
    """

    X = [
        [0.9, 1],  
        [0.2, 2],   
        [0.6, 1],   
        [0.95, 2],
    ]

    y = [2, 0, 1, 2]

    model = DecisionTreeClassifier(max_depth=3)
    model.fit(X, y)

    os.makedirs(BASE_DIR, exist_ok=True)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)


def predict_difficulty(features):
    if not os.path.exists(MODEL_PATH):
        train_model()

    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    prediction = model.predict([features])[0]
    return difficulty_reverse[prediction]