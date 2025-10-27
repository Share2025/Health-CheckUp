// frontend/dataProcessor.js
// หมายเหตุ: ฟังก์ชัน handleFile และอื่นๆ ที่เกี่ยวกับการประมวลผลถูกลบออกไป
// เนื่องจากตรรกะนี้ถูกย้ายไปที่ Backend แล้ว

/**
 * Exports follow-up data to an Excel file.
 * @param {Array<object>} followupData The data to export.
 * @param {string} companyName The name of the company for the filename.
 */
export function exportFollowUpData(followupData, companyName) {
    const dataToExport = followupData.map(item => ({
        "รหัสพนักงาน": item.id,
        "ชื่อ-สกุล": item.name,
        "แผนก": item.department,
        "รายการที่ยังไม่ครบ": item.uncompleted,
        "หมายเหตุ": item.note
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet['!cols'] = [
        { wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 50 }, { wch: 50 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Follow-Up List");

    const safeCompanyName = companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(workbook, `${safeCompanyName}_FollowUp_List.xlsx`);
}

/**
 * Exports all processed data to an Excel file.
 * @param {Array<object>} processedData The full dataset to export.
 * @param {Array<object>} activeStations The list of active stations to use as columns.
 * @param {string} companyName The name of the company for the filename.
 */
export function exportAllData(processedData, activeStations, companyName) {
    const dataToExport = processedData.map(person => {
        const row = {
            'No': person.no,
            'HN': person.hn,
            'รหัสพนักงาน': person.id,
            'ชื่อ-สกุล': person.name,
            'วันที่': person.date,
            'เวลา': person.time,
            'แผนก': person.department,
            'ตำแหน่ง': person.position,
            'สังกัด': person.affiliation,
            'สถานะลงทะเบียน': person.isRegistered ? 'ลงทะเบียนแล้ว' : 'ยังไม่ลงทะเบียน',
            'สถานะการตรวจ': person.status,
            'หมายเหตุ': person.note,
        };

        activeStations.forEach(station => {
            if (person.requiredStations.includes(station.key)) {
                row[station.name] = person.stations[station.key] ? 'Checked' : 'Unchecked';
            } else {
                row[station.name] = '-';
            }
        });

        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Set column widths
    const colWidths = [
        { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 12 },
        { wch: 10 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, 
        { wch: 20 }, { wch: 15 }, { wch: 40 }
    ];
    activeStations.forEach(() => colWidths.push({ wch: 25 }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Full Report");

    const safeCompanyName = companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(workbook, `${safeCompanyName}_Full_Report.xlsx`);
}