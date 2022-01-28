import re
def response(flow):
    flow.response.headers["rsb"] = flow.response.text
    flow.response.headers["rqb"] = flow.request.text
    #if re.findall(r'foo', flow.response.text):
        #flow.response.headers["newheader"] = "foo"
