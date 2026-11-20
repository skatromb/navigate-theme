import json, os, subprocess, sys, pathlib, time

ra_bin, root, file = sys.argv[1], pathlib.Path(sys.argv[2]).resolve(), pathlib.Path(sys.argv[3]).resolve()
proc = subprocess.Popen([ra_bin], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
seq = 0

def send(method, params, is_request=True):
    global seq
    msg = {"jsonrpc": "2.0", "method": method, "params": params}
    if is_request:
        seq += 1
        msg["id"] = seq
    body = json.dumps(msg).encode()
    proc.stdin.write(b"Content-Length: %d\r\n\r\n" % len(body) + body)
    proc.stdin.flush()
    return seq if is_request else None

def recv():
    headers = {}
    while True:
        line = proc.stdout.readline()
        if line in (b"\r\n", b""):
            break
        key, value = line.decode().split(":", 1)
        headers[key.strip()] = value.strip()
    return json.loads(proc.stdout.read(int(headers["Content-Length"])))

def wait_for(request_id):
    while True:
        msg = recv()
        if msg.get("id") == request_id and "method" not in msg:
            return msg
        if "id" in msg and "method" in msg:
            send_response(msg["id"])

def send_response(request_id):
    body = json.dumps({"jsonrpc": "2.0", "id": request_id, "result": None}).encode()
    proc.stdin.write(b"Content-Length: %d\r\n\r\n" % len(body) + body)
    proc.stdin.flush()

init_id = send("initialize", {
    "processId": None, "rootUri": root.as_uri(),
    "capabilities": {"textDocument": {"semanticTokens": {
        "requests": {"full": True}, "tokenTypes": [], "tokenModifiers": [], "formats": ["relative"]}}},
    "initializationOptions": json.loads(os.environ.get("RA_INIT", "{}")) | {"semanticHighlighting": {"punctuation": {"enable": True}}},
})
legend = wait_for(init_id)["result"]["capabilities"]["semanticTokensProvider"]["legend"]
send("initialized", {}, is_request=False)
text = file.read_text()
send("textDocument/didOpen", {"textDocument": {"uri": file.as_uri(), "languageId": "rust", "version": 1, "text": text}}, is_request=False)

lines = text.splitlines()
for attempt in range(40):
    time.sleep(1)
    tok_id = send("textDocument/semanticTokens/full", {"textDocument": {"uri": file.as_uri()}})
    result = wait_for(tok_id).get("result")
    data = result["data"] if result else []
    library_bit = 1 << legend["tokenModifiers"].index("library")
    if data and any(data[i+4] & library_bit for i in range(0, len(data), 5)):
        break

line = col = 0
rows = []
for i in range(0, len(data), 5):
    d_line, d_start, length, type_idx, mods = data[i:i+5]
    line += d_line
    col = col + d_start if d_line == 0 else d_start
    names = [legend["tokenModifiers"][b] for b in range(len(legend["tokenModifiers"])) if mods & (1 << b)]
    rows.append((line + 1, lines[line][col:col+length], legend["tokenTypes"][type_idx], names))
for row in rows:
    print(f"{row[0]:3} {row[1]!r:28} {row[2]:18} {' '.join(row[3])}")
proc.kill()
