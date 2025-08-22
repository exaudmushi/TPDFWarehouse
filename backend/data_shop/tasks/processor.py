import os, zipfile, json, uuid
from pathlib import Path
import pyodbc

class FileProcessor:
    def __init__(self, zip_path, task_id):
        self.zip_path = zip_path
        self.task_id = task_id
        self.base_dir = Path("warehouse/uploads") / task_id
        self.status_path = self.base_dir / "status.json"
        self.update_status("received")

    def update_status(self, status, details=None):
        self.status_path.parent.mkdir(parents=True, exist_ok=True)
        status_data = {"status": status}
        if details:
            status_data.update(details)
        with open(self.status_path, "w") as f:
            json.dump(status_data, f)

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
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={path};'
        )
        
        try:
            conn = pyodbc.connect(conn_str)
            cursor = conn.cursor()

            tables = [row.table_name for row in cursor.tables(tableType='TABLE')]
            result = {"filename": os.path.basename(path), "tables": {}}

            for table in tables:
                self.update_status("processing_table", {
                    "current_file": os.path.basename(path),
                    "current_table": table
                })

                cursor.execute(f"SELECT * FROM [{table}]")
                columns = [column[0] for column in cursor.description]
                rows = cursor.fetchall()
                table_data = [dict(zip(columns, row)) for row in rows]
                result["tables"][table] = table_data

            cursor.close()
            conn.close()
            return result

        except Exception as e:
            return {"error": str(e)}

    

    def get_status(self):
        if self.status_path.exists():
            with open(self.status_path) as f:
                return json.load(f)
        return {"status": "unknown"}

    def get_results(self):
        converted_dir = self.base_dir / "converted_data"
        return [f.name for f in converted_dir.glob("*.json")]

    def get_json_output(self):
        converted_dir = self.base_dir / "converted_data"
        output = {}

        for json_file in converted_dir.glob("*.json"):
            with open(json_file, "r") as f:
                output[json_file.stem] = json.load(f)

        return output
