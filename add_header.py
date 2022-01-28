import re
def response(flow):
    flow.response.headers["rsb"] = flow.response.raw_content
    flow.response.headers["rqb"] = flow.request.raw_content
    #if re.findall(r'foo', flow.response.text):
        #flow.response.headers["newheader"] = "foo"
