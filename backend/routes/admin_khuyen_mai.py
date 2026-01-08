from flask import Blueprint, jsonify, request
from db import get_db
from datetime import datetime

admin_khuyen_mai_bp = Blueprint("admin_khuyen_mai", __name__)

# =====================================================
# LẤY TẤT CẢ KHUYẾN MÃI
# =====================================================
@admin_khuyen_mai_bp.route("", methods=["GET"])
def get_all_khuyen_mai():
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                id, tenKhuyenMai, maKhuyenMai, loaiGiamGia,
                giaTriGiam, giaTriToiDa, donHangToiThieu,
                ngayBatDau, ngayKetThuc, trangThai, ngayTao
            FROM KhuyenMai
            ORDER BY ngayTao DESC
        """)

        rows = cursor.fetchall()
        data = []

        for r in rows:
            data.append({
                "id": r[0],
                "tenKhuyenMai": r[1],
                "maKhuyenMai": r[2],
                "loaiGiamGia": r[3],
                "giaTriGiam": float(r[4]),
                "giaTriToiDa": float(r[5]) if r[5] else None,
                "donHangToiThieu": float(r[6]) if r[6] else None,
                "ngayBatDau": r[7].isoformat() if r[7] else None,
                "ngayKetThuc": r[8].isoformat() if r[8] else None,
                "trangThai": bool(r[9]),
                "ngayTao": r[10].isoformat() if r[10] else None
            })

        return jsonify(data)
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500

# =====================================================
# LẤY KHUYẾN MÃI THEO ID
# =====================================================
@admin_khuyen_mai_bp.route("/<int:id>", methods=["GET"])
def get_khuyen_mai_by_id(id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                id, tenKhuyenMai, maKhuyenMai, loaiGiamGia,
                giaTriGiam, giaTriToiDa, donHangToiThieu,
                ngayBatDau, ngayKetThuc, trangThai, ngayTao
            FROM KhuyenMai
            WHERE id = ?
        """, (id,))

        row = cursor.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Không tìm thấy khuyến mãi"}), 404

        data = {
            "id": row[0],
            "tenKhuyenMai": row[1],
            "maKhuyenMai": row[2],
            "loaiGiamGia": row[3],
            "giaTriGiam": float(row[4]),
            "giaTriToiDa": float(row[5]) if row[5] else None,
            "donHangToiThieu": float(row[6]) if row[6] else None,
            "ngayBatDau": row[7].isoformat() if row[7] else None,
            "ngayKetThuc": row[8].isoformat() if row[8] else None,
            "trangThai": bool(row[9]),
            "ngayTao": row[10].isoformat() if row[10] else None
        }

        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500

# =====================================================
# TẠO KHUYẾN MÃI MỚI
# =====================================================
@admin_khuyen_mai_bp.route("", methods=["POST"])
def create_khuyen_mai():
    try:
        data = request.json
        
        # Validation
        if not data:
            return jsonify({"success": False, "message": "Thiếu dữ liệu"}), 400
        
        tenKhuyenMai = data.get("tenKhuyenMai", "").strip()
        maKhuyenMai = data.get("maKhuyenMai", "").strip()
        loaiGiamGia = data.get("loaiGiamGia", "").strip()
        giaTriGiam = data.get("giaTriGiam")
        
        if not tenKhuyenMai or len(tenKhuyenMai) < 3:
            return jsonify({"success": False, "message": "Tên khuyến mãi phải có ít nhất 3 ký tự"}), 400
        
        if not maKhuyenMai or len(maKhuyenMai) < 3:
            return jsonify({"success": False, "message": "Mã khuyến mãi phải có ít nhất 3 ký tự"}), 400
        
        if loaiGiamGia not in ["phan_tram", "tien_mat"]:
            return jsonify({"success": False, "message": "Loại giảm giá không hợp lệ"}), 400
        
        if not giaTriGiam or float(giaTriGiam) <= 0:
            return jsonify({"success": False, "message": "Giá trị giảm phải lớn hơn 0"}), 400
        
        if loaiGiamGia == "phan_tram" and (float(giaTriGiam) < 1 or float(giaTriGiam) > 100):
            return jsonify({"success": False, "message": "Phần trăm giảm giá phải từ 1% đến 100%"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Kiểm tra mã khuyến mãi đã tồn tại chưa
        cursor.execute("SELECT id FROM KhuyenMai WHERE maKhuyenMai = ?", (maKhuyenMai,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Mã khuyến mãi đã tồn tại"}), 400
        
        # Xử lý ngày tháng
        ngayBatDau = None
        ngayKetThuc = None
        
        if data.get("ngayBatDau"):
            try:
                ngayBatDau = datetime.fromisoformat(data["ngayBatDau"].replace("Z", "+00:00"))
            except:
                ngayBatDau = None
        
        if data.get("ngayKetThuc"):
            try:
                ngayKetThuc = datetime.fromisoformat(data["ngayKetThuc"].replace("Z", "+00:00"))
            except:
                ngayKetThuc = None
        
        # Kiểm tra ngày kết thúc phải sau ngày bắt đầu
        if ngayBatDau and ngayKetThuc and ngayKetThuc < ngayBatDau:
            return jsonify({"success": False, "message": "Ngày kết thúc phải sau ngày bắt đầu"}), 400
        
        cursor.execute("""
            INSERT INTO KhuyenMai
            (tenKhuyenMai, maKhuyenMai, loaiGiamGia, giaTriGiam,
             giaTriToiDa, donHangToiThieu, ngayBatDau, ngayKetThuc, trangThai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            tenKhuyenMai,
            maKhuyenMai,
            loaiGiamGia,
            float(giaTriGiam),
            float(data.get("giaTriToiDa")) if data.get("giaTriToiDa") else None,
            float(data.get("donHangToiThieu")) if data.get("donHangToiThieu") else None,
            ngayBatDau,
            ngayKetThuc,
            1 if data.get("trangThai", True) else 0
        ))

        conn.commit()
        return jsonify({"success": True, "message": "Thêm khuyến mãi thành công"})
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500

# =====================================================
# CẬP NHẬT KHUYẾN MÃI
# =====================================================
@admin_khuyen_mai_bp.route("/<int:id>", methods=["PUT"])
def update_khuyen_mai(id):
    try:
        data = request.json
        
        # Validation
        if not data:
            return jsonify({"success": False, "message": "Thiếu dữ liệu"}), 400
        
        tenKhuyenMai = data.get("tenKhuyenMai", "").strip()
        maKhuyenMai = data.get("maKhuyenMai", "").strip()
        loaiGiamGia = data.get("loaiGiamGia", "").strip()
        giaTriGiam = data.get("giaTriGiam")
        
        if not tenKhuyenMai or len(tenKhuyenMai) < 3:
            return jsonify({"success": False, "message": "Tên khuyến mãi phải có ít nhất 3 ký tự"}), 400
        
        if not maKhuyenMai or len(maKhuyenMai) < 3:
            return jsonify({"success": False, "message": "Mã khuyến mãi phải có ít nhất 3 ký tự"}), 400
        
        if loaiGiamGia not in ["phan_tram", "tien_mat"]:
            return jsonify({"success": False, "message": "Loại giảm giá không hợp lệ"}), 400
        
        if not giaTriGiam or float(giaTriGiam) <= 0:
            return jsonify({"success": False, "message": "Giá trị giảm phải lớn hơn 0"}), 400
        
        if loaiGiamGia == "phan_tram" and (float(giaTriGiam) < 1 or float(giaTriGiam) > 100):
            return jsonify({"success": False, "message": "Phần trăm giảm giá phải từ 1% đến 100%"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Kiểm tra khuyến mãi có tồn tại không
        cursor.execute("SELECT id FROM KhuyenMai WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Không tìm thấy khuyến mãi"}), 404
        
        # Kiểm tra mã khuyến mãi đã tồn tại chưa (trừ chính nó)
        cursor.execute("SELECT id FROM KhuyenMai WHERE maKhuyenMai = ? AND id != ?", (maKhuyenMai, id))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Mã khuyến mãi đã tồn tại"}), 400
        
        # Xử lý ngày tháng
        ngayBatDau = None
        ngayKetThuc = None
        
        if data.get("ngayBatDau"):
            try:
                ngayBatDau = datetime.fromisoformat(data["ngayBatDau"].replace("Z", "+00:00"))
            except:
                ngayBatDau = None
        
        if data.get("ngayKetThuc"):
            try:
                ngayKetThuc = datetime.fromisoformat(data["ngayKetThuc"].replace("Z", "+00:00"))
            except:
                ngayKetThuc = None
        
        # Kiểm tra ngày kết thúc phải sau ngày bắt đầu
        if ngayBatDau and ngayKetThuc and ngayKetThuc < ngayBatDau:
            return jsonify({"success": False, "message": "Ngày kết thúc phải sau ngày bắt đầu"}), 400

        cursor.execute("""
            UPDATE KhuyenMai
            SET tenKhuyenMai = ?, maKhuyenMai = ?, loaiGiamGia = ?,
                giaTriGiam = ?, giaTriToiDa = ?, donHangToiThieu = ?,
                ngayBatDau = ?, ngayKetThuc = ?, trangThai = ?
            WHERE id = ?
        """, (
            tenKhuyenMai,
            maKhuyenMai,
            loaiGiamGia,
            float(giaTriGiam),
            float(data.get("giaTriToiDa")) if data.get("giaTriToiDa") else None,
            float(data.get("donHangToiThieu")) if data.get("donHangToiThieu") else None,
            ngayBatDau,
            ngayKetThuc,
            1 if data.get("trangThai", True) else 0,
            id
        ))

        conn.commit()
        return jsonify({"success": True, "message": "Cập nhật khuyến mãi thành công"})
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500

# =====================================================
# XÓA KHUYẾN MÃI
# =====================================================
@admin_khuyen_mai_bp.route("/<int:id>", methods=["DELETE"])
def delete_khuyen_mai(id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Kiểm tra khuyến mãi có tồn tại không
        cursor.execute("SELECT id FROM KhuyenMai WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Không tìm thấy khuyến mãi"}), 404
        
        # Kiểm tra xem khuyến mãi có đang được sử dụng trong đơn hàng không
        cursor.execute("""
            SELECT COUNT(*) FROM DonHang_KhuyenMai WHERE khuyenMai_id = ?
        """, (id,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            return jsonify({
                "success": False,
                "message": f"Không thể xóa khuyến mãi này vì đã có {count} đơn hàng sử dụng"
            }), 400

        cursor.execute("DELETE FROM KhuyenMai WHERE id = ?", (id,))
        conn.commit()

        return jsonify({"success": True, "message": "Xóa khuyến mãi thành công"})
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500

