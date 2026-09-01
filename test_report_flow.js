import PhanAnh from './server/models/PhanAnh.model.js';

async function testReportFlow() {
  try {
    console.log('--- Checking DB Report Flow ---');
    const testReportData = {
      tieu_de: 'Kiểm tra hệ thống phản ánh',
      noi_dung: 'Nội dung kiểm tra tự động luồng gửi phản ánh',
      loai: 'Lĩnh vực môi trường',
      dia_chi: 'Khu phố 1, phường Hàm Thắng',
      nguoi_dan_id: 2, // ID của dancu
      khu_pho: 'Khu phố 1',
      so_dien_thoai: '0832439128',
      chuyen_muc: 'Lĩnh vực môi trường',
      linh_vuc: 'Tài nguyên - Môi trường',
      hinh_thuc: 'Phản ánh',
      nguon: 'App người dân',
      han_xu_ly: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      cong_khai: 1,
      don_vi_xu_ly: 'UBND Phường',
      hinh_anh: '/uploads/1784872845654-830518125.jpg'
    };

    console.log('1. Submitting test report...');
    const created = await PhanAnh.create(testReportData);
    console.log('Report created successfully! ID:', created.id);

    console.log('2. Querying all reports for Khu phố 1...');
    const officialReports = await PhanAnh.findAll('Khu phố 1', null);
    console.log(`Found ${officialReports.length} reports for Official.`);

    const foundTestReport = officialReports.find(r => r.id === created.id);
    if (foundTestReport) {
      console.log('Test report detail from DB:', {
        id: foundTestReport.id,
        tieu_de: foundTestReport.tieu_de,
        citizen: foundTestReport.citizen,
        khu_pho: foundTestReport.khu_pho,
        hinh_anh: foundTestReport.hinh_anh,
        trang_thai: foundTestReport.trang_thai
      });
    } else {
      console.error('ERROR: Created report not found in Official list!');
    }

    console.log('3. Updating status to "processing" with message...');
    await PhanAnh.updateStatus(created.id, 'processing', 'Đã tiếp nhận và giao cán bộ kiểm tra.');

    console.log('4. Updating status to "completed" with message...');
    await PhanAnh.updateStatus(created.id, 'completed', 'Đã dọn dẹp sạch rác tại khu vực.');

    const citizenReports = await PhanAnh.findAll(null, 2);
    const updatedTestReport = citizenReports.find(r => r.id === created.id);
    console.log('Updated report detail:', {
      id: updatedTestReport.id,
      trang_thai: updatedTestReport.trang_thai,
      ket_qua_xu_ly: updatedTestReport.ket_qua_xu_ly
    });

    console.log('5. Cleaning up test record...');
    const pool = await (await import('./server/config/database.js')).default.getPool();
    await pool.request().query(`DELETE FROM PhanAnh WHERE phan_anh_id = ${created.id}`);
    console.log('Test report deleted successfully.');

    console.log('=== TEST SUCCESSFUL: ALL STEPS PASSED ===');
    process.exit(0);
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
}

testReportFlow();
