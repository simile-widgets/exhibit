import sys
import logging
import urllib2
import httplib2
import cProfile

from amara.bindery import html
from amara.thirdparty import json
from amara.lib.iri import join, absolutize

from BeautifulSoup import BeautifulSoup

DATAPROFILE = {
    #properties: {
    #        'age': { valueType: "number" }
    #    }
    }

STARTURLS = [
    'http://eol.org/api/search/a.json'
    ]

DEBUGURLS = [
    'http://eol.org/api/search/Whale.json',
]

#Uncomment for debugging run
#STARTURLS = DEBUGURLS

def eol2json(starturls=STARTURLS, logger=logging):
    '''
    Note: for large collections, this defaults to a naive streaming mode
    which requires some minor manual tweaking of the output; s/}{/},{/
    and wrapping it all as a list which is the value for a dict key "items".
    '''
    H = httplib2.Http()
    items = []
    seen_items = set()
    for url in starturls:
        next = url
        next = 'http://eol.org/api/search/a.json?page=1800'
        while next:
            print >> sys.stderr, 'Processing results page: {0}'.format(next)
            resp,content = H.request(next)
            if not str(resp.status).startswith('2'):
                continue;
            resultset = json.loads(content)

            for result in resultset[u'results']:
                #Note: http://eol.org/pages/205453 corresponds to to http://eol.org/data_objects/3447855
                #But there seems to be no sensible scheme for correlating these

                #Oh well; get the image as best we can, then
                #print >> sys.stderr, 'Processing item page: {0}'.format(result[u'link'])

                lid = result[u'id']
                #if lid in seen_items:
                #    print >> sys.stderr, 'Duplicate: {0}'.format(lid)
                #    continue

                resp,content = H.request(result[u'link'])
                if not str(resp.status).startswith('2'):
                    continue;

                doc = BeautifulSoup(content)

                image_div = doc.find('div',{'class':'image'})
                img = image_div.find('img')
                imgattr = dict(img.attrs)
                image = imgattr['src']
                image = absolutize(image, 'http://eol.org/')
                image_alt = imgattr.get('alt','')

                try:
                    desc = doc.findAll('h2')[2].contents[0].strip('\n')
                except:
                    desc = ''

                aas = image_div.find('a')
                data_link = dict(aas.attrs)['href']
                if data_link: data_link = join('http://eol.org/', data_link)

                print >> sys.stderr, '.',
                #print >> sys.stderr, 'Image, data link: {0}'.format(repr((image, data_link)))
                item = {
                    u'title': result[u'title'],
                    u'label': result[u'title'],
                    u'id': str(lid),
                    u'content': [r.strip() for r in result[u'content'].split(u';')],
                    u'link': result[u'link'],
                    u'image': image,
                    u'image_alt': image_alt,
                    u'description': desc
                }
                if data_link: item[u'data_link'] = data_link
                #seen_items.add(lid)
                #items.append(item)
                json.dump(item, sys.stdout, indent=4)
            next = resultset.get(u'next')

    #json.dump({u'items': items, u'types': DATAPROFILE}, sys.stdout, indent=4)
    return


if __name__ == "__main__":
    cProfile.run('eol2json()','eol2json.prof')
    
