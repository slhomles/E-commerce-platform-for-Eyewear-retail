import pandas as pd
import xlsxwriter
import requests
from io import BytesIO
import os

def create_excel_with_embedded_images(filename):
    # Dữ liệu mẫu theo đúng thứ tự cột của AdminServiceImpl
    # 0: Name, 1: Slug, 2: Description, 3: Brand, 4: Category, 5: Type, 6: BasePrice, 7: SalePrice, 8: Gender
    # 9: Material, 10: Shape, 11: Rim, 12: Hinge, 13: NosePad, 14: Size, 15: Style, 16: SKU, 17: Color, 18: Hex, 19: Stock, 20: Image
    
    rows = [
        ['Kính Mát Chống UV Cao Cấp V1', '', 'Kính mát bảo vệ mắt tuyệt đối', 'Gucci', 'Kính Mát', 'FRAME', 1200000, 1000000, 'UNISEX', 'Titanium', 'OVAL', 'Full', 'Flex', 'Soft', '52-18-140', 'Modern', 'SKU-KM-001', 'Đen', '#000000', 10],
        ['Gọng Kính Cận Thời Trang V1', '', 'Gọng kính nhẹ, bền bỉ', 'RayBan', 'Gọng Kính', 'FRAME', 850000, 750000, 'WOMEN', 'Plastic', 'SQUARE', 'Half', 'Standard', 'Hard', '50-17-135', 'Classic', 'SKU-GK-002', 'Hồng', '#FFC0CB', 15]
    ]
    
    # URL ảnh mẫu
    image_urls = [
        'https://res.cloudinary.com/dfk16iu6d/image/upload/v1741710182/products/test_glass_1.png',
        'https://res.cloudinary.com/dfk16iu6d/image/upload/v1741710182/products/test_glass_2.png'
    ]

    workbook = xlsxwriter.Workbook(filename)
    worksheet = workbook.add_worksheet('Products')

    # Viết tiêu đề
    headers = ['Name', 'Slug', 'Description', 'Brand', 'Category', 'Type', 'Base Price', 'Sale Price', 'Gender', 
               'Material', 'Shape', 'Rim', 'Hinge', 'NosePad', 'Size', 'Style', 'SKU', 'Color', 'Hex', 'Stock', 'Image']
    for col_num, header in enumerate(headers):
        worksheet.write(0, col_num, header)

    # Viết dữ liệu và chèn ảnh vào cột 20 (U)
    for row_num, row_data in enumerate(rows, start=1):
        for col_num, value in enumerate(row_data):
            worksheet.write(row_num, col_num, value)
        
        # Chèn ảnh vào cột 20 (U)
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(image_urls[row_num-1], headers=headers)
            temp_img = f"test_data/temp_img_{row_num}.png"
            with open(temp_img, 'wb') as f:
                f.write(response.content)
            
            print(f"Downloaded image {row_num}, size: {len(response.content)} bytes")
            if len(response.content) > 100: # Ensure it's not a tiny/empty file
                worksheet.embed_image(row_num, 20, temp_img)
                print(f"Embedded image for row {row_num} at column U using file {temp_img}")
            else:
                print(f"Image {row_num} is too small, skipping embed.")

        except Exception as e:
            print(f"Failed to embed image for row {row_num}: {e}")

    workbook.close()
    print(f"Excel file '{filename}' created successfully.")

if __name__ == "__main__":
    output_path = os.path.join('test_data', 'products_with_images_v3.xlsx')
    create_excel_with_embedded_images(output_path)
