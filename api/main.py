"""
NEXUS ALPR API - Enterprise Edition
Main FastAPI Application Engine
Handles ML Inference (YOLOv8, ONNX), WebSockets, and routing for the ALPR system.
"""

from fastapi import FastAPI, File, UploadFile, Form, WebSocket, WebSocketDisconnect, Body
from fastapi.responses import StreamingResponse, Response
import cv2
import csv
import re 
import tempfile
import os
import asyncio
import base64
import random
from pydantic import BaseModel
from io import StringIO
import numpy as np
from ultralytics import YOLO
from fastapi.middleware.cors import CORSMiddleware 

from api.database import (
    init_db, log_entry, checkout_vehicle, add_new_subscriber, 
    get_all_visits, check_blacklist, add_to_blacklist, get_occupancy,
    log_security_alert, get_today_alerts_count, manual_log_entry, 
    update_visit_db, void_visit_db, waive_fee_db, get_blacklist_data, 
    get_alerts_data, remove_from_blacklist_db, mark_all_alerts_read, 
    get_vip_dashboard_data, remove_vip_db, update_vip_db, export_daily_report_csv, 
    get_full_dashboard_analytics, get_system_settings_db, update_system_settings_db
)

# ==========================================
# ⚙️ 1. APP CONFIGURATION & MODELS INITIALIZATION
# ==========================================

app = FastAPI(title="Nexus ALPR API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

print("Loading AI Models...")
plate_model = YOLO('models/plate_model.onnx')
ocr_model = YOLO('models/ocr_model.onnx')
vehicle_model = YOLO('yolov8n.pt') 
print("All Models Loaded Successfully! 🚀")

# ----------------- Dictionaries -----------------
arabic_mapping = {
    'alif': 'أ', 'baa': 'ب', 'taa': 'ت', 'thaa': 'ث', 'jeem': 'ج',
    '7aa': 'ح', 'khaa': 'خ', 'daal': 'د', 'zaal': 'ذ', 'raa': 'ر',
    'zay': 'ز', 'seen': 'س', 'sheen': 'ش', 'saad': 'ص', 'daad': 'ض',
    'Taa': 'ط', 'Thaa': 'ظ', 'ain': 'ع', 'ghayn': 'غ', 'faa': 'ف',
    'qaaf': 'ق', 'kaaf': 'ك', 'laam': 'ل', 'meem': 'م', 'noon': 'ن',
    'haa': 'هـ', 'waw': 'و', 'yaa': 'ي',
}

number_to_letter = {
    '1': 'أ', '١': 'أ', '5': 'هـ', '٥': 'هـ', '0': 'هـ', '٠': 'هـ',
    '2': 'د', '٢': 'د', '9': 'و', '٩': 'و', '6': 'ط', '٦': 'ط'
}

letter_to_number = {
    'أ': '1', 'هـ': '5', 'ه': '5', 'o': '5', 'د': '2', 'و': '9', 'ط': '6'
}


# ==========================================
# 🧠 2. CORE ML & LOGIC PIPELINES
# ==========================================

def correct_plate_logic(detected_chars):
    """
    Normalizes and corrects misclassified characters based on Egyptian license plate standards.
    Args:
        detected_chars (list): List of detected character dictionaries.
    Returns:
        str: Formatted and normalized license plate string.
    """
    corrected_plate = []
    total_chars = len(detected_chars)
    
    for i, item in enumerate(detected_chars):
        char = item["name"]
        
        # Apply spatial correction only for standard 5+ character plates
        if total_chars >= 5:
            if i < 2: 
                if char in number_to_letter:
                    char = number_to_letter[char]
            elif i >= total_chars - 3:
                if char in letter_to_number:
                    char = letter_to_number[char]
        else:
            pass
                
        corrected_plate.append(char)
        
    letters = [c for c in corrected_plate if not c.isdigit()]
    numbers = [c for c in corrected_plate if c.isdigit()]

    numbers.reverse()
    
    final_plate_text = f"{' '.join(letters)} {''.join(numbers)}".strip()
    normalized_plate_text = final_plate_text.replace('ى', 'ي')
    
    return normalized_plate_text


def extract_plates_from_frame(img):
    """
    Executes the full AI pipeline: Vehicle detection -> Plate isolation -> Image Enhancement -> OCR.
    Args:
        img (numpy.ndarray): The raw image frame.
    Returns:
        list: Extracted vehicle types and formatted license plate strings.
    """
    detected_data = []
    
    vehicle_results = vehicle_model.predict(img, classes=[2, 3, 5, 7], conf=0.5, verbose=False)
    vehicles = []
    for r in vehicle_results:
        for box in r.boxes:
            vx1, vy1, vx2, vy2 = map(int, box.xyxy[0])
            cls_id = int(box.cls[0].item())
            v_type = vehicle_model.names[cls_id] 
            vehicles.append({"box": (vx1, vy1, vx2, vy2), "type": v_type})

    plate_results = plate_model.predict(img, conf=0.5, verbose=False)
    
    for plate_result in plate_results:
        boxes = plate_result.boxes
        if len(boxes) == 0: continue
        
        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            if (x2 - x1) < 60 or (y2 - y1) < 20: 
                continue 
            
            plate_cx = (x1 + x2) / 2
            plate_cy = (y1 + y2) / 2
            assigned_vehicle_type = "car" 
            
            for v in vehicles:
                vx1, vy1, vx2, vy2 = v["box"]
                if vx1 <= plate_cx <= vx2 and vy1 <= plate_cy <= vy2:
                    assigned_vehicle_type = v["type"]
                    break
                    
            plate_crop = img[y1:y2, x1:x2]
            plate_crop_zoomed = cv2.resize(plate_crop, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
            gray_crop = cv2.cvtColor(plate_crop_zoomed, cv2.COLOR_BGR2GRAY)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            clahe_crop = clahe.apply(gray_crop)
            
            sharpen_kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
            sharpened_crop = cv2.filter2D(clahe_crop, -1, sharpen_kernel)
            
            final_processed_crop = cv2.cvtColor(sharpened_crop, cv2.COLOR_GRAY2BGR)
            
            char_results = ocr_model.predict(final_processed_crop, conf=0.25, verbose=False)
            
            all_chars = []
            for char_result in char_results:
                for char_box in char_result.boxes:
                    char_x1 = char_box.xyxy[0][0].item()
                    char_id = int(char_box.cls[0].item())
                    char_name = arabic_mapping.get(ocr_model.names[char_id], ocr_model.names[char_id])
                    all_chars.append({'x': char_x1, 'name': char_name})
                    
            if not all_chars: continue
            
            all_chars.sort(key=lambda item: item['x'], reverse=True)
            final_plate_text = correct_plate_logic(all_chars)
            raw_chars = final_plate_text.replace(" ", "")
            
            if not re.match(r'^[\u0600-\u06FF]{1,3}\d{1,4}$', raw_chars): 
                print(f"⚠️ Plate detected but rejected by Regex: {final_plate_text}")
                continue 
                
            detected_data.append({
                "plate": final_plate_text, 
                "type": assigned_vehicle_type
            })
            
    return detected_data

def process_plate_with_security(plate_data, gate):
    """
    Validates the detected plate against the security blacklist and updates the gate logs.
    Args:
        plate_data (dict): Contains 'plate' and 'type'.
        gate (str): Gate type ('in' or 'out').
    Returns:
        dict: Operational result or security alert.
    """
    plate = plate_data["plate"]
    v_type = plate_data["type"]
    
    blacklist_reason = check_blacklist(plate)
    
    if blacklist_reason:
        log_security_alert(plate, blacklist_reason)
        return {
            "status": "DANGER",
            "is_blacklisted": True,
            "message": f"SECURITY ALERT: Vehicle is blacklisted! Reason: {blacklist_reason}",
            "action": "DO NOT OPEN GATE"
        }
    
    if gate == 'in':
        return log_entry(plate, v_type)
    elif gate == 'out':
        return checkout_vehicle(plate)


# ==========================================
# 🌐 3. COMPUTER VISION API ENDPOINTS
# ==========================================

@app.post("/process_vehicle")
async def process_vehicle(gate: str = Form(...), file: UploadFile = File(...)):
    """ Endpoint to process a single static image uploaded via multipart/form-data. """
    if gate not in ['in', 'out']:
        return {"status": "error", "message": "Invalid gate type. Must be 'in' or 'out'."}

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {"status": "error", "message": "Invalid image file provided."}

    valid_data = extract_plates_from_frame(img)
    detected_vehicles_list = []
    
    for item in valid_data:
        db_response = process_plate_with_security(item, gate)
        detected_vehicles_list.append({
            "plate_number": item["plate"],
            "vehicle_type": item["type"],
            "database_response": db_response
        })

    if len(detected_vehicles_list) > 0:
        return {"status": "success", "total_detected": len(detected_vehicles_list), "results": detected_vehicles_list}
    else:
        return {"status": "error", "message": "No valid license plates found in the image."}


@app.post("/process_video")
async def process_video(gate: str = Form(...), file: UploadFile = File(...)):
    """ Endpoint to process an uploaded video file, applying frame skipping for performance. """
    if gate not in ['in', 'out']:
        return {"status": "error", "message": "Invalid gate type."}

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        contents = await file.read()
        temp_video.write(contents)
        temp_video_path = temp_video.name

    cap = cv2.VideoCapture(temp_video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_skip = max(1, fps // 2)  
    
    frame_count = 0
    unique_plates = set()
    db_results = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
            
        if frame_count % frame_skip == 0:
            valid_data = extract_plates_from_frame(frame)
            for item in valid_data:
                if item["plate"] not in unique_plates:
                    unique_plates.add(item["plate"])
                    db_res = process_plate_with_security(item, gate)
                    db_results.append({
                        "plate_number": item["plate"],
                        "vehicle_type": item["type"],
                        "database_response": db_res
                    })
        frame_count += 1

    cap.release()
    os.remove(temp_video_path)

    if db_results:
        return {"status": "success", "total_detected": len(db_results), "results": db_results}
    else:
        return {"status": "error", "message": "No valid plates found in video."}


@app.websocket("/ws/live_camera/{gate}")
async def live_camera(websocket: WebSocket, gate: str):
    """ Real-time WebSocket endpoint for continuous video stream inference. """
    await websocket.accept()
    
    if gate not in ['in', 'out']:
        await websocket.send_json({"error": "Invalid gate type"})
        await websocket.close()
        return

    processed_plates_cache = set()
    
    try:
        while True:
            bytes_data = await websocket.receive_bytes()
            nparr = np.frombuffer(bytes_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is not None:
                valid_data = extract_plates_from_frame(frame)
                
                responses = []
                for item in valid_data:
                    if item["plate"] not in processed_plates_cache:
                        processed_plates_cache.add(item["plate"])
                        db_res = process_plate_with_security(item, gate)
                        responses.append({
                            "plate_number": item["plate"],
                            "vehicle_type": item["type"],
                            "database_response": db_res
                        })
                
                if responses:
                    await websocket.send_json({"status": "detected", "results": responses})
                    
            await asyncio.sleep(0.1)
            
    except WebSocketDisconnect:
        print(f"Live camera feed disconnected for gate: {gate}")


class SnapshotData(BaseModel):
    gate: str
    image_base64: str

@app.post("/process_snapshot")
async def process_snapshot(data: SnapshotData):
    """ Endpoint to process an image encoded in Base64 (ideal for WebCams/IoT devices). """
    if data.gate not in ['in', 'out']:
        return {"status": "error", "message": "Invalid gate type."}

    try:
        encoded_data = data.image_base64.split(',')[1] if ',' in data.image_base64 else data.image_base64
        img_bytes = base64.b64decode(encoded_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"status": "error", "message": "Failed to decode image."}

        valid_data = extract_plates_from_frame(img)
        detected_vehicles_list = []
        
        for item in valid_data:
            db_response = process_plate_with_security(item, data.gate)
            detected_vehicles_list.append({
                "plate_number": item["plate"],
                "vehicle_type": item["type"],
                "database_response": db_response
            })

        if detected_vehicles_list:
            return {"status": "success", "total_detected": len(detected_vehicles_list), "results": detected_vehicles_list}
        else:
            return {"status": "error", "message": "No valid license plates found in the snapshot."}
            
    except Exception as e:
        return {"status": "error", "message": f"Error processing snapshot: {str(e)}"}


# ==========================================
# 📊 4. DASHBOARD & SYSTEM ENDPOINTS
# ==========================================

@app.get("/")
def read_root():
    """ Health Check endpoint. """
    return {"message": "Welcome to OmniBoard ALPR API - Enterprise Edition is Online 🟢"}

@app.get("/live_status")
def get_live_status():
    """ Fetches real-time occupancy and active security alerts. """
    occupancy_data = get_occupancy()
    alerts_count = get_today_alerts_count()
    return {
        "status": "success",
        "system": "ONLINE",
        "occupancy": occupancy_data,
        "active_alerts": alerts_count
    }

@app.get("/analytics/dashboard")
def get_dashboard_analytics():
    """ Aggregates core system analytics for the main dashboard. """
    return get_full_dashboard_analytics()

@app.get("/visits")
def get_visits_json():
    """ Retrieves all historical vehicle visits. """
    rows = get_all_visits()
    visits = []
    for r in rows:
        visits.append({
            "plate_number": r[0], "vehicle_type": r[1], "entry_time": r[2], 
            "exit_time": r[3], "status": r[4], "fee": r[5], "id": r[6] 
        })
    return {"status": "success", "data": visits}

# --- Analytics Sub-Endpoints ---
@app.get("/analytics/peak_hours")
def analytics_peak_hours():
    try:
        return {"status": "success", "description": "Traffic peak hours analysis", "data": get_peak_hours()}
    except Exception as e:
        return {"status": "error", "message": f"Could not fetch analytics: {str(e)}"}

@app.get("/analytics/revenue")
def analytics_revenue():
    try:
        return {"status": "success", "currency": "EGP", "data": get_revenue_analytics()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/analytics/dwell_time")
def analytics_dwell_time():
    try:
        return {"status": "success", "unit": "hours", "data": get_dwell_time_analytics()}
    except Exception as e:
        return {"status": "error", "message": f"Could not fetch dwell time: {str(e)}"}


# ==========================================
# 🛡️ 5. SECURITY & BLACKLIST MANAGEMENT
# ==========================================

@app.get("/security/blacklist")
def fetch_blacklist():
    return {"status": "success", "data": get_blacklist_data()}

@app.post("/add_to_blacklist")
def add_blacklist_entry(plate_number: str = Form(...), reason: str = Form(...)):
    """ Adds a vehicle to the security blacklist via Form submission. """
    return add_to_blacklist(plate_number, reason)

@app.delete("/security/blacklist/{plate_number}")
def delete_blacklist_record(plate_number: str):
    return remove_from_blacklist_db(plate_number)

@app.get("/security/alerts")
def fetch_security_alerts():
    return {"status": "success", "data": get_alerts_data()}

@app.put("/security/alerts/read")
def mark_alerts_as_read():
    return mark_all_alerts_read()


# ==========================================
# 🌟 6. VIP / SUBSCRIBER MANAGEMENT
# ==========================================

class VIPCreate(BaseModel):
    plate_number: str
    owner_name: str

class VIPUpdate(BaseModel):
    old_plate: str
    new_plate: str
    owner_name: str
    status: str

@app.get("/vips")
def get_all_vips():
    return get_vip_dashboard_data()

@app.post("/vip/add")
def add_vip_endpoint(vip: VIPCreate):
    """ Adds a VIP record via JSON payload. """
    return add_new_subscriber(vip.plate_number, vip.owner_name)

@app.post("/add_vip")
def add_vip(plate_number: str = Form(...), owner_name: str = Form(...)):
    """ Legacy endpoint: Adds a VIP record via Form submission. """
    return add_new_subscriber(plate_number, owner_name)

@app.put("/vip/update")
def update_vip_endpoint(vip: VIPUpdate):
    return update_vip_db(vip.old_plate, vip.new_plate, vip.owner_name, vip.status)

@app.delete("/vips/{plate_number}")
def delete_vip(plate_number: str):
    return remove_vip_db(plate_number)


# ==========================================
# 🛠️ 7. ADMIN ACTIONS & GATE CONTROLS
# ==========================================

@app.post("/admin/manual_entry")
def admin_manual_entry(plate_number: str = Form(...), vehicle_type: str = Form(...)):
    """ Allows manual gate override while enforcing blacklist checks. """
    clean_plate = " ".join(plate_number.split())
    bl_reason = check_blacklist(clean_plate)
    if bl_reason:
        log_security_alert(clean_plate, f"Manual Entry Blocked: {bl_reason}")
        return {"status": "error", "message": f"ACCESS DENIED: Vehicle is Blacklisted! Reason: {bl_reason}"}
        
    return manual_log_entry(clean_plate, vehicle_type)

@app.post("/admin/force_exit")
def admin_force_exit(data: dict = Body(...)):
    plate_number = data.get("plate_number")
    return checkout_vehicle(plate_number)

@app.post("/admin/update_visit")
def admin_update_visit(visit_id: int = Body(...), data: dict = Body(...)):
    return update_visit_db(visit_id, data.get("plate_number"), data.get("vehicle_type"), data.get("status"))

@app.post("/admin/void_visit")
def admin_void_visit(visit_id: int = Body(...), reason: str = Body(...)):
    return void_visit_db(visit_id, reason)

@app.post("/admin/waive_fee")
def admin_waive_fee(visit_id: int = Body(...), reason: str = Body(...)):
    return waive_fee_db(visit_id, reason)


# ==========================================
# 📈 8. EXPORTS & SYSTEM SETTINGS
# ==========================================

@app.get("/analytics/export")
def export_csv_report():
    """ Triggers a file download containing daily analytics (CSV). """
    csv_data = export_daily_report_csv()
    return Response(content=csv_data, media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="daily_report.csv"'})

@app.get("/export_report")
def export_report():
    """ Legacy CSV stream export for basic visits data. """
    rows = get_all_visits()
    stream = StringIO()
    writer = csv.writer(stream)
    writer.writerow(["Plate Number", "Vehicle Type", "Entry Time", "Exit Time", "Status", "Fee (EGP)"])
    for row in rows:
        writer.writerow(row[:6])
        
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=omniboard_daily_report.csv"
    return response

class SettingsModel(BaseModel):
    max_capacity: int
    hourly_rate: int

@app.get("/settings")
def get_settings():
    return get_system_settings_db()

@app.post("/settings")
def update_settings(data: SettingsModel):
    return update_system_settings_db(data.max_capacity, data.hourly_rate)