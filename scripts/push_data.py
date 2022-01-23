import authentication
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import storage
import firebase_admin
import csv
import sys, getopt
import urllib


def tsv_to_dictionary(tsv_file):
    dictionaryOut = {}
    with open(tsv_file) as fd:
        rd = csv.reader(fd, delimiter="\t", quotechar='"')
        list = []
        for row in rd:
            data = {}
            data['image']=row[0]
            data['file']=row[1]
            data['description']=row[2]
            data['title']=row[3]
            data['audioURL']='https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/' + urllib.parse.quote('NewStuff/'+data['file'],safe='')+'?alt=media'
            data['imageURL'] = 'https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/' + urllib.parse.quote('NewStuff/'+data['image'],safe='')+'?alt=media'
            data['category'] = row[4]

            dictionaryOut[row[1]] = data
    return dictionaryOut

def main(argv):

    opts, args = getopt.getopt(argv, "", ["data_path="])
    data_path = None
    for opt, arg in opts:
        if opt == "--data_path":
            data_path = arg

    if data_path is None:
        raise Exception("error")

    cred = credentials.Certificate(authentication.config["serviceAccount"])
    app = firebase_admin.initialize_app(credential=cred,options=authentication.config)
    db = firestore.client()

    dictionary=tsv_to_dictionary(f"{data_path}/data.tsv")
    for key, value in dictionary.items():
        # send data to firestore
        db.collection('music2').document(value['file']).set(value)


if __name__ == "__main__":
    # execute only if run as a script
    main(sys.argv[1:])
