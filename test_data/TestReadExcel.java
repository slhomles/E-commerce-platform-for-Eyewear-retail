import org.apache.poi.ss.usermodel.*;
import java.io.File;

public class TestReadExcel {
    public static void main(String[] args) throws Exception {
        File file = new File("import_ready.xlsx");
        if (!file.exists()) file = new File("product_import_template_FINAL_FILLED.xlsx");
        System.out.println("Reading " + file.getName());
        try (Workbook workbook = WorkbookFactory.create(file)) {
            Sheet sheet = workbook.getSheet("Products");
            if (sheet == null) sheet = workbook.getSheetAt(0);
            
            Row row = sheet.getRow(1); // Row 2
            System.out.println("Name (col 0): " + getCellValue(row, 0));
            System.out.println("SKU (col 18): " + getCellValue(row, 18));
            System.out.println("Stock (col 22): " + getCellValue(row, 22));
            System.out.println("ThumbUrl (col 27): " + getCellValue(row, 27));
        }
    }

    private static String getCellValue(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return "NULL_CELL";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC: return String.valueOf(cell.getNumericCellValue());
            default: return "OTHER_" + cell.getCellType().name();
        }
    }
}
