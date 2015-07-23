import requests
TOKEN = '9953A66E7A564EFB7FF3C7F767E476F8'
URL = 'https://redcap.stonybrookmedicine.edu/redcap/api/'

def printMetadata(metadata):
	print "This project has %d fields" % len(metadata)
	print
	print "field_name (type) ---> field_label"
	print "---------------------------"
	for field in metadata:
		print "%s (%s) ---> %s" % (field['field_name'], field['field_type'], field['field_label'])
	print
	print 'Every field has these keys: %s' % ', '.join(sorted(metadata[0].keys()))

def printRecords(records):
	print records
	
def main():
	payload = {'token': TOKEN, 'format': 'json', 'content': 'metadata'}
	
	response = requests.post(URL, data=payload)
	print response.status_code
	printMetadata(response.json())

if __name__ == '__main__':
   main()