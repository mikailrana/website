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


def main(argv):
    opts, args = getopt.getopt(argv, "i:")
    path = None
    for opt, arg in opts:
        if opt == "-i":
            path = arg
    print(path)
    print("HERE")
    cred = credentials.Certificate(authentication.config["serviceAccount"])
    app = firebase_admin.initialize_app(credential=cred,options=authentication.config)
    db = firestore.client()
    bucket = storage.bucket()
    for blob in bucket.list_blobs():
        print (blob)
    files = glob.glob(f'{path}/*.wav')
    for file in files:
        basename = ntpath.basename(os.path.splitext(file)[0])
        print("afconvert '" + basename + "'.wav -o '" + basename + "'.m4a" + " -b 128000 -f m4af -d aac")

    for file in files:
        #print(f'opening file:{file}')
        wave_read = pywav.WavRead(file)
        #print(wave_read.getparams())

        ##
        duration = float(wave_read.getsamplelength()) / float(wave_read.getbyterate())
        ##rate = f.getframerate()
        ##duration = frames / float(rate)


        duration = datetime.timedelta(seconds=duration)
        output = "{ name:'" + ntpath.basename(file) +"', author:'Freddie', img: 'https://www.bensound.com/bensound-img/buddy.jpg',"
        output += " audio:'https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/"+ntpath.basename(file)+"?alt=media', duration:'"
        output += f"{(duration.seconds % 3600) // 60 }:{(duration.seconds % 60):02d}'"
        output += "}"
        
        print(f'{output},')

    docs = db.collection('music').get();

    #for file in files:
        #print(f'{doc.id} => {doc.to_dict()}')


if __name__ == "__main__":
    # execute only if run as a script
    main(sys.argv[1:])
