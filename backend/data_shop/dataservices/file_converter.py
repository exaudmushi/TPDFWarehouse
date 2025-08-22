import os, json, pyodbc, base64, uuid, random, traceback
from datetime import datetime
from django.conf import settings

class JsonConverter:
    def __init__(self, all_tables_data, output_folder, weekly_file):
        self.all_tables_data = all_tables_data
        self.output_folder = output_folder
        self.weekly_file = weekly_file

    def datetime_serializer(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")

    def convert_mdb_to_json(self, weekfile_name):
        mdb_dir = os.path.join(settings.BASE_DIR, "data_shop", "uploads", weekfile_name, "extracted_files")
        
        for filename in os.listdir(mdb_dir):
            file_path = os.path.join(mdb_dir, filename)
            if not file_path.endswith(".mdb"):
                continue

            if not os.path.isfile(file_path):
                print(f"❌ Skipping: File not found → {file_path}")
                continue

            try:
                print(f"🔍 Connecting to: {file_path}")
                conn = pyodbc.connect(rf'DRIVER={{Microsoft Access Driver (*.mdb, *.accdb)}};DBQ={file_path};')
                cursor = conn.cursor()

                cursor.tables()
                tables = cursor.fetchall()
                user_tables = [table for table in tables if not table.table_name.startswith('MSys')]

                all_tables_data = {}
                current_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                uu_id = uuid.uuid4()

                # Try to get facility code from tblConfig
                try:
                    cursor.execute("SELECT * FROM tblConfig")
                    result = cursor.fetchall()
                    hrfFacilityCode = result[0][3] if result else None
                except Exception as config_error:
                    print(f"⚠️ Could not read tblConfig in {filename}: {config_error}")
                    hrfFacilityCode = "UNKNOWN"

                for table in user_tables:
                    table_name = table.table_name
                    try:
                        cursor.execute(f"SELECT * FROM {table_name}")
                        columns = [column[0] for column in cursor.description]
                        rows = cursor.fetchall()

                        data = []
                        for row in rows:
                            row_dict = {}
                            for i in range(len(columns)):
                                value = row[i]
                                if isinstance(value, bytes):
                                    value = base64.b64encode(value).decode('utf-8')
                                row_dict[columns[i]] = value

                            row_dict["r_id"] = self.weekly_file + "-" + hrfFacilityCode
                            row_dict["date_converted"] = current_date
                            row_dict["facility_name"] = hrfFacilityCode
                            row_dict["token"] = str(uu_id)
                            data.append(row_dict)

                        all_tables_data[table_name] = data
                    except Exception as table_error:
                        print(f"⚠️ Error reading table {table_name} in {filename}: {table_error}")
                        continue

                name = os.path.splitext(os.path.basename(filename))[0]
                json_filename = f"{name}.json"
                target_folder = os.path.join(settings.BASE_DIR, "data_shop", "uploads", "converted_json")
                os.makedirs(target_folder, exist_ok=True)
                json_filepath = os.path.join(target_folder, json_filename)

                with open(json_filepath, 'w') as json_file:
                    json.dump(all_tables_data, json_file, indent=4, default=self.datetime_serializer)

                print(f"✅ Converted all tables in {name} to JSON → {json_filepath}")
                conn.close()

            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")
                traceback.print_exc()
