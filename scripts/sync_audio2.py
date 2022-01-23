import authentication
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import storage
import firebase_admin
import glob
import sys, getopt
import contextlib
import pywav
import datetime
import ntpath
import os
from crc32c import crc32c
from os import listdir
import base64
import struct
import csv

valid_extensions = {".m4a",".mp3", ".jpg", ".png", ".jpeg"}
compressed_audio_extensions = {".m4a", ".mp3"};
image_extensions = {".jpg", ".png", ".jpeg"}

def read_in_chunks(file_object, chunk_size=1024):
    """Lazy function (generator) to read a file piece by piece.
    Default chunk size: 1k."""
    while True:
        data = file_object.read(chunk_size)
        if not data:
            break
        yield data

def compute_crc_32(filename):
    digest = 0
    with open(filename, mode="rb") as f:
        for chunk in read_in_chunks(f):
            digest = crc32c(chunk, digest)
    return digest

def compute_google_crc_32(filename):
    digest = compute_crc_32(filename)
    return base64.b64encode(struct.pack(">I", digest)).decode("utf-8")

# Populate dictionary using local file directory.
def sync_local(path,dictionary,image_and_file_assoc):
    audio_file = None
    image_file = None

    for dirEntry in os.scandir(path):
        if dirEntry.is_dir():
            sync_local(dirEntry.path, dictionary,image_and_file_assoc)
        elif dirEntry.is_file():
            basename = dirEntry.name
            extension = os.path.splitext(basename)[1]
            if extension in valid_extensions:
                crc = compute_google_crc_32(dirEntry.path)
                size = os.path.getsize(dirEntry.path)
                # check if this is the compressed audio
                if extension in compressed_audio_extensions:
                    audio_file = basename
                elif extension in image_extensions:
                    image_file = basename
                if basename in dictionary:
                    # if file size and crc are the same, then ignore the duplicate.

                    existingSize = dictionary[basename][0]
                    existingCrc = dictionary[basename][1]
                    existingPath = dictionary[basename][2]

                    if existingSize != size or existingCrc != crc:
                        error = "Duplicate filename with different size or crc found for name: " + basename + " existingPath:" + existingPath + " newPath:" + dirEntry.path
                        raise Exception(error)
                    else:
                        print("Skipping duplicate file: " + dirEntry.path)
                dictionary[basename] = (size, crc, dirEntry.path)
    if audio_file != None:
        # check if file is already in dictionary
        if audio_file in image_and_file_assoc:
            existing_image = image_and_file_assoc[audio_file]
            if existing_image != None and existing_image != image_file:
                error = f"Duplicate image:{image_file} is different than existing:{existing_image} for " \
                        f"audio file:{audio_file}"
                raise Exception(error)
            if image_file != None:
                image_and_file_assoc[audio_file] = image_file
        else:
            image_and_file_assoc[audio_file] = image_file


def main(argv):
    opts, args = getopt.getopt(argv, "i:",["path=", "tsv_path="])
    path = "../audio"
    tsv_path = "../audio"
    for opt, arg in opts:
        if opt == "--path":
            path = arg
        elif opt == "--tsv_path":
            tsv_path = arg
    print(path)
    cred = credentials.Certificate(authentication.config["serviceAccount"])
    app = firebase_admin.initialize_app(credential=cred,options=authentication.config)
    db = firestore.client()
    bucket = storage.bucket()
    print (bucket)
    blobs = {}
    files = {}
    image_and_file_assoc = {}

    # scan local dirs, return files and assoc dictionaries
    sync_local(path, files, image_and_file_assoc)

    for blob in bucket.list_blobs(prefix="NewStuff/"):
        basename = os.path.basename(blob.name)
        if len(basename) > 0:
            print (basename + " " + blob.crc32c)
            blobs[basename] = (blob.size, blob.crc32c)

    # We are syncing from local to remote.
    # So, we need to walk the local files hashmap, and compare it to the remote one.

    for item in files.items():
        filename = item[0]
        size = item[1][0]
        crc = item[1][1]
        localPath = item[1][2]

        #Assume we are going to copy the file by default
        copy = True

        # Check to see if file exists in the remote hashmap
        if filename in blobs:
            blob = blobs[filename]
            remoteSize = blob[0]
            remoteCRC = blob[1]

            if remoteSize == size and remoteCRC == crc:
                copy = False
                print("Skipping file: " + localPath)
        if copy:
            print("Copying file: " + localPath)
            blob = bucket.blob("NewStuff/" + filename)
            blob.upload_from_filename(localPath)

    with open(f"{tsv_path}/assoc.tsv", 'wt') as out_file:
        tsv_writer = csv.writer(out_file, delimiter='\t')
        for key,value in image_and_file_assoc.items():
            tsv_writer.writerow([key,value])

if __name__ == "__main__":
    # execute only if run as a script
    main(sys.argv[1:])
