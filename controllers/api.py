# Here go your api methods.
import tempfile
from gluon.utils import web2py_uuid
import requests
#import codecs


@auth.requires_signature(hash_vars=False)
def get_checklists():
    checklists = []
    rows = None
    # logger.info("auth.user is %r", auth.user)
    if auth.user is not None:
        rows = db(db.checklist.user_email == auth.user.email).select()

    # logger.info("database rows: %r", rows)
    for i, r in enumerate(rows):
        # logger.info("row title retrieving %r", r.title)
        t = dict(
            id=r.id,
            user_email=r.user_email,
            title=r.title,
            memo=r.memo,
            updated_on=r.updated_on,
            being_edited=False,
            info_japan_post=None,
            info_USPS=None
        )
        checklists.append(t)

    logged_in = auth.user is not None
    return response.json(dict(
        checklists=checklists,
        logged_in=logged_in,
        current_user=auth.user.email
    ))

def check_USPS():
    tracking_num_string = request.vars.tracking_num
    tracking_num_string = tracking_num_string.replace(" ", "")  # remove all spaces
    logger.info("tracking number to look up is %r", tracking_num_string)
    return response.json(dict(
        tracking_num_string = tracking_num_string,
    ))

def check_JP():
    tracking_num_string = request.vars.tracking_num
    tracking_num_string = tracking_num_string.replace(" ", "")  # remove all spaces
    logger.info("tracking number to look up is %r", tracking_num_string)
    return response.json(dict(
        tracking_num_string = tracking_num_string,
    ))


def query_Japan_Post():
    tracking_num_string = request.vars.tracking_num
    tracking_num_string = tracking_num_string.replace(" ", "")  # remove all spaces
    logger.info("tracking number to look up is %r", tracking_num_string)

    tracking_url_string = "https://trackings.post.japanpost.jp/services/srv/search/direct?locale=en&reqCodeNo1=" + tracking_num_string

    #try to get the webpage
    JP_response = requests.get(tracking_url_string, timeout=5)
    resp_body = JP_response.text
    resp_body = resp_body.encode('ascii','ignore') #convert from unicode to ascii
    index_ref = resp_body.find("State occurrence date") #<--- TOKEN TO LOOK FOR TO INDICATE SUCCESSFULL QUERY
    if index_ref < 0:
        #an error has occured or package number invalid
        resp_body = "Sorry, we can't find the tracking number info for this entry via Japan Post."
        pass
    else:
        #splice the string into the table portion
        #first splice the string from the <table> to end of string and save this as new string.
        resp_body = resp_body[(index_ref-500):] #resp_body now contains an arbitrary num of characters before the reference
        index_begin = resp_body.find("<table")
        resp_body = resp_body[index_begin:]

        # then, splice from the beginning of this new string until index of </table>
        index_end = resp_body.find("</table>") + 8 #plus seven because </table> contains 8 characters
        resp_body = resp_body[:index_end]

    return response.json(dict(
        resp_body=resp_body
    ))


def get_checklists_public():
    checklists = []
    rows = db(db.checklist.is_public == True).select()

    for i, r in enumerate(rows):
        # logger.info("row title retrieving %r", r.title)
        t = dict(
            id=r.id,
            user_email=r.user_email,
            title=r.title,
            memo=r.memo,
            is_public=r.is_public,
            updated_on=r.updated_on,
            being_edited=False
        )
        checklists.append(t)

    return response.json(dict(
        checklists=checklists,
    ))


@auth.requires_signature()
def add_memo():
    # Inserts the memo information.
    logger.info("Trying to insert into checklist db")
    logger.info("title: %r", request.vars.title)
    logger.info("memo: %r", request.vars.memo)
    id = db.checklist.insert(
        title=request.vars.title,
        memo=request.vars.memo
    )
    return response.json(dict(checklist=dict(
        id=id,
        title=request.vars.title,
        memo=request.vars.memo
    )))


@auth.requires_signature()
def del_memo():
    "Deletes a memo from the table"
    logger.info("Trying to delete %r", request.vars.memo_id)
    db(db.checklist.id == request.vars.memo_id).delete()
    return "ok"


@auth.requires_signature()
def toggle_memo():
    "Toggles the public field of the entry in the db"
    logger.info("toggling stuff happens here")
    entry = db(db.checklist.id == request.vars.memo_id).select().first()
    if entry:  # if entry exists
        newEntry = not entry.is_public
        logger.info('is public: %r' % newEntry)
        entry.update_record(is_public=newEntry)
    return "ok"


@auth.requires_signature()
def edit_memo():
    # Inserts the memo information.
    logger.info("Trying to edit memo ID %r", request.vars.memo_id)
    logger.info("new title: %r", request.vars.title)
    logger.info("new memo content: %r", request.vars.memo)

    entry = db(db.checklist.id == request.vars.memo_id).select().first()
    entry.update_record(title=request.vars.title)
    entry.update_record(memo=request.vars.memo)

    return response.json(dict(checklist=dict(
        title=request.vars.title,
        memo=request.vars.memo
    )))
