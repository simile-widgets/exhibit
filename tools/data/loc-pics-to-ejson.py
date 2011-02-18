'''
Transform LOC photo catalog JSON into Exhibit JSON

Execute as;

$ python loc-pics-to-ejson.py <url> > output.ejson

where 'url' is an LOC search results URL returning JSON, e.g.

  http://www.loc.gov/pictures/search/?q=&c=100&co=jpd&fo=json

Requires Amara, or else httplib2 and json/simplejson
'''

try:
    import httplib2
except:
    try:
        from amara.thirdparty import httplib2
    except:
        pass

try:
    import simplejson as json
except:
    try:
        from amara.thirdparty import json
    except:
        pass

import sys
import re

def ejsonify(pic):
    item = {}
    item['id'] = pic['links']['item']
    item['type'] = 'image'
    item['label'] = pic['title']

    # Promote images to properties
    for it in pic['image'].iterkeys():
        item['image_%s'%it] = pic['image'][it]

    # Copy these as-is
    for p in ['collection','medium','reproduction_number','date_updated','date_added',
              'call_number','subjects','medium_brief','pk','created_published_date',
              'subjects']:
        item[p] = pic.get(p,None)

    return item

STATIC_PROPS = {'properties':{'image_square':{'valueType':'uri'},
                              'image_alt':{'valueType':'uri'},
                              'image_full':{'valueType':'uri'},
                              'image_thumb':{'valueType':'uri'}}
               }

page_url = sys.argv[1]

H = httplib2.Http()
resp, body = H.request(page_url)
pic_js = json.loads(body)
pages = pic_js['pages']
if not 'sp=' in page_url:
    page_url = page_url+'&sp=1'

items = []
ejson = STATIC_PROPS
ejson['items'] = items

for page_num in xrange(0,pages['total']):

    page_url = re.sub('sp=\d+','sp=%d'%(page_num+1),page_url)

    resp, body = H.request(page_url)
    sys.stderr.write("Reading page %d of %d\n"%(page_num+1,pages['total']))

    items.extend([ejsonify(r) for r in json.loads(body)['results']])

sys.stdout.write(json.dumps(ejson,indent=4))
