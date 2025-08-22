from celery import shared_task
from .file_converter import JsonConverter  # Adjust import as needed

@shared_task(bind=True)
def convert_mdb_task(self, file_name, data_file):
    try:
        all_tables_data = {}
        json_data_process = JsonConverter(
            all_tables_data,
            output_folder="converted_json",
            weekly_file=data_file
        )
        json_data_process.convert_mdb_to_json(weekfile_name=file_name)
        return {"status": "success", "file": file_name}
    except Exception as e:
        return {"status": "error", "message": str(e)}
