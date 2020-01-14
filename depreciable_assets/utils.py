jpToJpNum = {"明":1, "大":2, "昭":3, "平":4, "令":5}

def convert_jp_to_jp_num(jp):
    return jpToJpNum[jp] if jp in jpToJpNum else 0
    
    