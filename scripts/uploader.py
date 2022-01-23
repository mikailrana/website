import firebase_admin
from google.cloud import storage
from google.oauth2 import service_account
import os
from firebase_admin import credentials

# get google credential object
goog_cred = service_account.Credentials.from_service_account_file("./mikmusic-key.json")
# Enable Cloud Storage
client = storage.Client("mikmusic-8c7e3",goog_cred)

bucket = client.get_bucket("mikmusic-8c7e3.appspot.com")

local_dir = r'C:\Users\mrana\Creative Cloud Files\Beat Website'
for dir_entry in os.scandir(local_dir):
    if dir_entry.is_dir():
        print("Scanning Local Path:" + dir_entry.path)
        for file_entry in os.scandir(dir_entry.path):
            if not file_entry.name.endswith(".wav"):
                print("uploading " + file_entry.path)
                blob = bucket.blob("NewStuff/" + file_entry.name)
                blob.upload_from_filename(file_entry.path)
                print("Finished Copying " + file_entry.path)

#firebase stuff ignore
cred = credentials.Certificate("./mikmusic-key.json")
default_app = firebase_admin.initialize_app(cred)


blobs = bucket.list_blobs(prefix="NewStuff/", delimiter="/")

for blob in blobs:
    print(blob)