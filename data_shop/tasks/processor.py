import os, zipfile, json, uuid
from pathlib import Path

class FileProcessor:
    def __init__(self, zip_path, task_id):
        self.zip_path = zip_path
        self.task_id = task_id
        self.base_dir = Path("warehouse/uploads") / task_id
        self.status_path = self.base_dir / "status.json"
        self.update_status("received")

    def update_status(self, status):
        self.status_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.status_path, "w") as f:
            json.dump({"status": status}, f)

    def create_folder(self):
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.update_status("folder_created")

    def extract_zip(self):
        extracted_dir = self.base_dir / "extracted"
        extracted_dir.mkdir(exist_ok=True)
        with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
            zip_ref.extractall(extracted_dir)
        self.update_status("extracted")

    def convert_mdb_to_json(self):
        converted_dir = self.base_dir / "converted_data"
        converted_dir.mkdir(exist_ok=True)
        extracted_dir = self.base_dir / "extracted"

        for file in extracted_dir.glob("*.mdb"):
            json_path = converted_dir / f"{file.stem}.json"
            data = self.read_mdb(file)
            with open(json_path, "w") as f:
                json.dump(data, f)

        self.update_status("completed")

    def read_mdb(self, path):
        # Replace with actual pydoc/pyodbc logic
        return {"filename": path.name, "data": "mocked"}

    def get_status(self):
        if self.status_path.exists():
            with open(self.status_path) as f:
                return json.load(f)
        return {"status": "unknown"}

    def get_results(self):
        converted_dir = self.base_dir / "converted_data"
        return [f.name for f in converted_dir.glob("*.json")]
