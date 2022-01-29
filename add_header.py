import re
def response(flow):
    flow.request.headers["rsb"] = flow.response.text
    flow.request.headers["rqb"] = flow.request.text
