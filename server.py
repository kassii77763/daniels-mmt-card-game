#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Harness & Ops Cockpit v2.0 Local Jira Server
- Lightweight Multi-threaded HTTP + SSE Server on 127.0.0.1:8795
- Watches tasks.yaml & shards/*.yaml with SHA-256 CAS
- Dispatches Server-Sent Events (SSE) on file modification
- Atomic temp-swap write via os.replace
"""

import os
import sys
import time
import glob
import json
import hashlib
import tempfile
import threading
import traceback
from urllib.parse import urlparse
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "server.log")

try:
    log_fp = open(LOG_FILE, "a", encoding="utf-8", buffering=1)
    sys.stdout = log_fp
    sys.stderr = log_fp
except Exception:
    pass

try:
    import yaml
except ImportError:
    print("[ERROR] PyYAML is not installed. Run 'pip install pyyaml'.", file=sys.stderr)
    sys.exit(1)

HOST = "127.0.0.1"
PORT = 8795
TASKS_YAML = os.path.join(BASE_DIR, "tasks.yaml")
SHARDS_DIR = os.path.join(BASE_DIR, "shards")
HTML_FILE = os.path.join(BASE_DIR, "cockpit.html")

STATE_LOCK = threading.Lock()
SSE_CLIENTS = []
LAST_KNOWN_SHA = ""
LAST_KNOWN_MTIME = 0

def calc_file_sha(filepath):
    if not os.path.exists(filepath):
        return ""
    try:
        with open(filepath, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()[:10]
    except Exception:
        return ""

def load_tasks_yaml():
    if not os.path.exists(TASKS_YAML):
        return {"tasks": [], "shards": [], "version": "2.0", "archived_done_count": 0}, ""
    try:
        with open(TASKS_YAML, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
            sha = calc_file_sha(TASKS_YAML)
            return data, sha
    except Exception as e:
        print(f"[WARN] Failed to load tasks.yaml: {e}", file=sys.stderr)
        return {"tasks": [], "error": str(e)}, ""

def atomic_write_yaml(data):
    with STATE_LOCK:
        dir_name = os.path.dirname(TASKS_YAML) or "."
        fd, tmp_path = tempfile.mkstemp(dir=dir_name, suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                yaml.safe_dump(data, f, allow_unicode=True, sort_keys=False)
            with open(tmp_path, "r", encoding="utf-8") as vf:
                yaml.safe_load(vf)
            os.replace(tmp_path, TASKS_YAML)
            new_sha = calc_file_sha(TASKS_YAML)
            try:
                json_path = os.path.join(dir_name, "tasks.json")
                with open(json_path, "w", encoding="utf-8") as jf:
                    json.dump(data, jf, ensure_ascii=False, indent=2)
            except Exception as je:
                print(f"[WARN] Failed to write tasks.json: {je}", file=sys.stderr)
            return new_sha
        except Exception as e:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            raise e

def broadcast_sse(event_data):
    payload = f"data: {json.dumps(event_data, ensure_ascii=False)}\n\n".encode("utf-8")
    dead_clients = []
    with STATE_LOCK:
        for client in list(SSE_CLIENTS):
            try:
                client.wfile.write(payload)
                client.wfile.flush()
            except Exception:
                dead_clients.append(client)
        for dead in dead_clients:
            if dead in SSE_CLIENTS:
                SSE_CLIENTS.remove(dead)

def file_watcher_thread():
    global LAST_KNOWN_SHA, LAST_KNOWN_MTIME
    try:
        data, current_sha = load_tasks_yaml()
        LAST_KNOWN_SHA = current_sha
        LAST_KNOWN_MTIME = os.path.getmtime(TASKS_YAML) if os.path.exists(TASKS_YAML) else 0
        heartbeat_counter = 0

        while True:
            time.sleep(1.0)
            heartbeat_counter += 1

            if os.path.exists(TASKS_YAML):
                try:
                    mtime = os.path.getmtime(TASKS_YAML)
                    if mtime != LAST_KNOWN_MTIME:
                        current_sha = calc_file_sha(TASKS_YAML)
                        if current_sha != LAST_KNOWN_SHA:
                            LAST_KNOWN_MTIME = mtime
                            LAST_KNOWN_SHA = current_sha
                            fresh_data, _ = load_tasks_yaml()
                            print(f"[SSE] tasks.yaml modified! SHA: {current_sha}. Broadcasting to {len(SSE_CLIENTS)} clients.")
                            broadcast_sse({
                                "type": "tasks_update",
                                "tasks": fresh_data.get("tasks", []),
                                "archived_done_count": fresh_data.get("archived_done_count", 0),
                                "sha": current_sha,
                                "timestamp": time.strftime("%H:%M:%S")
                            })
                except Exception as ex:
                    print(f"[WARN] File watcher error: {ex}", file=sys.stderr)

            if heartbeat_counter >= 10:
                heartbeat_counter = 0
                broadcast_sse({
                    "type": "heartbeat",
                    "time": time.strftime("%H:%M:%S")
                })
    except Exception as e:
        print(f"[FATAL in watcher]: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

class CockpitRequestHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, format, *args):
        if len(args) > 0 and "/events" not in str(args[0]):
            print(f"[{self.log_date_time_string()}] {args[0]} - Status: {args[1] if len(args)>1 else ''}")

    def do_GET(self):
        try:
            url = urlparse(self.path)
            path = url.path

            if path in ("/", "/index.html", "/cockpit.html"):
                if not os.path.exists(HTML_FILE):
                    self.send_error(404, "cockpit.html not found.")
                    return
                with open(HTML_FILE, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Cache-Control", "no-cache")
                self.end_headers()
                self.wfile.write(content)
                return

            if path == "/events":
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Connection", "keep-alive")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()

                with STATE_LOCK:
                    SSE_CLIENTS.append(self)
                print(f"[SSE] Client connected. Total active clients: {len(SSE_CLIENTS)}")

                data, current_sha = load_tasks_yaml()
                init_payload = f"data: {json.dumps({'type': 'tasks_update', 'tasks': data.get('tasks', []), 'archived_done_count': data.get('archived_done_count', 0), 'sha': current_sha, 'timestamp': time.strftime('%H:%M:%S')}, ensure_ascii=False)}\n\n".encode("utf-8")
                try:
                    self.wfile.write(init_payload)
                    self.wfile.flush()
                except Exception:
                    with STATE_LOCK:
                        if self in SSE_CLIENTS:
                            SSE_CLIENTS.remove(self)
                    return

                while True:
                    try:
                        time.sleep(1.0)
                    except Exception:
                        break
                with STATE_LOCK:
                    if self in SSE_CLIENTS:
                        SSE_CLIENTS.remove(self)
                return

            if path in ("/api/tasks", "/tasks.json"):
                data, current_sha = load_tasks_yaml()
                payload = json.dumps({
                    "tasks": data.get("tasks", []),
                    "shards": data.get("shards", []),
                    "archived_done_count": data.get("archived_done_count", 0),
                    "sha": current_sha,
                    "version": data.get("version", "2.0")
                }, ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return

            self.send_error(404, "Not Found")
        except Exception as e:
            print(f"[ERROR in do_GET]: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)

    def do_POST(self):
        try:
            url = urlparse(self.path)
            path = url.path
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                req_json = json.loads(body)
            except Exception:
                req_json = {}

            if path == "/api/update_task":
                task_id = req_json.get("id")
                if not task_id:
                    self.send_error(400, "Missing task id")
                    return
                data, _ = load_tasks_yaml()
                tasks = data.get("tasks", [])
                updated = False
                for i, t in enumerate(tasks):
                    if t.get("id") == task_id:
                        tasks[i].update(req_json)
                        updated = True
                        break
                if updated:
                    data["tasks"] = tasks
                    data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
                    new_sha = atomic_write_yaml(data)
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"ok": True, "sha": new_sha}).encode("utf-8"))
                else:
                    self.send_error(404, f"Task {task_id} not found")
                return

            if path == "/api/add_task":
                data, _ = load_tasks_yaml()
                tasks = data.get("tasks", [])
                tasks.insert(0, req_json)
                data["tasks"] = tasks
                data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
                new_sha = atomic_write_yaml(data)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "sha": new_sha}).encode("utf-8"))
                return

            if path == "/api/archive_done":
                data, _ = load_tasks_yaml()
                tasks = data.get("tasks", [])
                done_tasks = [t for t in tasks if t.get("column") == "done"]
                remaining = [t for t in tasks if t.get("column") != "done"]
                data["tasks"] = remaining
                data["archived_done_count"] = data.get("archived_done_count", 0) + len(done_tasks)
                data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
                new_sha = atomic_write_yaml(data)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "archived": len(done_tasks), "sha": new_sha}).encode("utf-8"))
                return

            if path == "/api/add_shard":
                code = req_json.get("code")
                name = req_json.get("name")
                shard_file = req_json.get("shardFile")
                initial_task = req_json.get("initialTask")
                data, _ = load_tasks_yaml()
                shards = data.get("shards", [])
                if not any(s.get("code") == code for s in shards):
                    shards.append({"code": code, "name": name, "file": shard_file, "progress": 15})
                    data["shards"] = shards
                if initial_task:
                    data.setdefault("tasks", []).insert(0, initial_task)
                new_sha = atomic_write_yaml(data)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "sha": new_sha}).encode("utf-8"))
                return

            self.send_error(404, "Not Found")
        except Exception as e:
            print(f"[ERROR in do_POST]: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)

def main():
    try:
        print("=" * 60)
        print(f" Harness & Ops Cockpit v2.0 - Local Jira Server (Threading)")
        print(f" URL:        http://{HOST}:{PORT}/")
        print(f" YAML Path:  {TASKS_YAML}")
        print(f" SSE Stream: http://{HOST}:{PORT}/events")
        print(f" Log File:   {LOG_FILE}")
        print("=" * 60)

        watcher = threading.Thread(target=file_watcher_thread, daemon=True)
        watcher.start()

        server = ThreadingHTTPServer((HOST, PORT), CockpitRequestHandler)
        server.serve_forever()
    except Exception as e:
        print(f"[FATAL in main]: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

if __name__ == "__main__":
    main()
