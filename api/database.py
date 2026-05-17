import psycopg2
import os
from dotenv import load_dotenv
import csv
import io
from datetime import datetime, timedelta

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscribers (
            id SERIAL PRIMARY KEY,
            plate_number TEXT UNIQUE NOT NULL,
            owner_name TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS visits (
            id SERIAL PRIMARY KEY,
            plate_number TEXT NOT NULL,
            vehicle_type TEXT DEFAULT 'car',
            entry_time TEXT NOT NULL,
            exit_time TEXT,
            status TEXT DEFAULT 'inside',
            fee REAL DEFAULT 0,
            notes TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS blacklist (
            id SERIAL PRIMARY KEY,
            plate_number TEXT UNIQUE NOT NULL,
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS security_alerts (
            id SERIAL PRIMARY KEY,
            plate_number TEXT NOT NULL,
            reason TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id SERIAL PRIMARY KEY,
            max_capacity INT DEFAULT 50,
            hourly_rate INT DEFAULT 20
        );
    """)

    cursor.execute("""
        INSERT INTO settings (id, max_capacity, hourly_rate)
        SELECT 1, 50, 20
        WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);
    """)

    cursor.execute("ALTER TABLE visits ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'car';")
    cursor.execute("ALTER TABLE visits ADD COLUMN IF NOT EXISTS notes TEXT;")
    cursor.execute("ALTER TABLE security_alerts ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;")
    cursor.execute("ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")
    cursor.execute("ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';")
    
    conn.commit()
    cursor.close()
    conn.close()
    print("PostgreSQL Database initialized with ALL Enterprise Features! 🚀")

# ==========================================
# 🛑 دوال القائمة السوداء والتنبيهات
# ==========================================
def log_security_alert(plate_number, reason):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO security_alerts (plate_number, reason) VALUES (%s, %s)", (plate_number, reason))
    conn.commit()
    cursor.close()
    conn.close()

def get_today_alerts_count():
    conn = get_connection()
    cursor = conn.cursor()
    today = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("SELECT COUNT(*) FROM security_alerts WHERE CAST(timestamp AS TEXT) LIKE %s", (f"{today}%",))
    count = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return count

def add_to_blacklist(plate_number, reason):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO blacklist (plate_number, reason) VALUES (%s, %s)", 
            (plate_number, reason)
        )
        conn.commit()
        response = {"status": "success", "message": f"Plate [{plate_number}] added to blacklist. Reason: {reason}"}
    except psycopg2.IntegrityError:
        conn.rollback()
        response = {"status": "error", "message": f"Plate [{plate_number}] is already in the blacklist."}
    finally:
        cursor.close()
        conn.close()
        
    return response

def normalize_plate(plate_text):
    if not plate_text: return ""
    
    text = plate_text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    text = text.replace("هـ", "ه").replace("ة", "ه")
    text = text.replace("ى", "ي")
    
    trans = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
    text = text.translate(trans)
    
    text = text.replace(" ", "")
    
    letters = "".join([c for c in text if c.isalpha()])
    numbers = "".join([c for c in text if c.isdigit()])
    
    return letters + numbers

def check_blacklist(plate_number):
    conn = get_connection()
    cursor = conn.cursor()
    
    clean_input = normalize_plate(plate_number)
    
    cursor.execute("SELECT plate_number, reason FROM blacklist")
    rows = cursor.fetchall()
    
    for row in rows:
        db_plate = row[0]
        db_reason = row[1]
        
        if normalize_plate(db_plate) == clean_input:
            cursor.close()
            conn.close()
            return db_reason
            
    cursor.close()
    conn.close()
    return None

    
def get_occupancy():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM visits WHERE status = 'inside'")
    current_inside = cursor.fetchone()[0]
    
    cursor.close()
    conn.close()
    
    settings = get_system_settings_db()
    max_capacity = settings.get("max_capacity", 50)
    
    available_spaces = max(0, max_capacity - current_inside)
    
    return {
        "total_capacity": max_capacity,
        "current_inside": current_inside,
        "available_spaces": available_spaces,
        "is_full": available_spaces == 0
    }

# ==========================================
# ⚙️ دوال الـ Admin (التحكم اليدوي)
# ==========================================
def manual_log_entry(plate_number, vehicle_type, entry_time=None):
    conn = get_connection()
    cursor = conn.cursor()
    time_to_log = entry_time if entry_time else datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("INSERT INTO visits (plate_number, vehicle_type, entry_time, status, notes) VALUES (%s, %s, %s, 'inside', %s)", 
                   (plate_number, vehicle_type, time_to_log, "Manual Entry by Admin"))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success", "message": "Manual entry logged successfully."}

def update_visit_db(visit_id, plate_number, vehicle_type, new_status):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT entry_time, exit_time, status, fee FROM visits WHERE id = %s", (visit_id,))
    row = cursor.fetchone()
    
    if not row:
        return {"status": "error", "message": "Visit not found"}
        
    entry_time, current_exit_time, current_status, current_fee = row
    
    exit_time_to_save = current_exit_time
    fee_to_save = current_fee
    
    if new_status.lower() == 'outside' and current_status.lower() == 'inside':
        exit_time_to_save = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        if entry_time:
            try:
                entry_dt = datetime.strptime(entry_time, "%Y-%m-%d %H:%M:%S")
                exit_dt = datetime.strptime(exit_time_to_save, "%Y-%m-%d %H:%M:%S")
                hours_stayed = (exit_dt - entry_dt).total_seconds() / 3600.0
                
                cursor.execute("SELECT status FROM subscribers WHERE REPLACE(plate_number, ' ', '') = %s", (plate_number.replace(" ", ""),))
                vip = cursor.fetchone()
                
                if vip and vip[0].lower() == 'active':
                    fee_to_save = 0  # الـ VIP بيدخل ويخرج ببلاش
                else:
                    fee_to_save = max(10, round(hours_stayed * 20))
            except Exception as e:
                fee_to_save = 0

    cursor.execute(
        "UPDATE visits SET plate_number = %s, vehicle_type = %s, status = %s, exit_time = %s, fee = %s WHERE id = %s",
        (plate_number, vehicle_type, new_status, exit_time_to_save, fee_to_save, visit_id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    
    return {"status": "success", "message": "Visit updated and fee calculated successfully"}

def void_visit_db(visit_id, reason):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE visits SET status = 'void', fee = 0, notes = %s WHERE id = %s", (f"Voided: {reason}", visit_id))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success", "message": "Visit successfully voided."}

def waive_fee_db(visit_id, reason):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE visits SET fee = 0, notes = %s WHERE id = %s", (f"Fee Waived: {reason}", visit_id))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success", "message": "Fee waived successfully."}

# ==========================================
# 🅿️ دوال حركة الجراج الأساسية
# ==========================================
def log_entry(plate_number, vehicle_type="car"):
    bl_reason = check_blacklist(plate_number)
    if bl_reason:
        log_security_alert(plate_number, f"Camera Entry Blocked: {bl_reason}")
        return {"status": "DANGER", "message": f"🚨 ACCESS DENIED: Blacklisted - {bl_reason}"}

    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM visits WHERE plate_number = %s AND status = 'inside'", (plate_number,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return {"status": "warning", "message": "Vehicle is already inside the parking lot."}
        
    occupancy = get_occupancy()
    if occupancy["is_full"]:
        cursor.close()
        conn.close()
        return {
            "status": "FULL", 
            "message": "PARKING FULL: No available spaces.", 
            "action": "DO NOT OPEN GATE"
        }
        
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        "INSERT INTO visits (plate_number, vehicle_type, entry_time) VALUES (%s, %s, %s)", 
        (plate_number, vehicle_type, now)
    )
    
    cursor.execute("SELECT owner_name FROM subscribers WHERE plate_number = %s", (plate_number,))
    sub = cursor.fetchone()
    
    conn.commit()
    cursor.close()
    conn.close()
    
    if sub:
        return {"status": "success", "is_vip": True, "message": f"Welcome VIP member: {sub[0]}", "entry_time": now, "type": vehicle_type}
    else:
        return {"status": "success", "is_vip": False, "message": "New visitor entry logged successfully.", "entry_time": now, "type": vehicle_type}

def checkout_vehicle(plate_number):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, entry_time, vehicle_type FROM visits WHERE plate_number = %s AND status = 'inside'", (plate_number,))
    record = cursor.fetchone()
    
    if not record:
        cursor.close()
        conn.close()
        return {"status": "error", "message": "Vehicle is not logged as currently inside the parking lot."}
        
    visit_id, entry_time_str, vehicle_type = record
    now = datetime.now()
    entry_time = datetime.strptime(entry_time_str, "%Y-%m-%d %H:%M:%S")
    hours = max((now - entry_time).total_seconds() / 3600, 1.0) # الحد الأدنى للمحاسبة ساعة
    
    cursor.execute("SELECT id FROM subscribers WHERE plate_number = %s", (plate_number,))
    is_sub = cursor.fetchone()
    
    hourly_rates = {
        "motorcycle": 10,
        "car": 20,
        "bus": 50,
        "truck": 80
    }
    rate = hourly_rates.get(vehicle_type, 20)
    
    fee = 0
    if is_sub:
        message = "VIP Checkout - No fees applied."
    else:
        fee = round(hours * rate, 2)
        message = f"Visitor Checkout - Type: {vehicle_type.capitalize()}"
        
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("UPDATE visits SET exit_time = %s, status = 'outside', fee = %s WHERE id = %s", (now_str, fee, visit_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        "status": "success",
        "duration_hours": round(hours, 4),
        "fee_egp": fee,
        "message": message,
        "exit_time": now_str
    }

def add_new_subscriber(plate_number, owner_name):
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO subscribers (plate_number, owner_name) VALUES (%s, %s)", 
            (plate_number, owner_name)
        )
        conn.commit()
        response = {"status": "success", "message": f"Successfully added VIP: {owner_name} with plate [{plate_number}]"}
    except psycopg2.IntegrityError:
        conn.rollback()
        response = {"status": "error", "message": f"Plate number [{plate_number}] is already registered as VIP."}
    finally:
        cursor.close()
        conn.close()
        
    return response

def get_all_visits():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT plate_number, vehicle_type, entry_time, exit_time, status, fee, id FROM visits WHERE status != 'void' ORDER BY id DESC")
    rows = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return rows

# ==========================================
# 📊 دوال تحليل البيانات وذكاء الأعمال (BI & Analytics)
# ==========================================
def get_full_dashboard_analytics():
    conn = get_connection()
    cursor = conn.cursor()

    settings = get_system_settings_db()
    max_cap = settings.get("max_capacity", 50)
    
    cursor.execute("SELECT vehicle_type, entry_time, exit_time, fee, status FROM visits WHERE status != 'void'")
    visits = cursor.fetchall()
    cursor.close()
    conn.close()

    total_revenue = 0
    total_vehicles = len(visits)
    type_revenue = {}
    hour_counts = {f"{i:02d}": 0 for i in range(24)}
    
    total_dwell_minutes = 0
    dwell_count = 0
    day_trends = {"Mon": {"revenue": 0, "vehicles": 0}, "Tue": {"revenue": 0, "vehicles": 0}, 
                  "Wed": {"revenue": 0, "vehicles": 0}, "Thu": {"revenue": 0, "vehicles": 0}, 
                  "Fri": {"revenue": 0, "vehicles": 0}, "Sat": {"revenue": 0, "vehicles": 0}, 
                  "Sun": {"revenue": 0, "vehicles": 0}}

    for v in visits:
        v_type, entry_str, exit_str, fee, status = v
        fee = fee if fee else 0
        total_revenue += fee
        
        if v_type not in type_revenue:
            type_revenue[v_type] = 0
        type_revenue[v_type] += fee

        if entry_str:
            try:
                entry_dt = datetime.strptime(entry_str, "%Y-%m-%d %H:%M:%S")
                hour_str = entry_dt.strftime("%H")
                hour_counts[hour_str] += 1
                
                day_name = entry_dt.strftime("%a")
                if day_name in day_trends:
                    day_trends[day_name]["vehicles"] += 1
                    day_trends[day_name]["revenue"] += fee
                
                if exit_str:
                    exit_dt = datetime.strptime(exit_str, "%Y-%m-%d %H:%M:%S")
                    diff_minutes = (exit_dt - entry_dt).total_seconds() / 60.0
                    if diff_minutes > 0:
                        total_dwell_minutes += diff_minutes
                        dwell_count += 1
            except:
                pass

    peak_hour = max(hour_counts, key=hour_counts.get) if total_vehicles > 0 else "00"
    top_v_type = max(type_revenue, key=type_revenue.get) if type_revenue else "N/A"

    if dwell_count > 0:
        avg_dwell_time = round(total_dwell_minutes / dwell_count)
    else:
        avg_dwell_time = 0

    peak_hours_chart = [{"hour": h, "count": c} for h, c in hour_counts.items() if 6 <= int(h) <= 23]
    revenue_by_type_chart = [{"name": k.capitalize(), "value": v} for k, v in type_revenue.items()]
    revenue_trends_chart = [{"day": day, "revenue": data["revenue"], "vehicles": data["vehicles"]} for day, data in day_trends.items()]

    return {
        "stats": {
            "total_revenue": total_revenue,
            "total_vehicles": total_vehicles,
            "peak_hour": f"{peak_hour}:00",
            "top_vehicle_type": top_v_type.capitalize(),
            "avg_dwell_time": avg_dwell_time,
            "max_capacity": max_cap  
        },
        "charts": {
            "peak_hours": peak_hours_chart,
            "revenue_by_type": revenue_by_type_chart,
            "revenue_trends": revenue_trends_chart  
        }
    }

def export_daily_report_csv():
    conn = get_connection()
    cursor = conn.cursor()
    today = datetime.now().strftime("%Y-%m-%d")
    
    cursor.execute("SELECT plate_number, vehicle_type, entry_time, exit_time, status, fee FROM visits WHERE entry_time LIKE %s OR exit_time LIKE %s", (f"{today}%", f"{today}%"))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Plate Number", "Vehicle Type", "Entry Time", "Exit Time", "Status", "Fee (EGP)"])
    
    for row in rows:
        writer.writerow(row)
        
    return output.getvalue()

def get_blacklist_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT plate_number, reason, created_at FROM blacklist ORDER BY id DESC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{"plate_number": r[0], "reason": r[1], "date": r[2]} for r in rows]

def get_alerts_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT plate_number, reason, timestamp FROM security_alerts WHERE is_read = FALSE ORDER BY id DESC LIMIT 50")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{"plate_number": r[0], "reason": r[1], "timestamp": r[2]} for r in rows]

def remove_from_blacklist_db(plate_number):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM blacklist WHERE plate_number = %s", (plate_number,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success", "message": "Removed from blacklist"}

def mark_all_alerts_read():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE security_alerts SET is_read = TRUE WHERE is_read = FALSE")
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success", "message": "All alerts marked as read"}

def get_vip_dashboard_data():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, plate_number, owner_name, created_at, status FROM subscribers ORDER BY id DESC")
    subscribers = cursor.fetchall()
    
    cursor.execute("SELECT plate_number FROM visits")
    all_visits = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    vips = []
    active_count = 0
    total_vip_visits = 0
    
    for sub in subscribers:
        sub_id, sub_plate, owner_name, created_at, status = sub
        status = status if status else "Active"
        
        clean_sub_plate = normalize_plate(sub_plate)
        
        visits_count = 0
        for visit in all_visits:
            if normalize_plate(visit[0]) == clean_sub_plate:
                visits_count += 1
                
        if status.lower() == 'active':
            active_count += 1
        total_vip_visits += visits_count
        
        vips.append({
            "plate_number": sub_plate,
            "owner_name": owner_name,
            "member_since": created_at.strftime("%Y-%m-%d") if created_at else "N/A",
            "status": status,
            "total_visits": visits_count
        })
        
    return {
        "stats": {
            "total_members": len(vips),
            "active_subscriptions": active_count,
            "total_vip_visits": total_vip_visits
        },
        "vips": vips
    }

def remove_vip_db(plate_number):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM subscribers WHERE plate_number = %s", (plate_number,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success", "message": "VIP Subscriber deleted successfully"}

def update_vip_db(old_plate, new_plate, owner_name, status):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE subscribers SET plate_number = %s, owner_name = %s, status = %s WHERE plate_number = %s",
            (new_plate, owner_name, status, old_plate)
        )
        conn.commit()
        response = {"status": "success", "message": "VIP updated successfully"}
    except Exception as e:
        conn.rollback()
        response = {"status": "error", "message": "Failed to update VIP. Plate might already exist."}
    finally:
        cursor.close()
        conn.close()
    return response

def get_system_settings_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT max_capacity, hourly_rate FROM settings WHERE id = 1")
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if row:
        return {"max_capacity": row[0], "hourly_rate": row[1]}
    return {"max_capacity": 50, "hourly_rate": 20}

def update_system_settings_db(max_capacity, hourly_rate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE settings SET max_capacity = %s, hourly_rate = %s WHERE id = 1",
        (max_capacity, hourly_rate)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success", "message": "Settings updated successfully"}