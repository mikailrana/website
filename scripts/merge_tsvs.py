import csv
import sys, getopt
import urllib
from push_data import tsv_to_dictionary

def file_assocs_to_dictionary(tsv_file):
    dictionaryOut = {}
    with open(tsv_file) as fd:
        rd = csv.reader(fd, delimiter="\t", quotechar='"')
        list = []
        for row in rd:
            if len(row) > 0:
                dictionaryOut[row[0]] = row[1] if len(row) == 2 else None
    return dictionaryOut

def main(argv):
    opts, args = getopt.getopt(argv, "", ["data_path=", "assoc_path=", "output_path="])

    data_path = None
    assoc_path = None
    output_path = None
    for opt, arg in opts:
        if opt == "--data_path":
            data_path = arg
        elif opt == "--assoc_path":
            assoc_path = arg
        elif opt == "--output_path":
            output_path = arg
    if data_path is None or assoc_path is None or output_path is None:
        raise Exception("error")

    dataDictionary = tsv_to_dictionary(f"{data_path}\data.tsv")

    associationDictionary = file_assocs_to_dictionary(f"{assoc_path}/assoc.tsv")

    # walk the association dictionary
    for assoc_file, assoc_image in associationDictionary.items():
        if assoc_file not in dataDictionary:
            print(f"{assoc_file} not found in data dictionary. Adding")
            data = {}
            data['image']= assoc_image
            data['file']= assoc_file
            data['description']= None
            data['title']= None
            data['audioURL']='https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/' + urllib.parse.quote('NewStuff/'+data['file'],safe='')+'?alt=media'
            data['imageURL'] = 'https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/' + urllib.parse.quote('NewStuff/'+data['image'],safe='')+'?alt=media'
            data['category'] = None

            dataDictionary[assoc_file] = data

    with open(f"{output_path}/data_out.tsv", 'wt',newline='') as out_file:
        tsv_writer = csv.writer(out_file, delimiter='\t')
        for key,data in dataDictionary.items():
            print(f"writing {key}")
            tsv_writer.writerow([data['image'],data['file'],data['description'],data['title'],data['category']])

if __name__ == "__main__":
    # execute only if run as a script
    main(sys.argv[1:])
